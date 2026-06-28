const DEFAULT_COOLDOWN_MS = 400;

/** 非 React 向けの簡易ラッパー（SafeButton / useTapHandler を優先） */
export function bindTapHandler(handler, cooldownMs = DEFAULT_COOLDOWN_MS) {
  if (typeof handler !== "function") {
    return {};
  }

  let lastFiredAt = 0;

  function runTap(event) {
    const now = Date.now();
    if (now - lastFiredAt < cooldownMs) {
      return;
    }
    lastFiredAt = now;
    handler(event);
  }

  function onTouchEnd(event) {
    if (event?.cancelable) {
      event.preventDefault();
    }
    runTap(event);
  }

  return {
    onClick: runTap,
    onTouchEnd,
    onPointerUp: runTap,
  };
}

export const bindSafePress = bindTapHandler;
