/**
 * admdongkor 읍면동 경계 → 제주 관광권역 SVG path JSON
 * 실행: node scripts/build-jeju-tourism-map.mjs
 */
import * as adk from "admdongkor";
import polygonClipping from "polygon-clipping";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/data/jeju-tourism-regions.json");

/** @type {Record<string, { id: string, label: string, match: (p: any) => boolean }>} */
const REGIONS = [
  {
    id: "hangyeong",
    label: "한경면",
    match: (p) => p.emdnm === "한경면",
  },
  {
    id: "hallim",
    label: "한림읍",
    match: (p) => p.emdnm === "한림읍",
  },
  {
    id: "aewol",
    label: "애월읍",
    match: (p) => p.emdnm === "애월읍",
  },
  {
    id: "jeju-si",
    label: "제주시",
    match: (p) =>
      p.sggnm === "제주시" &&
      p.emdnm.endsWith("동") &&
      p.emdnm !== "추자면",
  },
  {
    id: "jocheon",
    label: "조천읍",
    match: (p) => p.emdnm === "조천읍",
  },
  {
    id: "gujwa",
    label: "구좌읍",
    match: (p) => p.emdnm === "구좌읍",
  },
  {
    id: "udo",
    label: "우도",
    match: (p) => p.emdnm === "우도면",
  },
  {
    id: "daejeong",
    label: "대정읍",
    match: (p) => p.emdnm === "대정읍",
  },
  {
    id: "andeok",
    label: "안덕면",
    match: (p) => p.emdnm === "안덕면",
  },
  {
    id: "jungmun",
    label: "중문",
    match: (p) => p.emdnm === "중문동" || p.emdnm === "예래동",
  },
  {
    id: "seogwipo",
    label: "서귀포시",
    match: (p) =>
      p.sggnm === "서귀포시" &&
      p.emdnm.endsWith("동") &&
      p.emdnm !== "중문동" &&
      p.emdnm !== "예래동",
  },
  {
    id: "namwon",
    label: "남원읍",
    match: (p) => p.emdnm === "남원읍",
  },
  {
    id: "pyoseon",
    label: "표선면",
    match: (p) => p.emdnm === "표선면",
  },
  {
    id: "seongsan",
    label: "성산읍",
    match: (p) => p.emdnm === "성산읍",
  },
];

function ringToPath(ring, project) {
  if (!ring?.length) return "";
  return (
    ring
      .map(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

function geometryToPath(geometry, project) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringToPath(ring, project)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((poly) => poly.map((ring) => ringToPath(ring, project)).join(" "))
      .join(" ");
  }
  return "";
}

function collectCoords(geometry, out) {
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) for (const c of ring) out.push(c);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates)
      for (const ring of poly) for (const c of ring) out.push(c);
  }
}

/** GeoJSON geometry → polygon-clipping MultiPolygon */
function toClippingPolys(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

/** 여러 읍면동 폴리곤을 하나로 dissolve (내부 경계 제거) */
function dissolveFeatures(features) {
  const polys = features.flatMap((f) => toClippingPolys(f.geometry));
  if (!polys.length) return null;
  if (polys.length === 1) {
    return { type: "Polygon", coordinates: polys[0] };
  }
  const united = polygonClipping.union(...polys);
  if (!united?.length) return null;
  if (united.length === 1) {
    return { type: "Polygon", coordinates: united[0] };
  }
  return { type: "MultiPolygon", coordinates: united };
}

/** 외곽링 면적(절댓값) — 구멍 제외, MultiPolygon 중 본토 선택용 */
function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return a / 2;
}

/** Shoelace 면적 중심 */
function ringCentroid(ring) {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    a += cross;
    cx += (ring[j][0] + ring[i][0]) * cross;
    cy += (ring[j][1] + ring[i][1]) * cross;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-18) {
    let sx = 0;
    let sy = 0;
    for (const [x, y] of ring) {
      sx += x;
      sy += y;
    }
    return [sx / ring.length, sy / ring.length];
  }
  return [cx / (6 * a), cy / (6 * a)];
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    const ex = p[0] - a[0];
    const ey = p[1] - a[1];
    return Math.hypot(ex, ey);
  }
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function distToRing(point, ring) {
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    min = Math.min(min, distToSegment(point, ring[j], ring[i]));
  }
  return min;
}

/**
 * 가장 큰 외곽 링의 시각적 중심 (격자 탐색 + 면적중심 후보)
 * 라벨이 구역 안·중앙에 오도록
 */
function visualCenterOfGeometry(geometry) {
  const polys =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];
  if (!polys.length) return [126.5, 33.4];

  let bestPoly = polys[0];
  let bestAbs = Math.abs(ringArea(bestPoly[0]));
  for (const poly of polys) {
    const abs = Math.abs(ringArea(poly[0]));
    if (abs > bestAbs) {
      bestAbs = abs;
      bestPoly = poly;
    }
  }

  const outer = bestPoly[0];
  const holes = bestPoly.slice(1);
  const centroid = ringCentroid(outer);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of outer) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const isInside = (p) =>
    pointInRing(p, outer) && holes.every((h) => !pointInRing(p, h));

  const score = (p) => {
    if (!isInside(p)) return -1;
    let d = distToRing(p, outer);
    for (const h of holes) d = Math.min(d, distToRing(p, h));
    return d;
  };

  let best = centroid;
  let bestScore = score(centroid);

  const steps = 28;
  for (let iy = 0; iy <= steps; iy++) {
    for (let ix = 0; ix <= steps; ix++) {
      const p = [
        minX + ((maxX - minX) * ix) / steps,
        minY + ((maxY - minY) * iy) / steps,
      ];
      const s = score(p);
      if (s > bestScore) {
        bestScore = s;
        best = p;
      }
    }
  }

  // 주변 미세 조정
  const span = Math.max(maxX - minX, maxY - minY);
  const refine = span / (steps * 4);
  for (const [dx, dy] of [
    [0, 0],
    [refine, 0],
    [-refine, 0],
    [0, refine],
    [0, -refine],
    [refine, refine],
    [refine, -refine],
    [-refine, refine],
    [-refine, -refine],
  ]) {
    const p = [best[0] + dx, best[1] + dy];
    const s = score(p);
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }

  return bestScore >= 0 ? best : centroid;
}

const fc = await adk.get("20251001", "emd");
const jeju = fc.features.filter(
  (f) =>
    f.properties.sidonm?.includes("제주") && f.properties.emdnm !== "추자면",
);

const allCoords = [];
for (const f of jeju) collectCoords(f.geometry, allCoords);

let minLng = Infinity,
  minLat = Infinity,
  maxLng = -Infinity,
  maxLat = -Infinity;
for (const [lng, lat] of allCoords) {
  minLng = Math.min(minLng, lng);
  minLat = Math.min(minLat, lat);
  maxLng = Math.max(maxLng, lng);
  maxLat = Math.max(maxLat, lat);
}

const pad = 0.02;
minLng -= pad;
maxLng += pad;
minLat -= pad;
maxLat += pad;

const WIDTH = 1000;
const heightRaw = ((maxLat - minLat) / (maxLng - minLng)) * WIDTH;
const HEIGHT = Math.round(heightRaw);

function project(lng, lat) {
  const x = ((lng - minLng) / (maxLng - minLng)) * WIDTH;
  const y = ((maxLat - lat) / (maxLat - minLat)) * HEIGHT;
  return [x, y];
}

const regions = REGIONS.map((region) => {
  const features = jeju.filter((f) => region.match(f.properties));
  if (!features.length) {
    console.warn("no features for", region.id);
  }
  const dissolved = dissolveFeatures(features);
  const path = dissolved ? geometryToPath(dissolved, project) : "";
  const [clng, clat] = dissolved
    ? visualCenterOfGeometry(dissolved)
    : [126.5, 33.4];
  const [lx, ly] = project(clng, clat);
  return {
    id: region.id,
    label: region.label,
    path,
    labelX: Math.round(lx * 100) / 100,
    labelY: Math.round(ly * 100) / 100,
  };
});

const payload = {
  source: "admdongkor@20251001 emd dissolved to tourism regions",
  viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
  width: WIDTH,
  height: HEIGHT,
  regions,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload));
console.log(
  "wrote",
  OUT,
  "regions",
  regions.length,
  "kb",
  Math.round(JSON.stringify(payload).length / 1024),
);
for (const r of regions) {
  console.log(r.id, r.label, "pathLen", r.path.length, "label", r.labelX, r.labelY);
}
