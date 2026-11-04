import { airGradeFromApi } from "../lib/airGrade";
import { hasDataGoKrKey } from "../lib/env";
import type { WeatherStatusData } from "../types/weather";
import { fetchAirQuality, toAirFields } from "./airQuality";
import { fetchWeatherObservation } from "./weather";

export const MOCK_WEATHER_STATUS: WeatherStatusData = {
  temperature: 21,
  condition: "cloudy",
  pm10: airGradeFromApi(2),
  pm25: airGradeFromApi(2),
  ozone: airGradeFromApi(2),
  updatedAt: null,
  source: "mock",
};

/** 대기질 + 기온/날씨상태를 묶어 상단 상태창용 데이터로 반환 */
export async function fetchWeatherStatus(): Promise<WeatherStatusData> {
  if (!hasDataGoKrKey()) {
    return MOCK_WEATHER_STATUS;
  }

  const [airResult, weatherResult] = await Promise.allSettled([
    fetchAirQuality(),
    fetchWeatherObservation(),
  ]);

  if (airResult.status === "rejected" && weatherResult.status === "rejected") {
    throw new Error("대기질·날씨 API 모두 실패했습니다.");
  }

  const air =
    airResult.status === "fulfilled"
      ? toAirFields(airResult.value)
      : {
          pm10: MOCK_WEATHER_STATUS.pm10,
          pm25: MOCK_WEATHER_STATUS.pm25,
          ozone: MOCK_WEATHER_STATUS.ozone,
          updatedAt: null,
        };

  const temperature =
    weatherResult.status === "fulfilled"
      ? weatherResult.value.temperature
      : MOCK_WEATHER_STATUS.temperature;

  const condition =
    weatherResult.status === "fulfilled"
      ? weatherResult.value.condition
      : MOCK_WEATHER_STATUS.condition;

  return {
    ...air,
    temperature,
    condition,
    updatedAt:
      air.updatedAt ??
      (weatherResult.status === "fulfilled" ? weatherResult.value.updatedAt : null),
    source: "api",
  };
}
