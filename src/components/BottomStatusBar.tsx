export default function BottomStatusBar() {
  return (
    <footer
      className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-[2cqw] text-slate-500"
      style={{ height: "var(--kiosk-bottom-height)" }}
    >
      <span className="flex flex-col leading-tight text-[1.8cqh]">
        <span>제주원도심활성화자율상권조합</span>
        <span>064-755-9730</span>
      </span>
      <span className="flex flex-col items-end leading-tight text-[1.8cqh]">
        <span>스테이블 퓨전</span>
        <span>contact@stan.ai.kr</span>
      </span>
    </footer>
  );
}
