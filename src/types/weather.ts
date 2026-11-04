/** 대기질 등급: 1 좋음 · 2 보통 · 3 나쁨 · 4 매우나쁨 */
export type AirGrade = 1 | 2 | 3 | 4;

export type AirGradeLabel = "좋음" | "보통" | "나쁨" | "매우나쁨";

/** 화면용 날씨 상태 */
export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "overcast"
  | "rain"
  | "rainSnow"
  | "snow";

export type WeatherStatusData = {
  temperature: number | null;
  condition: WeatherCondition;
  pm10: { grade: AirGrade; label: AirGradeLabel };
  pm25: { grade: AirGrade; label: AirGradeLabel };
  ozone: { grade: AirGrade; label: AirGradeLabel };
  updatedAt: string | null;
  source: "api" | "mock";
};

export type WeatherFetchState = {
  data: WeatherStatusData;
  loading: boolean;
  error: string | null;
};
