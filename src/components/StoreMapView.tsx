import { useEffect, useMemo, useRef, useState } from "react";
import { useCloseOnIdle } from "../contexts/IdleContext";
import { useLanguage } from "../contexts/LanguageContext";
import { loadNaverMaps } from "../lib/naverMaps";
import {
  storeMatchesAllChipFilters,
  toggleChipSelection,
  type BenefitFilterChipId,
  type CategoryFilterChipId,
  type StoreAreaFilterChipId,
  type StoreChipSelection,
} from "../lib/storeFilters";
import {
  KIOSK_FIXED_LOCATION,
  getNearbyStores,
  type NearbyStore,
} from "../services/stores";
import StoreFilterBar from "./StoreFilterBar";
import StorePinPopup from "./StorePinPopup";

const NEARBY_RADIUS_M = 2000;
const PIN_LABEL_FONT_SIZE_PX = 11;
/** 네이버 지도 축척 약 30m */
const STORE_MAP_ZOOM = 18;

/** 현재 위치를 지도 화면 우측 하단에 두도록 중심을 보정 */
function frameCurrentLocationBottomRight(
  map: naver.maps.Map,
  location: naver.maps.LatLng,
) {
  map.setZoom(STORE_MAP_ZOOM, false);
  map.setCenter(location);
  const size = map.getSize();
  // 중심을 좌·상으로 이동해야 고정 마커가 화면 우하단에 보임
  const offsetX = Math.round(size.width * 0.36);
  const offsetY = Math.round(size.height * 0.34);
  map.panBy(new window.naver!.maps.Point(-offsetX, -offsetY));
}

function buildMyLocationPin() {
  const root = document.createElement("div");
  root.style.cssText = "position:absolute;width:0;height:0;pointer-events:none;";
  root.title = "현재 위치";
  const pulse = document.createElement("div");
  pulse.style.cssText =
    "position:absolute;width:28px;height:28px;transform:translate(-50%,-50%);border-radius:9999px;background:rgba(34,197,94,.25);";
  const dot = document.createElement("div");
  dot.style.cssText =
    "position:absolute;width:14px;height:14px;transform:translate(-50%,-50%);border-radius:9999px;background:#22c55e;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);";
  root.appendChild(pulse);
  root.appendChild(dot);
  return root;
}

type MarkerEntry = {
  id: number;
  marker: naver.maps.Marker;
  store: NearbyStore;
};

function buildStorePin(
  store: NearbyStore,
  selected: boolean,
  onSelect: (id: number) => void,
) {
  const root = document.createElement("div");
  root.style.cssText = "position:absolute;width:0;height:0;user-select:none;";

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:absolute;bottom:0;left:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;";

  const balloon = document.createElement("div");
  balloon.dataset.pinBalloon = "1";
  balloon.style.cssText = selected
    ? "display:flex;align-items:center;background:#ea580c;border-radius:8px;padding:4px 8px;box-shadow:0 2px 8px rgba(234,88,12,.45);white-space:nowrap;transform:scale(1.1);"
    : "display:flex;align-items:center;background:#2D8CFF;border-radius:8px;padding:4px 8px;box-shadow:0 2px 6px rgba(0,0,0,.3);white-space:nowrap;";

  const label = document.createElement("span");
  label.style.cssText = `font-size:${PIN_LABEL_FONT_SIZE_PX}px;font-weight:700;color:#fff;line-height:1.2;`;
  label.textContent = store.name;
  balloon.appendChild(label);

  const tail = document.createElement("div");
  tail.dataset.pinTail = "1";
  tail.style.cssText = selected
    ? "width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #ea580c;"
    : "width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #2D8CFF;";

  wrapper.appendChild(balloon);
  wrapper.appendChild(tail);
  root.appendChild(wrapper);
  wrapper.addEventListener("click", (ev) => {
    ev.stopPropagation();
    onSelect(store.id);
  });
  return root;
}

function styleMarkers(entries: MarkerEntry[], selectedId: number | null) {
  entries.forEach(({ id, marker }) => {
    const selected = id === selectedId;
    marker.setZIndex(selected ? 45 : 10);
    const content = marker.getIcon()?.content;
    if (!(content instanceof HTMLElement)) return;
    const balloon = content.querySelector(
      "[data-pin-balloon]",
    ) as HTMLElement | null;
    const tail = content.querySelector("[data-pin-tail]") as HTMLElement | null;
    if (balloon) {
      balloon.style.background = selected ? "#ea580c" : "#2D8CFF";
      balloon.style.transform = selected ? "scale(1.1)" : "scale(1)";
      balloon.style.boxShadow = selected
        ? "0 2px 8px rgba(234,88,12,.45)"
        : "0 2px 6px rgba(0,0,0,.3)";
    }
    if (tail) {
      tail.style.borderTopColor = selected ? "#ea580c" : "#2D8CFF";
    }
  });
}

export default function StoreMapView() {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<(id: number) => void>(() => {});
  const visibleIdsRef = useRef<Set<number>>(new Set());

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [areaChips, setAreaChips] = useState<Set<StoreAreaFilterChipId>>(
    () => new Set(["all"]),
  );
  const [benefitChips, setBenefitChips] = useState<Set<BenefitFilterChipId>>(
    () => new Set(["all"]),
  );
  const [categoryChips, setCategoryChips] = useState<Set<CategoryFilterChipId>>(
    () => new Set(["all"]),
  );

  const chipSelection = useMemo<StoreChipSelection>(
    () => ({
      area: areaChips,
      benefit: benefitChips,
      category: categoryChips,
    }),
    [areaChips, benefitChips, categoryChips],
  );

  const filteredStores = useMemo(
    () =>
      stores
        .filter((store) => storeMatchesAllChipFilters(store, chipSelection))
        .sort((a, b) => a.distance_m - b.distance_m),
    [stores, chipSelection],
  );

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedId) ?? null,
    [stores, selectedId],
  );

  visibleIdsRef.current = new Set(filteredStores.map((s) => s.id));

  const closePopup = () => {
    setSelectedId(null);
    styleMarkers(markersRef.current, null);
  };
  const isIdle = useCloseOnIdle(closePopup);

  selectRef.current = (id: number) => {
    setSelectedId(id);
    styleMarkers(markersRef.current, id);
    const entry = markersRef.current.find((m) => m.id === id);
    const map = mapRef.current;
    if (entry && map && window.naver?.maps) {
      map.setCenter(
        new window.naver.maps.LatLng(entry.store.latitude, entry.store.longitude),
      );
    }
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector(`[data-store-card="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  };

  useEffect(() => {
    const map = mapRef.current;
    markersRef.current.forEach(({ id, marker }) => {
      try {
        marker.setMap(visibleIdsRef.current.has(id) ? map : null);
      } catch {
        /* ignore */
      }
    });
    if (selectedId != null && !visibleIdsRef.current.has(selectedId)) {
      setSelectedId(null);
      styleMarkers(markersRef.current, null);
    }
  }, [filteredStores, selectedId]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        await loadNaverMaps(language);
        if (cancelled || !mapContainerRef.current || !window.naver?.maps) return;

        const naver = window.naver;
        const center = new naver.maps.LatLng(
          KIOSK_FIXED_LOCATION.latitude,
          KIOSK_FIXED_LOCATION.longitude,
        );
        const map = new naver.maps.Map(mapContainerRef.current, {
          center,
          zoom: STORE_MAP_ZOOM,
          maxZoom: 21,
          minZoom: 12,
        });
        mapRef.current = map;

        naver.maps.Event.addListener(map, "click", () => {
          setSelectedId(null);
          styleMarkers(markersRef.current, null);
        });

        new naver.maps.Marker({
          position: center,
          map,
          zIndex: 100,
          clickable: false,
          icon: {
            content: buildMyLocationPin(),
            anchor: new naver.maps.Point(0, 0),
          },
        });

        const nearby = await getNearbyStores(
          KIOSK_FIXED_LOCATION.latitude,
          KIOSK_FIXED_LOCATION.longitude,
          NEARBY_RADIUS_M,
        );
        if (cancelled) return;

        const withCoords = nearby.filter(
          (s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude),
        );
        setStores(withCoords);

        markersRef.current.forEach(({ marker }) => {
          try {
            marker.setMap(null);
          } catch {
            /* ignore */
          }
        });

        markersRef.current = withCoords.map((store) => {
          const content = buildStorePin(store, false, (id) =>
            selectRef.current(id),
          );
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(store.latitude, store.longitude),
            map,
            zIndex: 10,
            clickable: true,
            icon: {
              content,
              anchor: new naver.maps.Point(0, 0),
            },
          });
          naver.maps.Event.addListener(marker, "click", () =>
            selectRef.current(store.id),
          );
          return { id: store.id, marker, store };
        });

        window.setTimeout(() => {
          try {
            naver.maps.Event.trigger(map, "resize");
            frameCurrentLocationBottomRight(map, center);
          } catch {
            /* ignore */
          }
        }, 120);

        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "지도를 불러오지 못했습니다.",
        );
      }
    };

    void run();

    return () => {
      cancelled = true;
      markersRef.current.forEach(({ marker }) => {
        try {
          marker.setMap(null);
        } catch {
          /* ignore */
        }
      });
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [language]);

  return (
    <section className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-200">
      <div ref={mapContainerRef} className="min-h-0 w-full flex-1" />

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-100/70 text-[2cqh] font-medium text-slate-700">
          지도를 불러오는 중…
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-x-[4cqw] top-[4cqh] rounded-[1cqw] bg-white/95 p-[2cqw] text-[1.8cqh] text-red-700 shadow">
          {errorMessage}
        </div>
      )}

      {selectedStore && !isIdle ? (
        <StorePinPopup store={selectedStore} onClose={closePopup} />
      ) : null}

      <StoreFilterBar
        areaChips={areaChips}
        benefitChips={benefitChips}
        categoryChips={categoryChips}
        onToggleArea={(id) =>
          setAreaChips((prev) => toggleChipSelection(prev, id, "all"))
        }
        onToggleBenefit={(id) =>
          setBenefitChips((prev) => toggleChipSelection(prev, id, "all"))
        }
        onToggleCategory={(id) =>
          setCategoryChips((prev) => toggleChipSelection(prev, id, "all"))
        }
      />

      <div className="z-10 flex h-[28%] min-h-[16cqh] flex-col border-t border-slate-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex shrink-0 items-center justify-between px-[2.2cqw] py-[0.9cqh]">
          <h2 className="text-[2cqh] font-bold text-slate-900">
            주변 매장
            <span className="ml-[1cqw] text-[1.6cqh] font-semibold text-slate-500">
              {filteredStores.length}곳
            </span>
          </h2>
          <span className="text-[1.35cqh] text-slate-500">현재 위치 기준 2km</span>
        </div>

        <div
          ref={listRef}
          className="flex min-h-0 flex-1 gap-[1.4cqw] overflow-x-auto overflow-y-hidden px-[2.2cqw] pb-[1.2cqh]"
        >
          {filteredStores.map((store) => {
            const selected = store.id === selectedId;
            return (
              <button
                key={store.id}
                type="button"
                data-store-card={store.id}
                onClick={() => selectRef.current(store.id)}
                className={[
                  "flex h-full w-[42cqw] shrink-0 flex-col overflow-hidden rounded-[1.2cqw] border text-left transition-colors",
                  selected
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-slate-200 bg-white",
                ].join(" ")}
              >
                <div className="relative h-[58%] w-full shrink-0 overflow-hidden bg-slate-100">
                  {store.image_url ? (
                    <img
                      src={store.image_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[1.5cqh] text-slate-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-center gap-[0.3cqh] px-[1.4cqw] py-[0.8cqh]">
                  <p className="line-clamp-2 text-[1.7cqh] font-bold leading-snug text-slate-900">
                    {store.name}
                  </p>
                  <p className="truncate text-[1.35cqh] text-slate-500">
                    {store.distance}
                    {store.category ? ` · ${store.category}` : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
