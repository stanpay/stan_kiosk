import { useEffect, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[date.getDay()];
  return `${y}. ${m}. ${d}. ${weekday}`;
}

function formatTime(date: Date) {
  const hours = date.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");
  return { period, clock: `${hour12}:${minute}` };
}

export default function CurrentTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const { period, clock } = formatTime(now);

  return (
    <time
      dateTime={now.toISOString()}
      className="flex h-full flex-col items-center justify-center gap-[0.35cqh] whitespace-nowrap leading-none text-slate-900"
    >
      <span className="text-[1.25cqh] font-medium tracking-wide text-slate-700">
        {formatDate(now)}
      </span>
      <span className="flex items-baseline justify-center gap-[0.3cqw]">
        <span className="text-[1.35cqh] font-medium">{period}</span>
        <span className="text-[2.8cqh] font-bold tabular-nums tracking-tight">{clock}</span>
      </span>
    </time>
  );
}
