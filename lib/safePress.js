/** 非 React 向けの簡易ラッパー（SafeButton / useTapHandler を優先） */
export function bindTapHandler(handler) {
  if (typeof handler !== "function") {
    return {};
  }

  let skipClick = false;

  function invoke(event) {
    handler(event);
  }

  function onClick(event) {
    if (skipClick) {
      skipClick = false;
      return;
    }
    invoke(event);
  }

  function onTouchEnd(event) {
    skipClick = true;
    invoke(event);
    window.setTimeout(() => {
      skipClick = false;
    }, 400);
  }

  return { onClick, onTouchEnd };
}

export const bindSafePress = bindTapHandler;
