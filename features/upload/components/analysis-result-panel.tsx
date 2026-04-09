import type { CSSProperties, ChangeEvent, RefObject } from "react";
import { useState } from "react";

import { AnalysisCaptionList } from "@/features/upload/components/analysis-caption-list";
import { AnalysisPhraseList } from "@/features/upload/components/analysis-phrase-list";
import { AnalysisScoreCard } from "@/features/upload/components/analysis-score-card";
import type { AnalysisMessages } from "@/features/upload/i18n/upload-page-messages";
import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";
import type {
  ContentOverlayStyle,
  GeneratedContentSet,
  SavedOverlayPreset,
} from "@/lib/types/content";
import type { UploadedPhotoRecord } from "@/lib/types/database";

type AnalysisResultPanelProps = {
  uploaded: UploadedPhotoRecord;
  analysis: PhotoAnalysisResult;
  copiedItem: string | null;
  onCopy: (value: string) => void;
  onGenerateContentSet: () => void;
  isGeneratingContentSet: boolean;
  contentSet: GeneratedContentSet | null;
  commerceContent: GeneratedCommerceContent | null;
  onGenerateCommerceContent: () => void;
  onCopyCommerceContent: () => void;
  onApplyRecommendedPhrase: () => void;
  onApplyOverlayPreset: (
    presetKey:
      | "emotional_card"
      | "bright_intro"
      | "deep_focus"
      | "dawn_blue"
      | "vintage_cream"
      | "sunset_glow",
  ) => void;
  presetName: string;
  savedPresets: SavedOverlayPreset[];
  editingPresetId: string | null;
  editingPresetName: string;
  importInputRef: RefObject<HTMLInputElement | null>;
  onPresetNameChange: (value: string) => void;
  onEditingPresetNameChange: (value: string) => void;
  onSaveOverlayPreset: () => void;
  onDeleteOverlayPreset: (id: string) => void;
  onApplySavedOverlayPreset: (style: ContentOverlayStyle) => void;
  onStartRenameOverlayPreset: (item: SavedOverlayPreset) => void;
  onCancelRenameOverlayPreset: () => void;
  onConfirmRenameOverlayPreset: () => void;
  onExportOverlayPresets: () => void;
  onOpenImportOverlayPresets: () => void;
  onImportOverlayPresets: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedOverlayText: string;
  selectedCaptionText: string;
  overlayStyle: ContentOverlayStyle;
  onSelectOverlayText: (value: string) => void;
  onSelectCaptionText: (value: string) => void;
  onChangeOverlayStyle: (value: ContentOverlayStyle) => void;
  messages: AnalysisMessages;
};

export function AnalysisResultPanel({
  uploaded,
  analysis,
  copiedItem,
  onCopy,
  onGenerateContentSet,
  isGeneratingContentSet,
  contentSet,
  commerceContent,
  onGenerateCommerceContent,
  onCopyCommerceContent,
  onApplyRecommendedPhrase,
  onApplyOverlayPreset,
  presetName,
  savedPresets,
  editingPresetId,
  editingPresetName,
  importInputRef,
  onPresetNameChange,
  onEditingPresetNameChange,
  onSaveOverlayPreset,
  onDeleteOverlayPreset,
  onApplySavedOverlayPreset,
  onStartRenameOverlayPreset,
  onCancelRenameOverlayPreset,
  onConfirmRenameOverlayPreset,
  onExportOverlayPresets,
  onOpenImportOverlayPresets,
  onImportOverlayPresets,
  selectedOverlayText,
  selectedCaptionText,
  overlayStyle,
  onSelectOverlayText,
  onSelectCaptionText,
  onChangeOverlayStyle,
  messages,
}: AnalysisResultPanelProps) {
  const [activeTab, setActiveTab] = useState<"review" | "phrases" | "captions" | "hashtags">(
    "review",
  );
  const [isPresetSectionExpanded, setIsPresetSectionExpanded] = useState(true);

  const sourceLabel =
    analysis.generation_source === "openai" ? messages.sourceOpenAi : messages.sourceMock;
  const warningMessage =
    analysis.generation_warning && analysis.generation_warning in messages.warnings
      ? messages.warnings[analysis.generation_warning as keyof typeof messages.warnings]
      : null;
  const hashtagBundle = analysis.hashtags.join(" ");
  const heroPhrase = analysis.phrases[0]?.phrase ?? analysis.short_review;

  const resolveHeroOverlayPlacement = (position: string): CSSProperties => {
    switch (position) {
      case "top_left":
        return {
          top: "18px",
          left: "18px",
          textAlign: "left",
          alignItems: "flex-start",
        };
      case "top_center":
        return {
          top: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          alignItems: "center",
        };
      case "top_right":
        return {
          top: "18px",
          right: "18px",
          textAlign: "right",
          alignItems: "flex-end",
        };
      case "left_center":
        return {
          top: "50%",
          left: "18px",
          transform: "translateY(-50%)",
          textAlign: "left",
          alignItems: "flex-start",
        };
      case "right_center":
        return {
          top: "50%",
          right: "18px",
          transform: "translateY(-50%)",
          textAlign: "right",
          alignItems: "flex-end",
        };
      case "bottom_left":
        return {
          bottom: "18px",
          left: "18px",
          textAlign: "left",
          alignItems: "flex-start",
        };
      case "bottom_center":
        return {
          bottom: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          alignItems: "center",
        };
      case "bottom_right":
        return {
          bottom: "18px",
          right: "18px",
          textAlign: "right",
          alignItems: "flex-end",
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          alignItems: "center",
        };
    }
  };

  const handleStyleChange =
    <K extends keyof ContentOverlayStyle>(key: K) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChangeOverlayStyle({
        ...overlayStyle,
        [key]: event.target.value as ContentOverlayStyle[K],
      });
    };

  const handleOffsetChange =
    (key: "xOffset" | "yOffset") => (event: ChangeEvent<HTMLInputElement>) => {
      onChangeOverlayStyle({
        ...overlayStyle,
        [key]: Number(event.target.value),
      });
    };

  const handleFilterStrengthChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeOverlayStyle({
      ...overlayStyle,
      filterStrength: Number(event.target.value),
    });
  };

  const resolvePreviewFontFamily = (fontFamily: ContentOverlayStyle["fontFamily"]) => {
    if (fontFamily === "serif") {
      return "Georgia, 'Times New Roman', serif";
    }

    if (fontFamily === "mono") {
      return "'Courier New', monospace";
    }

    if (fontFamily === "display") {
      return "Impact, Haettenschweiler, 'Arial Black', sans-serif";
    }

    if (fontFamily === "handwritten") {
      return "'Brush Script MT', 'Segoe Print', cursive";
    }

    return "Arial, sans-serif";
  };

  const resolvePreviewFontSize = (fontSize: ContentOverlayStyle["fontSize"]) => {
    if (fontSize === "xxsmall") {
      return "11px";
    }

    if (fontSize === "xsmall") {
      return "12px";
    }

    if (fontSize === "small") {
      return "13px";
    }

    if (fontSize === "large") {
      return "18px";
    }

    if (fontSize === "xlarge") {
      return "20px";
    }

    if (fontSize === "xxlarge") {
      return "22px";
    }

    return "15px";
  };

  const resolvePreviewFontWeight = (fontWeight: ContentOverlayStyle["fontWeight"]) => {
    if (fontWeight === "medium") {
      return 500;
    }

    if (fontWeight === "semibold") {
      return 600;
    }

    return 700;
  };

  const resolvePreviewTextColor = (textColor: ContentOverlayStyle["textColor"]) => {
    if (textColor === "cream") {
      return "#f8ecd9";
    }

    if (textColor === "blush") {
      return "#f2c8cd";
    }

    if (textColor === "sage") {
      return "#d7ead9";
    }

    if (textColor === "sky") {
      return "#d8ebff";
    }

    if (textColor === "warm") {
      return "#f3d7c0";
    }

    if (textColor === "dark") {
      return "#1f1b17";
    }

    return "#fffaf4";
  };

  const resolvePreviewBackground = (background: ContentOverlayStyle["background"]) => {
    if (background === "soft_dark") {
      return "rgba(19,16,13,0.38)";
    }

    if (background === "soft_light") {
      return "rgba(255,250,244,0.84)";
    }

    return "transparent";
  };

  const resolvePreviewFrameBackground = (imageFilter: ContentOverlayStyle["imageFilter"]) => {
    if (imageFilter === "soft_warm") {
      return "linear-gradient(135deg, rgba(130,88,58,0.82), rgba(212,171,128,0.68), rgba(255,244,226,0.4))";
    }

    if (imageFilter === "moody_night") {
      return "linear-gradient(135deg, rgba(18,22,38,0.94), rgba(54,70,110,0.72), rgba(151,165,198,0.32))";
    }

    if (imageFilter === "fog_calm") {
      return "linear-gradient(135deg, rgba(128,138,152,0.82), rgba(205,214,224,0.7), rgba(255,255,255,0.34))";
    }

    if (imageFilter === "nature_fresh") {
      return "linear-gradient(135deg, rgba(31,73,58,0.9), rgba(84,142,113,0.68), rgba(224,247,233,0.3))";
    }

    if (imageFilter === "travel_film") {
      return "linear-gradient(135deg, rgba(58,38,26,0.92), rgba(153,108,74,0.7), rgba(240,215,189,0.3))";
    }

    if (imageFilter === "dawn_blue") {
      return "linear-gradient(135deg, rgba(36,58,92,0.92), rgba(95,138,196,0.72), rgba(224,238,255,0.34))";
    }

    if (imageFilter === "vintage_cream") {
      return "linear-gradient(135deg, rgba(120,96,72,0.9), rgba(215,188,149,0.72), rgba(255,247,231,0.36))";
    }

    if (imageFilter === "rose_mood") {
      return "linear-gradient(135deg, rgba(118,62,76,0.92), rgba(189,120,140,0.72), rgba(251,228,234,0.34))";
    }

    if (imageFilter === "sunset_orange") {
      return "linear-gradient(135deg, rgba(98,48,26,0.94), rgba(224,128,68,0.74), rgba(255,224,188,0.34))";
    }

    return "linear-gradient(135deg, rgba(36,28,22,0.9), rgba(112,88,68,0.58), rgba(255,250,244,0.26))";
  };

  const resolvePreviewFilterOpacity = (filterStrength: number) => {
    return Math.min(1, Math.max(0.2, filterStrength / 100));
  };

  const resolvePreviewTextShadow = (shadow: ContentOverlayStyle["shadow"]) => {
    if (shadow === "soft") {
      return "0 8px 18px rgba(19,16,13,0.26)";
    }

    if (shadow === "strong") {
      return "0 12px 24px rgba(19,16,13,0.4)";
    }

    return "none";
  };

  const resolveFilterLabel = (imageFilter: ContentOverlayStyle["imageFilter"]) => {
    if (imageFilter === "soft_warm") {
      return messages.instagram.options.filters.softWarm;
    }

    if (imageFilter === "moody_night") {
      return messages.instagram.options.filters.moodyNight;
    }

    if (imageFilter === "fog_calm") {
      return messages.instagram.options.filters.fogCalm;
    }

    if (imageFilter === "nature_fresh") {
      return messages.instagram.options.filters.natureFresh;
    }

    if (imageFilter === "travel_film") {
      return messages.instagram.options.filters.travelFilm;
    }

    if (imageFilter === "dawn_blue") {
      return messages.instagram.options.filters.dawnBlue;
    }

    if (imageFilter === "vintage_cream") {
      return messages.instagram.options.filters.vintageCream;
    }

    if (imageFilter === "rose_mood") {
      return messages.instagram.options.filters.roseMood;
    }

    if (imageFilter === "sunset_orange") {
      return messages.instagram.options.filters.sunsetOrange;
    }

    return messages.instagram.options.filters.none;
  };

  const resolvePresetBadgeText = (style: ContentOverlayStyle) => {
    return `${resolveFilterLabel(style.imageFilter)} · ${messages.instagram.imageFilterStrengthLabel} ${style.filterStrength}`;
  };

  const resolvePreviewAlignment = (position: ContentOverlayStyle["position"]) => {
    if (position.includes("right")) {
      return { alignItems: "end", textAlign: "right" as const };
    }

    if (position.includes("center")) {
      return { alignItems: "center", textAlign: "center" as const };
    }

    return { alignItems: "start", textAlign: "left" as const };
  };

  const resolvePreviewJustify = (position: ContentOverlayStyle["position"]) => {
    if (position.startsWith("top")) {
      return "start";
    }

    if (position.startsWith("bottom")) {
      return "end";
    }

    return "center";
  };

  const builtInPresets: Array<{
    key:
      | "emotional_card"
      | "bright_intro"
      | "deep_focus"
      | "dawn_blue"
      | "vintage_cream"
      | "sunset_glow";
    label: string;
    style: ContentOverlayStyle;
  }> = [
    {
      key: "emotional_card",
      label: messages.instagram.presets.emotionalCard,
      style: {
        position: "bottom_left",
        fontFamily: "serif",
        fontSize: "large",
        fontWeight: "bold",
        textColor: "light",
        imageFilter: "moody_night",
        filterStrength: 68,
        xOffset: 0,
        yOffset: 0,
        shadow: "soft",
        background: "soft_dark",
        lineHeight: "normal",
      },
    },
    {
      key: "bright_intro",
      label: messages.instagram.presets.brightIntro,
      style: {
        position: "top_center",
        fontFamily: "sans",
        fontSize: "medium",
        fontWeight: "semibold",
        textColor: "dark",
        imageFilter: "soft_warm",
        filterStrength: 54,
        xOffset: 0,
        yOffset: 0,
        shadow: "none",
        background: "soft_light",
        lineHeight: "relaxed",
      },
    },
    {
      key: "deep_focus",
      label: messages.instagram.presets.deepFocus,
      style: {
        position: "center",
        fontFamily: "serif",
        fontSize: "xlarge",
        fontWeight: "bold",
        textColor: "light",
        imageFilter: "travel_film",
        filterStrength: 72,
        xOffset: 0,
        yOffset: 0,
        shadow: "strong",
        background: "none",
        lineHeight: "tight",
      },
    },
    {
      key: "dawn_blue",
      label: messages.instagram.presets.dawnBlue,
      style: {
        position: "top_right",
        fontFamily: "sans",
        fontSize: "large",
        fontWeight: "semibold",
        textColor: "sky",
        imageFilter: "dawn_blue",
        filterStrength: 64,
        xOffset: 0,
        yOffset: -24,
        shadow: "soft",
        background: "none",
        lineHeight: "relaxed",
      },
    },
    {
      key: "vintage_cream",
      label: messages.instagram.presets.vintageCream,
      style: {
        position: "bottom_center",
        fontFamily: "serif",
        fontSize: "large",
        fontWeight: "semibold",
        textColor: "dark",
        imageFilter: "vintage_cream",
        filterStrength: 58,
        xOffset: 0,
        yOffset: 0,
        shadow: "none",
        background: "soft_light",
        lineHeight: "normal",
      },
    },
    {
      key: "sunset_glow",
      label: messages.instagram.presets.sunsetGlow,
      style: {
        position: "center",
        fontFamily: "display",
        fontSize: "xlarge",
        fontWeight: "bold",
        textColor: "cream",
        imageFilter: "sunset_orange",
        filterStrength: 74,
        xOffset: 0,
        yOffset: 0,
        shadow: "strong",
        background: "soft_dark",
        lineHeight: "tight",
      },
    },
  ];

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <div style={styles.kickerRow}>
          <div style={styles.kicker}>{analysis.mood_category}</div>
          <div style={styles.sourceBadge}>{sourceLabel}</div>
          {warningMessage ? <div style={styles.warningBadge}>{warningMessage}</div> : null}
        </div>
        <h2 style={styles.title}>{messages.title}</h2>
        <p style={styles.description}>{messages.description}</p>
      </div>

      <div style={styles.tabBar}>
        <button
          type="button"
          style={{
            ...styles.tabButton,
            ...(activeTab === "review" ? styles.tabButtonActive : null),
          }}
          onClick={() => setActiveTab("review")}
        >
          {messages.tabs.review}
        </button>
        <button
          type="button"
          style={{
            ...styles.tabButton,
            ...(activeTab === "phrases" ? styles.tabButtonActive : null),
          }}
          onClick={() => setActiveTab("phrases")}
        >
          {messages.tabs.phrases}
        </button>
        <button
          type="button"
          style={{
            ...styles.tabButton,
            ...(activeTab === "captions" ? styles.tabButtonActive : null),
          }}
          onClick={() => setActiveTab("captions")}
        >
          {messages.tabs.captions}
        </button>
        <button
          type="button"
          style={{
            ...styles.tabButton,
            ...(activeTab === "hashtags" ? styles.tabButtonActive : null),
          }}
          onClick={() => setActiveTab("hashtags")}
        >
          {messages.tabs.hashtags}
        </button>
      </div>

      {activeTab === "review" ? (
        <div style={styles.reviewPanel}>
          <section style={styles.mainContentResultCard}>
            <div style={styles.contentSetHeader}>
              <div style={styles.ctaTitleGroup}>
                <div style={styles.contentSetTitle}>{messages.cta.title}</div>
                <div style={styles.commerceSalesDescription}>{messages.cta.description}</div>
              </div>
              <button
                type="button"
                style={styles.instagramButton}
                onClick={onGenerateContentSet}
                disabled={isGeneratingContentSet}
              >
                {isGeneratingContentSet ? messages.instagram.contentSetCreating : messages.cta.refresh}
              </button>
            </div>

            {contentSet ? (
              <div style={styles.mainContentResultGrid}>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetImageLabel}</div>
                  <img
                    src={contentSet.imageDownloadUrl}
                    alt={`${uploaded.originalName}-content-result`}
                    style={styles.mainContentResultImage}
                  />
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.currentSelectionCard}>
                    <div style={styles.contentSetLabel}>{messages.cta.currentPhrase}</div>
                    <div style={styles.currentSelectionText}>{selectedOverlayText}</div>
                  </div>
                  <div style={styles.currentSelectionCard}>
                    <div style={styles.contentSetLabel}>{messages.cta.currentCaption}</div>
                    <div style={styles.currentSelectionSubtext}>{selectedCaptionText}</div>
                  </div>
                  <div style={styles.primaryActionGrid}>
                    <a
                      href={contentSet.imageDownloadUrl}
                      download={contentSet.imageFileName}
                      style={{ ...styles.downloadLink, ...styles.primaryActionButton }}
                    >
                      {messages.cta.saveImage}
                    </a>
                    <button
                      type="button"
                      style={styles.primaryActionButton}
                      onClick={() => onCopy(contentSet.captionText)}
                    >
                      {messages.cta.copyCaption}
                    </button>
                    <button
                      type="button"
                      style={styles.primaryActionButton}
                      onClick={() => onCopy(contentSet.hashtagText)}
                    >
                      {messages.cta.copyHashtags}
                    </button>
                  </div>
                  <div style={styles.secondaryActionRow}>
                    <button
                      type="button"
                      style={styles.secondaryActionButton}
                      onClick={() => onCopy(contentSet.combinedText)}
                    >
                      {messages.instagram.contentSetTextCopy}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.contentSetText}>
                {isGeneratingContentSet
                  ? messages.instagram.contentSetCreating
                  : messages.instagram.contentSetCreate}
              </div>
            )}
          </section>

          {analysis.phrases[0] ? (
            <section style={styles.recommendedPhraseCard}>
              <div style={styles.recommendedPhraseHeader}>
                <div style={styles.contentSetTitle}>{messages.recommendedPhrase}</div>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={() => onCopy(analysis.phrases[0]?.phrase ?? "")}
                >
                  {copiedItem === analysis.phrases[0].phrase
                    ? messages.copiedButton
                    : messages.copyButton}
                </button>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={() => {
                    onApplyRecommendedPhrase();
                    setActiveTab("captions");
                  }}
                >
                  {messages.applyRecommendedButton}
                </button>
              </div>
              <div style={styles.recommendedPhraseBody}>{analysis.phrases[0].phrase}</div>
              <div style={styles.recommendedPhraseMeta}>
                <span style={styles.recommendedPhraseScore}>
                  {messages.phraseScore} {analysis.phrases[0].score}
                </span>
                <span style={styles.recommendedPhraseReason}>{analysis.phrases[0].reason}</span>
              </div>
            </section>
          ) : null}

          <section style={styles.detailSection}>
            <div style={styles.sectionTitle}>{messages.cta.detailsTitle}</div>
            <div style={styles.detailGrid}>
              <div style={styles.textCard}>
                <div style={styles.sectionTitle}>{messages.shortReview}</div>
                <div style={styles.sectionBody}>{analysis.short_review}</div>
              </div>
              <div style={styles.textCard}>
                <div style={styles.sectionTitle}>{messages.longReview}</div>
                <div style={styles.sectionBody}>{analysis.long_review}</div>
              </div>
              <div style={styles.metaCard}>
                <span style={styles.metaKey}>{messages.moodCategory}</span>
                <span style={styles.metaValue}>{analysis.mood_category}</span>
              </div>
            </div>
          </section>

          <div style={styles.scoreGrid}>
            <AnalysisScoreCard label={messages.wallpaperScore} value={analysis.wallpaper_score} />
            <AnalysisScoreCard label={messages.socialScore} value={analysis.social_score} />
            <AnalysisScoreCard label={messages.commercialScore} value={analysis.commercial_score} />
          </div>

          <section style={styles.commerceCard}>
            <div style={styles.contentSetHeader}>
              <div style={styles.commerceTitleGroup}>
                <div style={styles.contentSetTitle}>{messages.commerce.sectionTitle}</div>
                <div style={styles.commerceSalesMessage}>{messages.commerce.salesMessage}</div>
                <div style={styles.commerceSalesDescription}>{messages.commerce.salesDescription}</div>
              </div>
              <div style={styles.instagramActions}>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={onGenerateCommerceContent}
                >
                  {messages.commerce.generateButton}
                </button>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={onCopyCommerceContent}
                  disabled={!commerceContent}
                >
                  {messages.commerce.copyButton}
                </button>
                <button type="button" style={styles.instagramGhostButton} disabled aria-disabled="true">
                  {messages.commerce.storePlaceholder}
                </button>
              </div>
            </div>
            {commerceContent ? (
              <div style={styles.commerceGrid}>
                <div style={styles.commerceGeneratedBadge}>{messages.commerce.generatedBadge}</div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.commerce.productTitle}</div>
                  <pre style={styles.contentSetText}>
                    {commerceContent.productTitle ?? messages.commerce.empty}
                  </pre>
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.commerce.oneLineIntro}</div>
                  <pre style={styles.contentSetText}>
                    {commerceContent.oneLineIntro ?? messages.commerce.empty}
                  </pre>
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.commerce.productDescription}</div>
                  <pre style={styles.contentSetText}>
                    {commerceContent.productDescription ?? messages.commerce.empty}
                  </pre>
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.commerce.usageGuide}</div>
                  <pre style={styles.contentSetText}>
                    {commerceContent.usageGuide ?? messages.commerce.empty}
                  </pre>
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.commerce.recommendedFor}</div>
                  <pre style={styles.contentSetText}>
                    {commerceContent.recommendedFor ?? messages.commerce.empty}
                  </pre>
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.commerce.keywords}</div>
                  <pre style={styles.contentSetText}>
                    {commerceContent.keywords.length > 0
                      ? commerceContent.keywords.join(", ")
                      : messages.commerce.empty}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={styles.contentSetText}>{messages.commerce.empty}</div>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "phrases" ? (
        <AnalysisPhraseList
          title={messages.phrases}
          scoreLabel={messages.phraseScore}
          reasonLabel={messages.phraseReason}
          items={analysis.phrases}
          copyLabel={messages.copyButton}
          copiedLabel={messages.copiedButton}
          emptyLabel={messages.emptyList}
          copiedItem={copiedItem}
          onCopy={onCopy}
          minHeight={styles.tabContentMinHeight.minHeight as string}
        />
      ) : null}

      {activeTab === "captions" ? (
        <div style={styles.tabStack}>
          <section style={styles.contentSetCard}>
            <div style={styles.contentSetHeader}>
              <div style={styles.contentSetTitle}>{messages.instagram.contentSetPreviewTitle}</div>
              <div style={styles.instagramActions}>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={onGenerateContentSet}
                  disabled={isGeneratingContentSet}
                >
                  {isGeneratingContentSet
                    ? messages.instagram.contentSetCreating
                    : messages.instagram.contentSetCreate}
                </button>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={() => onCopy(selectedCaptionText)}
                  disabled={!selectedCaptionText}
                >
                  {messages.instagram.captionCopy}
                </button>
                <button
                  type="button"
                  style={styles.instagramButton}
                  onClick={() => onCopy(hashtagBundle)}
                  disabled={!hashtagBundle}
                >
                  {messages.instagram.hashtagCopy}
                </button>
                <button type="button" style={styles.instagramGhostButton} disabled aria-disabled="true">
                  {messages.instagram.sharePlaceholder}
                </button>
              </div>
            </div>

            <div style={styles.overlayControlGrid}>
              <div style={styles.presetSection}>
                <div style={styles.presetHeaderRow}>
                  <div style={styles.contentSetLabel}>{messages.instagram.presetSectionTitle}</div>
                  <button
                    type="button"
                    style={styles.presetToggleButton}
                    onClick={() => setIsPresetSectionExpanded((current) => !current)}
                  >
                    {isPresetSectionExpanded
                      ? messages.instagram.presetCollapseButton
                      : messages.instagram.presetExpandButton}
                  </button>
                </div>
                {isPresetSectionExpanded ? (
                  <>
                    <div style={styles.presetButtons}>
                      {builtInPresets.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          style={styles.presetCardButton}
                          onClick={() => onApplyOverlayPreset(item.key)}
                        >
                          <span style={styles.presetCardName}>{item.label}</span>
                          <span style={styles.presetCardMeta}>{resolvePresetBadgeText(item.style)}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        style={styles.presetButton}
                        onClick={onExportOverlayPresets}
                      >
                        {messages.instagram.presetExportButton}
                      </button>
                      <button
                        type="button"
                        style={styles.presetButton}
                        onClick={onOpenImportOverlayPresets}
                      >
                        {messages.instagram.presetImportButton}
                      </button>
                    </div>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept="application/json"
                      onChange={onImportOverlayPresets}
                      style={styles.hiddenInput}
                    />
                    <div style={styles.presetSaveRow}>
                      <input
                        type="text"
                        value={presetName}
                        onChange={(event) => onPresetNameChange(event.target.value)}
                        placeholder={messages.instagram.presetNamePlaceholder}
                        style={styles.presetInput}
                      />
                      <button
                        type="button"
                        style={styles.presetButton}
                        onClick={onSaveOverlayPreset}
                        disabled={!presetName.trim()}
                      >
                        {messages.instagram.presetSaveButton}
                      </button>
                    </div>
                    {savedPresets.length > 0 ? (
                      <div style={styles.savedPresetSection}>
                        <div style={styles.contentSetLabel}>
                          {messages.instagram.presetSavedSectionTitle}
                        </div>
                        <div style={styles.savedPresetList}>
                          {savedPresets.map((item) => (
                            <div key={item.id} style={styles.savedPresetItem}>
                              <button
                                type="button"
                                style={styles.savedPresetPreviewButton}
                                onClick={() => onApplySavedOverlayPreset(item.style)}
                              >
                                <div
                                  style={{
                                    ...styles.savedPresetPreviewFrame,
                                    background: resolvePreviewFrameBackground(item.style.imageFilter),
                                    opacity: resolvePreviewFilterOpacity(item.style.filterStrength),
                                    justifyContent: resolvePreviewJustify(item.style.position),
                                    ...resolvePreviewAlignment(item.style.position),
                                  }}
                                >
                                  <div
                                    style={{
                                      ...styles.savedPresetPreviewText,
                                      fontFamily: resolvePreviewFontFamily(item.style.fontFamily),
                                      fontSize: resolvePreviewFontSize(item.style.fontSize),
                                      fontWeight: resolvePreviewFontWeight(item.style.fontWeight),
                                      color: resolvePreviewTextColor(item.style.textColor),
                                      background: resolvePreviewBackground(item.style.background),
                                      textShadow: resolvePreviewTextShadow(item.style.shadow),
                                      lineHeight:
                                        item.style.lineHeight === "tight"
                                          ? 1.15
                                          : item.style.lineHeight === "relaxed"
                                            ? 1.55
                                            : 1.35,
                                      transform: `translate(${item.style.xOffset / 10}px, ${item.style.yOffset / 10}px)`,
                                    }}
                                  >
                                    {selectedOverlayText}
                                  </div>
                                </div>
                                <div style={styles.savedPresetPreviewInfo}>
                                  <div style={styles.savedPresetPreviewName}>{item.name}</div>
                                  <div style={styles.savedPresetPreviewMeta}>
                                    {resolvePresetBadgeText(item.style)}
                                  </div>
                                </div>
                              </button>
                              {editingPresetId === item.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingPresetName}
                                    onChange={(event) => onEditingPresetNameChange(event.target.value)}
                                    placeholder={messages.instagram.presetRenamePlaceholder}
                                    style={styles.presetInput}
                                  />
                                  <button
                                    type="button"
                                    style={styles.savedPresetApplyButton}
                                    onClick={onConfirmRenameOverlayPreset}
                                    disabled={!editingPresetName.trim()}
                                  >
                                    {messages.instagram.presetRenameConfirmButton}
                                  </button>
                                  <button
                                    type="button"
                                    style={styles.savedPresetDeleteButton}
                                    onClick={onCancelRenameOverlayPreset}
                                  >
                                    {messages.instagram.presetRenameCancelButton}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    style={styles.savedPresetDeleteButton}
                                    onClick={() => onStartRenameOverlayPreset(item)}
                                  >
                                    {messages.instagram.presetRenameButton}
                                  </button>
                                  <button
                                    type="button"
                                    style={styles.savedPresetDeleteButton}
                                    onClick={() => onDeleteOverlayPreset(item.id)}
                                  >
                                    {messages.instagram.presetDeleteButton}
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayTextLabel}</span>
                <select
                  value={selectedOverlayText}
                  onChange={(event) => onSelectOverlayText(event.target.value)}
                  style={styles.select}
                >
                  {analysis.phrases.map((item, index) => (
                    <option key={`${item.phrase}-${index}`} value={item.phrase}>
                      {item.phrase}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayCaptionLabel}</span>
                <select
                  value={selectedCaptionText}
                  onChange={(event) => onSelectCaptionText(event.target.value)}
                  style={styles.select}
                >
                  {analysis.captions.map((item, index) => (
                    <option key={`${item.caption}-${index}`} value={item.caption}>
                      {item.caption}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayPositionLabel}</span>
                <select
                  value={overlayStyle.position}
                  onChange={handleStyleChange("position")}
                  style={styles.select}
                >
                  <option value="top_left">{messages.instagram.options.positions.topLeft}</option>
                  <option value="top_center">{messages.instagram.options.positions.topCenter}</option>
                  <option value="top_right">{messages.instagram.options.positions.topRight}</option>
                  <option value="left_center">{messages.instagram.options.positions.leftCenter}</option>
                  <option value="center">{messages.instagram.options.positions.center}</option>
                  <option value="right_center">{messages.instagram.options.positions.rightCenter}</option>
                  <option value="bottom_left">{messages.instagram.options.positions.bottomLeft}</option>
                  <option value="bottom_center">{messages.instagram.options.positions.bottomCenter}</option>
                  <option value="bottom_right">{messages.instagram.options.positions.bottomRight}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayFontLabel}</span>
                <select
                  value={overlayStyle.fontFamily}
                  onChange={handleStyleChange("fontFamily")}
                  style={styles.select}
                >
                  <option value="sans">{messages.instagram.options.fonts.sans}</option>
                  <option value="serif">{messages.instagram.options.fonts.serif}</option>
                  <option value="mono">{messages.instagram.options.fonts.mono}</option>
                  <option value="display">{messages.instagram.options.fonts.display}</option>
                  <option value="handwritten">{messages.instagram.options.fonts.handwritten}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlaySizeLabel}</span>
                <select
                  value={overlayStyle.fontSize}
                  onChange={handleStyleChange("fontSize")}
                  style={styles.select}
                >
                  <option value="xxsmall">{messages.instagram.options.sizes.xxsmall}</option>
                  <option value="xsmall">{messages.instagram.options.sizes.xsmall}</option>
                  <option value="small">{messages.instagram.options.sizes.small}</option>
                  <option value="medium">{messages.instagram.options.sizes.medium}</option>
                  <option value="large">{messages.instagram.options.sizes.large}</option>
                  <option value="xlarge">{messages.instagram.options.sizes.xlarge}</option>
                  <option value="xxlarge">{messages.instagram.options.sizes.xxlarge}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayWeightLabel}</span>
                <select
                  value={overlayStyle.fontWeight}
                  onChange={handleStyleChange("fontWeight")}
                  style={styles.select}
                >
                  <option value="medium">{messages.instagram.options.weights.medium}</option>
                  <option value="semibold">{messages.instagram.options.weights.semibold}</option>
                  <option value="bold">{messages.instagram.options.weights.bold}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayColorLabel}</span>
                <select
                  value={overlayStyle.textColor}
                  onChange={handleStyleChange("textColor")}
                  style={styles.select}
                >
                  <option value="light">{messages.instagram.options.colors.light}</option>
                  <option value="warm">{messages.instagram.options.colors.warm}</option>
                  <option value="dark">{messages.instagram.options.colors.dark}</option>
                  <option value="cream">{messages.instagram.options.colors.cream}</option>
                  <option value="blush">{messages.instagram.options.colors.blush}</option>
                  <option value="sage">{messages.instagram.options.colors.sage}</option>
                  <option value="sky">{messages.instagram.options.colors.sky}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.imageFilterLabel}</span>
                <select
                  value={overlayStyle.imageFilter}
                  onChange={handleStyleChange("imageFilter")}
                  style={styles.select}
                >
                  <option value="none">{messages.instagram.options.filters.none}</option>
                  <option value="soft_warm">{messages.instagram.options.filters.softWarm}</option>
                  <option value="moody_night">{messages.instagram.options.filters.moodyNight}</option>
                  <option value="fog_calm">{messages.instagram.options.filters.fogCalm}</option>
                  <option value="nature_fresh">{messages.instagram.options.filters.natureFresh}</option>
                  <option value="travel_film">{messages.instagram.options.filters.travelFilm}</option>
                  <option value="dawn_blue">{messages.instagram.options.filters.dawnBlue}</option>
                  <option value="vintage_cream">{messages.instagram.options.filters.vintageCream}</option>
                  <option value="rose_mood">{messages.instagram.options.filters.roseMood}</option>
                  <option value="sunset_orange">{messages.instagram.options.filters.sunsetOrange}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>
                  {messages.instagram.imageFilterStrengthLabel} ({overlayStyle.filterStrength})
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="2"
                  value={overlayStyle.filterStrength}
                  onChange={handleFilterStrengthChange}
                  style={styles.range}
                />
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayShadowLabel}</span>
                <select
                  value={overlayStyle.shadow}
                  onChange={handleStyleChange("shadow")}
                  style={styles.select}
                >
                  <option value="none">{messages.instagram.options.shadows.none}</option>
                  <option value="soft">{messages.instagram.options.shadows.soft}</option>
                  <option value="strong">{messages.instagram.options.shadows.strong}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayBackgroundLabel}</span>
                <select
                  value={overlayStyle.background}
                  onChange={handleStyleChange("background")}
                  style={styles.select}
                >
                  <option value="none">{messages.instagram.options.backgrounds.none}</option>
                  <option value="soft_dark">{messages.instagram.options.backgrounds.softDark}</option>
                  <option value="soft_light">{messages.instagram.options.backgrounds.softLight}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>{messages.instagram.overlayLineHeightLabel}</span>
                <select
                  value={overlayStyle.lineHeight}
                  onChange={handleStyleChange("lineHeight")}
                  style={styles.select}
                >
                  <option value="tight">{messages.instagram.options.lineHeights.tight}</option>
                  <option value="normal">{messages.instagram.options.lineHeights.normal}</option>
                  <option value="relaxed">{messages.instagram.options.lineHeights.relaxed}</option>
                </select>
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>
                  {messages.instagram.overlayHorizontalLabel} ({overlayStyle.xOffset})
                </span>
                <input
                  type="range"
                  min="-220"
                  max="220"
                  step="4"
                  value={overlayStyle.xOffset}
                  onChange={handleOffsetChange("xOffset")}
                  style={styles.range}
                />
              </label>
              <label style={styles.selectField}>
                <span style={styles.contentSetLabel}>
                  {messages.instagram.overlayVerticalLabel} ({overlayStyle.yOffset})
                </span>
                <input
                  type="range"
                  min="-260"
                  max="260"
                  step="4"
                  value={overlayStyle.yOffset}
                  onChange={handleOffsetChange("yOffset")}
                  style={styles.range}
                />
              </label>
            </div>

            {contentSet ? (
              <div style={styles.contentSetGrid}>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetImageLabel}</div>
                  <img
                    src={contentSet.imageDownloadUrl}
                    alt={`${uploaded.originalName}-content-set`}
                    style={styles.contentSetImage}
                  />
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetCaptionLabel}</div>
                  <pre style={styles.contentSetText}>{contentSet.captionText}</pre>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetHashtagLabel}</div>
                  <pre style={styles.contentSetText}>{contentSet.hashtagText}</pre>
                  <div style={styles.instagramActions}>
                    <button
                      type="button"
                      style={styles.instagramButton}
                      onClick={() => onCopy(contentSet.combinedText)}
                    >
                      {messages.instagram.contentSetTextCopy}
                    </button>
                    <a
                      href={contentSet.imageDownloadUrl}
                      download={contentSet.imageFileName}
                      style={styles.downloadLink}
                    >
                      {messages.instagram.contentSetDownload}
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <AnalysisCaptionList
            title={messages.captions}
            items={analysis.captions}
            copyLabel={messages.copyButton}
            copiedLabel={messages.copiedButton}
            emptyLabel={messages.emptyList}
            copiedItem={copiedItem}
            onCopy={onCopy}
            minHeight={styles.tabContentMinHeight.minHeight as string}
          />
        </div>
      ) : null}

      {activeTab === "hashtags" ? (
        <div style={styles.tabStack}>
          <div style={styles.instagramActions}>
            <button
              type="button"
              style={styles.instagramButton}
              onClick={() => onCopy(hashtagBundle)}
              disabled={!hashtagBundle}
            >
              {messages.instagram.hashtagCopy}
            </button>
          </div>
          <AnalysisPhraseList
            title={messages.hashtags}
            scoreLabel=""
            reasonLabel=""
            items={analysis.hashtags.map((item) => ({ phrase: item, score: 0, reason: "" }))}
            copyLabel={messages.copyButton}
            copiedLabel={messages.copiedButton}
            emptyLabel={messages.emptyList}
            copiedItem={copiedItem}
            onCopy={onCopy}
            minHeight={styles.tabContentMinHeight.minHeight as string}
          />
        </div>
      ) : null}
    </article>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    padding: "32px",
    borderRadius: "32px",
    background: "rgba(255, 255, 255, 0.84)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 24px 80px rgba(91, 60, 36, 0.12)",
    backdropFilter: "blur(16px)",
    display: "grid",
    gap: "24px",
  },
  header: {
    display: "grid",
    gap: "12px",
  },
  kickerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  kicker: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "0.88rem",
    fontWeight: 700,
  },
  sourceBadge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(104, 139, 214, 0.12)",
    color: "#365e9c",
    fontSize: "0.88rem",
    fontWeight: 700,
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
    maxWidth: "720px",
  },
  warning: {
    margin: 0,
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(180, 102, 63, 0.08)",
    color: "#8f4725",
    lineHeight: 1.6,
    fontSize: "12px",
    fontWeight: 600,
  },
  warningBadge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.35,
  },
  tabBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  tabButton: {
    borderRadius: "999px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(64, 47, 30, 0.12)",
    padding: "9px 14px",
    background: "rgba(255, 255, 255, 0.78)",
    color: "#5f564d",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  tabButtonActive: {
    background: "#1f1b17",
    color: "#fffaf4",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#1f1b17",
  },
  reviewPanel: {
    display: "grid",
    gap: "18px",
    minHeight: "420px",
  },
  mainContentResultCard: {
    display: "grid",
    gap: "16px",
    padding: "18px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 20px 56px rgba(91, 60, 36, 0.1)",
  },
  mainContentResultGrid: {
    display: "grid",
    gap: "18px",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  mainContentResultImage: {
    width: "100%",
    minHeight: "360px",
    aspectRatio: "4 / 5",
    objectFit: "cover",
    borderRadius: "22px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "#f7f2ec",
    boxShadow: "0 18px 40px rgba(91, 60, 36, 0.1)",
  },
  recommendedPhraseCard: {
    display: "grid",
    gap: "10px",
    padding: "18px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, rgba(180, 102, 63, 0.12), rgba(255, 255, 255, 0.9))",
    border: "1px solid rgba(180, 102, 63, 0.18)",
  },
  recommendedPhraseHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  recommendedPhraseBody: {
    margin: 0,
    color: "#241c16",
    fontSize: "20px",
    lineHeight: 1.5,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  recommendedPhraseMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },
  recommendedPhraseScore: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.8)",
    color: "#8f4725",
    fontSize: "12px",
    fontWeight: 700,
  },
  recommendedPhraseReason: {
    color: "#6b6055",
    fontSize: "13px",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  tabStack: {
    display: "grid",
    gap: "12px",
  },
  tabContentMinHeight: {
    minHeight: "360px",
  },
  instagramActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },
  instagramButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "10px 16px",
    background: "#1f1b17",
    color: "#fffaf4",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  instagramGhostButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    borderRadius: "999px",
    border: "1px dashed rgba(64, 47, 30, 0.16)",
    padding: "10px 16px",
    background: "rgba(255, 255, 255, 0.72)",
    color: "#7b6f63",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "not-allowed",
  },
  contentSetCard: {
    display: "grid",
    gap: "14px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  contentSetHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaTitleGroup: {
    display: "grid",
    gap: "6px",
  },
  contentSetTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#2f2923",
  },
  contentSetGrid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  contentSetBlock: {
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  currentSelectionCard: {
    display: "grid",
    gap: "6px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  currentSelectionText: {
    color: "#231d18",
    fontSize: "18px",
    lineHeight: 1.5,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
  },
  currentSelectionSubtext: {
    color: "#3e362f",
    fontSize: "13px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  contentSetLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#7b6f63",
  },
  contentSetImage: {
    width: "100%",
    borderRadius: "18px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "#f7f2ec",
  },
  contentSetText: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#2f2923",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  downloadLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "10px 16px",
    background: "rgba(255, 255, 255, 0.92)",
    color: "#1f1b17",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
  },
  primaryActionGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  },
  primaryActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    borderRadius: "14px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "#1f1b17",
    color: "#fffaf4",
    fontSize: "13px",
    fontWeight: 800,
    textDecoration: "none",
    cursor: "pointer",
    padding: "12px 14px",
  },
  secondaryActionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  secondaryActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "10px 14px",
  },
  detailSection: {
    display: "grid",
    gap: "12px",
  },
  detailGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  heroArea: {
    display: "grid",
    gap: "18px",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  heroVisualStack: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
  },
  heroImageCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: "300px",
    borderRadius: "24px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "#e9dfd4",
    boxShadow: "0 20px 56px rgba(91, 60, 36, 0.12)",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  heroImageShade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(19,16,13,0.12) 0%, rgba(19,16,13,0.22) 38%, rgba(19,16,13,0.46) 100%)",
  },
  heroOverlay: {
    position: "absolute",
    zIndex: 1,
    display: "grid",
    gap: "10px",
    maxWidth: "78%",
  },
  heroOverlayKicker: {
    width: "fit-content",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "rgba(255, 250, 244, 0.2)",
    color: "#fff7ef",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    backdropFilter: "blur(10px)",
  },
  heroOverlayText: {
    margin: 0,
    color: "#fffaf4",
    fontSize: "clamp(22px, 2.8vw, 28px)",
    lineHeight: 1.32,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    textShadow: "0 12px 32px rgba(19,16,13,0.42)",
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
  },
  summary: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
  },
  textStack: {
    display: "grid",
    gap: "12px",
  },
  metaCard: {
    display: "grid",
    gap: "6px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  metaKey: {
    fontSize: "0.9rem",
    color: "#7b6f63",
  },
  metaValue: {
    color: "#2f2923",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  textCard: {
    display: "grid",
    gap: "8px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#2f2923",
  },
  sectionBody: {
    color: "#3e362f",
    lineHeight: 1.7,
    fontSize: "14px",
    maxHeight: "108px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  scoreGrid: {
    display: "grid",
    gap: "14px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  commerceCard: {
    display: "grid",
    gap: "14px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  commerceTitleGroup: {
    display: "grid",
    gap: "6px",
  },
  commerceSalesMessage: {
    color: "#8f4725",
    fontSize: "16px",
    lineHeight: 1.35,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  commerceSalesDescription: {
    color: "#6b6055",
    fontSize: "13px",
    lineHeight: 1.6,
    maxWidth: "420px",
  },
  commerceGrid: {
    display: "grid",
    gap: "12px",
  },
  commerceGeneratedBadge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.12)",
    color: "#8f4725",
    fontSize: "12px",
    fontWeight: 700,
  },
  overlayControlGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  presetSection: {
    display: "grid",
    gap: "8px",
    gridColumn: "1 / -1",
  },
  presetHeaderRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  presetToggleButton: {
    minHeight: "40px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  presetButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  presetSaveRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  presetButton: {
    minHeight: "40px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "9px 12px",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  presetCardButton: {
    display: "grid",
    gap: "6px",
    minWidth: "150px",
    padding: "12px 14px",
    borderRadius: "18px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    textAlign: "left",
    cursor: "pointer",
  },
  presetCardName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#2f2923",
  },
  presetCardMeta: {
    fontSize: "11px",
    color: "#7b6f63",
    lineHeight: 1.4,
  },
  hiddenInput: {
    display: "none",
  },
  presetInput: {
    minWidth: "180px",
    flex: 1,
    borderRadius: "14px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "13px",
  },
  savedPresetSection: {
    display: "grid",
    gap: "8px",
  },
  savedPresetList: {
    display: "grid",
    gap: "8px",
  },
  savedPresetItem: {
    display: "grid",
    gap: "8px",
    alignItems: "start",
    gridTemplateColumns: "minmax(0, 1fr)",
  },
  savedPresetPreviewButton: {
    display: "grid",
    gap: "8px",
    padding: "10px",
    borderRadius: "18px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    background: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    textAlign: "left",
  },
  savedPresetPreviewFrame: {
    minHeight: "88px",
    borderRadius: "16px",
    padding: "12px",
    display: "grid",
    background:
      "linear-gradient(135deg, rgba(36,28,22,0.9), rgba(112,88,68,0.58), rgba(255,250,244,0.26))",
    overflow: "hidden",
  },
  savedPresetPreviewText: {
    maxWidth: "100%",
    width: "fit-content",
    borderRadius: "14px",
    padding: "8px 10px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    wordBreak: "break-word",
    letterSpacing: "-0.01em",
  },
  savedPresetPreviewName: {
    color: "#2f2923",
    fontSize: "12px",
    fontWeight: 700,
  },
  savedPresetPreviewInfo: {
    display: "grid",
    gap: "4px",
  },
  savedPresetPreviewMeta: {
    color: "#7b6f63",
    fontSize: "11px",
    lineHeight: 1.4,
  },
  savedPresetApplyButton: {
    minHeight: "40px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "9px 12px",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  savedPresetDeleteButton: {
    minHeight: "40px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "8px 10px",
    background: "rgba(255,255,255,0.78)",
    color: "#7b6f63",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  selectField: {
    display: "grid",
    gap: "8px",
  },
  select: {
    width: "100%",
    borderRadius: "14px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "13px",
  },
  range: {
    width: "100%",
    accentColor: "#8f4725",
  },
};
