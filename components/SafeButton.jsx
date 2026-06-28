"use client";

export default function SafeButton({
  onPress,
  onClick,
  type = "button",
  disabled = false,
  children,
  ...props
}) {
  const handleClick = (event) => {
    if (disabled) return;
    const action = onPress ?? onClick;
    if (typeof action === "function") {
      action(event);
    }
  };

  return (
    <button type={type} disabled={disabled} {...props} onClick={handleClick}>
      {children}
    </button>
  );
}
