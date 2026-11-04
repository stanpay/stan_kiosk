export type NearbyStore = {
  area: string | null;
  business_hours_today: string | null;
  category: string | null;
  distance: string;
  distance_m: number;
  downtown_coupon: boolean;
  id: number;
  image_url: string | null;
  latitude: number;
  localpay: boolean;
  longitude: number;
  name: string;
  oil_subsidy: boolean;
};

const STORE_API_BASE_URL =
  import.meta.env.VITE_STORE_API_BASE_URL?.trim() || "https://mac.kurl.kr:5001";

/**
 * 키오스크 고정 현재 위치
 * https://map.naver.com/p/entry/coordinates/3yYKXZ,2y1Yrc?c=19.86,0,0,1,dh
 * (제주특별자치도 제주시 일도일동 1146-22)
 */
export const KIOSK_FIXED_LOCATION = {
  latitude: 33.5130889413149,
  longitude: 126.527892733438,
  /** 네이버 지도 축척 약 50m */
  zoom: 17,
} as const;

function normalizeNearbyResponse(payload: unknown): NearbyStore[] {
  if (Array.isArray(payload)) return payload as NearbyStore[];
  if (
    payload &&
    typeof payload === "object" &&
    "value" in payload &&
    Array.isArray((payload as { value: unknown }).value)
  ) {
    return (payload as { value: NearbyStore[] }).value;
  }
  return [];
}

export async function getNearbyStores(
  latitude: number,
  longitude: number,
  radius = 2000,
): Promise<NearbyStore[]> {
  const response = await fetch(
    `${STORE_API_BASE_URL}/nearby/${latitude}/${longitude}?radius=${radius}`,
  );
  if (!response.ok) {
    throw new Error(`매장 API 실패: ${response.status}`);
  }
  return normalizeNearbyResponse(await response.json());
}

export function getStoreRedirectUrl(storeId: string | number): string {
  return `${STORE_API_BASE_URL}/redirect/${storeId}`;
}
