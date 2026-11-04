import AirFaceIcon from "./AirFaceIcon";
import WeatherIcon from "./WeatherIcon";
import useWeatherStatus from "../hooks/useWeatherStatus";

export default function WeatherStatus() {
  const { data, loading, error } = useWeatherStatus();

  const airItems = [
    { key: "pm10", name: "미세", grade: data.pm10.grade, gradeLabel: data.pm10.label },
    { key: "pm25", name: "초미세", grade: data.pm25.grade, gradeLabel: data.pm25.label },
    { key: "ozone", name: "오존", grade: data.ozone.grade, gradeLabel: data.ozone.label },
  ] as const;

  return (
    <div
      className="flex h-full items-center gap-[2.4cqw] whitespace-nowrap text-slate-800"
      aria-label="날씨 및 대기질"
      title={
        error
          ? `날씨 불러오기 실패: ${error}`
          : data.source === "mock"
            ? "목업 데이터 (API 키 또는 연동 확인)"
            : data.updatedAt
              ? `갱신: ${data.updatedAt}`
              : undefined
      }
    >
      <div className="flex h-[86%] shrink-0 flex-col justify-between py-[0.4cqh]">
        {airItems.map((item) => (
          <div
            key={item.key}
            className="grid h-[2.6cqh] grid-cols-[5.6cqw_2.4cqh] items-center gap-x-[0.8cqw]"
          >
            <span className="text-right text-[1.3cqh] leading-none text-slate-600">
              {item.name}
            </span>
            <AirFaceIcon
              grade={item.grade}
              className="h-[2.2cqh] w-[2.2cqh] justify-self-start"
            />
            <span className="sr-only">
              {item.name} {item.gradeLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center gap-[0.45cqh]">
        <span
          className={[
            "text-[2.1cqh] font-semibold tabular-nums leading-none",
            loading ? "opacity-60" : "",
          ].join(" ")}
        >
          {data.temperature == null ? "--" : `${Math.round(data.temperature)}`}
          °C
        </span>
        <WeatherIcon condition={data.condition} className="h-[3.8cqh] w-[3.8cqh]" />
      </div>
    </div>
  );
}
