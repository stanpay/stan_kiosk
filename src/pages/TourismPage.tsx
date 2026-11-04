import { useEffect, useMemo, useRef, useState } from "react";
import JejuTourismMap from "../components/JejuTourismMap";
import TourismSpotPopup from "../components/TourismSpotPopup";
import { useCloseOnIdle } from "../contexts/IdleContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  TOURISM_HINT,
  TOURISM_REGION_LABELS,
  type TourismRegionId,
} from "../data/tourism";
import {
  fetchVisitJejuTopSpots,
  getCachedVisitJejuTopSpots,
  type VisitJejuSpot,
  type VisitJejuSpotsByRegion,
} from "../services/visitJeju";

/** stan 매장 카드뷰와 유사한 2열 카드 */
function SpotCard({
  spot,
  onSelect,
}: {
  spot: VisitJejuSpot;
  onSelect: (spot: VisitJejuSpot) => void;
}) {
  const src = spot.image || spot.thumbnail;

  return (
    <li className="h-full">
      <button
        type="button"
        onClick={() => onSelect(spot)}
        className="flex h-full w-full flex-col overflow-hidden rounded-[1cqw] border border-slate-200/80 bg-white text-left shadow-sm transition-colors hover:border-orange-300 active:bg-orange-50/40"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
          {src ? (
            <img
              src={src}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[1.3cqh] text-slate-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[0.3cqh] px-[1cqw] py-[0.85cqh]">
          <h3 className="line-clamp-2 text-[1.85cqh] font-bold leading-snug text-slate-900">
            {spot.title}
          </h3>
          {spot.introduction ? (
            <p className="line-clamp-2 text-[1.2cqh] leading-snug text-slate-500">
              {spot.introduction}
            </p>
          ) : null}
          <p className="mt-auto inline-flex items-center gap-[0.25cqw] pt-[0.25cqh] text-[1.35cqh] text-slate-500">
            <svg
              viewBox="0 0 24 24"
              className="h-[1.35cqh] w-[1.35cqh] text-rose-500"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 21s-7.2-4.5-9.6-9A5.4 5.4 0 0 1 12 5.2 5.4 5.4 0 0 1 21.6 12c-2.4 4.5-9.6 9-9.6 9Z" />
            </svg>
            {spot.markcnt.toLocaleString("ko-KR")}
          </p>
        </div>
      </button>
    </li>
  );
}

export default function TourismPage() {
  const { language } = useLanguage();
  const cached = getCachedVisitJejuTopSpots();
  const [selectedId, setSelectedId] = useState<TourismRegionId | null>("jeju-si");
  const [spotsByRegion, setSpotsByRegion] = useState<VisitJejuSpotsByRegion>(
    () => cached?.byRegion ?? {},
  );
  const [loading, setLoading] = useState(() => !cached);
  const [loadError, setLoadError] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<VisitJejuSpot | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isIdle = useCloseOnIdle(() => setSelectedSpot(null));

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    fetchVisitJejuTopSpots()
      .then((result) => {
        if (cancelled) return;
        setSpotsByRegion(result.byRegion);
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cached]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  const spots = useMemo(
    () => (selectedId ? (spotsByRegion[selectedId] ?? []) : []),
    [selectedId, spotsByRegion],
  );

  const regionLabel = selectedId
    ? TOURISM_REGION_LABELS[selectedId][language]
    : "";

  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-slate-100">
      {/* 지도 영역(상단) — SVG는 이 div 하단 정렬 */}
      <div className="relative flex h-[58%] min-h-[34cqh] shrink-0 flex-col justify-end bg-white px-[1cqw] pb-[0.6cqh] pt-[2cqh]">
        <JejuTourismMap
          language={language}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* 목록 — 하단 스크롤 */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-slate-200/80 bg-white">
        <div className="flex shrink-0 items-center justify-between px-[1.2cqw] py-[0.75cqh]">
          <p className="text-[1.55cqh] font-bold text-slate-800">
            {selectedId ? regionLabel : "관광지"}
          </p>
          <p className="text-[1.25cqh] text-slate-500">
            {selectedId
              ? `좋아요순 ${spots.length}곳`
              : loading
                ? "불러오는 중…"
                : "위에서 구역을 선택하세요"}
          </p>
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[1cqw] pb-[1.2cqh]"
        >
          {loading ? (
            <p className="flex min-h-[14cqh] items-center justify-center text-[1.45cqh] text-slate-400">
              관광지 불러오는 중…
            </p>
          ) : loadError ? (
            <p className="flex min-h-[14cqh] items-center justify-center text-[1.45cqh] text-slate-500">
              관광지 목록을 불러오지 못했습니다
            </p>
          ) : !selectedId ? (
            <div className="flex min-h-[14cqh] flex-col items-center justify-center text-center">
              <p className="text-[1.55cqh] font-bold text-slate-800">
                {TOURISM_HINT[language]}
              </p>
            </div>
          ) : spots.length === 0 ? (
            <p className="flex min-h-[14cqh] items-center justify-center text-[1.45cqh] text-slate-500">
              {regionLabel} — 좋아요 상위 200위 내 관광지가 없습니다
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-[1cqw]">
              {spots.map((spot) => (
                <SpotCard
                  key={spot.contentsid}
                  spot={spot}
                  onSelect={setSelectedSpot}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedSpot && !isIdle ? (
        <TourismSpotPopup
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      ) : null}
    </section>
  );
}
