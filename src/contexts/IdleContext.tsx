import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type IdleContextValue = {
  isIdle: boolean;
};

const IdleContext = createContext<IdleContextValue>({ isIdle: false });

export function IdleProvider({
  isIdle,
  children,
}: {
  isIdle: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ isIdle }), [isIdle]);
  return <IdleContext.Provider value={value}>{children}</IdleContext.Provider>;
}

export function useIdle() {
  return useContext(IdleContext);
}

/** 대기모드로 들어가면 onClose 호출. isIdle도 반환해 렌더에서 즉시 숨길 때 사용 */
export function useCloseOnIdle(onClose: () => void) {
  const { isIdle } = useIdle();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isIdle) onCloseRef.current();
  }, [isIdle]);

  return isIdle;
}
