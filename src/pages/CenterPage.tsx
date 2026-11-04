import { useLanguage } from "../contexts/LanguageContext";
import type { LanguageCode } from "../lib/languages";

const POSTERS: Record<LanguageCode, string> = {
  ko: "/banners/jeju-traveler-center-coupon-poster-ko.webp",
  en: "/banners/jeju-traveler-center-coupon-poster-en.webp",
  ja: "/banners/jeju-traveler-center-coupon-poster-ja.webp",
  zh: "/banners/jeju-traveler-center-coupon-poster-zh.webp",
};

const POSTER_ALT: Record<LanguageCode, string> = {
  ko: "제주 여행자센터 쿠폰 안내",
  en: "Jeju Traveler Center coupon guide",
  ja: "済州トラベラーセンター クーポン案内",
  zh: "济州旅行者中心优惠券指南",
};

export default function CenterPage() {
  const { language } = useLanguage();

  return (
    <section className="flex h-full min-h-0 w-full items-center">
      <img
        src={POSTERS[language]}
        alt={POSTER_ALT[language]}
        className="h-auto w-full"
      />
    </section>
  );
}
