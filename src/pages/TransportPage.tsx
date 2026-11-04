import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import type { LanguageCode } from "../lib/languages";

type TransportTab = "bus" | "taxi";

const IMAGES: Record<TransportTab, Record<LanguageCode, string>> = {
  bus: {
    ko: "/images/transport/bus-ko.png",
    en: "/images/transport/bus-en.png",
    ja: "/images/transport/bus-ja.png",
    zh: "/images/transport/bus-zh.png",
  },
  taxi: {
    ko: "/images/transport/taxi-ko.png",
    en: "/images/transport/taxi-en.png",
    ja: "/images/transport/taxi-ja.png",
    zh: "/images/transport/taxi-zh.png",
  },
};

const TAB_LABELS: Record<TransportTab, Record<LanguageCode, string>> = {
  bus: {
    ko: "버스정보",
    en: "Bus Info",
    ja: "バス情報",
    zh: "巴士信息",
  },
  taxi: {
    ko: "택시정보",
    en: "Taxi Info",
    ja: "タクシー情報",
    zh: "出租车信息",
  },
};

const IMAGE_ALT: Record<TransportTab, Record<LanguageCode, string>> = {
  bus: {
    ko: "버스 노선 안내",
    en: "Bus route information",
    ja: "バス路線案内",
    zh: "巴士线路信息",
  },
  taxi: {
    ko: "주요 목적지별 택시요금",
    en: "Taxi fares by major destination",
    ja: "主な目的地別タクシー料金",
    zh: "按主要目的地计程车费",
  },
};

const TABS: TransportTab[] = ["bus", "taxi"];

export default function TransportPage() {
  const { language } = useLanguage();
  const [tab, setTab] = useState<TransportTab>("bus");

  return (
    <section className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-[1.2cqh]">
      <div className="flex max-h-[72cqh] w-full min-h-0 items-center justify-center overflow-hidden rounded-[0.9cqw] bg-white ring-1 ring-slate-200/80">
        <img
          src={IMAGES[tab][language]}
          alt={IMAGE_ALT[tab][language]}
          className="max-h-[72cqh] max-w-full object-contain"
        />
      </div>

      <div
        className="flex w-full shrink-0 gap-[0.7cqw]"
        role="tablist"
        aria-label="교통정보 분류"
      >
        {TABS.map((id) => {
          const active = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={[
                "min-h-[4.8cqh] flex-1 rounded-[0.7cqw] px-[1cqw] text-[1.85cqh] font-semibold transition-colors",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              {TAB_LABELS[id][language]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
