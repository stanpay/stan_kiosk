import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCloseOnIdle } from "../contexts/IdleContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FACILITIES,
  distanceMeters,
  formatDistance,
  type Facility,
  type FacilityKind,
} from "../data/facilities";
import { loadNaverMaps } from "../lib/naverMaps";
import { KIOSK_FIXED_LOCATION } from "../services/stores";

type KindFilter = "all" | FacilityKind;

const KIND_FILTERS: KindFilter[] = ["all", "toilet", "parking"];

const KIND_LABELS: Record<KindFilter, string> = {
  all: "전체",
  toilet: "화장실",
  parking: "주차장",
};

const KIND_PIN_COLOR: Record<FacilityKind, string> = {
  toilet: "#0ea5e9",
  parking: "#16a34a",
};

type MarkerEntry = {
  id: string;
  marker: naver.maps.Marker;
  facility: Facility;
};

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

function buildFacilityPin(
  facility: Facility,
  selected: boolean,
  onSelect: (id: string) => void,
) {
  const color = KIND_PIN_COLOR[facility.kind];
  const selectedColor = "#ea580c";
  const root = document.createElement("div");
  root.style.cssText = "position:absolute;width:0;height:0;user-select:none;";

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:absolute;bottom:0;left:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;";

  const balloon = document.createElement("div");
  balloon.dataset.pinBalloon = "1";
  balloon.dataset.pinColor = color;
  balloon.style.cssText = selected
    ? `display:flex;align-items:center;background:${selectedColor};border-radius:8px;padding:4px 8px;box-shadow:0 2px 8px rgba(234,88,12,.45);white-space:nowrap;transform:scale(1.1);`
    : `display:flex;align-items:center;background:${color};border-radius:8px;padding:4px 8px;box-shadow:0 2px 6px rgba(0,0,0,.3);white-space:nowrap;`;

  const label = document.createElement("span");
  label.style.cssText =
    "font-size:11px;font-weight:700;color:#fff;line-height:1.2;";
  label.textContent = facility.name;
  balloon.appendChild(label);

  const tail = document.createElement("div");
  tail.dataset.pinTail = "1";
  tail.style.cssText = selected
    ? `width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${selectedColor};`
    : `width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};`;

  wrapper.appendChild(balloon);
  wrapper.appendChild(tail);
  root.appendChild(wrapper);
  wrapper.addEventListener("click", (ev) => {
    ev.stopPropagation();
    onSelect(facility.id);
  });
  return root;
}

function styleMarkers(entries: MarkerEntry[], selectedId: string | null) {
  entries.forEach(({ id, marker, facility }) => {
    const selected = id === selectedId;
    marker.setZIndex(selected ? 45 : 10);
    const content = marker.getIcon()?.content;
    if (!(content instanceof HTMLElement)) return;
    const balloon = content.querySelector(
      "[data-pin-balloon]",
    ) as HTMLElement | null;
    const tail = content.querySelector("[data-pin-tail]") as HTMLElement | null;
    const base = balloon?.dataset.pinColor || KIND_PIN_COLOR[facility.kind];
    const color = selected ? "#ea580c" : base;
    if (balloon) {
      balloon.style.background = color;
      balloon.style.transform = selected ? "scale(1.1)" : "scale(1)";
      balloon.style.boxShadow = selected
        ? "0 2px 8px rgba(234,88,12,.45)"
        : "0 2px 6px rgba(0,0,0,.3)";
    }
    if (tail) {
      tail.style.borderTopColor = color;
    }
  });
}

function FacilityPopup({
  facility,
  distanceLabel,
  onClose,
}: {
  facility: Facility;
  distanceLabel: string;
  onClose: () => void;
}) {
  const host = document.querySelector(".kiosk-frame") ?? document.body;
  const kindLabel = facility.kind === "toilet" ? "화장실" : "주차장";

  return createPortal(
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/45 p-[3cqw]"
      onClick={onClose}
      role="presentation"
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-label={facility.name}
        className="flex w-[68cqw] max-h-[78cqh] flex-col overflow-hidden rounded-[1.6cqw] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex items-start justify-between gap-[2.4cqw] border-b border-slate-100 px-[3cqw] py-[2cqh]">
          <div>
            <p className="text-[1.6cqh] font-semibold text-slate-500">
              {kindLabel}
            </p>
            <h2 className="mt-[0.5cqh] text-[2.8cqh] font-extrabold leading-snug text-slate-900">
              {facility.name}
            </h2>
            <p className="mt-[0.7cqh] text-[1.9cqh] text-slate-500">
              현재 위치에서 {distanceLabel}
              {facility.address ? ` · ${facility.address}` : ""}
            </p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-[5cqh] w-[5cqh] shrink-0 items-center justify-center rounded-full bg-slate-100 text-[2.4cqh] font-bold text-slate-700"
          >
            ×
          </button>
        </div>
      </article>
    </div>,
    host,
  );
}

export default function FacilityMapView() {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const selectRef = useRef<(id: string) => void>(() => {});
  const visibleIdsRef = useRef<Set<string>>(new Set());

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const filtered = useMemo(() => {
    const list =
      kindFilter === "all"
        ? FACILITIES
        : FACILITIES.filter((f) => f.kind === kindFilter);
    return [...list].sort(
      (a, b) =>
        distanceMeters(
          KIOSK_FIXED_LOCATION.latitude,
          KIOSK_FIXED_LOCATION.longitude,
          a.latitude,
          a.longitude,
        ) -
        distanceMeters(
          KIOSK_FIXED_LOCATION.latitude,
          KIOSK_FIXED_LOCATION.longitude,
          b.latitude,
          b.longitude,
        ),
    );
  }, [kindFilter]);

  const selectedFacility = useMemo(
    () => FACILITIES.find((f) => f.id === selectedId) ?? null,
    [selectedId],
  );

  const selectedDistance = selectedFacility
    ? formatDistance(
        distanceMeters(
          KIOSK_FIXED_LOCATION.latitude,
          KIOSK_FIXED_LOCATION.longitude,
          selectedFacility.latitude,
          selectedFacility.longitude,
        ),
      )
    : "";

  visibleIdsRef.current = new Set(filtered.map((f) => f.id));

  const closePopup = () => {
    setSelectedId(null);
    styleMarkers(markersRef.current, null);
  };
  const isIdle = useCloseOnIdle(closePopup);

  selectRef.current = (id: string) => {
    setSelectedId(id);
    styleMarkers(markersRef.current, id);
    const entry = markersRef.current.find((m) => m.id === id);
    const map = mapRef.current;
    if (entry && map && window.naver?.maps) {
      map.setCenter(
        new window.naver.maps.LatLng(
          entry.facility.latitude,
          entry.facility.longitude,
        ),
      );
    }
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
  }, [filtered, selectedId]);

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
          zoom: KIOSK_FIXED_LOCATION.zoom,
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

        markersRef.current.forEach(({ marker }) => {
          try {
            marker.setMap(null);
          } catch {
            /* ignore */
          }
        });

        markersRef.current = FACILITIES.map((facility) => {
          const content = buildFacilityPin(facility, false, (id) =>
            selectRef.current(id),
          );
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(
              facility.latitude,
              facility.longitude,
            ),
            map,
            zIndex: 10,
            clickable: true,
            icon: {
              content,
              anchor: new naver.maps.Point(0, 0),
            },
          });
          naver.maps.Event.addListener(marker, "click", () =>
            selectRef.current(facility.id),
          );
          return { id: facility.id, marker, facility };
        });

        window.setTimeout(() => {
          try {
            naver.maps.Event.trigger(map, "resize");
            map.setCenter(center);
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

      {selectedFacility && !isIdle ? (
        <FacilityPopup
          facility={selectedFacility}
          distanceLabel={selectedDistance}
          onClose={closePopup}
        />
      ) : null}

      <div className="relative z-20 flex shrink-0 flex-col gap-[0.8cqh] border-t border-slate-200 bg-white/95 px-[2cqw] py-[1cqh] backdrop-blur">
        <div
          className="flex gap-[1cqw] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="toolbar"
          aria-label="편의시설 필터"
        >
          {KIND_FILTERS.map((id) => {
            const active = kindFilter === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setKindFilter(id)}
                className={[
                  "flex shrink-0 items-center justify-center rounded-full border px-[2.2cqw] py-[0.7cqh] text-[1.45cqh] font-semibold transition-colors",
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-300 bg-white text-slate-800",
                ].join(" ")}
              >
                <span className="whitespace-nowrap">
                  {KIND_LABELS[id]}
                  {id !== "all"
                    ? ` ${FACILITIES.filter((f) => f.kind === id).length}`
                    : ` ${FACILITIES.length}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
