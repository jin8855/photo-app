import type { CSSProperties } from "react";

type AnalysisStateCardProps = {
  title: string;
  description: string;
};

export function AnalysisStateCard({ title, description }: AnalysisStateCardProps) {
  return (
    <article style={styles.card}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.description}>{description}</p>
    </article>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    padding: "28px",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.76)",
    border: "1px dashed rgba(64, 47, 30, 0.14)",
    boxShadow: "0 20px 60px rgba(91, 60, 36, 0.08)",
    display: "grid",
    gap: "12px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    letterSpacing: "-0.01em",
    color: "#231d18",
    fontWeight: 700,
  },
  description: {
    margin: 0,
    lineHeight: 1.7,
    color: "#6b6055",
  },
};
