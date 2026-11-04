import { env } from "../lib/env";
import { resolveWeatherCondition } from "../lib/weatherCondition";
import { fetchDataGoKr } from "./dataGoKrClient";
import type { WeatherCondition } from "../types/weather";

type UltraItem = {
  category?: string;
  obsrValue?: string;
  fcstValue?: string;
  fcstDate?: string;
  fcstTime?: string;
  baseDate?: string;
  baseTime?: string;
};

type UltraResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: UltraItem[] | UltraItem };
    };
  };
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** 초단기실황 base_time: 매시 40분 이후 당시간 */
export function getNcstBaseDateTime(now = new Date()) {
  const date = new Date(now);
  if (date.getMinutes() < 40) {
    date.setHours(date.getHours() - 1);
  }
  return {
    baseDate: `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`,
    baseTime: `${pad2(date.getHours())}00`,
  };
}

/** 초단기예보 base_time: 매시 30분 발표, 45분 이후 당회차 */
export function getFcstBaseDateTime(now = new Date()) {
  const date = new Date(now);
  if (date.getMinutes() < 45) {
    date.setHours(date.getHours() - 1);
  }
  return {
    baseDate: `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`,
    baseTime: `${pad2(date.getHours())}30`,
  };
}

function normalizeItems(json: UltraResponse): UltraItem[] {
  const raw = json.response?.body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function assertOk(json: UltraResponse, label: string) {
  const header = json.response?.header;
  if (header?.resultCode && header.resultCode !== "00") {
    throw new Error(header.resultMsg || `${label} 오류 (${header.resultCode})`);
  }
}

async function fetchUltraSrtNcst(nx: number, ny: number) {
  const { baseDate, baseTime } = getNcstBaseDateTime();
  const json = await fetchDataGoKr<UltraResponse>(
    "/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst",
    {
      numOfRows: 20,
      pageNo: 1,
      base_date: baseDate,
      base_time: baseTime,
      nx,
      ny,
    },
  );
  assertOk(json, "초단기실황");
  return { items: normalizeItems(json), baseDate, baseTime };
}

async function fetchUltraSrtFcst(nx: number, ny: number) {
  const { baseDate, baseTime } = getFcstBaseDateTime();
  const json = await fetchDataGoKr<UltraResponse>(
    "/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst",
    {
      numOfRows: 60,
      pageNo: 1,
      base_date: baseDate,
      base_time: baseTime,
      nx,
      ny,
    },
  );
  assertOk(json, "초단기예보");
  return { items: normalizeItems(json), baseDate, baseTime };
}

function pickNearestSky(items: UltraItem[]): number | null {
  const skyItems = items.filter((item) => item.category === "SKY" && item.fcstValue);
  if (skyItems.length === 0) return null;

  const now = new Date();
  const nowKey = Number(
    `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}${pad2(now.getHours())}${pad2(now.getMinutes())}`,
  );

  const sorted = [...skyItems].sort((a, b) => {
    const aKey = Number(`${a.fcstDate ?? ""}${a.fcstTime ?? ""}`);
    const bKey = Number(`${b.fcstDate ?? ""}${b.fcstTime ?? ""}`);
    return Math.abs(aKey - nowKey) - Math.abs(bKey - nowKey);
  });

  const value = Number(sorted[0]?.fcstValue);
  return Number.isFinite(value) ? value : null;
}

export type WeatherObservation = {
  temperature: number;
  condition: WeatherCondition;
  updatedAt: string;
};

/** 기온(T1H) + 강수형태(PTY) + 하늘상태(SKY) */
export async function fetchWeatherObservation(
  nx = env.weatherNx,
  ny = env.weatherNy,
): Promise<WeatherObservation> {
  const [ncst, fcstResult] = await Promise.all([
    fetchUltraSrtNcst(nx, ny),
    fetchUltraSrtFcst(nx, ny).catch(() => null),
  ]);

  const tempItem = ncst.items.find((item) => item.category === "T1H");
  if (!tempItem?.obsrValue) {
    throw new Error("기온(T1H) 데이터가 없습니다.");
  }

  const temperature = Number(tempItem.obsrValue);
  if (!Number.isFinite(temperature)) {
    throw new Error(`기온 값 파싱 실패: ${tempItem.obsrValue}`);
  }

  const ptyItem = ncst.items.find((item) => item.category === "PTY");
  const pty = Number(ptyItem?.obsrValue ?? 0);
  const sky = fcstResult ? pickNearestSky(fcstResult.items) : null;

  return {
    temperature,
    condition: resolveWeatherCondition(Number.isFinite(pty) ? pty : 0, sky),
    updatedAt: `${tempItem.baseDate ?? ncst.baseDate} ${tempItem.baseTime ?? ncst.baseTime}`,
  };
}

/** @deprecated use fetchWeatherObservation */
export async function fetchTemperature(nx = env.weatherNx, ny = env.weatherNy) {
  const weather = await fetchWeatherObservation(nx, ny);
  return {
    temperature: weather.temperature,
    updatedAt: weather.updatedAt,
  };
}
