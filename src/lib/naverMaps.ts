function getNaverMapClientId(): string {
  const clientId =
    import.meta.env.VITE_NAVER_NCP_KEY_ID ??
    import.meta.env.VITE_NAVER_CLIENT_ID ??
    import.meta.env.VITE_NAVER_MAP_CLIENT_ID ??
    import.meta.env.VITE_NAVER_NCP_CLIENT_ID;
  if (!clientId) {
    throw new Error("VITE_NAVER_NCP_KEY_ID가 설정되지 않았습니다.");
  }
  return clientId;
}

function resolveLanguage(preferred?: string): string {
  const tag = (preferred ?? document.documentElement.lang ?? "ko")
    .toLowerCase()
    .replace(/_/g, "-");
  if (tag.startsWith("ko")) return "ko";
  if (tag.startsWith("ja")) return "ja";
  if (tag.startsWith("zh")) return "zh";
  return "en";
}

let naverLoaded = false;

export async function loadNaverMaps(preferredLanguage?: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Window is undefined");

  const clientId = getNaverMapClientId();
  const language = resolveLanguage(preferredLanguage);
  const scriptUrl = `https://oapi.map.naver.com/openapi/v3/maps.js?${new URLSearchParams({
    ncpKeyId: clientId,
    language,
  })}`;

  let existing = document.querySelector(
    'script[data-naver-maps="true"]',
  ) as HTMLScriptElement | null;

  if (existing && existing.src !== scriptUrl) {
    existing.remove();
    delete window.naver;
    naverLoaded = false;
    existing = null;
  }

  if (window.naver?.maps && naverLoaded) return;

  if (!existing || existing.src !== scriptUrl) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.setAttribute("data-naver-maps", "true");
      script.async = true;
      script.src = scriptUrl;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error(
            "Naver Maps SDK 로드 실패 — Web 서비스 URL 등록 및 ncpKeyId를 확인해주세요.",
          ),
        );
      document.head.appendChild(script);
    });
  } else {
    await new Promise<void>((resolve) => {
      if (window.naver?.maps) {
        resolve();
        return;
      }
      existing!.addEventListener("load", () => resolve(), { once: true });
    });
  }

  let retries = 0;
  while (!window.naver?.maps && retries < 50) {
    await new Promise((r) => setTimeout(r, 100));
    retries += 1;
  }
  if (!window.naver?.maps) throw new Error("Naver Maps SDK 초기화 실패");
  naverLoaded = true;
}
