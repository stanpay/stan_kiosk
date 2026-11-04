type IdleScreenProps = {
  onDismiss: () => void;
};

function TouchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M28.5 34.5V18.2a4.2 4.2 0 0 1 8.4 0V36"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36.9 30.8V22.6a3.6 3.6 0 0 1 7.2 0v12.4"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44.1 35.2v-5.4a3.2 3.2 0 0 1 6.4 0v8.8c0 7.4-4.8 13.2-12.4 13.2h-5.2c-5.6 0-9.8-2.4-12.8-6.4L14.4 37a3.4 3.4 0 0 1 5.2-4.4l5.4 5.2V18.2a4.2 4.2 0 0 1 8.4 0V34.5"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.8 14.8c-2.4-2.6-3.8-6-3.8-9.6"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M26.2 12.2c-1.4-1.8-2.2-4-2.2-6.4"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M15.2 19.4c-3.2-1.4-5.8-3.8-7.4-7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function IdleScreen({ onDismiss }: IdleScreenProps) {
  return (
    <button
      type="button"
      className="absolute inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center border-0 bg-neutral-950 p-0"
      onClick={onDismiss}
      aria-label="아무곳이나 터치해주세요"
    >
      <div className="flex min-h-0 w-full flex-1 items-center justify-center px-[3cqw] pb-[16cqh] pt-[2cqh]">
        <img
          src="/banners/downtown-food-map.webp"
          alt="원도심 맛집지도"
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[4.5cqh] flex justify-center px-[3.5cqw]">
        <div className="flex w-[94%] items-center gap-[3.2cqw] rounded-full bg-[#5a5a5a] px-[5cqw] py-[2.6cqh] text-black shadow-lg animate-pulse">
          <TouchIcon className="h-[7.5cqh] w-[7.5cqh] shrink-0" />
          <div className="min-w-0 flex-1 text-left leading-tight">
            <p className="text-[4.2cqw] font-extrabold tracking-tight">
              아무곳이나 터치해주세요.
            </p>
            <p className="mt-[0.6cqh] text-[2.4cqw] font-medium tracking-wide text-black/80">
              Please touch anywhere
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
