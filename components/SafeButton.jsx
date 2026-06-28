"use client";

import { useCallback } from "react";
import { useTapHandler } from "../hooks/useTapHandler";

export default function SafeButton({
  onPress,
  onClick,
  tapLabel,
  type = "button",
  disabled = false,
  children,
  ...props
}) {
  const action = useCallback(
    (event) => {
      if (tapLabel) {
        console.log(`[tap] ${tapLabel}`);
      }
      (onPress ?? onClick)?.(event);
    },
    [tapLabel, onPress, onClick]
  );

  const { onClick: handleClick, onTouchEnd } = useTapHandler(action, disabled);

  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      onClick={handleClick}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </button>
  );
}
