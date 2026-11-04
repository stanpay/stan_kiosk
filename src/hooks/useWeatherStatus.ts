import { useEffect, useState } from "react";
import { env } from "../lib/env";
import {
  fetchWeatherStatus,
  MOCK_WEATHER_STATUS,
} from "../services/weatherStatus";
import type { WeatherFetchState } from "../types/weather";

export default function useWeatherStatus(): WeatherFetchState {
  const [state, setState] = useState<WeatherFetchState>({
    data: MOCK_WEATHER_STATUS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchWeatherStatus();
        if (cancelled) return;
        setState({ data, loading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({
          data: MOCK_WEATHER_STATUS,
          loading: false,
          error: error instanceof Error ? error.message : "날씨 정보를 불러오지 못했습니다.",
        });
      }
    };

    void load();
    const id = window.setInterval(() => void load(), env.weatherRefreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return state;
}
