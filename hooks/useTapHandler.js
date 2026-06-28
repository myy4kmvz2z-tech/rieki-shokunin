"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_COOLDOWN_MS = 400;

/**
 * iPhone Safari 向けタップ処理。
 * React の passive touch リスナー問題を避けるため、button に native touchend を付与する。
 */
export function useTapHandler(handler, disabled = false, cooldownMs = DEFAULT_COOLDOWN_MS) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);
  const lastFiredRef = useRef(0);

  handlerRef.current = handler;

  const runHandler = useCallback(
    (event) => {
      if (disabled) return;
      const now = Date.now();
      if (now - lastFiredRef.current < cooldownMs) return;
      lastFiredRef.current = now;
      handlerRef.current?.(event);
    },
    [disabled, cooldownMs]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    function onTouchEnd(event) {
      if (event.cancelable) {
        event.preventDefault();
      }
      runHandler(event);
    }

    element.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => element.removeEventListener("touchend", onTouchEnd);
  }, [disabled, runHandler]);

  const onClick = runHandler;
  const onPointerUp = runHandler;

  return { ref, onClick, onPointerUp };
}
