import { env } from "../lib/env";

/**
 * data.go.kr 호출 클라이언트.
 * 브라우저는 Vite 프록시(`/api/data-go-kr`)를 통해 CORS를 우회한다.
 *
 * serviceKey는 Encoding 키(이미 % 인코딩됨)를 그대로 붙인다.
 * URLSearchParams로 다시 인코딩하면 403이 난다.
 */
export async function fetchDataGoKr<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  if (!env.dataGoKrServiceKey) {
    throw new Error("VITE_DATA_GO_KR_SERVICE_KEY 가 설정되지 않았습니다.");
  }

  const search = new URLSearchParams();
  search.set("returnType", "json");

  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }

  const url = `/api/data-go-kr${path}?serviceKey=${env.dataGoKrServiceKey}&${search.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`data.go.kr 요청 실패 (${response.status})`);
  }

  return (await response.json()) as T;
}
