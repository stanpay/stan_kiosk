import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { getStoreRedirectUrl, type NearbyStore } from "../services/stores";

type StorePinPopupProps = {
  store: NearbyStore;
  onClose: () => void;
};

export default function StorePinPopup({ store, onClose }: StorePinPopupProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const detailUrl = getStoreRedirectUrl(store.id);

  useEffect(() => {
    let cancelled = false;
    setQrDataUrl(null);
    void QRCode.toDataURL(detailUrl, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [detailUrl]);

  const host =
    document.querySelector(".kiosk-frame") ?? document.body;

  return createPortal(
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/45 p-[3cqw]"
      onClick={onClose}
      role="presentation"
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-label={store.name}
        className="flex w-[68cqw] max-h-[78cqh] flex-col overflow-hidden rounded-[1.6cqw] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[22cqh] w-full shrink-0 overflow-hidden bg-slate-100">
          {store.image_url ? (
            <img
              src={store.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[2cqh] text-slate-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[1.2cqh] overflow-y-auto p-[3cqw]">
          <div>
            <h2 className="text-[2.8cqh] font-extrabold leading-snug text-slate-900">
              {store.name}
            </h2>
            <p className="mt-[0.6cqh] text-[1.9cqh] text-slate-500">
              {store.distance}
              {store.category ? ` · ${store.category}` : ""}
              {store.area ? ` · ${store.area}` : ""}
            </p>
          </div>

          <div className="flex flex-col items-center gap-[1cqh] rounded-[1.2cqw] bg-slate-50 px-[2.4cqw] py-[2cqh]">
            <div className="flex h-[28cqw] w-[28cqw] items-center justify-center overflow-hidden rounded-[1cqw] bg-white p-[1cqw] shadow-sm">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="상세보기 QR 코드"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-[1.6cqh] text-slate-400">QR 생성 중…</span>
              )}
            </div>
            <p className="text-center text-[1.8cqh] font-semibold text-slate-700">
              QR을 스캔해 상세보기
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[0.8cqw] bg-slate-800 px-[3.2cqw] py-[1.1cqh] text-[1.9cqh] font-bold text-white"
            >
              닫기
            </button>
          </div>
        </div>
      </article>
    </div>,
    host,
  );
}
