import type { CSSProperties } from "react";
import Link from "next/link";

import type { HistoryListItem } from "@/lib/types/history";

type HistoryListItemCardProps = {
  item: HistoryListItem;
  isDeleting?: boolean;
  onDelete?: (photoId: number) => void;
  messages: {
    openDetail: string;
    delete: string;
    deleting: string;
    noAnalysis: string;
    photoCreatedAt: string;
    analysisCreatedAt: string;
    sceneType: string;
    moodCategory: string;
  };
};

export function HistoryListItemCard({
  item,
  isDeleting = false,
  onDelete,
  messages,
}: HistoryListItemCardProps) {
  return (
    <article style={styles.card}>
      <img src={item.filePath} alt={item.originalName} style={styles.image} />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>{item.originalName}</h2>
          <div style={styles.actions}>
            <Link href={`/history/${item.photoId}`} style={styles.link}>
              {messages.openDetail}
            </Link>
            <button
              type="button"
              style={styles.deleteButton}
              disabled={isDeleting}
              onClick={() => onDelete?.(item.photoId)}
            >
              {isDeleting ? messages.deleting : messages.delete}
            </button>
          </div>
        </div>

        <div style={styles.metaGrid}>
          <div style={styles.metaItem}>
            <span style={styles.metaKey}>{messages.photoCreatedAt}</span>
            <span style={styles.metaValue}>{item.photoCreatedAt}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaKey}>{messages.analysisCreatedAt}</span>
            <span style={styles.metaValue}>
              {item.analysisCreatedAt ?? messages.noAnalysis}
            </span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaKey}>{messages.sceneType}</span>
            <span style={styles.metaValue}>{item.sceneType ?? messages.noAnalysis}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaKey}>{messages.moodCategory}</span>
            <span style={styles.metaValue}>{item.moodCategory ?? messages.noAnalysis}</span>
          </div>
        </div>

        <p style={styles.review}>{item.shortReview ?? messages.noAnalysis}</p>
      </div>
    </article>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    display: "grid",
    gridTemplateColumns: "minmax(140px, 180px) minmax(0, 1fr)",
    gap: "18px",
    padding: "18px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.82)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 20px 60px rgba(91, 60, 36, 0.1)",
  },
  image: {
    width: "100%",
    height: "100%",
    minHeight: "148px",
    objectFit: "cover",
    borderRadius: "18px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  content: {
    display: "grid",
    gap: "14px",
    minWidth: 0,
  },
  header: {
    display: "flex",
    alignItems: "start",
    justifyContent: "space-between",
    gap: "16px",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "10px",
  },
  title: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.4,
    color: "#231d18",
    fontWeight: 700,
    wordBreak: "break-word",
  },
  link: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
    borderRadius: "999px",
    padding: "9px 14px",
    background: "#1f1b17",
    color: "#fffaf4",
    fontWeight: 700,
  },
  deleteButton: {
    flexShrink: 0,
    minHeight: "40px",
    borderRadius: "999px",
    padding: "9px 14px",
    background: "rgba(255, 255, 255, 0.92)",
    color: "#7a4123",
    border: "1px solid rgba(122, 65, 35, 0.16)",
    fontWeight: 700,
    cursor: "pointer",
  },
  metaGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  metaItem: {
    display: "grid",
    gap: "4px",
    padding: "10px 12px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.68)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  metaKey: {
    fontSize: "0.84rem",
    color: "#7b6f63",
  },
  metaValue: {
    color: "#2f2923",
    wordBreak: "break-word",
  },
  review: {
    margin: 0,
    color: "#4b4239",
    lineHeight: 1.7,
  },
};
