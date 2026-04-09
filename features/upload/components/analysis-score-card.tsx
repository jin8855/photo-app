import type { CSSProperties } from "react";

type AnalysisScoreCardProps = {
  label: string;
  value: number;
};

export function AnalysisScoreCard({ label, value }: AnalysisScoreCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    display: "grid",
    gap: "8px",
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 18px 44px rgba(91, 60, 36, 0.08)",
  },
  label: {
    color: "#7b6f63",
    fontSize: "12px",
  },
  value: {
    fontSize: "18px",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    color: "#231d18",
    fontWeight: 700,
  },
};
