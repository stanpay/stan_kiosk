import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { IdleProvider } from "../contexts/IdleContext";
import { prefetchVisitJejuTopSpots } from "../services/visitJeju";
import { prefetchJejuTourismMap } from "./JejuTourismMap";
import BottomStatusBar from "./BottomStatusBar";
import IdleScreen from "./IdleScreen";
import NavBar from "./NavBar";
import TopStatusBar from "./TopStatusBar";

/** 조작 없을 때 대기화면으로 복귀 */
const IDLE_RETURN_MS = 90_000;

const FULL_BLEED_PATHS = new Set(["/stores", "/facilities", "/tourism"]);

export default function Layout() {
  const { pathname } = useLocation();
  const isFullBleed = FULL_BLEED_PATHS.has(pathname);
  const [isIdle, setIsIdle] = useState(true);
  const idleTimerRef = useRef<number | null>(null);

  // 관광 화면 진입 전 목록·지도 미리 로드
  useEffect(() => {
    void prefetchVisitJejuTopSpots();
    void prefetchJejuTourismMap();
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const armIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, IDLE_RETURN_MS);
  }, [clearIdleTimer]);

  const dismissIdle = useCallback(() => {
    setIsIdle(false);
    armIdleTimer();
  }, [armIdleTimer]);

  useEffect(() => {
    if (isIdle) {
      clearIdleTimer();
      return;
    }

    const onActivity = () => armIdleTimer();
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);

    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      clearIdleTimer();
    };
  }, [isIdle, armIdleTimer, clearIdleTimer]);

  return (
    <IdleProvider isIdle={isIdle}>
      <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-neutral-900">
        <div className="kiosk-frame relative flex flex-col overflow-hidden bg-slate-100 shadow-2xl">
          {isIdle && <IdleScreen onDismiss={dismissIdle} />}

          <TopStatusBar />

          <div className="flex min-h-0 flex-1">
            <aside
              className="flex shrink-0 items-end border-r border-slate-200/80 bg-slate-100/80"
              style={{ width: "var(--kiosk-nav-width)" }}
            >
              <NavBar />
            </aside>

            <main
              className={[
                "flex min-h-0 min-w-0 flex-1",
                isFullBleed
                  ? "overflow-hidden p-0"
                  : "overflow-auto px-[2cqw] py-[1.5cqh]",
              ].join(" ")}
            >
              <Outlet />
            </main>
          </div>

          <BottomStatusBar />
        </div>
      </div>
    </IdleProvider>
  );
}
