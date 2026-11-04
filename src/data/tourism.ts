import type { LanguageCode } from "../lib/languages";

export type TourismTab = "guide" | "food";

export type TourismRegionId =
  | "hangyeong"
  | "hallim"
  | "aewol"
  | "jeju-si"
  | "jocheon"
  | "gujwa"
  | "udo"
  | "daejeong"
  | "andeok"
  | "jungmun"
  | "seogwipo"
  | "namwon"
  | "pyoseon"
  | "seongsan";

export type TourismSpot = {
  ko: string;
  en: string;
  ja: string;
  zh: string;
};

type CopySet = Record<LanguageCode, string>;

export const TOURISM_BACKGROUNDS: Record<LanguageCode, string> = {
  ko: "/tourism/bg-ko.jpg",
  en: "/tourism/bg-en.jpg",
  ja: "/tourism/bg-ja.jpg",
  zh: "/tourism/bg-zh.jpg",
};

export const TOURISM_FOOD_MAPS: Record<LanguageCode, string> = {
  ko: "/tourism/food-map-ko.jpg",
  en: "/tourism/food-map-en.jpg",
  ja: "/tourism/food-map-ja.jpg",
  zh: "/tourism/food-map-zh.jpg",
};

export const TOURISM_HERO: CopySet = {
  ko: "제주시 관광지와\n원도심 맛집을 소개해드리겠습니다.",
  en: "Discover Jeju City sights\nand old downtown restaurants.",
  ja: "済州市の観光地と\n旧市街のグルメをご紹介します。",
  zh: "为您介绍济州市观光地\n与原都心美食。",
};

export const TOURISM_PANEL_TITLE: CopySet = {
  ko: "관광안내",
  en: "Tour Guide",
  ja: "観光案内",
  zh: "观光指南",
};

export const TOURISM_TAB_LABELS: Record<TourismTab, CopySet> = {
  guide: {
    ko: "관광안내",
    en: "Tour Guide",
    ja: "観光案内",
    zh: "观光指南",
  },
  food: {
    ko: "원도심 맛집",
    en: "Downtown Food",
    ja: "旧市街グルメ",
    zh: "原都心美食",
  },
};

export const TOURISM_HINT: CopySet = {
  ko: "궁금하신 관광지를 선택해주세요.",
  en: "Please choose a tourist destination you are curious about.",
  ja: "気になる観光地を選択してください。",
  zh: "请选择您感兴趣的观光地。",
};

export const TOURISM_REGION_LABELS: Record<
  TourismRegionId,
  Record<LanguageCode, string>
> = {
  hangyeong: { ko: "한경면", en: "Hangyeong", ja: "ハンギョン面", zh: "翰京面" },
  hallim: { ko: "한림읍", en: "Hallim", ja: "ハンリム邑", zh: "翰林邑" },
  aewol: { ko: "애월읍", en: "Aewol", ja: "エウォル邑", zh: "涯月邑" },
  "jeju-si": { ko: "제주시", en: "Jeju City", ja: "済州市", zh: "济州市" },
  jocheon: { ko: "조천읍", en: "Jocheon", ja: "チョチョン邑", zh: "朝天邑" },
  gujwa: { ko: "구좌읍", en: "Gujwa", ja: "クジュァ邑", zh: "旧左邑" },
  udo: { ko: "우도", en: "Udo", ja: "牛島", zh: "牛岛" },
  daejeong: { ko: "대정읍", en: "Daejeong", ja: "テジョン邑", zh: "大静邑" },
  andeok: { ko: "안덕면", en: "Andeok", ja: "アンドク面", zh: "安德面" },
  jungmun: { ko: "중문", en: "Jungmun", ja: "中文", zh: "中文" },
  seogwipo: { ko: "서귀포시", en: "Seogwipo", ja: "西帰浦市", zh: "西归浦市" },
  namwon: { ko: "남원읍", en: "Namwon", ja: "ナムォン邑", zh: "南元邑" },
  pyoseon: { ko: "표선면", en: "Pyoseon", ja: "ピョソン面", zh: "表善面" },
  seongsan: { ko: "성산읍", en: "Seongsan", ja: "ソンサン邑", zh: "城山邑" },
};

/** 권역별 대표 관광지 (키오스크 관광안내 목록) */
export const TOURISM_SPOTS: Record<TourismRegionId, TourismSpot[]> = {
  "jeju-si": [
    {
      ko: "이호테우 말등대",
      en: "Iho Tewoo Horse Lighthouse",
      ja: "イホテウ馬灯台",
      zh: "梨湖道头马灯塔",
    },
    {
      ko: "산지천",
      en: "Sanjicheon Stream",
      ja: "山地川",
      zh: "山地川",
    },
    {
      ko: "노형수퍼마켙",
      en: "Nohyeong Supermarket",
      ja: "ノヒョンスーパーマーケット",
      zh: "老衡超市",
    },
    {
      ko: "도두동 무지개 해안도로",
      en: "Dodu Rainbow Coastal Road",
      ja: "トドゥ洞虹の海岸道路",
      zh: "道头洞彩虹海岸路",
    },
    {
      ko: "수목원길 야시장",
      en: "Arboretum Road Night Market",
      ja: "樹木園キル夜市",
      zh: "树木园路夜市",
    },
    {
      ko: "한라산국립공원",
      en: "Hallasan National Park",
      ja: "漢拏山国立公園",
      zh: "汉拿山国立公园",
    },
  ],
  aewol: [
    { ko: "애월 해안도로", en: "Aewol Coastal Road", ja: "エウォル海岸道路", zh: "涯月海岸路" },
    { ko: "곽지과물해변", en: "Gwaji Gwamul Beach", ja: "クァクジ過水ビーチ", zh: "郭支过水海滩" },
    { ko: "한담해안산책로", en: "Handam Coastal Walk", ja: "ハンダム海岸散歩道", zh: "闲谈海岸步道" },
    { ko: "항몽유적지", en: "Hangmong Historic Site", ja: "抗蒙遺跡地", zh: "抗蒙遗迹地" },
  ],
  hallim: [
    { ko: "협재해수욕장", en: "Hyeopjae Beach", ja: "ヒョプジェ海水浴場", zh: "挟才海水浴场" },
    { ko: "금능해수욕장", en: "Geumneung Beach", ja: "クムヌン海水浴場", zh: "金宁海水浴场" },
    { ko: "한림공원", en: "Hallim Park", ja: "ハンリム公園", zh: "翰林公园" },
    { ko: "비양도", en: "Biyangdo Island", ja: "飛揚島", zh: "飞扬岛" },
  ],
  hangyeong: [
    { ko: "차귀도", en: "Chagwido Island", ja: "チャグィ島", zh: "遮归岛" },
    { ko: "신창풍차해안", en: "Sinchang Windmill Coast", ja: "シンチャン風車海岸", zh: "新昌风车海岸" },
    { ko: "수월봉", en: "Suwolbong Peak", ja: "スウォル峰", zh: "水月峰" },
    { ko: "절부암", en: "Jeolbuam Rock", ja: "節婦岩", zh: "节妇岩" },
  ],
  jocheon: [
    { ko: "함덕해수욕장", en: "Hamdeok Beach", ja: "ハムドク海水浴場", zh: "咸德海水浴场" },
    { ko: "제주돌문화공원", en: "Jeju Stone Park", ja: "済州ドル文化公園", zh: "济州石文化公园" },
    { ko: "사려니숲길", en: "Saryeoni Forest Path", ja: "サリョニ森の道", zh: "思礼尼林道" },
    { ko: "선흘곶자왈", en: "Seonheul Gotjawal", ja: "ソンフルゴッジャワル", zh: "善屹高地森林" },
  ],
  gujwa: [
    { ko: "월정리 해변", en: "Woljeongri Beach", ja: "ウォルジョンリ海岸", zh: "月汀里海滩" },
    { ko: "김녕성세기해변", en: "Gimnyeong Beach", ja: "キムニョン海岸", zh: "金宁海岸" },
    { ko: "만장굴", en: "Manjanggul Cave", ja: "万丈窟", zh: "万丈窟" },
    { ko: "비자림", en: "Bijarim Forest", ja: "ピジャリム", zh: "榧子林" },
  ],
  udo: [
    { ko: "우도봉", en: "Udobong Peak", ja: "牛島峰", zh: "牛岛峰" },
    { ko: "검멀레해변", en: "Geommeolle Beach", ja: "コムモルレ海岸", zh: "剑没勒海滩" },
    { ko: "하고수동해수욕장", en: "Hagosudong Beach", ja: "ハゴスドン海水浴場", zh: "下古水洞海水浴场" },
    { ko: "우도땅콩버스", en: "Udo Peanut Bus", ja: "牛島ピーナッツバス", zh: "牛岛花生巴士" },
  ],
  daejeong: [
    { ko: "모슬포항", en: "Moseulpo Port", ja: "モスルポ港", zh: "摹瑟浦港" },
    { ko: "송악산", en: "Songaksan", ja: "ソンアク山", zh: "松岳山" },
    { ko: "마라도", en: "Marado Island", ja: "馬羅島", zh: "马罗岛" },
    { ko: "알뜨르비행장", en: "Altreu Airfield", ja: "アルトゥル飛行場", zh: "阿尔特尔机场遗址" },
  ],
  andeok: [
    { ko: "산방산", en: "Sanbangsan", ja: "山房山", zh: "山房山" },
    { ko: "용머리해안", en: "Yongmeori Coast", ja: "ヨンモリ海岸", zh: "龙头海岸" },
    { ko: "화순금모래해변", en: "Hwasun Geummorae Beach", ja: "ファスン金砂浜", zh: "和顺金沙海滩" },
    { ko: "안덕계곡", en: "Andeok Valley", ja: "アンドク渓谷", zh: "安德溪谷" },
  ],
  jungmun: [
    { ko: "천제연폭포", en: "Cheonjeyeon Falls", ja: "天帝淵瀑布", zh: "天帝渊瀑布" },
    { ko: "중문색달해변", en: "Jungmun Saekdal Beach", ja: "中文セクダル海岸", zh: "中文色达海滩" },
    { ko: "여미지식물원", en: "Yeomiji Botanical Garden", ja: "ヨミジ植物園", zh: "如美地植物园" },
    { ko: "주상절리대", en: "Jusangjeolli Cliff", ja: "柱状節理帯", zh: "柱状节理带" },
  ],
  seogwipo: [
    { ko: "천지연폭포", en: "Cheonjiyeon Falls", ja: "天地淵瀑布", zh: "天地渊瀑布" },
    { ko: "정방폭포", en: "Jeongbang Falls", ja: "正房瀑布", zh: "正房瀑布" },
    { ko: "쇠소깍", en: "Soesokkak", ja: "ソソカク", zh: "苏索角" },
    { ko: "서귀포 매일올레시장", en: "Seogwipo Maeil Olle Market", ja: "西帰浦毎日オレ市場", zh: "西归浦每日偶来市场" },
  ],
  namwon: [
    { ko: "큰엉해안", en: "Keuneong Coast", ja: "クノン海岸", zh: "大崎海岸" },
    { ko: "남원큰엉전망대", en: "Namwon Keuneong Observatory", ja: "ナムォンクノン展望台", zh: "南元大崎观景台" },
    { ko: "원앙폭포", en: "Wonnang Falls", ja: "ウォンアン瀑布", zh: "鸳鸯瀑布" },
    { ko: "신례천생태로", en: "Sinryecheon Eco Path", ja: "シンレチョン生態路", zh: "新礼川生态路" },
  ],
  pyoseon: [
    { ko: "표선해비치", en: "Pyoseon Beach", ja: "ピョソン海岸", zh: "表善海滩" },
    { ko: "성읍민속마을", en: "Seongeup Folk Village", ja: "ソンウプ民俗村", zh: "城邑民俗村" },
    { ko: "제주민속촌", en: "Jeju Folk Village", ja: "済州民俗村", zh: "济州民俗村" },
    { ko: "가시리조랑말체험공원", en: "Gasiri Horse Park", ja: "カシリポニー体験公園", zh: "加时里矮马体验公园" },
  ],
  seongsan: [
    { ko: "성산일출봉", en: "Seongsan Ilchulbong", ja: "城山日出峰", zh: "城山日出峰" },
    { ko: "광치기해변", en: "Gwangchigi Beach", ja: "クァンチギ海岸", zh: "光治基海滩" },
    { ko: "섭지코지", en: "Seopjikoji", ja: "ソプジコジ", zh: "涉地可支" },
    { ko: "아쿠아플라넷 제주", en: "Aquaplaset Jeju", ja: "アクアプラネット済州", zh: "济州海洋世界" },
  ],
};

export function spotLabel(spot: TourismSpot, language: LanguageCode): string {
  return spot[language] || spot.ko;
}
