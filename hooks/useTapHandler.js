"use client";

import { useCallback, useRef } from "react";

/**
 * iPhone Safari 向けタップ処理（シンプル版）。
 * onClick を基本とし、touch 後の click 二重発火だけ抑止する。
 */
export function useTapHandler(handler, disabled = false) {
  const handlerRef = useRef(handler);
  const skipClickRef = useRef(false);

  handlerRef.current = handler;

  const invoke = useCallback(
    (event) => {
      if (disabled) return;
      if (typeof handlerRef.current !== "function") return;
      handlerRef.current(event);
    },
    [disabled]
  );

  const onClick = useCallback(
    (event) => {
      if (skipClickRef.current) {
        skipClickRef.current = false;
        return;
      }
      invoke(event);
    },
    [invoke]
  );

  const onTouchEnd = useCallback(
    (event) => {
      skipClickRef.current = true;
      invoke(event);
      window.setTimeout(() => {
        skipClickRef.current = false;
      }, 400);
    },
    [invoke]
  );

  return { onClick, onTouchEnd };
}
