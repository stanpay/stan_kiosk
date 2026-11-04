import type { AirGrade, AirGradeLabel } from "../types/weather";

const LABELS: Record<AirGrade, AirGradeLabel> = {
  1: "좋음",
  2: "보통",
  3: "나쁨",
  4: "매우나쁨",
};

export function parseAirGrade(value: string | number | null | undefined): AirGrade {
  const n = Number(value);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return 2;
}

export function airGradeLabel(grade: AirGrade): AirGradeLabel {
  return LABELS[grade];
}

export function airGradeFromApi(
  grade: string | number | null | undefined,
): { grade: AirGrade; label: AirGradeLabel } {
  const parsed = parseAirGrade(grade);
  return { grade: parsed, label: airGradeLabel(parsed) };
}
