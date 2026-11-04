import type { AirGrade } from "../types/weather";

type AirFaceIconProps = {
  grade?: AirGrade;
  className?: string;
};

/** 대기질 등급별 얼굴 아이콘 */
export default function AirFaceIcon({
  grade = 2,
  className = "h-5 w-5",
}: AirFaceIconProps) {
  const mouth =
    grade === 1
      ? "M8.5 14.2c1.2 1.4 2.6 2.1 3.5 2.1s2.3-.7 3.5-2.1"
      : grade === 2
        ? "M8.5 14.5h7"
        : grade === 3
          ? "M8.5 15.2c1.2-1 2.6-1.5 3.5-1.5s2.3.5 3.5 1.5"
          : "M8.2 15.6c1.4-1.6 2.9-2.3 3.8-2.3s2.4.7 3.8 2.3 M9.2 16.6h1.2 M13.6 16.6h1.2";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d={mouth} strokeLinecap="round" />
    </svg>
  );
}
