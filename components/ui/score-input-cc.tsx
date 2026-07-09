"use client";

interface ScoreInputCCProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  size?: number;
}

export function ScoreInputCC({
  value,
  onChange,
  disabled = false,
  size = 46,
}: ScoreInputCCProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      max={20}
      value={value}
      onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="–"
      className={[
        "ta-score",
        "[appearance:textfield]",
        "[&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:appearance-none",
        "outline-none",
        "focus:border-[var(--ac)]",
        "focus:shadow-[0_0_0_3px_rgba(0,207,128,0.15)]",
        "disabled:opacity-35",
        "disabled:cursor-not-allowed",
        "placeholder:text-[var(--mt)]",
      ].join(" ")}
      style={{
        width: size,
        height: size,
        fontSize: 26,
        textAlign: "center",
        background: "var(--ip)",
        border: "2px solid var(--br)",
        borderRadius: 10,
      }}
    />
  );
}
