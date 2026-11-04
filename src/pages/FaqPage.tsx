import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FAQ_CATEGORIES,
  FAQ_DISTRICTS,
  FAQ_ITEMS,
  type FaqCategoryId,
  type FaqDistrict,
  type FaqItem,
} from "../data/faq";

const ANSWER_MAX_CQH = 2.3;
const ANSWER_MIN_CQH = 1.55;

const DISTRICT_LABEL: Record<FaqDistrict, string> = {
  칠성로: "칠성로 상점가",
  중앙지하: "중앙지하상가",
  중앙로: "중앙로 상점가",
};

export default function FaqPage() {
  const [category, setCategory] = useState<FaqCategoryId>("general");
  const [selectedId, setSelectedId] = useState<string>(
    () => FAQ_ITEMS.find((item) => item.category === "general")?.id ?? "",
  );
  const [activeDistrict, setActiveDistrict] = useState<FaqDistrict>("칠성로");

  const items = useMemo(
    () => FAQ_ITEMS.filter((item) => item.category === category),
    [category],
  );

  const selected: FaqItem | undefined = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  );

  const selectCategory = (next: FaqCategoryId) => {
    setCategory(next);
    const first = FAQ_ITEMS.find((item) => item.category === next);
    setSelectedId(first?.id ?? "");
  };

  const districtAnswer =
    selected?.answersByDistrict?.[activeDistrict] ?? selected?.answer ?? "";

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-[1cqh]">
      <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.9cqw] bg-white ring-1 ring-slate-200/80">
        {selected ? (
          <>
            <div className="shrink-0 border-b border-slate-100 px-[1.4cqw] py-[1.1cqh]">
              <p className="text-[1.6cqh] font-semibold uppercase tracking-wide text-sky-700">
                Q
              </p>
              <h2 className="mt-[0.35cqh] text-[2.6cqh] font-semibold leading-snug text-slate-900">
                {selected.question}
              </h2>
              {selected.answersByDistrict ? (
                <p className="mt-[0.45cqh] text-[1.7cqh] font-semibold text-slate-500">
                  {DISTRICT_LABEL[activeDistrict]}
                </p>
              ) : null}
            </div>

            <FittingAnswer
              text={districtAnswer}
              storesCta={selected.storesCta}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[1.8cqh] text-slate-400">
            질문을 선택해 주세요
          </div>
        )}
      </article>

      <div className="flex h-[calc(4.6cqh+1.7cqw+0.8cqh+4.6cqh+1.7cqw+0.8cqh+4*5cqh+3*0.65cqw+1.7cqw)] shrink-0 flex-col gap-[0.8cqh]">
        <div
          className="shrink-0 rounded-[0.9cqw] bg-white p-[0.85cqw] ring-1 ring-slate-200/80"
          role="tablist"
          aria-label="FAQ 분류"
        >
          <div className="flex gap-[0.7cqw]">
            {FAQ_CATEGORIES.map((tab) => {
              const active = tab.id === category;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectCategory(tab.id)}
                  className={[
                    "min-h-[4.6cqh] flex-1 rounded-[0.65cqw] px-[1cqw] text-[1.75cqh] font-semibold transition-colors",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {category === "districts" ? (
          <div
            className="shrink-0 rounded-[0.9cqw] bg-white p-[0.85cqw] ring-1 ring-slate-200/80"
            role="tablist"
            aria-label="상권 선택"
          >
            <div className="flex gap-[0.7cqw]">
              {FAQ_DISTRICTS.map((district) => {
                const active = district === activeDistrict;
                return (
                  <button
                    key={district}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveDistrict(district)}
                    className={[
                      "min-h-[4.6cqh] flex-1 rounded-[0.65cqw] px-[0.6cqw] text-[1.55cqh] font-semibold transition-colors",
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
                    ].join(" ")}
                  >
                    {DISTRICT_LABEL[district]}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 rounded-[0.9cqw] bg-white p-[0.85cqw] ring-1 ring-slate-200/80">
          <div
            className={[
              "grid h-full gap-[0.65cqw]",
              category === "general"
                ? "grid-cols-2 grid-rows-3"
                : "grid-cols-4 content-start",
            ].join(" ")}
          >
            {items.map((item) => {
              const active = item.id === selected?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={[
                    "rounded-[0.65cqw] px-[0.5cqw] py-[0.55cqh] text-center font-semibold leading-snug transition-colors",
                    category === "general"
                      ? "h-full text-[1.7cqh]"
                      : "min-h-[5cqh] text-[1.45cqh]",
                    active
                      ? "bg-sky-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
                  ].join(" ")}
                >
                  {item.menuLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FittingAnswer({
  text,
  storesCta,
}: {
  text: string;
  storesCta?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontCqh, setFontCqh] = useState(ANSWER_MAX_CQH);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const paragraph = textRef.current;
    if (!container || !paragraph) return;

    const frame = container.closest(".kiosk-frame");
    const cqhPx = (frame?.clientHeight ?? window.innerHeight) / 100;

    let next = ANSWER_MAX_CQH;
    paragraph.style.fontSize = `${next * cqhPx}px`;

    while (
      container.scrollHeight > container.clientHeight + 1 &&
      next > ANSWER_MIN_CQH
    ) {
      next = Math.max(ANSWER_MIN_CQH, next - 0.05);
      paragraph.style.fontSize = `${next * cqhPx}px`;
    }

    setFontCqh(next);
  }, [text, storesCta]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col overflow-hidden px-[1.4cqw] py-[1.2cqh]"
    >
      <p
        ref={textRef}
        className="whitespace-pre-wrap leading-relaxed text-slate-700"
        style={{ fontSize: `${fontCqh}cqh` }}
      >
        {text}
      </p>

      {storesCta ? (
        <Link
          to="/stores"
          className="mt-[1.4cqh] inline-flex min-h-[4.8cqh] shrink-0 items-center justify-center rounded-[0.7cqw] bg-sky-700 px-[1.6cqw] text-[1.75cqh] font-semibold text-white shadow-sm"
        >
          참여매장 지도 보기
        </Link>
      ) : null}
    </div>
  );
}
