import {
  BENEFIT_FILTER_CHIP_ORDER,
  STORE_AREA_FILTER_CHIP_ORDER,
  STORE_CATEGORY_CHIP_ORDER,
  type BenefitFilterChipId,
  type CategoryFilterChipId,
  type StoreAreaFilterChipId,
} from "../lib/storeFilters";

const AREA_LABELS: Record<StoreAreaFilterChipId, string> = {
  all: "전체",
  areaChilsungro: "칠성로상점가",
  areaJungangro: "중앙로상점가",
  areaUndergroundMall: "중앙지하상가",
};

const BENEFIT_LABELS: Record<BenefitFilterChipId, string> = {
  all: "전체",
  chilsungro: "여행자 소비쿠폰",
  localCurrency: "지역화폐",
  highOilSupport: "고유가 지원금",
};

const CATEGORY_LABELS: Record<CategoryFilterChipId, string> = {
  all: "전체",
  restaurant: "음식점",
  cafe: "카페, 디저트",
  shopping: "쇼핑",
  other: "기타",
};

type StoreFilterBarProps = {
  areaChips: ReadonlySet<StoreAreaFilterChipId>;
  benefitChips: ReadonlySet<BenefitFilterChipId>;
  categoryChips: ReadonlySet<CategoryFilterChipId>;
  onToggleArea: (id: StoreAreaFilterChipId) => void;
  onToggleBenefit: (id: BenefitFilterChipId) => void;
  onToggleCategory: (id: CategoryFilterChipId) => void;
};

function ChipButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "flex shrink-0 items-center justify-center rounded-full border px-[2.2cqw] py-[0.7cqh] text-[1.45cqh] font-semibold transition-colors",
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-300 bg-white text-slate-800",
      ].join(" ")}
    >
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function ChipRow<T extends string>({
  ariaLabel,
  order,
  activeChips,
  labelMap,
  onToggle,
}: {
  ariaLabel: string;
  order: readonly T[];
  activeChips: ReadonlySet<T>;
  labelMap: Record<T, string>;
  onToggle: (id: T) => void;
}) {
  return (
    <div
      className="flex gap-[1cqw] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="toolbar"
      aria-label={ariaLabel}
    >
      {order.map((id) => (
        <ChipButton
          key={id}
          active={activeChips.has(id)}
          label={labelMap[id]}
          onClick={() => onToggle(id)}
        />
      ))}
    </div>
  );
}

export default function StoreFilterBar({
  areaChips,
  benefitChips,
  categoryChips,
  onToggleArea,
  onToggleBenefit,
  onToggleCategory,
}: StoreFilterBarProps) {
  return (
    <div className="relative z-20 flex shrink-0 flex-col gap-[0.8cqh] border-t border-slate-200 bg-white/95 px-[2cqw] py-[1cqh] backdrop-blur">
      <ChipRow
        ariaLabel="구역 필터"
        order={STORE_AREA_FILTER_CHIP_ORDER}
        activeChips={areaChips}
        labelMap={AREA_LABELS}
        onToggle={onToggleArea}
      />
      <ChipRow
        ariaLabel="할인 필터"
        order={BENEFIT_FILTER_CHIP_ORDER}
        activeChips={benefitChips}
        labelMap={BENEFIT_LABELS}
        onToggle={onToggleBenefit}
      />
      <ChipRow
        ariaLabel="카테고리 필터"
        order={STORE_CATEGORY_CHIP_ORDER}
        activeChips={categoryChips}
        labelMap={CATEGORY_LABELS}
        onToggle={onToggleCategory}
      />
    </div>
  );
}
