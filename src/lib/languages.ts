export const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
