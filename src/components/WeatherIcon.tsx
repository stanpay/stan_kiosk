import type { WeatherCondition } from "../types/weather";

type WeatherIconProps = {
  condition?: WeatherCondition;
  className?: string;
};

export default function WeatherIcon({
  condition = "cloudy",
  className = "h-6 w-6",
}: WeatherIconProps) {
  if (condition === "clear") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
        <circle cx="12" cy="12" r="3.4" />
        <path
          d="M12 3.2v1.6M12 19.2v1.6M3.2 12h1.6M19.2 12h1.6M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (condition === "overcast") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
        <path
          d="M7.5 17h10.2a3.4 3.4 0 0 0 .4-6.78 4.6 4.6 0 0 0-8.7 1.45A3 3 0 0 0 7.5 17Z"
          strokeLinejoin="round"
        />
        <path d="M6 19.5h11" strokeLinecap="round" />
      </svg>
    );
  }

  if (condition === "rain" || condition === "rainSnow") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
        <path
          d="M7.2 14.2h9.6a3 3 0 0 0 .35-5.98 4.1 4.1 0 0 0-7.85 1.2A2.7 2.7 0 0 0 7.2 14.2Z"
          strokeLinejoin="round"
        />
        <path d="M9 16.5l-.8 2.2M12 16.8l-.8 2.2M15 16.5l-.8 2.2" strokeLinecap="round" />
        {condition === "rainSnow" ? (
          <path d="M17.2 17.2l.7.7M17.9 17.2l-.7.7" strokeLinecap="round" />
        ) : null}
      </svg>
    );
  }

  if (condition === "snow") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
        <path
          d="M7.2 14.2h9.6a3 3 0 0 0 .35-5.98 4.1 4.1 0 0 0-7.85 1.2A2.7 2.7 0 0 0 7.2 14.2Z"
          strokeLinejoin="round"
        />
        <path d="M9.2 16.6l.8.8M10 16.6l-.8.8M12 16.8l.8.8M12.8 16.8l-.8.8M14.8 16.6l.8.8M15.6 16.6l-.8.8" strokeLinecap="round" />
      </svg>
    );
  }

  // cloudy — 구름 뒤 태양
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <circle cx="10" cy="9" r="3.2" />
      <path
        d="M10 3.5v1.2M10 13.3v1.2M4.7 9H5.9M14.1 9h1.2M6.2 5.2l.85.85M12.95 12.0l.85.85M6.2 12.8l.85-.85M12.95 6.05l.85-.85"
        strokeLinecap="round"
      />
      <path
        d="M8.2 16.2h7.4a3.1 3.1 0 0 0 .35-6.18 4.2 4.2 0 0 0-7.95 1.3A2.7 2.7 0 0 0 8.2 16.2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
