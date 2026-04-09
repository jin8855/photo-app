import type { CSSProperties } from "react";
import type { ScoredPhrase } from "@/lib/types/analysis";

type AnalysisPhraseListProps = {
  title: string;
  scoreLabel: string;
  reasonLabel: string;
  copyLabel: string;
  copiedLabel: string;
  emptyLabel: string;
  items: ScoredPhrase[];
  copiedItem: string | null;
  onCopy: (value: string) => void;
  minHeight?: string;
};

export function AnalysisPhraseList({
  title,
  scoreLabel,
  reasonLabel,
  copyLabel,
  copiedLabel,
  emptyLabel,
  items,
  copiedItem,
  onCopy,
  minHeight,
}: AnalysisPhraseListProps) {
  return (
    <section style={{ ...styles.section, ...(minHeight ? { minHeight } : null) }}>
      <div style={styles.title}>{title}</div>
      {items.length === 0 ? (
        <div style={styles.empty}>{emptyLabel}</div>
      ) : (
        <ul style={styles.list}>
          {items.map((item, index) => (
            <li key={`${item.phrase}-${index}`} style={styles.item}>
              <div style={styles.content}>
                <span style={styles.text}>{item.phrase}</span>
                <div style={styles.metaRow}>
                  {scoreLabel && item.score > 0 ? (
                    <span style={styles.scoreBadge}>
                      {scoreLabel} {item.score}
                    </span>
                  ) : null}
                  {reasonLabel && item.reason ? (
                    <span style={styles.reasonText}>
                      {reasonLabel} {item.reason}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                style={styles.button}
                onClick={() => onCopy(item.phrase)}
                aria-label={copiedItem === item.phrase ? copiedLabel : copyLabel}
                title={copiedItem === item.phrase ? copiedLabel : copyLabel}
              >
                {copiedItem === item.phrase ? <CheckIcon /> : <CopyIcon />}
              </button>
            </li>
          ))}
        </ul>
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
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: "10px",
    maxHeight: "360px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  content: {
    display: "grid",
    gap: "8px",
    minWidth: 0,
  },
  text: {
    fontSize: "15px",
    color: "#2f2923",
    lineHeight: 1.6,
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
    borderRadius: "999px",
    padding: "4px 8px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "12px",
    fontWeight: 700,
  },
  reasonText: {
    fontSize: "12px",
    color: "#7b6f63",
    lineHeight: 1.4,
  },
  button: {
    flexShrink: 0,
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
