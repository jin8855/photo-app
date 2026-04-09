"use client";

import type { ChangeEvent, CSSProperties } from "react";
import { useRef, useState } from "react";

import Link from "next/link";
import { AnalysisResultViewer } from "@/features/upload/components/analysis-result-viewer";
import { AnalysisStateCard } from "@/features/upload/components/analysis-state-card";
import type { PhotoUploadScreenMessages } from "@/features/upload/i18n/upload-page-messages";
import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { UploadedPhotoRecord } from "@/lib/types/database";
import { analyzePhoto } from "@/services/analyses/photo-analysis-client";
import { uploadPhoto } from "@/services/photos/photo-upload-client";

type PhotoUploadScreenProps = {
  messages: PhotoUploadScreenMessages;
};

export function PhotoUploadScreen({ messages }: PhotoUploadScreenProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedPhotoRecord | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysisResult | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [isMetaExpanded, setIsMetaExpanded] = useState(false);

  const onSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedFile(nextFile);
    setFeedback("");
    setAnalysis(null);
    setAnalysisError("");
  };

  const onUpload = async () => {
    if (!selectedFile) {
      setFeedback(messages.errors.noFile);
      return;
    }

    setIsUploading(true);
    setFeedback("");

    try {
      const result = await uploadPhoto(selectedFile);

      if (!result.ok) {
        setFeedback(messages.errors[result.errorCode] ?? messages.errors.unknown);
        return;
      }

      setUploaded(result.data);
      setAnalysis(null);
      setAnalysisError("");
      setIsMetaExpanded(false);
      setFeedback(messages.success);
    } catch {
      setFeedback(messages.errors.uploadFailed ?? messages.errors.unknown);
    } finally {
      setIsUploading(false);
    }
  };

  const onAnalyze = async () => {
    if (!uploaded) {
      setFeedback(messages.errors.photoNotFound);
      return;
    }

    setIsAnalyzing(true);
    setFeedback("");
    setAnalysisError("");

    try {
      const result = await analyzePhoto(uploaded.id);

      if (!result.ok) {
        const nextError = messages.errors[result.errorCode] ?? messages.errors.unknown;
        setFeedback(nextError);
        setAnalysisError(nextError);
        return;
      }

      setAnalysis(result.data);
      setAnalysisError("");
      setFeedback(messages.analyzeSuccess);
    } catch {
      setFeedback(messages.errors.unknown);
      setAnalysisError(messages.errors.unknown);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section style={styles.layout}>
      <div style={styles.topGrid}>
        <article style={{ ...styles.card, ...styles.formCard }}>
          <h2 style={styles.title}>{messages.heroTitle}</h2>
          <p style={styles.description}>{messages.heroDescription}</p>

          <div style={styles.formGroup}>
            <div style={styles.formLabel}>{messages.selectedLabel}</div>
            <div style={styles.fileName}>
              {selectedFile ? selectedFile.name : messages.emptySelection}
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            style={styles.hiddenInput}
          />

          <div style={styles.actions}>
            <button
              type="button"
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => inputRef.current?.click()}
            >
              {messages.chooseButton}
            </button>
            <button
              type="button"
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={onUpload}
              disabled={isUploading}
            >
              {isUploading ? messages.uploadingButton : messages.uploadButton}
            </button>
            <Link href="/history" style={{ ...styles.button, ...styles.linkButton }}>
              {messages.historyButton}
            </Link>
          </div>

          <p style={styles.helper}>{messages.helper}</p>

          <div style={styles.stepRow}>
            <div style={styles.stepBadge}>{messages.heroSteps.upload}</div>
            <div style={styles.stepArrow}>→</div>
            <div style={styles.stepBadge}>{messages.heroSteps.analyze}</div>
            <div style={styles.stepArrow}>→</div>
            <div style={styles.stepBadge}>{messages.heroSteps.save}</div>
          </div>

          {uploaded && !analysis ? (
            <div style={styles.nextStepCard}>
              <div style={styles.nextStepTitle}>{messages.nextStepTitle}</div>
              <div style={styles.nextStepDescription}>{messages.nextStepDescription}</div>
              <button
                type="button"
                style={{ ...styles.button, ...styles.primaryButton, ...styles.nextStepButton }}
                onClick={onAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? messages.analyzingButton : messages.nextStepButton}
              </button>
            </div>
          ) : null}

          {feedback ? <div style={styles.feedback}>{feedback}</div> : null}
        </article>

        <article style={{ ...styles.card, ...styles.previewCard }}>
          <h2 style={styles.title}>{messages.previewTitle}</h2>
          <p style={styles.description}>{messages.previewDescription}</p>

          {uploaded ? (
            <div style={styles.previewContent}>
              <img alt={uploaded.originalName} src={uploaded.previewUrl} style={styles.previewImage} />
              <div style={styles.metaBlock}>
                <div style={styles.metaHeader}>
                  <div style={styles.metaTitle}>{messages.uploadedMetaTitle}</div>
                  <button
                    type="button"
                    style={styles.metaToggleButton}
                    onClick={() => setIsMetaExpanded((current) => !current)}
                  >
                    {isMetaExpanded ? messages.uploadedMetaCollapse : messages.uploadedMetaExpand}
                  </button>
                </div>
                {isMetaExpanded ? (
                  <>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>{messages.uploadedMetaName}</span>
                      <span style={styles.metaValue}>{uploaded.originalName}</span>
                    </div>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>{messages.uploadedMetaPath}</span>
                      <span style={styles.metaValue}>{uploaded.filePath}</span>
                    </div>
                    <div style={styles.metaRow}>
                      <span style={styles.metaKey}>{messages.uploadedMetaCreatedAt}</span>
                      <span style={styles.metaValue}>{uploaded.createdAt}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div style={styles.emptyPreview} />
          )}
        </article>
      </div>

      <div style={styles.bottomSection}>
        {analysis ? (
          <AnalysisResultViewer
            uploaded={uploaded as UploadedPhotoRecord}
            analysis={analysis}
            onFeedback={setFeedback}
            messages={messages.analysis}
          />
        ) : null}

        {!analysis && isAnalyzing ? (
          <AnalysisStateCard
            title={messages.analysis.states.loadingTitle}
            description={messages.analysis.states.loadingDescription}
          />
        ) : null}

        {!analysis && !isAnalyzing && analysisError ? (
          <AnalysisStateCard
            title={messages.analysis.states.errorTitle}
            description={`${messages.analysis.states.errorDescription} ${analysisError}`}
          />
        ) : null}

        {!analysis && !isAnalyzing && !analysisError ? (
          <AnalysisStateCard
            title={messages.analysis.states.emptyTitle}
            description={messages.analysis.states.emptyDescription}
          />
        ) : null}
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  layout: {
    display: "grid",
    gap: "20px",
    alignItems: "start",
  },
  topGrid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    alignItems: "start",
  },
  bottomSection: {
    display: "grid",
    gap: "20px",
    alignContent: "start",
  },
  card: {
    padding: "24px",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 20px 60px rgba(91, 60, 36, 0.1)",
    backdropFilter: "blur(14px)",
  },
  formCard: {
    display: "grid",
    gap: "18px",
  },
  previewCard: {
    display: "grid",
    gap: "18px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
    fontWeight: 700,
  },
  description: {
    margin: 0,
    color: "#5f564d",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  formGroup: {
    display: "grid",
    gap: "10px",
  },
  formLabel: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#2f2923",
  },
  fileName: {
    minHeight: "52px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    color: "#3e362f",
  },
  hiddenInput: {
    display: "none",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    borderRadius: "999px",
    border: "1px solid transparent",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    background: "#1f1b17",
    color: "#fffaf4",
  },
  secondaryButton: {
    background: "rgba(255, 255, 255, 0.86)",
    color: "#1f1b17",
    borderColor: "rgba(64, 47, 30, 0.12)",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.86)",
    color: "#1f1b17",
    borderColor: "rgba(64, 47, 30, 0.12)",
  },
  helper: {
    margin: 0,
    color: "#7b6f63",
    lineHeight: 1.6,
    fontSize: "12px",
  },
  stepRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  },
  stepBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.86)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    color: "#4c443c",
    fontSize: "12px",
    fontWeight: 700,
  },
  stepArrow: {
    color: "#a28f7c",
    fontSize: "13px",
    fontWeight: 700,
  },
  nextStepCard: {
    display: "grid",
    gap: "10px",
    padding: "16px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, rgba(31, 27, 23, 0.96), rgba(74, 54, 38, 0.9))",
    boxShadow: "0 16px 36px rgba(31, 27, 23, 0.2)",
  },
  nextStepTitle: {
    color: "#fffaf4",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  nextStepDescription: {
    color: "rgba(255, 250, 244, 0.82)",
    fontSize: "12px",
    lineHeight: 1.6,
  },
  nextStepButton: {
    justifySelf: "start",
    minWidth: "180px",
  },
  feedback: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#7a4123",
    fontWeight: 600,
  },
  previewContent: {
    display: "grid",
    gap: "18px",
  },
  previewImage: {
    width: "100%",
    maxHeight: "320px",
    objectFit: "cover",
    borderRadius: "24px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  metaBlock: {
    display: "grid",
    gap: "12px",
  },
  metaHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  metaTitle: {
    fontWeight: 700,
    fontSize: "14px",
  },
  metaToggleButton: {
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "7px 10px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1f1b17",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },
  metaRow: {
    display: "grid",
    gap: "6px",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  metaKey: {
    fontSize: "0.9rem",
    color: "#7b6f63",
  },
  metaValue: {
    color: "#2f2923",
    wordBreak: "break-all",
  },
  emptyPreview: {
    minHeight: "260px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(180, 102, 63, 0.08), rgba(104, 139, 214, 0.1))",
    border: "1px dashed rgba(64, 47, 30, 0.14)",
  },
};
