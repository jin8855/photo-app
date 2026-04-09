import type { CSSProperties } from "react";
import type { ScoredCaption } from "@/lib/types/analysis";

type AnalysisCaptionListProps = {
  title: string;
  copyLabel: string;
  copiedLabel: string;
  emptyLabel: string;
  items: ScoredCaption[];
  copiedItem: string | null;
  onCopy: (value: string) => void;
  minHeight?: string;
};

export function AnalysisCaptionList({
  title,
  copyLabel,
  copiedLabel,
  emptyLabel,
  items,
  copiedItem,
  onCopy,
  minHeight,
}: AnalysisCaptionListProps) {
  return (
    <section style={{ ...styles.section, ...(minHeight ? { minHeight } : null) }}>
      <div style={styles.title}>{title}</div>
      {items.length === 0 ? (
        <div style={styles.empty}>{emptyLabel}</div>
      ) : (
        <div style={styles.stack}>
          {items.map((item, index) => (
            <div key={`${item.caption}-${index}`} style={styles.card}>
              <div style={styles.content}>
                <div style={styles.text}>{item.caption}</div>
                <div style={styles.metaRow}>
                  <span style={styles.scoreBadge}>{item.score}</span>
                  <span style={styles.reason}>{item.reason}</span>
                </div>
              </div>
              <button
                type="button"
                style={styles.button}
                onClick={() => onCopy(item.caption)}
                aria-label={copiedItem === item.caption ? copiedLabel : copyLabel}
                title={copiedItem === item.caption ? copiedLabel : copyLabel}
              >
                {copiedItem === item.caption ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  section: {
    display: "grid",
    gap: "12px",
  },
  title: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#2f2923",
  },
  empty: {
    minHeight: "100%",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.6)",
    color: "#7b6f63",
    border: "1px dashed rgba(64, 47, 30, 0.14)",
  },
  stack: {
    display: "grid",
    gap: "12px",
    maxHeight: "360px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "start",
    gap: "12px",
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  content: {
    display: "grid",
    gap: "8px",
  },
  text: {
    fontSize: "15px",
    color: "#2f2923",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
    wordBreak: "break-word",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  scoreBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "34px",
    padding: "3px 8px",
    borderRadius: "999px",
    background: "rgba(232, 220, 209, 0.82)",
    color: "#6a4a34",
    fontSize: "11px",
    fontWeight: 700,
  },
  reason: {
    fontSize: "12px",
    color: "#7b6f63",
    lineHeight: 1.45,
  },
  button: {
    width: "44px",
    height: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: 0,
    background: "rgba(255, 255, 255, 0.92)",
    color: "#1f1b17",
    fontWeight: 700,
    cursor: "pointer",
  },
};

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.2 16.7 19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
