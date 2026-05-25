export function LiveDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#00D4FF",
        flexShrink: 0,
        animation: "livePulse 1.4s ease-in-out infinite",
      }}
    />
  );
}
