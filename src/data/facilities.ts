export type FacilityKind = "toilet" | "parking";

export type Facility = {
  id: string;
  kind: FacilityKind;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

/** 키오스크 주변 공중화장실·공영주차장 (카카오 로컬 검색 기준 좌표) */
export const FACILITIES: Facility[] = [
  {
    id: "toilet-sanji",
    kind: "toilet",
    name: "산지천 공중화장실",
    latitude: 33.5140197521774,
    longitude: 126.527753137357,
    address: "제주 제주시 일도일동 1210-2",
  },
  {
    id: "toilet-chilsungro",
    kind: "toilet",
    name: "칠성로 상점가 공영화장실",
    latitude: 33.5140107794414,
    longitude: 126.526111791843,
  },
  {
    id: "toilet-ildo1",
    kind: "toilet",
    name: "일도1동주민센터 화장실",
    latitude: 33.5150033312437,
    longitude: 126.526321647698,
  },
  {
    id: "toilet-sanjitmul",
    kind: "toilet",
    name: "산짓물공원 공중화장실",
    latitude: 33.51597865308405,
    longitude: 126.52910730410504,
  },
  {
    id: "toilet-chilsunggol-parking",
    kind: "toilet",
    name: "칠성골 공영주차 화장실",
    latitude: 33.5165057832003,
    longitude: 126.525484666204,
  },
  {
    id: "toilet-tapdong2",
    kind: "toilet",
    name: "탑동제2공원 화장실",
    latitude: 33.5174097562859,
    longitude: 126.524460412063,
  },
  {
    id: "toilet-sinsan",
    kind: "toilet",
    name: "신산공원 공중화장실",
    latitude: 33.5052852592366,
    longitude: 126.533735914609,
  },
  {
    id: "parking-dongmun",
    kind: "parking",
    name: "동문공영주차장",
    latitude: 33.51206381349811,
    longitude: 126.52859789602843,
    address: "제주 제주시 일도일동 1103",
  },
  {
    id: "parking-underground-east",
    kind: "parking",
    name: "중앙지하상가 동쪽 공영주차장",
    latitude: 33.5135762993827,
    longitude: 126.526606038199,
    address: "제주 제주시 일도일동 1476-33",
  },
  {
    id: "parking-buksu",
    kind: "parking",
    name: "북수구공영주차장",
    latitude: 33.514651521544884,
    longitude: 126.52816194009158,
    address: "제주 제주시 일도일동 1230-5",
  },
  {
    id: "parking-chilsung-1",
    kind: "parking",
    name: "칠성상가 제1공영주차장",
    latitude: 33.5141142336993,
    longitude: 126.526287745176,
    address: "제주 제주시 일도일동 1476-1",
  },
  {
    id: "parking-namsugak",
    kind: "parking",
    name: "남수각 공영유료주차장",
    latitude: 33.5109992413369,
    longitude: 126.526524282725,
  },
  {
    id: "parking-dongmun-market",
    kind: "parking",
    name: "제주동문재래시장 공영주차장",
    latitude: 33.51082802560564,
    longitude: 126.52607532826407,
  },
  {
    id: "parking-chilsung-2",
    kind: "parking",
    name: "칠성상가 제2공영주차장",
    latitude: 33.5139458675308,
    longitude: 126.523761455907,
    address: "제주 제주시 일도일동 1401-13",
  },
  {
    id: "parking-underground-west",
    kind: "parking",
    name: "제주중앙지하상가 서쪽 공영주차장",
    latitude: 33.5127477397158,
    longitude: 126.52331489438,
    address: "제주 제주시 삼도이동 102-2",
  },
  {
    id: "parking-chilsunggol",
    kind: "parking",
    name: "칠성골 공영주차장",
    latitude: 33.516516418943496,
    longitude: 126.5252015267615,
  },
  {
    id: "parking-tapdong1",
    kind: "parking",
    name: "탑동제1공영주차장",
    latitude: 33.5173033464907,
    longitude: 126.52375059358309,
  },
  {
    id: "parking-gwandeok",
    kind: "parking",
    name: "관덕정 서측 노외공영주차장",
    latitude: 33.5135121185197,
    longitude: 126.5207006323449,
  },
];

export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
