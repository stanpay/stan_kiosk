import type { Plugin } from "vite";

type RawItem = Record<string, unknown>;

const TOP_LIMIT = 200;

/**
 * 개발/프리뷰에서 VisitJEJU 좋아요순 N건(+대표사진)을 프록시.
 * 브라우저는 `/api/visitjeju/top` 만 호출한다 (API 키·쿠키 비노출).
 */
export function visitJejuDevApiPlugin(): Plugin {
  const handler = async (
    _req: unknown,
    res: {
      statusCode: number;
      setHeader: (k: string, v: string) => void;
      end: (body: string) => void;
    },
    next: (err?: unknown) => void,
  ) => {
    try {
      const payload = await fetchMarkcntTop(TOP_LIMIT);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(payload));
    } catch (err) {
      console.error("[visitjeju]", err);
      next();
    }
  };

  return {
    name: "visitjeju-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/visitjeju/top", handler);
      // 하위 호환
      server.middlewares.use("/api/visitjeju/top100", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/visitjeju/top", handler);
      server.middlewares.use("/api/visitjeju/top100", handler);
    },
  };
}

async function fetchMarkcntTop(limit: number): Promise<{
  result: string;
  items: RawItem[];
  totalCount: number;
}> {
  const tokenRes = await fetch("https://api.visitjeju.net/api/auth/token", {
    headers: {
      Origin: "https://visitjeju.net",
      Referer: "https://visitjeju.net/",
      Accept: "application/json",
    },
  });
  if (!tokenRes.ok) {
    throw new Error(`token ${tokenRes.status}`);
  }
  const setCookie = tokenRes.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");

  const qs = new URLSearchParams({
    locale: "kr",
    cate1cd: "cate0000000002",
    sorting: "markcnt desc, title_kr asc",
    pageSize: String(limit),
    page: "1",
    q: "",
    tag: "",
    region1cd: "",
    region2cd: "",
  });

  const listRes = await fetch(
    `https://api.visitjeju.net/api/contents/list?${qs}`,
    {
      headers: {
        Origin: "https://visitjeju.net",
        Referer: "https://visitjeju.net/",
        Accept: "application/json",
        Cookie: cookie,
      },
    },
  );
  if (!listRes.ok) {
    throw new Error(`contents/list ${listRes.status}`);
  }
  const data = (await listRes.json()) as {
    result?: string;
    items?: RawItem[];
    totalCount?: number;
  };
  if (data.result && data.result !== "200") {
    throw new Error(`contents/list result ${data.result}`);
  }
  return {
    result: "200",
    items: data.items ?? [],
    totalCount: data.totalCount ?? 0,
  };
}
