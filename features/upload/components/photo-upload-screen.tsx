"use client";

import type { ChangeEvent, CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { AnalysisResultViewer } from "@/features/upload/components/analysis-result-viewer";
import { AnalysisStateCard } from "@/features/upload/components/analysis-state-card";
import type { PhotoUploadScreenMessages } from "@/features/upload/i18n/upload-page-messages";
import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { UploadedPhotoRecord } from "@/lib/types/database";
import { analyzePhoto } from "@/services/analyses/photo-analysis-client";
import { uploadPhoto } from "@/services/photos/photo-upload-client";
import {
  readStoredDeviceType,
  storeDeviceType,
  userDeviceTypes,
  type UserDeviceType,
} from "@/services/user-context/device-type-preference";

type PhotoUploadScreenProps = {
  messages: PhotoUploadScreenMessages;
};

type UploadFlowStep = "select" | "analyze" | "edit" | "finalize";

export function PhotoUploadScreen({ messages }: PhotoUploadScreenProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeFlow, setActiveFlow] = useState<"upload" | null>(null);
  const [currentStep, setCurrentStep] = useState<UploadFlowStep>("select");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhotoRecord[]>([]);
  const [primaryPhotoId, setPrimaryPhotoId] = useState<number | null>(null);
  const [uploaded, setUploaded] = useState<UploadedPhotoRecord | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysisResult | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [isMetaExpanded, setIsMetaExpanded] = useState(false);
  const [deviceType, setDeviceType] = useState<UserDeviceType | null>(null);

  useEffect(() => {
    setDeviceType(readStoredDeviceType());
  }, []);

  const onSelectDeviceType = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDeviceType = event.target.value ? (event.target.value as UserDeviceType) : null;
    setDeviceType(nextDeviceType);
    storeDeviceType(nextDeviceType);
  };

  const onSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setSelectedFiles(nextFiles);
    setUploadedPhotos([]);
    setPrimaryPhotoId(null);
    setUploaded(null);
    setFeedback("");
    setAnalysis(null);
    setAnalysisError("");
    setIsMetaExpanded(false);
    setCurrentStep("select");
  };

  const onUpload = async () => {
    if (selectedFiles.length === 0) {
      setFeedback(messages.errors.noFile);
      return;
    }

    setIsUploading(true);
    setFeedback("");

    try {
      const nextUploadedPhotos: UploadedPhotoRecord[] = [];

      for (const file of selectedFiles) {
        const result = await uploadPhoto(file);

        if (!result.ok) {
          setFeedback(messages.errors[result.errorCode] ?? messages.errors.unknown);
          return;
        }

        nextUploadedPhotos.push(result.data);
      }

      const nextPrimaryPhoto = nextUploadedPhotos[0] ?? null;

      setUploadedPhotos(nextUploadedPhotos);
      setPrimaryPhotoId(nextPrimaryPhoto?.id ?? null);
      setUploaded(nextPrimaryPhoto);
      setAnalysis(null);
      setAnalysisError("");
      setIsMetaExpanded(false);
      setFeedback(messages.success);
      setCurrentStep("select");
    } catch {
      setFeedback(messages.errors.uploadFailed ?? messages.errors.unknown);
    } finally {
      setIsUploading(false);
    }
  };

  const onSelectPrimaryPhoto = (photo: UploadedPhotoRecord) => {
    setPrimaryPhotoId(photo.id);
    setUploaded(photo);
    setAnalysis(null);
    setAnalysisError("");
    setIsMetaExpanded(false);
    setFeedback("");
    setCurrentStep("select");
  };

  const onAnalyze = async () => {
    if (!uploaded) {
      setFeedback(messages.errors.photoNotFound);
      return;
    }

    setIsAnalyzing(true);
    setFeedback("");
    setAnalysisError("");
    setCurrentStep("analyze");

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

  if (activeFlow === null) {
    return (
      <section style={styles.entryLayout}>
        <h1 style={styles.entryTitle}>{messages.entryTitle}</h1>
        <div style={styles.choiceGrid}>
          <button
            type="button"
            style={{ ...styles.choiceCard, ...styles.choiceCardPrimary }}
            onClick={() => setActiveFlow("upload")}
          >
            <span style={styles.choiceEyebrow}>{messages.heroSteps.upload}</span>
            <span style={styles.choiceTitle}>{messages.homeSplit.uploadTitle}</span>
            <span style={styles.choiceDescription}>{messages.homeSplit.uploadDescription}</span>
          </button>

          <Link href="/shooting-guide" style={{ ...styles.choiceCard, ...styles.choiceCardSecondary }}>
            <span style={styles.choiceEyebrow}>{messages.shootingGuideButton}</span>
            <span style={styles.choiceTitle}>{messages.homeSplit.guideTitle}</span>
            <span style={styles.choiceDescription}>{messages.homeSplit.guideDescription}</span>
          </Link>
        </div>

        <div style={styles.supportRow}>
          <Link href="/history" style={styles.supportLink}>
            {messages.homeSplit.historyLabel}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.layout}>
      <div style={styles.supportActionRow}>
        <button
          type="button"
          style={styles.supportActionButton}
          onClick={() => {
            setActiveFlow(null);
            setCurrentStep("select");
          }}
        >
          {messages.homeSplit.backLabel}
        </button>
        <Link href="/history" style={styles.supportActionLink}>
          {messages.historyButton}
        </Link>
        <Link
          href={deviceType ? `/shooting-guide?deviceType=${deviceType}` : "/shooting-guide"}
          style={styles.supportActionLink}
        >
          {messages.shootingGuideButton}
        </Link>
      </div>

      <div style={styles.flowStepNav}>
        <button
          type="button"
          style={{
            ...styles.flowStepButton,
            ...(currentStep === "select" ? styles.flowStepButtonActive : null),
          }}
          onClick={() => setCurrentStep("select")}
        >
          {messages.heroSteps.upload}
        </button>
        <button
          type="button"
          style={{
            ...styles.flowStepButton,
            ...(currentStep === "analyze" ? styles.flowStepButtonActive : null),
            ...(!analysis && !isAnalyzing && !analysisError ? styles.flowStepButtonDisabled : null),
          }}
          onClick={() => setCurrentStep("analyze")}
          disabled={!analysis && !isAnalyzing && !analysisError}
        >
          {messages.analysis.resultSections.stepResultLabel}
        </button>
        <button
          type="button"
          style={{
            ...styles.flowStepButton,
            ...(currentStep === "edit" ? styles.flowStepButtonActive : null),
            ...(!analysis ? styles.flowStepButtonDisabled : null),
          }}
          onClick={() => setCurrentStep("edit")}
          disabled={!analysis}
        >
          {messages.analysis.resultSections.stepEditLabel}
        </button>
        <button
          type="button"
          style={{
            ...styles.flowStepButton,
            ...(currentStep === "finalize" ? styles.flowStepButtonActive : null),
            ...(!analysis ? styles.flowStepButtonDisabled : null),
          }}
          onClick={() => setCurrentStep("finalize")}
          disabled={!analysis}
        >
          {messages.analysis.resultSections.stepCompleteLabel}
        </button>
      </div>

      {currentStep === "select" ? (
      <div style={styles.topGrid}>
        <article style={{ ...styles.card, ...styles.formCard }}>
          <h2 style={styles.title}>{messages.heroTitle}</h2>
          <p style={styles.description}>{messages.heroDescription}</p>

          <div style={styles.formGroup}>
            <div style={styles.formLabel}>{messages.selectedLabel}</div>
            <div style={styles.fileName}>
              {selectedFiles.length > 0
                ? messages.selectedCount.replace("{count}", String(selectedFiles.length))
                : messages.emptySelection}
            </div>
          </div>

          <label style={styles.formGroup}>
            <span style={styles.formLabel}>{messages.deviceTypeLabel}</span>
            <select value={deviceType ?? ""} onChange={onSelectDeviceType} style={styles.select}>
              <option value="">{messages.deviceTypePlaceholder}</option>
              {userDeviceTypes.map((item) => (
                <option key={item} value={item}>
                  {messages.deviceTypes[item]}
                </option>
              ))}
            </select>
            <span style={styles.fieldHint}>
              {deviceType ? messages.deviceTypeSelectedHint : messages.deviceTypeHint}
            </span>
          </label>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
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
              {uploadedPhotos.length > 1 ? (
                <div style={styles.primaryPicker}>
                  <div style={styles.metaTitle}>{messages.primaryPickerTitle}</div>
                  <div style={styles.thumbnailGrid}>
                    {uploadedPhotos.map((photo) => {
                      const isPrimary = photo.id === primaryPhotoId;

                      return (
                        <button
                          key={photo.id}
                          type="button"
                          style={{
                            ...styles.thumbnailButton,
                            ...(isPrimary ? styles.thumbnailButtonActive : null),
                          }}
                          onClick={() => onSelectPrimaryPhoto(photo)}
                        >
                          <img
                            alt={photo.originalName}
                            src={photo.previewUrl}
                            style={styles.thumbnailImage}
                          />
                          <span style={styles.thumbnailLabel}>
                            {isPrimary ? messages.primaryBadge : messages.selectPrimaryButton}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
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
      ) : null}

      {currentStep !== "select" ? (
      <div style={styles.bottomSection}>
        {analysis ? (
          <AnalysisResultViewer
            uploaded={uploaded as UploadedPhotoRecord}
            analysis={analysis}
            deviceType={deviceType}
            activeStep={currentStep === "finalize" ? "finalize" : currentStep === "edit" ? "edit" : "analyze"}
            onStepChange={setCurrentStep}
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
      ) : null}
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  entryLayout: {
    display: "grid",
    gap: "18px",
  },
  entryTitle: {
    margin: 0,
    maxWidth: "760px",
    fontSize: "18px",
    lineHeight: 1.35,
    letterSpacing: "-0.02em",
    color: "#231d18",
    fontWeight: 700,
  },
  choiceGrid: {
    display: "grid",
    gap: "18px",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  choiceCard: {
    display: "grid",
    gap: "12px",
    minHeight: "220px",
    padding: "28px",
    borderRadius: "30px",
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
    transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
  },
  choiceCardPrimary: {
    border: "1px solid rgba(31, 27, 23, 0.12)",
    background: "linear-gradient(145deg, rgba(31, 27, 23, 0.96), rgba(102, 61, 39, 0.9))",
    color: "#fffaf4",
    boxShadow: "0 24px 64px rgba(31, 27, 23, 0.18)",
  },
  choiceCardSecondary: {
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(244,238,229,0.86))",
    color: "#231d18",
    boxShadow: "0 20px 60px rgba(91, 60, 36, 0.1)",
  },
  choiceEyebrow: {
    width: "fit-content",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.18)",
    fontSize: "12px",
    fontWeight: 800,
  },
  choiceTitle: {
    alignSelf: "end",
    fontSize: "26px",
    lineHeight: 1.15,
    letterSpacing: "-0.04em",
    fontWeight: 900,
  },
  choiceDescription: {
    maxWidth: "280px",
    fontSize: "14px",
    lineHeight: 1.6,
    opacity: 0.84,
  },
  supportRow: {
    display: "flex",
    justifyContent: "center",
  },
  supportLink: {
    color: "#7b6f63",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
  },
  supportActionRow: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "6px",
    alignItems: "center",
    overflowX: "auto",
    paddingBottom: "2px",
  },
  supportActionButton: {
    flexShrink: 0,
    minHeight: "30px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    padding: "6px 9px",
    background: "rgba(255, 255, 255, 0.74)",
    color: "#4c443c",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },
  supportActionLink: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "30px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    padding: "6px 9px",
    background: "rgba(255, 255, 255, 0.74)",
    color: "#4c443c",
    fontSize: "11px",
    fontWeight: 800,
    textDecoration: "none",
  },
  backButton: {
    justifySelf: "start",
    minHeight: "38px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "9px 12px",
    background: "rgba(255, 255, 255, 0.78)",
    color: "#3e362f",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  layout: {
    display: "grid",
    gap: "10px",
    alignItems: "start",
  },
  flowStepNav: {
    display: "grid",
    gap: "6px",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    padding: "6px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 8px 24px rgba(91, 60, 36, 0.06)",
  },
  flowStepButton: {
    minHeight: "34px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    padding: "7px 8px",
    background: "rgba(255, 255, 255, 0.78)",
    color: "#4c443c",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  flowStepButtonActive: {
    background: "#1f1b17",
    color: "#fffaf4",
    border: "1px solid #1f1b17",
    boxShadow: "0 12px 26px rgba(31, 27, 23, 0.16)",
  },
  flowStepButtonDisabled: {
    opacity: 0.42,
    cursor: "not-allowed",
  },
  topGrid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    alignItems: "start",
  },
  bottomSection: {
    display: "grid",
    gap: "12px",
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
  fieldHint: {
    color: "#7b6f63",
    fontSize: "12px",
    lineHeight: 1.55,
  },
  fileName: {
    minHeight: "52px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    color: "#3e362f",
  },
  select: {
    width: "100%",
    minHeight: "52px",
    padding: "12px 14px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    color: "#3e362f",
    fontSize: "14px",
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
    border: "1px solid rgba(64, 47, 30, 0.12)",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.86)",
    color: "#1f1b17",
    border: "1px solid rgba(64, 47, 30, 0.12)",
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
    objectFit: "contain",
    objectPosition: "center top",
    background: "#f7f4ee",
    borderRadius: "24px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  primaryPicker: {
    display: "grid",
    gap: "12px",
  },
  thumbnailGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
  },
  thumbnailButton: {
    display: "grid",
    gap: "8px",
    padding: "8px",
    borderRadius: "18px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "rgba(255, 255, 255, 0.72)",
    color: "#5f564d",
    cursor: "pointer",
    textAlign: "left",
  },
  thumbnailButtonActive: {
    border: "2px solid rgba(31, 27, 23, 0.86)",
    background: "rgba(255, 250, 244, 0.94)",
    color: "#1f1b17",
  },
  thumbnailImage: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    borderRadius: "12px",
  },
  thumbnailLabel: {
    fontSize: "12px",
    fontWeight: 800,
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
