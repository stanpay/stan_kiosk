import CurrentTime from "./CurrentTime";
import WeatherStatus from "./WeatherStatus";

export default function TopStatusBar() {
  return (
    <header
      className="flex shrink-0 items-center justify-between overflow-hidden border-b border-slate-200 bg-white pl-[0.6cqw] pr-[1.4cqw]"
      style={{ height: "var(--kiosk-top-height)" }}
    >
      <div className="flex h-full min-w-0 flex-1 items-center">
        <img
          src="/images/logo.png"
          alt="원도심활성화자율상권조합"
          className="h-[76%] w-auto max-w-[46cqw] object-contain object-left"
        />
      </div>

      <div className="flex h-full shrink-0 items-center gap-[2.4cqw]">
        <WeatherStatus />
        <div className="mx-[0.2cqw] h-[62%] w-px shrink-0 bg-slate-300" aria-hidden />
        <CurrentTime />
      </div>
    </header>
  );
}
