/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_GO_KR_SERVICE_KEY?: string;
  readonly VITE_AIR_STATION_NAME?: string;
  readonly VITE_WEATHER_NX?: string;
  readonly VITE_WEATHER_NY?: string;
  readonly VITE_WEATHER_REFRESH_MS?: string;
  readonly VITE_NAVER_NCP_KEY_ID?: string;
  readonly VITE_NAVER_CLIENT_ID?: string;
  readonly VITE_NAVER_MAP_CLIENT_ID?: string;
  readonly VITE_NAVER_NCP_CLIENT_ID?: string;
  readonly VITE_STORE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
