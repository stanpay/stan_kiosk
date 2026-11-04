import type { TourismRegionId } from "../data/tourism";

export type VisitJejuSpot = {
  rank: number;
  contentsid: string;
  title: string;
  address: string;
  region1: string;
  region2: string;
  regionId: TourismRegionId | null;
  markcnt: number;
  introduction: string;
  thumbnail: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
};

/** 네이버 지도 앱/웹으로 여는 URL (QR용) */
export function getNaverMapUrl(spot: VisitJejuSpot): string {
  const title = encodeURIComponent(spot.title);
  if (
    spot.latitude != null &&
    spot.longitude != null &&
    Number.isFinite(spot.latitude) &&
    Number.isFinite(spot.longitude)
  ) {
    return `https://map.naver.com/v5/search/${title}?c=${spot.longitude},${spot.latitude},16,0,0,0,dh`;
  }
  const q = encodeURIComponent(
    [spot.title, spot.address].filter(Boolean).join(" "),
  );
  return `https://map.naver.com/v5/search/${q}`;
}

export type VisitJejuSpotsByRegion = Partial<
  Record<TourismRegionId, VisitJejuSpot[]>
>;

const REGION_MAP: Record<string, TourismRegionId> = {
  한경: "hangyeong",
  한림: "hallim",
  애월: "aewol",
  제주시내: "jeju-si",
  조천: "jocheon",
  구좌: "gujwa",
  우도: "udo",
  대정: "daejeong",
  안덕: "andeok",
  중문: "jungmun",
  서귀포시내: "seogwipo",
  남원: "namwon",
  표선: "pyoseon",
  성산: "seongsan",
  마라도: "daejeong",
  가파도: "daejeong",
  비양도: "hallim",
  차귀도: "hangyeong",
};

type RawItem = {
  contentsid?: string;
  title?: string;
  address?: string;
  roadaddress?: string;
  introduction?: string;
  markcnt?: number;
  likecnt?: number;
  latitude?: number | null;
  longitude?: number | null;
  region1cd?: { label?: string; value?: string };
  region2cd?: { label?: string; value?: string };
  repPhoto?: {
    thumbnailpath?: string;
    imgpath?: string;
    photoid?: { thumbnailpath?: string; imgpath?: string };
  };
};

function photoOf(it: RawItem): { thumbnail: string; image: string } {
  const thumbnail =
    it.repPhoto?.photoid?.thumbnailpath ||
    it.repPhoto?.thumbnailpath ||
    "";
  const image =
    it.repPhoto?.photoid?.imgpath || it.repPhoto?.imgpath || thumbnail;
  return { thumbnail, image };
}

function mapItems(rawItems: RawItem[]): VisitJejuSpot[] {
  return rawItems.map((it, idx) => {
    const region2 = it.region2cd?.label || "";
    const photos = photoOf(it);
    const latitude =
      typeof it.latitude === "number" && Number.isFinite(it.latitude)
        ? it.latitude
        : null;
    const longitude =
      typeof it.longitude === "number" && Number.isFinite(it.longitude)
        ? it.longitude
        : null;
    return {
      rank: idx + 1,
      contentsid: it.contentsid || `row-${idx}`,
      title: it.title || "",
      address: it.address || it.roadaddress || "",
      region1: it.region1cd?.label || "",
      region2,
      regionId: REGION_MAP[region2] ?? null,
      markcnt: it.markcnt ?? it.likecnt ?? 0,
      introduction: it.introduction || "",
      thumbnail: photos.thumbnail,
      image: photos.image,
      latitude,
      longitude,
    };
  });
}

export function groupSpotsByRegion(
  spots: VisitJejuSpot[],
): VisitJejuSpotsByRegion {
  const byRegion: VisitJejuSpotsByRegion = {};
  for (const spot of spots) {
    if (!spot.regionId) continue;
    (byRegion[spot.regionId] ??= []).push(spot);
  }
  return byRegion;
}

async function fetchViaApi(): Promise<VisitJejuSpot[]> {
  const res = await fetch("/api/visitjeju/top");
  if (!res.ok) throw new Error(`visitjeju top ${res.status}`);
  const data = (await res.json()) as { items?: RawItem[] };
  return mapItems(data.items ?? []);
}

async function fetchViaStaticFallback(): Promise<VisitJejuSpot[]> {
  let res = await fetch("/data/visitjeju-top200.json");
  if (!res.ok) res = await fetch("/data/visitjeju-top100.json");
  if (!res.ok) throw new Error("static visitjeju json missing");
  const data = (await res.json()) as { items: VisitJejuSpot[] };
  return (data.items ?? []).map((it) => ({
    ...it,
    image: it.image || it.thumbnail || "",
  }));
}

export type VisitJejuTopResult = {
  spots: VisitJejuSpot[];
  byRegion: VisitJejuSpotsByRegion;
  source: "api" | "static";
};

let spotsPromise: Promise<VisitJejuTopResult> | null = null;
let spotsCache: VisitJejuTopResult | null = null;

async function loadVisitJejuTopSpots(): Promise<VisitJejuTopResult> {
  try {
    const spots = await fetchViaApi();
    if (!spots.length) throw new Error("empty");
    return { spots, byRegion: groupSpotsByRegion(spots), source: "api" };
  } catch {
    const spots = await fetchViaStaticFallback();
    return { spots, byRegion: groupSpotsByRegion(spots), source: "static" };
  }
}

/** 앱 시작 시 미리 호출 — 동일 Promise를 재사용 */
export function prefetchVisitJejuTopSpots(): Promise<VisitJejuTopResult> {
  if (!spotsPromise) {
    spotsPromise = loadVisitJejuTopSpots()
      .then((result) => {
        spotsCache = result;
        return result;
      })
      .catch((err) => {
        spotsPromise = null;
        throw err;
      });
  }
  return spotsPromise;
}

export function getCachedVisitJejuTopSpots(): VisitJejuTopResult | null {
  return spotsCache;
}

/** 좋아요순 상위 관광지 (+사진). API 우선, 실패 시 스냅샷 JSON. */
export function fetchVisitJejuTopSpots(): Promise<VisitJejuTopResult> {
  return prefetchVisitJejuTopSpots();
}
