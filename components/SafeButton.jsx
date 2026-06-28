"use client";

import { useTapHandler } from "../hooks/useTapHandler";

export default function SafeButton({
  onPress,
  onClick,
  type = "button",
  disabled = false,
  children,
  ...props
}) {
  const action = onPress ?? onClick;
  const { ref, onClick: handleClick, onPointerUp } = useTapHandler(action, disabled);

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      {...props}
      onClick={handleClick}
      onPointerUp={onPointerUp}
    >
      {children}
    </button>
  );
}
