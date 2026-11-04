import { useEffect, useState } from "react";
import {
  TOURISM_REGION_LABELS,
  type TourismRegionId,
} from "../data/tourism";
import type { LanguageCode } from "../lib/languages";

type RegionPath = {
  id: TourismRegionId;
  label: string;
  path: string;
  labelX: number;
  labelY: number;
};

type MapData = {
  viewBox: string;
  regions: RegionPath[];
};

type Props = {
  language: LanguageCode;
  selectedId: TourismRegionId | null;
  onSelect: (id: TourismRegionId) => void;
};

const FILL_IDLE = "#FFFFFF";
const FILL_HOVER = "#FFF1E6";
const FILL_SELECTED = "#F97316"; /* 제주 어울리는 주황 */
const STROKE = "#111827";

let mapPromise: Promise<MapData> | null = null;
let mapCache: MapData | null = null;

export function prefetchJejuTourismMap(): Promise<MapData> {
  if (!mapPromise) {
    mapPromise = fetch("/data/jeju-tourism-regions.json")
      .then((res) => {
        if (!res.ok) throw new Error("map load failed");
        return res.json() as Promise<MapData>;
      })
      .then((data) => {
        mapCache = data;
        return data;
      })
      .catch((err) => {
        mapPromise = null;
        throw err;
      });
  }
  return mapPromise;
}

export default function JejuTourismMap({
  language,
  selectedId,
  onSelect,
}: Props) {
  const [mapData, setMapData] = useState<MapData | null>(mapCache);
  const [hoverId, setHoverId] = useState<TourismRegionId | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (mapCache) {
      setMapData(mapCache);
      return;
    }
    let cancelled = false;
    prefetchJejuTourismMap()
      .then((data) => {
        if (!cancelled) setMapData(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-[1.6cqh] text-slate-500">
        지도를 불러오지 못했습니다
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="flex h-full items-center justify-center text-[1.6cqh] text-slate-400">
        지도 로딩 중…
      </div>
    );
  }

  return (
    <svg
      viewBox={mapData.viewBox}
      className="mt-auto h-auto max-h-full w-full"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label="제주 관광 권역 지도"
    >
      {mapData.regions.map((region) => {
        const selected = region.id === selectedId;
        const hovered = region.id === hoverId;
        const fill = selected
          ? FILL_SELECTED
          : hovered
            ? FILL_HOVER
            : FILL_IDLE;
        return (
          <path
            key={region.id}
            d={region.path}
            fill={fill}
            stroke={STROKE}
            strokeWidth={selected ? 3 : 2.2}
            strokeLinejoin="round"
            className="cursor-pointer transition-[fill,stroke-width] duration-150"
            onPointerDown={(e) => {
              e.preventDefault();
              onSelect(region.id);
            }}
            onPointerEnter={() => setHoverId(region.id)}
            onPointerLeave={() => setHoverId(null)}
          />
        );
      })}

      {mapData.regions.map((region) => {
        const label =
          TOURISM_REGION_LABELS[region.id]?.[language] ?? region.label;
        return (
          <text
            key={`${region.id}-label`}
            x={region.labelX}
            y={region.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none"
            style={{
              fontSize: region.id === "udo" ? 18 : 22,
              fontWeight: 700,
              fill: "#111827",
            }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
