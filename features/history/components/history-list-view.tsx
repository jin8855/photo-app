"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { HistoryListItemCard } from "@/features/history/components/history-list-item-card";
import { AnalysisStateCard } from "@/features/upload/components/analysis-state-card";
import type { HistoryListItem } from "@/lib/types/history";
import { deletePhoto } from "@/services/photos/photo-delete-client";

type HistoryListViewProps = {
  items: HistoryListItem[];
  messages: {
    title: string;
    description: string;
    openDetail: string;
    delete: string;
    deleting: string;
    deleteConfirm: string;
    deleteFailed: string;
    emptyAfterDeleteTitle: string;
    emptyAfterDeleteDescription: string;
    noAnalysis: string;
    photoCreatedAt: string;
    analysisCreatedAt: string;
    sceneType: string;
    moodCategory: string;
  };
};

export function HistoryListView({ items, messages }: HistoryListViewProps) {
  const [listItems, setListItems] = useState(items);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const isEmpty = useMemo(() => listItems.length === 0, [listItems]);

  const handleDelete = async (photoId: number) => {
    const confirmed = window.confirm(messages.deleteConfirm);

    if (!confirmed) {
      return;
    }

    setDeletingPhotoId(photoId);
    setFeedback("");

    try {
      const result = await deletePhoto(photoId);

      if (!result.ok) {
        setFeedback(messages.deleteFailed);
        return;
      }

      setListItems((current) => current.filter((item) => item.photoId !== photoId));
    } catch {
      setFeedback(messages.deleteFailed);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <section style={styles.layout}>
      <div style={styles.header}>
        <h2 style={styles.title}>{messages.title}</h2>
        <p style={styles.description}>{messages.description}</p>
      </div>

      {feedback ? <p style={styles.feedback}>{feedback}</p> : null}

      {isEmpty ? (
        <AnalysisStateCard
          title={messages.emptyAfterDeleteTitle}
          description={messages.emptyAfterDeleteDescription}
        />
      ) : (
        <div style={styles.list}>
          {listItems.map((item) => (
            <HistoryListItemCard
              key={item.photoId}
              item={item}
              isDeleting={deletingPhotoId === item.photoId}
              onDelete={handleDelete}
              messages={{
                openDetail: messages.openDetail,
                delete: messages.delete,
                deleting: messages.deleting,
                noAnalysis: messages.noAnalysis,
                photoCreatedAt: messages.photoCreatedAt,
                analysisCreatedAt: messages.analysisCreatedAt,
                sceneType: messages.sceneType,
                moodCategory: messages.moodCategory,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  layout: {
    display: "grid",
    gap: "20px",
  },
  header: {
    display: "grid",
    gap: "10px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
    color: "#231d18",
    fontWeight: 700,
  },
  description: {
    margin: 0,
    color: "#6b6055",
    lineHeight: 1.7,
  },
  list: {
    display: "grid",
    gap: "16px",
  },
  feedback: {
    margin: 0,
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#7a4123",
    fontWeight: 600,
  },
};
