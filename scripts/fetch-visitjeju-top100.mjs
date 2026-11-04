/**
 * VisitJEJU 관광지 좋아요(markcnt) 순 상위 200건 → 권역별 JSON
 * 실행: node scripts/fetch-visitjeju-top100.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOP_LIMIT = 200;
const OUT = join(__dirname, "../public/data/visitjeju-top200.json");
const OUT_LEGACY = join(__dirname, "../public/data/visitjeju-top100.json");

/** VisitJEJU region2 라벨 → 키오스크 관광권역 id */
const REGION_MAP = {
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

const headers = {
  "User-Agent": "Mozilla/5.0 (compatible; stan-kiosk/1.0)",
  Origin: "https://visitjeju.net",
  Referer: "https://visitjeju.net/",
  Accept: "application/json",
};

async function main() {
  const tokenRes = await fetch("https://api.visitjeju.net/api/auth/token", {
    headers,
    credentials: "include",
  });
  if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
  const setCookie = tokenRes.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");

  const qs = new URLSearchParams({
    locale: "kr",
    cate1cd: "cate0000000002",
    sorting: "markcnt desc, title_kr asc",
    pageSize: String(TOP_LIMIT),
    page: "1",
    q: "",
    tag: "",
    region1cd: "",
    region2cd: "",
  });

  const listRes = await fetch(
    `https://api.visitjeju.net/api/contents/list?${qs}`,
    {
      headers: { ...headers, Cookie: cookie },
    },
  );
  if (!listRes.ok) throw new Error(`list ${listRes.status}`);
  const data = await listRes.json();
  if (data.result !== "200") throw new Error(JSON.stringify(data));

  /** @type {Record<string, object[]>} */
  const byRegion = {};
  const items = data.items.map((it, idx) => {
    const region2 = it.region2cd?.label || "";
    const regionId = REGION_MAP[region2] ?? null;
    const row = {
      rank: idx + 1,
      contentsid: it.contentsid,
      title: it.title,
      address: it.address || it.roadaddress || "",
      region1: it.region1cd?.label || "",
      region2,
      regionId,
      markcnt: it.markcnt ?? 0,
      latitude: it.latitude ?? null,
      longitude: it.longitude ?? null,
      introduction: it.introduction || "",
      thumbnail:
        it.repPhoto?.photoid?.thumbnailpath ||
        it.repPhoto?.thumbnailpath ||
        "",
    };
    if (regionId) {
      (byRegion[regionId] ??= []).push(row);
    } else {
      console.warn("unmapped", row.title, region2);
    }
    return row;
  });

  const payload = {
    fetchedAt: new Date().toISOString(),
    source: `https://visitjeju.net markcnt top ${TOP_LIMIT} (cate0000000002)`,
    totalCount: data.totalCount,
    itemCount: items.length,
    items,
    byRegion,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  const json = JSON.stringify(payload, null, 2);
  writeFileSync(OUT, json);
  writeFileSync(OUT_LEGACY, json);
  console.log(
    "wrote",
    OUT,
    "items",
    items.length,
    "regions",
    Object.keys(byRegion).length,
  );
  for (const [id, list] of Object.entries(byRegion).sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    console.log(`  ${id}: ${list.length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
