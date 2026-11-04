import { env } from "../lib/env";
import { airGradeFromApi } from "../lib/airGrade";
import { fetchDataGoKr } from "./dataGoKrClient";
import type { WeatherStatusData } from "../types/weather";

type AirKoreaItem = {
  dataTime?: string;
  pm10Grade?: string;
  pm10Grade1h?: string;
  pm25Grade?: string;
  pm25Grade1h?: string;
  o3Grade?: string;
  pm10Value?: string;
  pm25Value?: string;
  o3Value?: string;
};

type AirKoreaResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: AirKoreaItem[] | AirKoreaItem;
      totalCount?: number;
    };
  };
};

function normalizeItems(items: AirKoreaResponse["response"]): AirKoreaItem[] {
  const raw = items?.body?.items;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** 에어코리아 — 측정소별 실시간 측정정보 */
export async function fetchAirQuality(stationName = env.airStationName) {
  const json = await fetchDataGoKr<AirKoreaResponse>(
    "/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty",
    {
      numOfRows: 1,
      pageNo: 1,
      stationName,
      dataTerm: "DAILY",
      ver: "1.3",
    },
  );

  const header = json.response?.header;
  if (header?.resultCode && header.resultCode !== "00") {
    throw new Error(header.resultMsg || `에어코리아 오류 (${header.resultCode})`);
  }

  const item = normalizeItems(json.response)[0];
  if (!item) {
    throw new Error(`측정소 "${stationName}" 대기질 데이터가 없습니다.`);
  }

  return {
    updatedAt: item.dataTime ?? null,
    pm10: airGradeFromApi(item.pm10Grade1h || item.pm10Grade),
    pm25: airGradeFromApi(item.pm25Grade1h || item.pm25Grade),
    ozone: airGradeFromApi(item.o3Grade),
    raw: item,
  };
}

export function toAirFields(
  air: Awaited<ReturnType<typeof fetchAirQuality>>,
): Pick<WeatherStatusData, "pm10" | "pm25" | "ozone" | "updatedAt"> {
  return {
    pm10: air.pm10,
    pm25: air.pm25,
    ozone: air.ozone,
    updatedAt: air.updatedAt,
  };
}
