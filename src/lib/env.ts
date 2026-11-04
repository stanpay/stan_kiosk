function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  dataGoKrServiceKey: import.meta.env.VITE_DATA_GO_KR_SERVICE_KEY?.trim() ?? "",
  airStationName: import.meta.env.VITE_AIR_STATION_NAME?.trim() || "이도동",
  weatherNx: readNumber(import.meta.env.VITE_WEATHER_NX, 53),
  weatherNy: readNumber(import.meta.env.VITE_WEATHER_NY, 38),
  weatherRefreshMs: readNumber(import.meta.env.VITE_WEATHER_REFRESH_MS, 600_000),
  naverNcpKeyId:
    import.meta.env.VITE_NAVER_NCP_KEY_ID?.trim() ||
    import.meta.env.VITE_NAVER_CLIENT_ID?.trim() ||
    "",
  storeApiBaseUrl:
    import.meta.env.VITE_STORE_API_BASE_URL?.trim() || "https://mac.kurl.kr:5001",
};

export function hasDataGoKrKey() {
  return env.dataGoKrServiceKey.length > 0;
}
