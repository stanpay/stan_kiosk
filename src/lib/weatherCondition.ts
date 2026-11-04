import type { WeatherCondition } from "../types/weather";

/** 기상청 PTY(강수형태) → 아이콘 상태 */
export function conditionFromPty(pty: number): WeatherCondition | null {
  if (pty === 1 || pty === 5) return "rain";
  if (pty === 2 || pty === 6) return "rainSnow";
  if (pty === 3 || pty === 7) return "snow";
  return null;
}

/** 기상청 SKY(하늘상태) → 아이콘 상태 */
export function conditionFromSky(sky: number): WeatherCondition {
  if (sky === 1) return "clear";
  if (sky === 3) return "cloudy";
  if (sky === 4) return "overcast";
  return "cloudy";
}

export function resolveWeatherCondition(pty: number, sky: number | null): WeatherCondition {
  return conditionFromPty(pty) ?? (sky == null ? "cloudy" : conditionFromSky(sky));
}
