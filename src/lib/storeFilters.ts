export type StoreFilterChipId =
  | "all"
  | "chilsungro"
  | "localCurrency"
  | "highOilSupport"
  | "restaurant"
  | "cafe"
  | "shopping"
  | "other";

export type StoreAreaFilterChipId =
  | "all"
  | "areaChilsungro"
  | "areaJungangro"
  | "areaUndergroundMall";

export const STORE_AREA_FILTER_CHIP_ORDER: StoreAreaFilterChipId[] = [
  "all",
  "areaChilsungro",
  "areaJungangro",
  "areaUndergroundMall",
];

export type BenefitFilterChipId =
  | "all"
  | "chilsungro"
  | "localCurrency"
  | "highOilSupport";

export type CategoryFilterChipId =
  | "all"
  | "restaurant"
  | "cafe"
  | "shopping"
  | "other";

export const BENEFIT_FILTER_CHIP_ORDER: BenefitFilterChipId[] = [
  "all",
  "chilsungro",
  "localCurrency",
  "highOilSupport",
];

export const STORE_CATEGORY_CHIP_ORDER: CategoryFilterChipId[] = [
  "all",
  "restaurant",
  "cafe",
  "shopping",
  "other",
];

export type StoreLikeForChip = {
  category?: string | null;
  area?: string | null;
  localpay?: boolean;
  oil_subsidy?: boolean;
  downtown_coupon?: boolean;
};

export type StoreChipSelection = {
  area: ReadonlySet<StoreAreaFilterChipId>;
  benefit: ReadonlySet<BenefitFilterChipId>;
  category: ReadonlySet<CategoryFilterChipId>;
};

function imageFromCategory(category?: string | null): string {
  if (!category) return "other";
  if (category.includes("카페") || category.includes("디저트")) return "cafe";
  if (category.includes("쇼핑")) return "shopping";
  if (category.includes("음식")) return "restaurant";
  return "other";
}

function isCafe(store: StoreLikeForChip) {
  return imageFromCategory(store.category) === "cafe";
}

function isRestaurant(store: StoreLikeForChip) {
  return !isCafe(store) && imageFromCategory(store.category) === "restaurant";
}

function isShopping(store: StoreLikeForChip) {
  return imageFromCategory(store.category) === "shopping";
}

function isOther(store: StoreLikeForChip) {
  return !isRestaurant(store) && !isCafe(store) && !isShopping(store);
}

export function toggleChipSelection<T extends string>(
  prev: ReadonlySet<T>,
  id: T,
  allId: T,
): Set<T> {
  if (id === allId) return new Set<T>([allId]);
  const next = new Set(prev);
  next.delete(allId);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  if (next.size === 0) next.add(allId);
  return next;
}

export function storeMatchesAreaChipFilters(
  store: StoreLikeForChip,
  chips: ReadonlySet<StoreAreaFilterChipId>,
): boolean {
  if (chips.has("all")) return true;
  const parts: boolean[] = [];
  if (chips.has("areaChilsungro")) parts.push(store.area === "칠성로");
  if (chips.has("areaJungangro")) parts.push(store.area === "중앙로");
  if (chips.has("areaUndergroundMall")) parts.push(store.area === "지하상가");
  return parts.length > 0 && parts.some(Boolean);
}

export function storeMatchesBenefitChipFilters(
  store: StoreLikeForChip,
  chips: ReadonlySet<BenefitFilterChipId>,
): boolean {
  if (chips.has("all")) return true;
  const parts: boolean[] = [];
  if (chips.has("chilsungro")) parts.push(store.downtown_coupon === true);
  if (chips.has("localCurrency")) parts.push(store.localpay === true);
  if (chips.has("highOilSupport")) parts.push(store.oil_subsidy === true);
  return parts.length > 0 && parts.some(Boolean);
}

export function storeMatchesCategoryChipFilters(
  store: StoreLikeForChip,
  chips: ReadonlySet<CategoryFilterChipId>,
): boolean {
  if (chips.has("all")) return true;
  const parts: boolean[] = [];
  if (chips.has("restaurant")) parts.push(isRestaurant(store));
  if (chips.has("cafe")) parts.push(isCafe(store));
  if (chips.has("shopping")) parts.push(isShopping(store));
  if (chips.has("other")) parts.push(isOther(store));
  return parts.length > 0 && parts.some(Boolean);
}

export function storeMatchesAllChipFilters(
  store: StoreLikeForChip,
  chips: StoreChipSelection,
): boolean {
  return (
    storeMatchesAreaChipFilters(store, chips.area) &&
    storeMatchesBenefitChipFilters(store, chips.benefit) &&
    storeMatchesCategoryChipFilters(store, chips.category)
  );
}

export function dropdownLabel<T extends string>(
  filterLabel: string,
  order: readonly T[],
  activeChips: ReadonlySet<T>,
  labelMap: Record<T, string>,
): string {
  const allLabel = labelMap["all" as T];
  if (activeChips.has("all" as T)) return `${filterLabel} - ${allLabel}`;
  const selected = order
    .filter((id) => id !== "all" && activeChips.has(id))
    .map((id) => labelMap[id]);
  if (selected.length === 0) return `${filterLabel} - ${allLabel}`;
  return `${filterLabel} - ${selected.join(", ")}`;
}
