import { NavLink } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGES } from "../lib/languages";

const NAV_ITEMS = [
  { to: "/", lines: ["제주", "여행자센터"], end: true },
  { to: "/stores", lines: ["매장정보"] },
  {
    to: "/facilities",
    lines: ["편의시설"],
    description: "화장실 · 주차장",
  },
  { to: "/tourism", lines: ["관광정보"] },
  { to: "/transport", lines: ["교통정보"] },
  { to: "/faq", lines: ["FAQ"] },
  { to: "/map", lines: ["원도심", "지도"] },
] as const;

export default function NavBar() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex w-full flex-col gap-[0.6cqh] px-[0.5cqw] py-[1cqh]"
    >
      <div className="mb-[0.4cqh] flex flex-col items-center gap-[0.35cqh] bg-slate-100/80">
        <span className="text-center text-[1.25cqh] font-semibold leading-tight text-slate-700">
          여행자센터
          <br />
          길안내 및
          <br />
          모바일에서 보기
        </span>
        <img
          src="/images/directions-qr.png"
          alt="여행자 센터 길안내 QR"
          className="aspect-square w-[70%] max-w-[12cqh] object-contain mix-blend-multiply"
        />
      </div>

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          className={({ isActive }) =>
            [
              "flex min-h-[5.2cqh] flex-col items-center justify-center rounded-[0.6cqw] px-[0.4cqw] py-[0.7cqh] text-center transition-colors",
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white/80 text-slate-700 hover:bg-white",
            ].join(" ")
          }
        >
          {item.lines.map((line) => (
            <span
              key={line}
              className="whitespace-nowrap text-[1.55cqh] font-semibold leading-tight"
            >
              {line}
            </span>
          ))}
          {"description" in item && item.description ? (
            <span className="mt-[0.2cqh] whitespace-nowrap text-[1.05cqh] leading-tight opacity-70">
              {item.description}
            </span>
          ) : null}
        </NavLink>
      ))}

      <div
        className="mt-[0.4cqh] flex flex-col gap-[0.45cqh] border-t border-slate-300 pt-[0.8cqh]"
        role="group"
        aria-label="언어 선택"
      >
        <span className="pb-[0.15cqh] text-center text-[1.2cqh] font-semibold tracking-wide text-slate-500">
          Language
        </span>
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            type="button"
            aria-pressed={language === item.code}
            onClick={() => setLanguage(item.code)}
            className={[
              "flex min-h-[4.4cqh] w-full items-center justify-center rounded-[0.6cqw] px-[0.4cqw] py-[0.5cqh] text-center transition-colors",
              language === item.code
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white/80 text-slate-700 hover:bg-white",
            ].join(" ")}
          >
            <span className="whitespace-nowrap text-[1.4cqh] font-semibold leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
