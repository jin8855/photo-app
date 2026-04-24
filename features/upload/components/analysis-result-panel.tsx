import type { CSSProperties, ChangeEvent, PointerEvent, RefObject } from "react";
import { useRef, useState } from "react";
import Link from "next/link";

import { AnalysisCaptionList } from "@/features/upload/components/analysis-caption-list";
import { AnalysisPhraseList } from "@/features/upload/components/analysis-phrase-list";
import { AnalysisScoreCard } from "@/features/upload/components/analysis-score-card";
import type { AnalysisMessages } from "@/features/upload/i18n/upload-page-messages";
import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";
import type {
  ContentFocusArea,
  ContentFrameTextColor,
  ContentFrameStyle,
  ContentOverlayStyle,
  GeneratedContentSet,
  InstagramOutputAspectRatio,
  SavedOverlayPreset,
} from "@/lib/types/content";
import type { UploadedPhotoRecord } from "@/lib/types/database";
import {
  DEFAULT_FOCUS_AREA,
  buildRenderConfig,
  resolveRenderCssFilter,
} from "@/services/content/content-render-config";
import type { PreviewLayout } from "@/services/content/content-image-renderer";
import { resolveInstagramOutputFormat } from "@/services/content/instagram-output-format";
import { getPhotoTipsForAnalysis } from "@/services/tips/photo-tip-service";
import type { UserDeviceType } from "@/services/user-context/device-type-preference";

type AnalysisResultPanelProps = {
  uploaded: UploadedPhotoRecord;
  analysis: PhotoAnalysisResult;
  copiedItem: string | null;
  onCopy: (value: string) => void;
  onGenerateContentSet: () => void;
  onSaveEditPreview: () => void;
  isGeneratingContentSet: boolean;
  contentSet: GeneratedContentSet | null;
  completePreviewContentSet: GeneratedContentSet | null;
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
  previewRenderState: PreviewLayout;
  completePreviewRenderState: PreviewLayout | null;
  completePreviewOverlayStyle: ContentOverlayStyle | null;
  completePreviewOverlayText: string | null;
  completePreviewCaptionText: string | null;
  overlayStyle: ContentOverlayStyle;
  onSelectOverlayText: (value: string) => void;
  onSelectCaptionText: (value: string) => void;
  onChangeOverlayStyle: (value: ContentOverlayStyle) => void;
  deviceType?: UserDeviceType | null;
  activeStep: "analyze" | "edit" | "finalize";
  onStepChange: (step: "analyze" | "edit" | "finalize") => void;
  messages: AnalysisMessages;
};

export function AnalysisResultPanel({
  uploaded,
  analysis,
  copiedItem,
  onCopy,
  onGenerateContentSet,
  onSaveEditPreview,
  isGeneratingContentSet,
  contentSet,
  completePreviewContentSet,
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
  previewRenderState,
  completePreviewRenderState,
  completePreviewOverlayStyle,
  completePreviewOverlayText,
  completePreviewCaptionText,
  overlayStyle,
  onSelectOverlayText,
  onSelectCaptionText,
  onChangeOverlayStyle,
  deviceType = null,
  activeStep,
  onStepChange,
  messages,
}: AnalysisResultPanelProps) {
  const MAX_POLAROID_TEXT_LENGTH = 24;
  const MAX_FILM_NUMBER_LENGTH = 12;
  const resolveTodayDateStamp = () =>
    new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()).replaceAll(". ", ".").replace(/\.$/, "");
  const [isAdvancedCustomizeExpanded, setIsAdvancedCustomizeExpanded] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<"photo" | "text">("photo");
  const [activeMoodOption, setActiveMoodOption] = useState("natural");
  const [activePhotoStyleOption, setActivePhotoStyleOption] = useState("none");
  const [activeSpeechOption, setActiveSpeechOption] = useState("plain");
  const [activeEmotionOption, setActiveEmotionOption] = useState("comfort");
  const [isDetailListExpanded, setIsDetailListExpanded] = useState(false);
  const [selectedPhotoTipCategory, setSelectedPhotoTipCategory] = useState<string | null>(null);
  const pendingFocusAreaRef = useRef<Partial<ContentFocusArea> | null>(null);
  const focusAnimationFrameRef = useRef<number | null>(null);
  const activeTab =
    activeStep === "analyze" ? "review" : activeStep === "edit" ? "captions" : "complete";
  const panelTitle =
    activeTab === "review"
      ? messages.resultSections.analysisResultTitle
      : activeTab === "captions"
        ? messages.resultSections.stepEditLabel
        : messages.resultSections.stepCompleteLabel;
  const panelDescription =
    activeTab === "review"
      ? messages.resultSections.analysisResultDescription
      : activeTab === "captions"
        ? messages.resultSections.editDescription
        : messages.instagram.contentSetReadyDescription;
  const setActiveTab = (nextTab: "review" | "captions" | "complete") => {
    if (nextTab === "review") {
      onStepChange("analyze");
      return;
    }

    if (nextTab === "complete") {
      onStepChange("finalize");
      return;
    }

    onStepChange("edit");
  };

  const sourceLabel =
    analysis.generation_source === "openai" ? messages.sourceOpenAi : messages.sourceMock;
  const photoStyleTypeLabel = analysis.photo_style_type.replaceAll("_", " ");
  const activeRenderedPreviewContentSet = contentSet;
  const activeCompletePreviewContentSet = activeRenderedPreviewContentSet;
  const hasSavedCompletePreview = Boolean(completePreviewRenderState && completePreviewOverlayStyle);
  const currentPreviewImageUrl = previewRenderState.imageUrl;
  const warningMessage =
    analysis.generation_warning && analysis.generation_warning in messages.warnings
      ? messages.warnings[analysis.generation_warning as keyof typeof messages.warnings]
      : null;
  const hashtagBundle = analysis.hashtags.join(" ");
  const heroPhrase = analysis.phrases[0]?.phrase ?? analysis.short_review;
  const isActionLike =
    analysis.photo_style_type === "action_speed" || analysis.photo_style_type === "sports_energy";
  const isSoftLike =
    analysis.photo_style_type === "spring_healing" ||
    analysis.photo_style_type === "natural_healing" ||
    analysis.photo_style_type === "travel_korean";
  const isQuietLike =
    analysis.photo_style_type === "emotional_landscape" ||
    analysis.photo_style_type === "lonely_night" ||
    analysis.photo_style_type === "reflective_fog" ||
    analysis.photo_style_type === "urban_mood" ||
    analysis.photo_style_type === "other";
  const photoTips = getPhotoTipsForAnalysis(analysis, deviceType);
  const selectedPhotoTip = photoTips.find((tip) => tip.category === selectedPhotoTipCategory) ?? null;
  const selectedPhotoTipDetailRows = selectedPhotoTip
    ? [
        { label: messages.photoTips.detailLabel, value: selectedPhotoTip.detail },
        { label: messages.photoTips.whyLabel, value: selectedPhotoTip.why },
        { label: messages.photoTips.whenLabel, value: selectedPhotoTip.when },
        { label: messages.photoTips.exampleLabel, value: selectedPhotoTip.example },
        { label: messages.photoTips.settingHintLabel, value: selectedPhotoTip.relatedSettingHint },
        { label: messages.photoTips.deviceHintLabel, value: selectedPhotoTip.deviceHint },
      ].filter((row) => row.value)
    : [];

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

  const handleFrameTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeOverlayStyle({
      ...overlayStyle,
      frameText: event.target.value.slice(0, MAX_POLAROID_TEXT_LENGTH),
    });
  };

  const handleDateStampEnabledChange = (checked: boolean) => {
    onChangeOverlayStyle({
      ...overlayStyle,
      dateStampEnabled: checked,
      dateStampValue: checked ? overlayStyle.dateStampValue || resolveTodayDateStamp() : overlayStyle.dateStampValue,
    });
  };

  const handleFilmNumberEnabledChange = (checked: boolean) => {
    onChangeOverlayStyle({
      ...overlayStyle,
      filmNumberEnabled: checked,
      filmNumberValue: checked ? overlayStyle.filmNumberValue || "FRAME 01" : overlayStyle.filmNumberValue,
    });
  };

  const handleFilmNumberValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeOverlayStyle({
      ...overlayStyle,
      filmNumberValue: event.target.value.slice(0, MAX_FILM_NUMBER_LENGTH),
    });
  };
  const handleFrameTextColorChange = (frameTextColor: ContentFrameTextColor) => {
    onChangeOverlayStyle({
      ...overlayStyle,
      frameTextColor,
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
    if (imageFilter === "black_and_white") {
      return "linear-gradient(135deg, rgba(18,18,18,0.82), rgba(112,112,112,0.5), rgba(245,245,245,0.18))";
    }

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

    if (imageFilter === "film_frame") {
      return "linear-gradient(135deg, rgba(58,38,26,0.9), rgba(181,124,82,0.66), rgba(255,231,190,0.34))";
    }

    if (imageFilter === "portrait_focus") {
      return "linear-gradient(135deg, rgba(22,20,18,0.42), rgba(255,244,226,0.12), rgba(22,20,18,0.36))";
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

  const renderConfig = {
    ...buildRenderConfig(overlayStyle),
    focusStyle: previewRenderState.focus,
    focusArea: previewRenderState.focusArea,
    frameStyle: previewRenderState.frameStyle,
    imageFitMode: previewRenderState.fit,
  };
  const selectedAspectRatio =
    previewRenderState.fit === "original" ? null : (overlayStyle.aspectRatio ?? null);
  const outputFormat = selectedAspectRatio ? resolveInstagramOutputFormat(selectedAspectRatio) : null;
  const isManualFocusStyle = renderConfig.focusStyle === "manual";
  const isFocusStyle = renderConfig.focusStyle !== "none";
  const imageFitMode = previewRenderState.fit;
  const isColorFocusActive =
    isFocusStyle && renderConfig.toneStyle === "bw" && renderConfig.focusColorMode === "color-pop";
  const resolvePreviewFrameWidth = (aspectRatio: InstagramOutputAspectRatio | undefined) => {
    if (aspectRatio === "1:1") {
      return "min(100%, 440px)";
    }

    if (aspectRatio === "9:16") {
      return "min(100%, 320px)";
    }

    return "min(100%, 420px)";
  };
  const manualFocusCircleStyle: CSSProperties = {
    ...styles.manualFocusCircle,
    left: `${renderConfig.focusArea.centerX * 100}%`,
    top: `${renderConfig.focusArea.centerY * 100}%`,
    width: `${renderConfig.focusArea.radius * 2 * 100}%`,
  };
  const frameStyle = previewRenderState.frameStyle;
  const frameTextColor = previewRenderState.frameTextColor;
  const polaroidFrameText = (overlayStyle.frameText ?? "").slice(0, MAX_POLAROID_TEXT_LENGTH).trim();
  const dateStampText = overlayStyle.dateStampValue || resolveTodayDateStamp();
  const filmNumberText = (overlayStyle.filmNumberValue ?? "FRAME 01").slice(0, MAX_FILM_NUMBER_LENGTH).trim();
  const isDateStampVisible = frameStyle !== "none" && overlayStyle.dateStampEnabled === true;
  const resolvePreviewImageFilter = (imageFilter: ContentOverlayStyle["imageFilter"]) => {
    return resolveRenderCssFilter({
      ...renderConfig,
      toneStyle:
        imageFilter === "black_and_white"
          ? "bw"
          : imageFilter === "film_frame" || imageFilter === "travel_film" || imageFilter === "vintage_cream"
            ? "film"
            : "none",
    });
  };

  const resolvePreviewBaseImageFilter = (imageFilter: ContentOverlayStyle["imageFilter"]) => {
    const baseFilter = resolvePreviewImageFilter(imageFilter);

    if (!isFocusStyle) {
      return baseFilter;
    }

    const blurPixels = Math.min(3, Math.max(1.8, renderConfig.params.blurBackground * 48));

    return `${baseFilter} blur(${blurPixels.toFixed(1)}px) brightness(0.85)`;
  };

  const resolvePreviewFocusImageFilter = (imageFilter: ContentOverlayStyle["imageFilter"]) => {
    if (isColorFocusActive) {
      return "none";
    }

    return resolvePreviewImageFilter(imageFilter);
  };

  const isVintageFilmFrameStyle = frameStyle === "vintageFilmBorder";
  const isCinemaFilmFrameStyle = frameStyle === "cinemaFilm";
  const isPolaroidFrameStyle = frameStyle === "polaroid";
  const isMinimalFrameStyle = frameStyle === "minimal";
  const isFilmNumberVisible =
    (isVintageFilmFrameStyle || isCinemaFilmFrameStyle) && overlayStyle.filmNumberEnabled === true;
  const resolvePreviewMatBackground = (
    currentStyle: ContentOverlayStyle = overlayStyle,
  ) => {
    const currentRenderConfig =
      currentStyle === overlayStyle ? renderConfig : buildRenderConfig(currentStyle);

    if (currentRenderConfig.cameraStyle === "crisp" && currentRenderConfig.toneStyle === "none") {
      return "#ffffff";
    }

    if (
      currentStyle.imageFilter === "film_frame" ||
      currentStyle.imageFilter === "travel_film" ||
      currentStyle.imageFilter === "vintage_cream"
    ) {
      return "#f4eee3";
    }

    if (currentRenderConfig.toneStyle === "bw") {
      return "#f1eee7";
    }

    return "#f7f4ee";
  };
  const resolvePreviewPhotoWindowStyle = (currentFrameStyle: ContentFrameStyle): CSSProperties => {
    if (currentFrameStyle === "vintageFilmBorder") {
      return {
        ...styles.livePreviewPhotoWindow,
        inset: "22px",
        borderRadius: "8px",
      };
    }

    if (currentFrameStyle === "cinemaFilm") {
      return {
        ...styles.livePreviewPhotoWindow,
        inset: "7% 0",
        borderRadius: 0,
      };
    }

    if (currentFrameStyle === "polaroid") {
      return {
        ...styles.livePreviewPhotoWindow,
        inset: "20px 20px 88px",
        borderRadius: "4px",
      };
    }

    if (currentFrameStyle === "minimal") {
      return {
        ...styles.livePreviewPhotoWindow,
        inset: "20px",
        borderRadius: "16px",
      };
    }

    return {
      ...styles.livePreviewPhotoWindow,
      inset: 0,
      borderRadius: "2px",
    };
  };
  const resolveFrameTextPreviewColor = (color: ContentFrameTextColor) => {
    if (color === "black") {
      return "#231c17";
    }

    if (color === "brown") {
      return "#6a4d39";
    }

    if (color === "cream") {
      return "#fff2dc";
    }

    return "rgba(255,255,255,0.92)";
  };
  const resolveFrameTextPreviewShadow = (color: ContentFrameTextColor) => {
    if (color === "black") {
      return "0 1px 2px rgba(255,255,255,0.26)";
    }

    if (color === "brown") {
      return "0 1px 2px rgba(20,10,6,0.14)";
    }

    return "0 1px 2px rgba(0,0,0,0.45)";
  };
  const frameTextColorOptions: Array<{ key: ContentFrameTextColor; label: string }> = [
    { key: "white", label: messages.instagram.frameTextColorWhite },
    { key: "black", label: messages.instagram.frameTextColorBlack },
    { key: "brown", label: messages.instagram.frameTextColorBrown },
    { key: "cream", label: messages.instagram.frameTextColorCream },
  ];
  const resolvePreviewFocusClipPath = (focusArea: ContentFocusArea) => {
    return `circle(${focusArea.radius * 100}% at ${focusArea.centerX * 100}% ${focusArea.centerY * 100}%)`;
  };

  const clampFocusArea = (nextArea: ContentFocusArea): ContentFocusArea => {
    const radius = clampValue(nextArea.radius, 0.15, 0.5);
    const verticalRadius = radius * 0.8;

    return {
      centerX: clampValue(nextArea.centerX, radius, 1 - radius),
      centerY: clampValue(nextArea.centerY, verticalRadius, 1 - verticalRadius),
      radius,
    };
  };

  const updateManualFocusArea = (nextArea: Partial<ContentFocusArea>) => {
    const focusArea = clampFocusArea({
      ...renderConfig.focusArea,
      ...nextArea,
    });

    onChangeOverlayStyle({
      ...overlayStyle,
      focusStyle: "manual",
      focusArea,
    });
  };

  const scheduleManualFocusAreaUpdate = (nextArea: Partial<ContentFocusArea>) => {
    pendingFocusAreaRef.current = {
      ...pendingFocusAreaRef.current,
      ...nextArea,
    };

    if (focusAnimationFrameRef.current !== null) {
      return;
    }

    focusAnimationFrameRef.current = window.requestAnimationFrame(() => {
      const pendingArea = pendingFocusAreaRef.current;
      pendingFocusAreaRef.current = null;
      focusAnimationFrameRef.current = null;

      if (pendingArea) {
        updateManualFocusArea(pendingArea);
      }
    });
  };

  const updateManualFocusAreaFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const radius = renderConfig.focusArea.radius;
    const verticalRadius = radius * 0.8;

    scheduleManualFocusAreaUpdate({
      centerX: clampValue((event.clientX - rect.left) / rect.width, radius, 1 - radius),
      centerY: clampValue((event.clientY - rect.top) / rect.height, verticalRadius, 1 - verticalRadius),
    });
  };

  const handleManualFocusPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateManualFocusAreaFromPointer(event);
  };

  const handleManualFocusPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    updateManualFocusAreaFromPointer(event);
  };

  const handleManualFocusPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleManualFocusRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const radius = Number(event.target.value);
    const verticalRadius = radius * 0.8;

    updateManualFocusArea({
      centerX: clampValue(renderConfig.focusArea.centerX, radius, 1 - radius),
      centerY: clampValue(renderConfig.focusArea.centerY, verticalRadius, 1 - verticalRadius),
      radius,
    });
  };

  const clampValue = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
  };
  const filmDateStamp = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\s/g, "");

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
    if (imageFilter === "black_and_white") {
      return messages.instagram.options.filters.blackAndWhite;
    }

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

    if (imageFilter === "film_frame") {
      return messages.instagram.options.filters.filmFrame;
    }

    if (imageFilter === "portrait_focus") {
      return messages.instagram.options.filters.portraitFocus;
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

  const isSameOverlayStyle = (targetStyle: ContentOverlayStyle) => {
    const currentFocusStyle =
      overlayStyle.focusStyle ?? (overlayStyle.imageFilter === "portrait_focus" ? "center" : "none");
    const targetFocusStyle =
      targetStyle.focusStyle ?? (targetStyle.imageFilter === "portrait_focus" ? "center" : "none");
    const currentFocusArea = overlayStyle.focusArea ?? DEFAULT_FOCUS_AREA;
    const targetFocusArea = targetStyle.focusArea ?? DEFAULT_FOCUS_AREA;

    return (
      overlayStyle.position === targetStyle.position &&
      overlayStyle.fontFamily === targetStyle.fontFamily &&
      overlayStyle.fontSize === targetStyle.fontSize &&
      overlayStyle.fontWeight === targetStyle.fontWeight &&
      overlayStyle.textColor === targetStyle.textColor &&
      overlayStyle.imageFilter === targetStyle.imageFilter &&
      overlayStyle.filterStrength === targetStyle.filterStrength &&
      overlayStyle.xOffset === targetStyle.xOffset &&
      overlayStyle.yOffset === targetStyle.yOffset &&
      overlayStyle.shadow === targetStyle.shadow &&
      overlayStyle.background === targetStyle.background &&
      overlayStyle.lineHeight === targetStyle.lineHeight &&
      overlayStyle.cameraStyle === targetStyle.cameraStyle &&
      (overlayStyle.frameStyle ?? "none") === (targetStyle.frameStyle ?? "none") &&
      (overlayStyle.frameText ?? "") === (targetStyle.frameText ?? "") &&
      (overlayStyle.imageFitMode ?? "contain") === (targetStyle.imageFitMode ?? "contain") &&
      (targetStyle.aspectRatio === undefined ||
        (overlayStyle.aspectRatio ?? "4:5") === (targetStyle.aspectRatio ?? "4:5")) &&
      currentFocusStyle === targetFocusStyle &&
      (overlayStyle.focusColorMode ?? "none") === (targetStyle.focusColorMode ?? "none") &&
      currentFocusArea.centerX === targetFocusArea.centerX &&
      currentFocusArea.centerY === targetFocusArea.centerY &&
      currentFocusArea.radius === targetFocusArea.radius
    );
  };

  const isSamePartialOverlayStyle = (targetStyle: Partial<ContentOverlayStyle>) => {
    return Object.entries(targetStyle).every(([key, value]) => {
      const currentValue = overlayStyle[key as keyof ContentOverlayStyle];

      if (key === "focusArea") {
        const currentFocusArea = overlayStyle.focusArea ?? DEFAULT_FOCUS_AREA;
        const targetFocusArea = (value as ContentFocusArea | undefined) ?? DEFAULT_FOCUS_AREA;

        return (
          currentFocusArea.centerX === targetFocusArea.centerX &&
          currentFocusArea.centerY === targetFocusArea.centerY &&
          currentFocusArea.radius === targetFocusArea.radius
        );
      }

      return currentValue === value;
    });
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
    description: string;
    style: ContentOverlayStyle;
  }> = [
    {
      key: "emotional_card",
      label: messages.instagram.presets.emotionalCard,
      description: messages.instagram.presetDescriptions.emotionalCard,
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
        cameraStyle: "classic",
      },
    },
    {
      key: "bright_intro",
      label: messages.instagram.presets.brightIntro,
      description: messages.instagram.presetDescriptions.brightIntro,
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
        cameraStyle: "natural",
      },
    },
    {
      key: "deep_focus",
      label: messages.instagram.presets.deepFocus,
      description: messages.instagram.presetDescriptions.deepFocus,
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
        cameraStyle: "classic",
      },
    },
    {
      key: "dawn_blue",
      label: messages.instagram.presets.dawnBlue,
      description: messages.instagram.presetDescriptions.dawnBlue,
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
        cameraStyle: "crisp",
      },
    },
    {
      key: "vintage_cream",
      label: messages.instagram.presets.vintageCream,
      description: messages.instagram.presetDescriptions.vintageCream,
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
        cameraStyle: "warmPortrait",
      },
    },
    {
      key: "sunset_glow",
      label: messages.instagram.presets.sunsetGlow,
      description: messages.instagram.presetDescriptions.sunsetGlow,
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
        cameraStyle: "crisp",
      },
    },
  ];

  const comboPresets: Array<{
    key: "film_mood" | "polaroid_memory" | "product_thumbnail";
    label: string;
    description: string;
    style: Partial<ContentOverlayStyle>;
  }> = [
    {
      key: "film_mood",
      label: messages.instagram.comboPresets.filmMood,
      description: messages.instagram.comboPresetDescriptions.filmMood,
      style: {
        imageFilter: "film_frame",
        filterStrength: 72,
        cameraStyle: "classic",
        frameStyle: "cinemaFilm",
        focusStyle: "center",
        dateStampEnabled: true,
        dateStampValue: overlayStyle.dateStampValue || resolveTodayDateStamp(),
        filmNumberEnabled: true,
        filmNumberValue: overlayStyle.filmNumberValue || "FRAME 01",
      },
    },
    {
      key: "polaroid_memory",
      label: messages.instagram.comboPresets.polaroidMemory,
      description: messages.instagram.comboPresetDescriptions.polaroidMemory,
      style: {
        imageFilter: "film_frame",
        filterStrength: 58,
        cameraStyle: "warmPortrait",
        frameStyle: "polaroid",
        focusStyle: "center",
        dateStampEnabled: true,
        dateStampValue: overlayStyle.dateStampValue || resolveTodayDateStamp(),
        frameText: overlayStyle.frameText ?? "",
      },
    },
    {
      key: "product_thumbnail",
      label: messages.instagram.comboPresets.productThumbnail,
      description: messages.instagram.comboPresetDescriptions.productThumbnail,
      style: {
        imageFilter: "none",
        filterStrength: 34,
        cameraStyle: "crisp",
        frameStyle: "minimal",
        focusStyle: "manual",
        focusArea: overlayStyle.focusArea ?? DEFAULT_FOCUS_AREA,
        dateStampEnabled: false,
        filmNumberEnabled: false,
      },
    },
  ];

  const getPhraseAt = (index: number) => {
    return analysis.phrases[index]?.phrase ?? analysis.phrases[0]?.phrase ?? analysis.short_review;
  };

  const getCaptionAt = (index: number) => {
    return analysis.captions[index]?.caption ?? analysis.captions[0]?.caption ?? "";
  };

  const highestScorePhrase =
    [...analysis.phrases].sort((first, second) => second.score - first.score)[0]?.phrase ??
    getPhraseAt(0);
  const highestScoreCaption =
    [...analysis.captions].sort((first, second) => second.score - first.score)[0]?.caption ??
    getCaptionAt(0);
  const questionPhrase =
    analysis.phrases.find((item) => item.phrase.includes("?"))?.phrase ?? getPhraseAt(3);
  const questionCaption =
    analysis.captions.find((item) => item.caption.includes("?"))?.caption ?? getCaptionAt(3);

  const moodOptions = [
    {
      key: "natural",
      label: messages.instagram.quickControlLabels.natural,
      style: {
        imageFilter: "none",
        filterStrength: 36,
        textColor: "light",
        background: "none",
        shadow: "soft",
        fontFamily: "sans",
        fontSize: "medium",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "bright",
      label: messages.instagram.quickControlLabels.bright,
      style: {
        imageFilter: "soft_warm",
        filterStrength: 54,
        textColor: "dark",
        background: "soft_light",
        shadow: "none",
        fontFamily: "sans",
        fontSize: "medium",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "calm",
      label: messages.instagram.quickControlLabels.calm,
      style: {
        imageFilter: "fog_calm",
        filterStrength: 62,
        textColor: "cream",
        background: "soft_dark",
        shadow: "soft",
        fontFamily: "serif",
        fontSize: "large",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "bold",
      label: messages.instagram.quickControlLabels.bold,
      style: {
        imageFilter: "sunset_orange",
        filterStrength: 72,
        textColor: "cream",
        background: "soft_dark",
        shadow: "strong",
        fontFamily: "display",
        fontSize: "xlarge",
        fontWeight: "bold",
      } satisfies Partial<ContentOverlayStyle>,
    },
  ];

  const photoStyleOptions = [
    {
      key: "none",
      label: messages.instagram.quickControlLabels.none,
      style: {
        imageFilter: "none",
        filterStrength: 36,
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "blackAndWhite",
      label: messages.instagram.quickControlLabels.blackAndWhite,
      style: {
        imageFilter: "black_and_white",
        filterStrength: 88,
        textColor: "light",
        background: "soft_dark",
        shadow: "strong",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "film",
      label: messages.instagram.quickControlLabels.film,
      style: {
        imageFilter: "film_frame",
        filterStrength: 76,
        textColor: "cream",
        shadow: "soft",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "warm",
      label: messages.instagram.quickControlLabels.warm,
      style: {
        imageFilter: "vintage_cream",
        filterStrength: 62,
        textColor: "dark",
        background: "soft_light",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "cool",
      label: messages.instagram.quickControlLabels.cool,
      style: {
        imageFilter: "dawn_blue",
        filterStrength: 66,
        textColor: "sky",
        background: "none",
      } satisfies Partial<ContentOverlayStyle>,
    },
  ];

  const focusStyleOptions = [
    {
      key: "none",
      label: messages.instagram.focusStyleLabels.none,
      description: messages.instagram.focusStyleDescriptions.none,
      style: {
        focusStyle: "none",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "center",
      label: messages.instagram.focusStyleLabels.center,
      description: messages.instagram.focusStyleDescriptions.center,
      style: {
        focusStyle: "center",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "manual",
      label: messages.instagram.focusStyleLabels.manual,
      description: messages.instagram.focusStyleDescriptions.manual,
      style: {
        focusStyle: "manual",
        focusArea: overlayStyle.focusArea ?? DEFAULT_FOCUS_AREA,
      } satisfies Partial<ContentOverlayStyle>,
    },
  ];

  const cameraStyleOptions = [
    {
      key: "none",
      label: messages.instagram.cameraStyleLabels.none,
      style: {
        cameraStyle: "none",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "natural",
      label: messages.instagram.cameraStyleLabels.natural,
      style: {
        cameraStyle: "natural",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "warmPortrait",
      label: messages.instagram.cameraStyleLabels.warmPortrait,
      style: {
        cameraStyle: "warmPortrait",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "crisp",
      label: messages.instagram.cameraStyleLabels.crisp,
      style: {
        cameraStyle: "crisp",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "classic",
      label: messages.instagram.cameraStyleLabels.classic,
      style: {
        cameraStyle: "classic",
      } satisfies Partial<ContentOverlayStyle>,
    },
  ];

  const frameStyleOptions: Array<{
    key: ContentFrameStyle;
    label: string;
    style: Partial<ContentOverlayStyle>;
  }> = [
    {
      key: "none",
      label: messages.instagram.frameStyleLabels.none,
      style: {
        frameStyle: "none",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "vintageFilmBorder",
      label: messages.instagram.frameStyleLabels.vintageFilmBorder,
      style: {
        frameStyle: "vintageFilmBorder",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "cinemaFilm",
      label: messages.instagram.frameStyleLabels.cinemaFilm,
      style: {
        frameStyle: "cinemaFilm",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "polaroid",
      label: messages.instagram.frameStyleLabels.polaroid,
      style: {
        frameStyle: "polaroid",
      } satisfies Partial<ContentOverlayStyle>,
    },
    {
      key: "minimal",
      label: messages.instagram.frameStyleLabels.minimal,
      style: {
        frameStyle: "minimal",
      } satisfies Partial<ContentOverlayStyle>,
    },
  ];

  const aspectRatioOptions: Array<{
    key: InstagramOutputAspectRatio;
    label: string;
  }> = [
    {
      key: "1:1",
      label: messages.instagram.aspectRatioLabels.square,
    },
    {
      key: "4:5",
      label: messages.instagram.aspectRatioLabels.feed,
    },
    {
      key: "9:16",
      label: messages.instagram.aspectRatioLabels.story,
    },
  ];
  const imageFitModeOptions: Array<{ key: "original" | "contain" | "cover"; label: string }> = [
    {
      key: "original",
      label: messages.instagram.imageFitModeLabels.original,
    },
    {
      key: "contain",
      label: messages.instagram.imageFitModeLabels.contain,
    },
    {
      key: "cover",
      label: messages.instagram.imageFitModeLabels.cover,
    },
  ];

  const speechOptions = [
    {
      key: "plain",
      label: messages.instagram.quickControlLabels.plain,
      phrase: getPhraseAt(0),
      caption: getCaptionAt(0),
    },
    {
      key: "strong",
      label: messages.instagram.quickControlLabels.strong,
      phrase: highestScorePhrase,
      caption: highestScoreCaption,
    },
    {
      key: "soft",
      label: messages.instagram.quickControlLabels.soft,
      phrase: getPhraseAt(1),
      caption: getCaptionAt(1),
    },
    {
      key: "question",
      label: messages.instagram.quickControlLabels.question,
      phrase: questionPhrase,
      caption: questionCaption,
    },
  ];

  const emotionOptions = [
    {
      key: "comfort",
      label: messages.instagram.quickControlLabels.comfort,
      phrase: getPhraseAt(1),
      caption: getCaptionAt(1),
    },
    {
      key: "thrill",
      label: messages.instagram.quickControlLabels.thrill,
      phrase: highestScorePhrase,
      caption: highestScoreCaption,
    },
    {
      key: "memory",
      label: messages.instagram.quickControlLabels.memory,
      phrase: getPhraseAt(2),
      caption: getCaptionAt(2),
    },
  ];

  const renderSharedPreview = (
    interactive: boolean,
    options?: {
      layout?: PreviewLayout | null;
      style?: ContentOverlayStyle | null;
      captionText?: string | null;
    },
  ) => {
    const layout = options?.layout ?? previewRenderState;
    const previewStyle = options?.style ?? overlayStyle;
    const previewCaptionText = options?.captionText ?? layout.captionText;
    const localRenderConfig = {
      ...buildRenderConfig(previewStyle),
      focusStyle: layout.focus,
      focusArea: layout.focusArea,
    };
    const localSelectedAspectRatio =
      layout.fit === "original" ? null : ((layout.ratio as InstagramOutputAspectRatio | undefined) ?? null);
    const localOutputFormat = localSelectedAspectRatio
      ? resolveInstagramOutputFormat(localSelectedAspectRatio)
      : null;
    const localImageFitMode = layout.fit;
    const isOriginalFitMode = localImageFitMode === "original";
    const localFrameStyle = layout.frameStyle;
    const localFrameTextColor = layout.frameTextColor;
    const localCurrentPreviewImageUrl = layout.imageUrl;
    const localPolaroidFrameText = (previewStyle.frameText ?? "").slice(0, MAX_POLAROID_TEXT_LENGTH).trim();
    const localDateStampText = previewStyle.dateStampValue || resolveTodayDateStamp();
    const localFilmNumberText = (previewStyle.filmNumberValue ?? "FRAME 01")
      .slice(0, MAX_FILM_NUMBER_LENGTH)
      .trim();
    const localIsDateStampVisible = localFrameStyle !== "none" && previewStyle.dateStampEnabled === true;
    const localIsFilmNumberVisible =
      (localFrameStyle === "vintageFilmBorder" || localFrameStyle === "cinemaFilm") &&
      previewStyle.filmNumberEnabled === true;
    const localIsManualFocusStyle = localRenderConfig.focusStyle === "manual";
    const localIsFocusStyle = localRenderConfig.focusStyle !== "none";
    const localIsVintageFilmFrameStyle = localFrameStyle === "vintageFilmBorder";
    const localIsCinemaFilmFrameStyle = localFrameStyle === "cinemaFilm";
    const localIsPolaroidFrameStyle = localFrameStyle === "polaroid";
    const localIsMinimalFrameStyle = localFrameStyle === "minimal";

    if (isOriginalFitMode && localFrameStyle === "none") {
      return (
        <div
          style={{
            ...styles.livePreviewFrame,
            display: "block",
            aspectRatio: undefined,
            minHeight: 0,
            maxHeight: "none",
            padding: 0,
            background: "transparent",
          }}
        >
          <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: "16px" }}>
            <img
              src={localCurrentPreviewImageUrl}
              alt={`${uploaded.originalName}-${interactive ? "live" : "complete"}-preview`}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                filter: resolvePreviewBaseImageFilter(previewStyle.imageFilter),
              }}
            />
            {localIsFocusStyle ? (
              <img
                src={layout.imageUrl}
                alt=""
                aria-hidden="true"
                style={{
                  ...styles.livePreviewPortraitFocusImage,
                  objectFit: "contain",
                  objectPosition: "center top",
                  clipPath: resolvePreviewFocusClipPath(localRenderConfig.focusArea),
                  filter: resolvePreviewFocusImageFilter(previewStyle.imageFilter),
                }}
              />
            ) : null}
            {interactive && localIsManualFocusStyle ? (
              <div
                aria-hidden="true"
                style={styles.manualFocusLayer}
                onPointerDown={handleManualFocusPointerDown}
                onPointerMove={handleManualFocusPointerMove}
                onPointerUp={handleManualFocusPointerUp}
                onPointerCancel={handleManualFocusPointerUp}
              >
                <span style={manualFocusCircleStyle}>
                  <span style={styles.manualFocusDot} />
                </span>
              </div>
            ) : null}
            <div
              style={{
                ...styles.livePreviewFilter,
                background: resolvePreviewFrameBackground(previewStyle.imageFilter),
                opacity: resolvePreviewFilterOpacity(previewStyle.filterStrength),
              }}
            />
            <div
              style={{
                ...styles.livePreviewText,
                fontFamily: resolvePreviewFontFamily(previewStyle.fontFamily),
                fontSize: resolvePreviewFontSize(previewStyle.fontSize),
                fontWeight: resolvePreviewFontWeight(previewStyle.fontWeight),
                color: resolvePreviewTextColor(previewStyle.textColor),
                background: resolvePreviewBackground(previewStyle.background),
                textShadow: resolvePreviewTextShadow(previewStyle.shadow),
                lineHeight:
                  previewStyle.lineHeight === "tight"
                    ? 1.15
                    : previewStyle.lineHeight === "relaxed"
                      ? 1.55
                      : 1.35,
                transform: `translate(${previewStyle.xOffset / 6}px, ${previewStyle.yOffset / 6}px)`,
                justifyContent: resolvePreviewJustify(previewStyle.position),
                ...resolvePreviewAlignment(previewStyle.position),
              }}
            >
              {previewCaptionText}
            </div>
          </div>
        </div>
      );
    }

    return (
        <div
          style={{
            ...styles.livePreviewFrame,
            aspectRatio: localOutputFormat?.cssAspectRatio,
            width: localOutputFormat ? resolvePreviewFrameWidth(localSelectedAspectRatio ?? undefined) : "min(100%, 520px)",
            maxHeight: "none",
            background:
              localImageFitMode === "contain"
              ? resolvePreviewMatBackground()
              : styles.livePreviewFrame.background,
        }}
      >
        <div style={resolvePreviewPhotoWindowStyle(localFrameStyle)}>
          <img
            src={localCurrentPreviewImageUrl}
            alt={`${uploaded.originalName}-${interactive ? "live" : "complete"}-preview`}
            style={{
              ...styles.livePreviewImage,
              width: "100%",
              height: isOriginalFitMode && localFrameStyle === "none" ? "auto" : "100%",
              objectFit: isOriginalFitMode ? "contain" : localImageFitMode,
              objectPosition:
                localImageFitMode === "contain" || isOriginalFitMode ? "center center" : "center center",
              filter: resolvePreviewBaseImageFilter(previewStyle.imageFilter),
            }}
          />
          {localIsFocusStyle ? (
            <img
              src={layout.imageUrl}
              alt=""
              aria-hidden="true"
              style={{
                ...styles.livePreviewPortraitFocusImage,
                objectFit: isOriginalFitMode ? "contain" : localImageFitMode,
                objectPosition:
                  localImageFitMode === "contain" || isOriginalFitMode ? "center center" : "center center",
                clipPath: resolvePreviewFocusClipPath(localRenderConfig.focusArea),
                filter: resolvePreviewFocusImageFilter(previewStyle.imageFilter),
              }}
            />
          ) : null}
          {interactive && localIsManualFocusStyle ? (
          <div
            aria-hidden="true"
            style={styles.manualFocusLayer}
            onPointerDown={handleManualFocusPointerDown}
            onPointerMove={handleManualFocusPointerMove}
            onPointerUp={handleManualFocusPointerUp}
            onPointerCancel={handleManualFocusPointerUp}
          >
            <span style={manualFocusCircleStyle}>
              <span style={styles.manualFocusDot} />
            </span>
          </div>
          ) : null}
          <div
            style={{
              ...styles.livePreviewFilter,
              background: resolvePreviewFrameBackground(previewStyle.imageFilter),
              opacity: resolvePreviewFilterOpacity(previewStyle.filterStrength),
            }}
          />
          <div
            style={{
              ...styles.livePreviewText,
              fontFamily: resolvePreviewFontFamily(previewStyle.fontFamily),
              fontSize: resolvePreviewFontSize(previewStyle.fontSize),
              fontWeight: resolvePreviewFontWeight(previewStyle.fontWeight),
              color: resolvePreviewTextColor(previewStyle.textColor),
              background: resolvePreviewBackground(previewStyle.background),
              textShadow: resolvePreviewTextShadow(previewStyle.shadow),
              lineHeight:
                previewStyle.lineHeight === "tight"
                  ? 1.15
                  : previewStyle.lineHeight === "relaxed"
                    ? 1.55
                    : 1.35,
              transform: `translate(${previewStyle.xOffset / 6}px, ${previewStyle.yOffset / 6}px)`,
              justifyContent: resolvePreviewJustify(previewStyle.position),
              ...resolvePreviewAlignment(previewStyle.position),
            }}
          >
            {previewCaptionText}
          </div>
        </div>
        {localIsVintageFilmFrameStyle ? (
        <div style={styles.livePreviewFilmFrame} aria-hidden="true">
          {localIsDateStampVisible ? (
            <span
              style={{
                ...styles.livePreviewFilmDate,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
              }}
            >
              {localDateStampText}
            </span>
          ) : null}
          {localIsFilmNumberVisible ? (
            <span
              style={{
                ...styles.livePreviewFilmNumber,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
              }}
            >
              {localFilmNumberText}
            </span>
          ) : null}
          <span style={styles.livePreviewFilmMark}>FILM</span>
        </div>
        ) : null}
        {localIsCinemaFilmFrameStyle ? (
        <div style={styles.livePreviewCinemaFilmFrame} aria-hidden="true">
          <span style={styles.livePreviewCinemaFilmSprocketTop} />
          <span style={styles.livePreviewCinemaFilmSprocketBottom} />
          {localIsFilmNumberVisible ? (
            <span
              style={{
                ...styles.livePreviewCinemaFilmNumber,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
                textShadow: resolveFrameTextPreviewShadow(localFrameTextColor),
              }}
            >
              {localFilmNumberText}
            </span>
          ) : null}
          {localIsDateStampVisible ? (
            <span
              style={{
                ...styles.livePreviewCinemaFilmDate,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
              }}
            >
              {localDateStampText}
            </span>
          ) : null}
        </div>
        ) : null}
        {localIsPolaroidFrameStyle ? (
        <div style={styles.livePreviewPolaroidFrame} aria-hidden="true">
          {localIsDateStampVisible ? (
            <span
              style={{
                ...styles.livePreviewPolaroidDate,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
              }}
            >
              {localDateStampText}
            </span>
          ) : null}
          {localPolaroidFrameText ? (
            <span
              style={{
                ...styles.livePreviewPolaroidCaption,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
              }}
            >
              {localPolaroidFrameText}
            </span>
          ) : null}
        </div>
        ) : null}
        {localIsMinimalFrameStyle ? (
        <div style={styles.livePreviewMinimalFrame} aria-hidden="true">
          {localIsDateStampVisible ? (
            <span
              style={{
                ...styles.livePreviewMinimalDate,
                color: resolveFrameTextPreviewColor(localFrameTextColor),
              }}
            >
              {localDateStampText}
            </span>
          ) : null}
        </div>
        ) : null}
      </div>
    );
  };

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <div style={styles.kickerRow}>
          <div style={styles.kicker}>{analysis.mood_category}</div>
          <div style={styles.styleTypeBadge}>{photoStyleTypeLabel}</div>
          <div style={styles.sourceBadge}>{sourceLabel}</div>
          {warningMessage ? <div style={styles.warningBadge}>{warningMessage}</div> : null}
        </div>
        <h2 style={styles.title}>{panelTitle}</h2>
        <p style={styles.description}>{panelDescription}</p>
      </div>

      {activeTab === "review" ? (
        <div style={styles.reviewPanel}>
          <section style={styles.resultStage}>
            <div style={styles.resultStageHeader}>
              <div>
                <div style={styles.resultStageTitle}>{messages.resultSections.analysisResultTitle}</div>
                <p style={styles.resultStageDescription}>
                  {messages.resultSections.analysisResultDescription}
                </p>
              </div>
            </div>

            <section
              style={{
                ...styles.mainContentResultCard,
                ...(isActionLike ? styles.mainContentResultCardAction : null),
                ...(isSoftLike ? styles.mainContentResultCardSoft : null),
                ...(isQuietLike ? styles.mainContentResultCardQuiet : null),
              }}
            >
              <div style={styles.contentSetHeader}>
                <div style={styles.ctaTitleGroup}>
                  <div
                    style={{
                      ...styles.contentSetTitle,
                      ...(isActionLike ? styles.contentSetTitleAction : null),
                    }}
                  >
                    {messages.cta.title}
                  </div>
                  <div
                    style={{
                      ...styles.commerceSalesDescription,
                      ...(isActionLike ? styles.commerceSalesDescriptionAction : null),
                    }}
                  >
                    {messages.cta.description}
                  </div>
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

              {activeRenderedPreviewContentSet ? (
                <div style={styles.mainContentResultGrid}>
                  <div style={styles.contentSetBlock}>
                    <div
                      style={{
                        ...styles.contentSetLabel,
                        ...(isActionLike ? styles.contentSetLabelAction : null),
                      }}
                    >
                      {messages.instagram.contentSetImageLabel}
                    </div>
                    <div
                      style={{
                        ...styles.mainContentResultImage,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        overflow: "hidden",
                      }}
                    >
                      {renderSharedPreview(false)}
                    </div>
                  </div>
                  <div style={styles.contentSetBlock}>
                    <div
                      style={{
                        ...styles.currentSelectionCard,
                        ...(isActionLike ? styles.currentSelectionCardAction : null),
                      }}
                    >
                      <div
                        style={{
                          ...styles.contentSetLabel,
                          ...(isActionLike ? styles.contentSetLabelAction : null),
                        }}
                      >
                        {messages.cta.currentPhrase}
                      </div>
                      <div
                        style={{
                          ...styles.currentSelectionText,
                          ...(isActionLike ? styles.currentSelectionTextAction : null),
                          ...(isSoftLike ? styles.currentSelectionTextSoft : null),
                          ...(isQuietLike ? styles.currentSelectionTextQuiet : null),
                        }}
                      >
                        {selectedOverlayText}
                      </div>
                    </div>
                    <div
                      style={{
                        ...styles.currentSelectionCard,
                        ...(isActionLike ? styles.currentSelectionCardAction : null),
                      }}
                    >
                      <div
                        style={{
                          ...styles.contentSetLabel,
                          ...(isActionLike ? styles.contentSetLabelAction : null),
                        }}
                      >
                        {messages.cta.currentCaption}
                      </div>
                      <div
                        style={{
                          ...styles.currentSelectionSubtext,
                          ...(isActionLike ? styles.currentSelectionSubtextAction : null),
                        }}
                      >
                        {selectedCaptionText}
                      </div>
                    </div>
                    <div style={styles.primaryActionGrid}>
                      <a
                        href={activeRenderedPreviewContentSet.imageDownloadUrl}
                        download={activeRenderedPreviewContentSet.imageFileName}
                        style={{ ...styles.downloadLink, ...styles.primaryActionButton }}
                      >
                        {messages.cta.saveImage}
                      </a>
                      <button
                        type="button"
                        style={styles.primaryActionButton}
                        onClick={() => onCopy(activeRenderedPreviewContentSet.captionText)}
                      >
                        {messages.cta.copyCaption}
                      </button>
                      <button
                        type="button"
                        style={styles.primaryActionButton}
                        onClick={() => onCopy(activeRenderedPreviewContentSet.hashtagText)}
                      >
                        {messages.cta.copyHashtags}
                      </button>
                    </div>
                    <div style={styles.secondaryActionRow}>
                      <button
                        type="button"
                        style={styles.secondaryActionButton}
                        onClick={() => onCopy(activeRenderedPreviewContentSet.combinedText)}
                      >
                        {messages.instagram.contentSetTextCopy}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.mainContentResultGrid}>
                  <div style={styles.contentSetBlock}>
                    <div style={styles.contentSetLabel}>{messages.instagram.contentSetImageLabel}</div>
                    <div
                      style={{
                        ...styles.mainContentResultImage,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        overflow: "hidden",
                      }}
                    >
                      {renderSharedPreview(false)}
                    </div>
                  </div>
                  <div style={styles.contentSetBlock}>
                    <div style={styles.contentSetText}>
                      {isGeneratingContentSet
                        ? messages.instagram.contentSetCreating
                        : messages.instagram.contentSetCreate}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {analysis.phrases[0] ? (
              <section
                style={{
                  ...styles.recommendedPhraseCard,
                  ...(isActionLike ? styles.recommendedPhraseCardAction : null),
                  ...(isSoftLike ? styles.recommendedPhraseCardSoft : null),
                  ...(isQuietLike ? styles.recommendedPhraseCardQuiet : null),
                }}
              >
                <div style={styles.recommendedPhraseHeader}>
                  <div
                    style={{
                      ...styles.contentSetTitle,
                      ...(isActionLike ? styles.contentSetTitleAction : null),
                    }}
                  >
                    {messages.recommendedPhrase}
                  </div>
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
                    {messages.resultSections.phraseChangeButton}
                  </button>
                </div>
                <div
                  style={{
                    ...styles.recommendedPhraseBody,
                    ...(isActionLike ? styles.recommendedPhraseBodyAction : null),
                    ...(isSoftLike ? styles.recommendedPhraseBodySoft : null),
                    ...(isQuietLike ? styles.recommendedPhraseBodyQuiet : null),
                  }}
                >
                  {analysis.phrases[0].phrase}
                </div>
                <div style={styles.recommendedPhraseMeta}>
                  <span
                    style={{
                      ...styles.recommendedPhraseScore,
                      ...(isActionLike ? styles.recommendedPhraseScoreAction : null),
                      ...(isSoftLike ? styles.recommendedPhraseScoreSoft : null),
                    }}
                  >
                    {messages.phraseScore} {analysis.phrases[0].score}
                  </span>
                  <span
                    style={{
                      ...styles.recommendedPhraseReason,
                      ...(isActionLike ? styles.recommendedPhraseReasonAction : null),
                    }}
                  >
                    {analysis.phrases[0].reason}
                  </span>
                </div>
              </section>
            ) : null}
          </section>

          <section style={styles.resultStage}>
            <div style={styles.resultStageHeader}>
              <div>
                <div style={styles.resultStageTitle}>{messages.resultSections.extensionTitle}</div>
                <p style={styles.resultStageDescription}>
                  {messages.resultSections.extensionDescription}
                </p>
              </div>
              <div style={styles.instagramActions}>
                <Link
                  href={deviceType ? `/shooting-guide?deviceType=${deviceType}` : "/shooting-guide"}
                  style={styles.instagramButton}
                >
                  {messages.resultSections.guideButton}
                </Link>
              </div>
            </div>

            <section style={styles.photoTipsSection}>
              <div style={styles.sectionTitle}>{messages.photoTips.title}</div>
              {photoTips.length > 0 ? (
                <>
                  <div style={styles.photoTipGrid}>
                    {photoTips.map((tip, index) => {
                      const isSelected = selectedPhotoTipCategory === tip.category;
                      const hasDetail = [
                        tip.detail,
                        tip.why,
                        tip.when,
                        tip.example,
                        tip.relatedSettingHint,
                        tip.deviceHint,
                      ].some(Boolean);

                      return (
                        <article
                          key={tip.category}
                          style={{
                            ...styles.photoTipCard,
                            ...(index === 0 ? styles.photoTipCardPrimary : null),
                            ...(index === 0 && isActionLike ? styles.photoTipCardPrimaryAction : null),
                            ...(index === 0 && isSoftLike ? styles.photoTipCardPrimarySoft : null),
                            ...(index === 0 && isQuietLike ? styles.photoTipCardPrimaryQuiet : null),
                            ...(isSelected ? styles.photoTipCardActive : null),
                          }}
                        >
                          <div
                            style={{
                              ...styles.photoTipCategory,
                              ...(index === 0 ? styles.photoTipCategoryPrimary : null),
                              ...(index === 0 && isActionLike ? styles.photoTipCategoryPrimaryAction : null),
                              ...(index === 0 && isSoftLike ? styles.photoTipCategoryPrimarySoft : null),
                              ...(index === 0 && isQuietLike ? styles.photoTipCategoryPrimaryQuiet : null),
                            }}
                          >
                            {messages.photoTips.categories[tip.category]}
                          </div>
                          <div
                            style={{
                              ...styles.photoTipTitle,
                              ...(index === 0 ? styles.photoTipTitlePrimary : null),
                              ...(index === 0 && isActionLike ? styles.photoTipTitlePrimaryAction : null),
                              ...(index === 0 && isSoftLike ? styles.photoTipTitlePrimarySoft : null),
                              ...(index === 0 && isQuietLike ? styles.photoTipTitlePrimaryQuiet : null),
                            }}
                          >
                            {tip.title}
                          </div>
                          <p
                            style={{
                              ...styles.photoTipBody,
                              ...(index === 0 ? styles.photoTipBodyPrimary : null),
                              ...(index === 0 && isActionLike ? styles.photoTipBodyPrimaryAction : null),
                              ...(index === 0 && isSoftLike ? styles.photoTipBodyPrimarySoft : null),
                              ...(index === 0 && isQuietLike ? styles.photoTipBodyPrimaryQuiet : null),
                            }}
                          >
                            {tip.short}
                          </p>
                          {hasDetail ? (
                            <button
                              type="button"
                              style={{
                                ...styles.photoTipDetailButton,
                                ...(index === 0 && isActionLike ? styles.photoTipDetailButtonAction : null),
                              }}
                              onClick={() =>
                                setSelectedPhotoTipCategory((current) =>
                                  current === tip.category ? null : tip.category,
                                )
                              }
                            >
                              {isSelected
                                ? messages.photoTips.collapseButton
                                : messages.photoTips.detailButton}
                            </button>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                  {selectedPhotoTip ? (
                    <div style={styles.photoTipDetailPanel}>
                      <div style={styles.photoTipDetailHeader}>
                        <span style={styles.photoTipCategory}>
                          {messages.photoTips.categories[selectedPhotoTip.category]}
                        </span>
                        <strong style={styles.photoTipDetailTitle}>{selectedPhotoTip.title}</strong>
                      </div>
                      <div style={styles.photoTipDetailGrid}>
                        {selectedPhotoTipDetailRows.map((row) => (
                          <div key={row.label} style={styles.photoTipDetailRow}>
                            <span style={styles.photoTipDetailLabel}>{row.label}</span>
                            <span style={styles.photoTipDetailText}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div style={styles.contentSetText}>{messages.photoTips.empty}</div>
              )}
            </section>

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

          </section>
        </div>
      ) : null}

      {activeTab === "complete" ? (
        <div style={styles.tabStack}>
          <section style={styles.contentSetCard}>
            <div style={styles.contentSetHeader}>
              <div>
              </div>
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
              </div>
            </div>

            {hasSavedCompletePreview ? (
              <div style={styles.contentSetGrid}>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetImageLabel}</div>
                  {renderSharedPreview(false, {
                    layout: completePreviewRenderState!,
                    style: completePreviewOverlayStyle!,
                    captionText: completePreviewOverlayText,
                  })}
                  {activeCompletePreviewContentSet ? (
                    <a
                      href={activeCompletePreviewContentSet.imageDownloadUrl}
                      download={activeCompletePreviewContentSet.imageFileName}
                      style={styles.downloadLink}
                    >
                      {messages.instagram.contentSetDownload}
                    </a>
                  ) : null}
                </div>
                <div style={styles.contentSetBlock}>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetCaptionLabel}</div>
                  <pre style={styles.contentSetText}>
                    {completePreviewCaptionText ?? selectedCaptionText}
                  </pre>
                  <div style={styles.contentSetLabel}>{messages.instagram.contentSetHashtagLabel}</div>
                  <pre style={styles.contentSetText}>{hashtagBundle}</pre>
                  {activeCompletePreviewContentSet ? (
                    <button
                      type="button"
                      style={styles.instagramButton}
                      onClick={() => onCopy(activeCompletePreviewContentSet.combinedText)}
                    >
                      {messages.instagram.contentSetTextCopy}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div style={styles.contentSetText}>
                {messages.resultSections.editSaveButton}
              </div>
            )}
          </section>

          <section style={styles.commerceCard}>
            <div style={styles.contentSetHeader}>
              <div style={styles.commerceTitleGroup}>
                <div
                  style={{
                    ...styles.contentSetTitle,
                    ...(isActionLike ? styles.contentSetTitleAction : null),
                  }}
                >
                  {messages.commerce.sectionTitle}
                </div>
                <div style={styles.commerceSalesMessage}>{messages.commerce.salesMessage}</div>
                <div
                  style={{
                    ...styles.commerceSalesDescription,
                    ...(isActionLike ? styles.commerceSalesDescriptionAction : null),
                  }}
                >
                  {messages.commerce.salesDescription}
                </div>
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

        {activeTab === "captions" ? (
          <div style={styles.tabStack}>
            <section style={styles.contentSetCard}>
              <div style={styles.resultStageHeader}>
                <div>
                  <div style={styles.resultStageTitle}>{messages.resultSections.stepEditLabel}</div>
                  <p style={styles.resultStageDescription}>{messages.resultSections.editDescription}</p>
                </div>
                <button
                  type="button"
                  style={styles.editSaveButton}
                  onClick={onSaveEditPreview}
                >
                  {messages.resultSections.editSaveButton}
                </button>
              </div>
              <div style={styles.editWorkspace}>
                <section style={styles.previewColumn}>
                  <section style={styles.livePreviewCard}>
                    {renderSharedPreview(true)}
                  </section>
                </section>

                <section style={styles.controlsColumn}>
                  <div style={styles.editModeTabBar}>
                  <button
                    type="button"
                    style={{
                      ...styles.editModeTabButton,
                      ...(activeEditTab === "photo" ? styles.editModeTabButtonActive : null),
                    }}
                    onClick={() => setActiveEditTab("photo")}
                  >
                    {messages.resultSections.photoEditTab}
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.editModeTabButton,
                      ...(activeEditTab === "text" ? styles.editModeTabButtonActive : null),
                    }}
                    onClick={() => setActiveEditTab("text")}
                  >
                    {messages.resultSections.textEditTab}
                  </button>
                </div>

                {activeEditTab === "photo" ? (
                  <div style={styles.customizeSection}>
                    <section style={styles.editGroupCard}>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.resultSections.toneTitle}</div>
                        <div style={styles.quickOptionRow}>
                          {moodOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(activeMoodOption === option.key ? styles.quickOptionButtonActive : null),
                              }}
                              aria-pressed={activeMoodOption === option.key}
                              onClick={() => {
                                setActiveMoodOption(option.key);
                                onChangeOverlayStyle({ ...overlayStyle, ...option.style });
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.instagram.imageFilterLabel}</div>
                        <div style={styles.quickOptionRow}>
                          {photoStyleOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(activePhotoStyleOption === option.key ? styles.quickOptionButtonActive : null),
                              }}
                              aria-pressed={activePhotoStyleOption === option.key}
                              onClick={() => {
                                setActivePhotoStyleOption(option.key);
                                onChangeOverlayStyle({ ...overlayStyle, ...option.style });
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.instagram.aspectRatioLabel}</div>
                        <div style={styles.quickOptionRow}>
                          {aspectRatioOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(selectedAspectRatio === option.key ? styles.quickOptionButtonActive : null),
                                ...(imageFitMode === "original" ? styles.quickOptionButtonDisabled : null),
                              }}
                              aria-pressed={selectedAspectRatio === option.key}
                              disabled={imageFitMode === "original"}
                              onClick={() => onChangeOverlayStyle({ ...overlayStyle, aspectRatio: option.key })}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.instagram.imageFitModeLabel}</div>
                        <div style={styles.quickOptionRow}>
                          {imageFitModeOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(imageFitMode === option.key ? styles.quickOptionButtonActive : null),
                              }}
                              aria-pressed={imageFitMode === option.key}
                              onClick={() => onChangeOverlayStyle({ ...overlayStyle, imageFitMode: option.key })}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.instagram.cameraStyleLabel}</div>
                        <div style={styles.quickOptionRow}>
                          {cameraStyleOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...((overlayStyle.cameraStyle ?? "none") === option.key
                                  ? styles.quickOptionButtonActive
                                  : null),
                              }}
                              aria-pressed={(overlayStyle.cameraStyle ?? "none") === option.key}
                              onClick={() => onChangeOverlayStyle({ ...overlayStyle, ...option.style })}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.instagram.frameStyleLabel}</div>
                        <div style={styles.quickOptionRow}>
                          {frameStyleOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(frameStyle === option.key ? styles.quickOptionButtonActive : null),
                              }}
                              aria-pressed={frameStyle === option.key}
                              onClick={() => onChangeOverlayStyle({ ...overlayStyle, ...option.style })}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.instagram.focusStyleLabel}</div>
                        <div style={styles.quickOptionRow}>
                          {focusStyleOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(renderConfig.focusStyle === option.key
                                  ? styles.quickOptionButtonActive
                                  : null),
                              }}
                              aria-pressed={renderConfig.focusStyle === option.key}
                              onClick={() => onChangeOverlayStyle({ ...overlayStyle, ...option.style })}
                            >
                              <span>{option.label}</span>
                              <span style={styles.quickOptionDescription}>{option.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {isManualFocusStyle ? (
                        <div style={styles.manualFocusPanel}>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.manualFocusRadiusLabel}</span>
                            <input
                              type="range"
                              min="0.15"
                              max="0.5"
                              step="0.01"
                              value={renderConfig.focusArea.radius}
                              onChange={handleManualFocusRadiusChange}
                              style={styles.range}
                            />
                            <span style={styles.manualFocusRangeHint}>
                              <span>{messages.instagram.manualFocusNarrowLabel}</span>
                              <span>{messages.instagram.manualFocusWideLabel}</span>
                            </span>
                          </label>
                          <p style={styles.manualFocusHelp}>{messages.instagram.manualFocusHelp}</p>
                          {renderConfig.toneStyle === "bw" ? (
                            <label style={styles.manualFocusCheckbox}>
                              <input
                                type="checkbox"
                                checked={overlayStyle.focusColorMode === "color-pop"}
                                onChange={(event) =>
                                  onChangeOverlayStyle({
                                    ...overlayStyle,
                                    focusColorMode: event.target.checked ? "color-pop" : "none",
                                  })
                                }
                              />
                              <span style={styles.manualFocusCheckboxText}>
                                <strong>{messages.instagram.colorFocusLabel}</strong>
                                <small>{messages.instagram.colorFocusHelp}</small>
                              </span>
                            </label>
                          ) : null}
                          <button
                            type="button"
                            style={styles.manualFocusResetButton}
                            onClick={() => updateManualFocusArea(DEFAULT_FOCUS_AREA)}
                          >
                            {messages.instagram.manualFocusResetButton}
                          </button>
                        </div>
                      ) : null}
                    </section>
                  </div>
                ) : null}

                {activeEditTab === "text" ? (
                  <div style={styles.customizeSection}>
                    <section style={styles.editGroupCard}>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.resultSections.styleTitle}</div>
                        <div style={styles.quickOptionRow}>
                          {speechOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(activeSpeechOption === option.key ? styles.quickOptionButtonActive : null),
                              }}
                              aria-pressed={activeSpeechOption === option.key}
                              onClick={() => {
                                setActiveSpeechOption(option.key);
                                onSelectOverlayText(option.phrase);
                                if (option.caption) {
                                  onSelectCaptionText(option.caption);
                                }
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={styles.quickControlGroup}>
                        <div style={styles.contentSetLabel}>{messages.resultSections.themeTitle}</div>
                        <div style={styles.quickOptionRow}>
                          {emotionOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              style={{
                                ...styles.quickOptionButton,
                                ...(activeEmotionOption === option.key ? styles.quickOptionButtonActive : null),
                              }}
                              aria-pressed={activeEmotionOption === option.key}
                              onClick={() => {
                                setActiveEmotionOption(option.key);
                                onSelectOverlayText(option.phrase);
                                if (option.caption) {
                                  onSelectCaptionText(option.caption);
                                }
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  </div>
                ) : null}
              </section>
            </div>

            {activeEditTab === "photo" ? (
              <section style={styles.editBottomPanel}>
                <div style={styles.editBottomGrid}>
                  <section style={styles.editGroupCard}>
                    <div style={styles.presetHeaderRow}>
                      <div style={styles.contentSetLabel}>{messages.instagram.presetSectionTitle}</div>
                    </div>
                    <div style={styles.presetButtons}>
                      {builtInPresets.map((item) => {
                        const isSelectedPreset = isSameOverlayStyle(item.style);

                        return (
                          <button
                            key={item.key}
                            type="button"
                            style={{
                              ...styles.presetCardButton,
                              ...(isSelectedPreset ? styles.presetCardButtonSelected : null),
                            }}
                            aria-pressed={isSelectedPreset}
                            onClick={() => onApplyOverlayPreset(item.key)}
                          >
                            <span style={styles.presetCardTopLine}>
                              <span style={styles.presetCardName}>{item.label}</span>
                              {isSelectedPreset ? (
                                <span style={styles.presetSelectedBadge}>
                                  {messages.instagram.selectedPresetBadge}
                                </span>
                              ) : null}
                            </span>
                            <span style={styles.presetCardDescription}>{item.description}</span>
                            <span style={styles.presetCardMeta}>{resolvePresetBadgeText(item.style)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section style={styles.editGroupCard}>
                    <div style={styles.presetHeaderRow}>
                      <div style={styles.contentSetLabel}>{messages.instagram.comboPresetSectionTitle}</div>
                    </div>
                    <div style={styles.presetButtons}>
                      {comboPresets.map((item) => {
                        const isSelectedPreset = isSamePartialOverlayStyle(item.style);

                        return (
                          <button
                            key={item.key}
                            type="button"
                            style={{
                              ...styles.presetCardButton,
                              ...(isSelectedPreset ? styles.presetCardButtonSelected : null),
                            }}
                            aria-pressed={isSelectedPreset}
                            onClick={() => onChangeOverlayStyle({ ...overlayStyle, ...item.style })}
                          >
                            <span style={styles.presetCardTopLine}>
                              <span style={styles.presetCardName}>{item.label}</span>
                              {isSelectedPreset ? (
                                <span style={styles.presetSelectedBadge}>
                                  {messages.instagram.selectedPresetBadge}
                                </span>
                              ) : null}
                            </span>
                            <span style={styles.presetCardDescription}>{item.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section style={styles.editGroupCard}>
                    <div style={styles.contentSetTitle}>{messages.instagram.frameDetailTitle}</div>
                    <div style={styles.editBottomGridCompact}>
                      {frameStyle === "none" ? (
                        <div style={styles.emptyGuideCard}>{messages.instagram.frameDetailEmpty}</div>
                      ) : null}
                      {isPolaroidFrameStyle ? (
                        <label style={styles.selectField}>
                          <span style={styles.contentSetLabel}>{messages.instagram.frameTextLabel}</span>
                          <input
                            type="text"
                            value={overlayStyle.frameText ?? ""}
                            onChange={handleFrameTextChange}
                            maxLength={MAX_POLAROID_TEXT_LENGTH}
                            placeholder={messages.instagram.frameTextPlaceholder}
                            style={styles.textInput}
                          />
                          <span style={styles.fieldHint}>{messages.instagram.frameTextHelp}</span>
                        </label>
                      ) : null}
                      {frameStyle !== "none" ? (
                        <label style={styles.manualFocusCheckbox}>
                          <input
                            type="checkbox"
                            checked={overlayStyle.dateStampEnabled === true}
                            onChange={(event) => handleDateStampEnabledChange(event.target.checked)}
                          />
                          <span style={styles.manualFocusCheckboxText}>
                            <strong>{messages.instagram.dateStampLabel}</strong>
                            <small>{messages.instagram.dateStampHelp}</small>
                          </span>
                        </label>
                      ) : null}
                      {frameStyle !== "none" ? (
                        <div style={styles.selectField}>
                          <span style={styles.contentSetLabel}>{messages.instagram.frameTextColorLabel}</span>
                          <div style={styles.quickOptionRow}>
                            {frameTextColorOptions.map((option) => (
                              <button
                                key={option.key}
                                type="button"
                                style={{
                                  ...styles.quickOptionButton,
                                  ...(frameTextColor === option.key ? styles.quickOptionButtonActive : null),
                                }}
                                onClick={() => handleFrameTextColorChange(option.key)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {isVintageFilmFrameStyle || isCinemaFilmFrameStyle ? (
                        <>
                          <label style={styles.manualFocusCheckbox}>
                            <input
                              type="checkbox"
                              checked={overlayStyle.filmNumberEnabled === true}
                              onChange={(event) => handleFilmNumberEnabledChange(event.target.checked)}
                            />
                            <span style={styles.manualFocusCheckboxText}>
                              <strong>{messages.instagram.filmNumberLabel}</strong>
                              <small>{messages.instagram.filmNumberHelp}</small>
                            </span>
                          </label>
                          {isFilmNumberVisible ? (
                            <label style={styles.selectField}>
                              <span style={styles.contentSetLabel}>{messages.instagram.filmNumberLabel}</span>
                              <input
                                type="text"
                                value={overlayStyle.filmNumberValue ?? "FRAME 01"}
                                onChange={handleFilmNumberValueChange}
                                maxLength={MAX_FILM_NUMBER_LENGTH}
                                placeholder={messages.instagram.filmNumberPlaceholder}
                                style={styles.textInput}
                              />
                            </label>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </section>

                  <section style={{ ...styles.editGroupCard, ...styles.editGroupCardFullWidth }}>
                    <div style={styles.advancedCustomizeHeader}>
                      <div>
                        <div style={styles.contentSetTitle}>{messages.instagram.advancedCustomizeTitle}</div>
                        <p style={styles.resultStageDescription}>
                          {messages.instagram.advancedCustomizeDescription}
                        </p>
                      </div>
                      <button
                        type="button"
                        style={styles.presetToggleButton}
                        onClick={() => setIsAdvancedCustomizeExpanded((current) => !current)}
                      >
                        {isAdvancedCustomizeExpanded
                          ? messages.instagram.advancedCollapseButton
                          : messages.instagram.advancedExpandButton}
                      </button>
                    </div>
                    {isAdvancedCustomizeExpanded ? (
                      <>
                        <div style={styles.overlayControlGrid}>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.overlayPositionLabel}</span>
                            <select value={overlayStyle.position} onChange={handleStyleChange("position")} style={styles.select}>
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
                            <select value={overlayStyle.fontFamily} onChange={handleStyleChange("fontFamily")} style={styles.select}>
                              <option value="sans">{messages.instagram.options.fonts.sans}</option>
                              <option value="serif">{messages.instagram.options.fonts.serif}</option>
                              <option value="mono">{messages.instagram.options.fonts.mono}</option>
                              <option value="display">{messages.instagram.options.fonts.display}</option>
                              <option value="handwritten">{messages.instagram.options.fonts.handwritten}</option>
                            </select>
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.overlaySizeLabel}</span>
                            <select value={overlayStyle.fontSize} onChange={handleStyleChange("fontSize")} style={styles.select}>
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
                            <select value={overlayStyle.fontWeight} onChange={handleStyleChange("fontWeight")} style={styles.select}>
                              <option value="medium">{messages.instagram.options.weights.medium}</option>
                              <option value="semibold">{messages.instagram.options.weights.semibold}</option>
                              <option value="bold">{messages.instagram.options.weights.bold}</option>
                            </select>
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.overlayColorLabel}</span>
                            <select value={overlayStyle.textColor} onChange={handleStyleChange("textColor")} style={styles.select}>
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
                            <span style={styles.contentSetLabel}>
                              {messages.instagram.imageFilterStrengthLabel} ({overlayStyle.filterStrength})
                            </span>
                            <input type="range" min="0" max="100" step="2" value={overlayStyle.filterStrength} onChange={handleFilterStrengthChange} style={styles.range} />
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.overlayShadowLabel}</span>
                            <select value={overlayStyle.shadow} onChange={handleStyleChange("shadow")} style={styles.select}>
                              <option value="none">{messages.instagram.options.shadows.none}</option>
                              <option value="soft">{messages.instagram.options.shadows.soft}</option>
                              <option value="strong">{messages.instagram.options.shadows.strong}</option>
                            </select>
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.overlayBackgroundLabel}</span>
                            <select value={overlayStyle.background} onChange={handleStyleChange("background")} style={styles.select}>
                              <option value="none">{messages.instagram.options.backgrounds.none}</option>
                              <option value="soft_dark">{messages.instagram.options.backgrounds.softDark}</option>
                              <option value="soft_light">{messages.instagram.options.backgrounds.softLight}</option>
                            </select>
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>{messages.instagram.overlayLineHeightLabel}</span>
                            <select value={overlayStyle.lineHeight} onChange={handleStyleChange("lineHeight")} style={styles.select}>
                              <option value="tight">{messages.instagram.options.lineHeights.tight}</option>
                              <option value="normal">{messages.instagram.options.lineHeights.normal}</option>
                              <option value="relaxed">{messages.instagram.options.lineHeights.relaxed}</option>
                            </select>
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>
                              {messages.instagram.overlayHorizontalLabel} ({overlayStyle.xOffset})
                            </span>
                            <input type="range" min="-220" max="220" step="4" value={overlayStyle.xOffset} onChange={handleOffsetChange("xOffset")} style={styles.range} />
                          </label>
                          <label style={styles.selectField}>
                            <span style={styles.contentSetLabel}>
                              {messages.instagram.overlayVerticalLabel} ({overlayStyle.yOffset})
                            </span>
                            <input type="range" min="-260" max="260" step="4" value={overlayStyle.yOffset} onChange={handleOffsetChange("yOffset")} style={styles.range} />
                          </label>
                        </div>
                        <div style={styles.presetSection}>
                          <div style={styles.contentSetLabel}>{messages.instagram.presetManageTitle}</div>
                          <div style={styles.presetButtons}>
                            <button type="button" style={styles.presetButton} onClick={onExportOverlayPresets}>
                              {messages.instagram.presetExportButton}
                            </button>
                            <button type="button" style={styles.presetButton} onClick={onOpenImportOverlayPresets}>
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
                            <button type="button" style={styles.presetButton} onClick={onSaveOverlayPreset} disabled={!presetName.trim()}>
                              {messages.instagram.presetSaveButton}
                            </button>
                          </div>
                          {savedPresets.length > 0 ? (
                            <div style={styles.savedPresetSection}>
                              <div style={styles.contentSetLabel}>{messages.instagram.presetSavedSectionTitle}</div>
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
                                        <div style={styles.savedPresetPreviewMeta}>{resolvePresetBadgeText(item.style)}</div>
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
                                        <button type="button" style={styles.savedPresetApplyButton} onClick={onConfirmRenameOverlayPreset} disabled={!editingPresetName.trim()}>
                                          {messages.instagram.presetRenameConfirmButton}
                                        </button>
                                        <button type="button" style={styles.savedPresetDeleteButton} onClick={onCancelRenameOverlayPreset}>
                                          {messages.instagram.presetRenameCancelButton}
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button type="button" style={styles.savedPresetDeleteButton} onClick={() => onStartRenameOverlayPreset(item)}>
                                          {messages.instagram.presetRenameButton}
                                        </button>
                                        <button type="button" style={styles.savedPresetDeleteButton} onClick={() => onDeleteOverlayPreset(item.id)}>
                                          {messages.instagram.presetDeleteButton}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </section>
                </div>
              </section>
            ) : (
              <section style={styles.editBottomPanel}>
                <section style={styles.editGroupCard}>
                  <div style={styles.currentTextGrid}>
                    <div style={styles.currentTextCard}>
                      <span style={styles.contentSetLabel}>{messages.instagram.currentOverlayTextTitle}</span>
                      <strong style={styles.currentTextValue}>{selectedOverlayText}</strong>
                    </div>
                    <div style={styles.currentTextCard}>
                      <span style={styles.contentSetLabel}>{messages.instagram.currentCaptionTitle}</span>
                      <p style={styles.currentCaptionValue}>{selectedCaptionText}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={styles.detailListButton}
                    onClick={() => setIsDetailListExpanded((current) => !current)}
                  >
                    {isDetailListExpanded
                      ? messages.instagram.detailListCloseButton
                      : messages.instagram.detailListButton}
                  </button>
                  {isDetailListExpanded ? (
                    <div style={styles.detailAccordionPanel}>
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
                        minHeight="auto"
                      />
                      <AnalysisCaptionList
                        title={messages.captions}
                        items={analysis.captions}
                        copyLabel={messages.copyButton}
                        copiedLabel={messages.copiedButton}
                        emptyLabel={messages.emptyList}
                        copiedItem={copiedItem}
                        onCopy={onCopy}
                        minHeight="auto"
                      />
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
                        minHeight="auto"
                      />
                    </div>
                  ) : null}
                </section>
              </section>
            )}

            <div style={styles.compactCompleteActionRow}>
              <button
                type="button"
                style={styles.compactCompleteButton}
                onClick={() => setActiveTab("complete")}
              >
                {messages.resultSections.stepCompleteLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

    </article>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    padding: "20px",
    borderRadius: "26px",
    background: "rgba(255, 255, 255, 0.84)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 18px 56px rgba(91, 60, 36, 0.1)",
    backdropFilter: "blur(16px)",
    display: "grid",
    gap: "14px",
  },
  header: {
    display: "grid",
    gap: "6px",
  },
  kickerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
  },
  kicker: {
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "11px",
    fontWeight: 700,
  },
  sourceBadge: {
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: "999px",
    background: "rgba(104, 139, 214, 0.12)",
    color: "#365e9c",
    fontSize: "11px",
    fontWeight: 700,
  },
  styleTypeBadge: {
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: "999px",
    background: "rgba(79, 111, 75, 0.12)",
    color: "#436246",
    fontSize: "11px",
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
    lineHeight: 1.45,
    fontSize: "13px",
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
    padding: "4px 8px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "10px",
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
    border: "1px solid rgba(64, 47, 30, 0.12)",
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
    border: "1px solid #1f1b17",
  },
  reviewPanel: {
    display: "grid",
    gap: "18px",
    minHeight: "420px",
  },
  resultStage: {
    display: "grid",
    gap: "14px",
    padding: "18px",
    borderRadius: "26px",
    background: "rgba(255, 255, 255, 0.54)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  resultStageHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultStageTitle: {
    color: "#231d18",
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  resultStageDescription: {
    margin: "4px 0 0",
    color: "#6b6055",
    fontSize: "13px",
    lineHeight: 1.6,
    maxWidth: "620px",
  },
  selectionOverviewGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    alignItems: "stretch",
  },
  selectionGroupCard: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
    padding: "14px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 14px 34px rgba(91, 60, 36, 0.08)",
  },
  selectionGroupHeader: {
    display: "grid",
    gap: "2px",
  },
  selectionOverviewCard: {
    display: "grid",
    gap: "10px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  selectionShortcutGrid: {
    display: "grid",
    gap: "8px",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  },
  selectionShortcutButton: {
    display: "grid",
    gap: "7px",
    alignContent: "center",
    minHeight: "86px",
    borderRadius: "20px",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    padding: "14px",
    background: "rgba(255,255,255,0.82)",
    color: "#231d18",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
  },
  selectionInfoCard: {
    display: "grid",
    gap: "4px",
    alignContent: "center",
    minHeight: "56px",
    borderRadius: "16px",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    padding: "10px",
    background: "rgba(255,255,255,0.76)",
    color: "#231d18",
    fontSize: "12px",
    fontWeight: 800,
    textAlign: "left",
  },
  selectionShortcutTitle: {
    display: "block",
    color: "#231d18",
    fontSize: "13px",
    fontWeight: 850,
  },
  selectionShortcutDescription: {
    display: "block",
    color: "#6b6055",
    fontSize: "11px",
    fontWeight: 650,
    lineHeight: 1.35,
  },
  photoTipsSection: {
    display: "grid",
    gap: "12px",
  },
  photoTipGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  photoTipCard: {
    display: "grid",
    alignContent: "start",
    gap: "8px",
    minHeight: "156px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.76)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 14px 36px rgba(91, 60, 36, 0.08)",
  },
  photoTipCardActive: {
    border: "1px solid rgba(31, 27, 23, 0.34)",
    boxShadow: "0 20px 42px rgba(91, 60, 36, 0.16)",
    transform: "translateY(-1px)",
  },
  photoTipCardPrimary: {
    minHeight: "152px",
    background: "linear-gradient(145deg, rgba(255, 252, 246, 0.96), rgba(246, 237, 224, 0.9))",
    border: "1px solid rgba(180, 102, 63, 0.18)",
    boxShadow: "0 18px 40px rgba(91, 60, 36, 0.12)",
  },
  photoTipCardPrimaryAction: {
    background:
      "linear-gradient(145deg, rgba(48, 30, 24, 0.96), rgba(118, 54, 31, 0.88))",
    border: "1px solid rgba(255, 180, 120, 0.24)",
    boxShadow: "0 20px 42px rgba(58, 24, 18, 0.18)",
  },
  photoTipCardPrimarySoft: {
    background:
      "linear-gradient(145deg, rgba(250, 249, 241, 0.98), rgba(232, 241, 224, 0.9))",
    border: "1px solid rgba(111, 143, 104, 0.16)",
    boxShadow: "0 18px 38px rgba(83, 112, 78, 0.1)",
  },
  photoTipCardPrimaryQuiet: {
    background:
      "linear-gradient(145deg, rgba(248, 246, 241, 0.98), rgba(232, 228, 220, 0.92))",
    border: "1px solid rgba(92, 80, 69, 0.14)",
    boxShadow: "0 18px 38px rgba(72, 61, 52, 0.1)",
  },
  photoTipCategory: {
    width: "fit-content",
    borderRadius: "999px",
    padding: "5px 9px",
    background: "rgba(31, 27, 23, 0.08)",
    color: "#5f3428",
    fontSize: "11px",
    fontWeight: 800,
  },
  photoTipCategoryPrimary: {
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
  },
  photoTipCategoryPrimaryAction: {
    background: "rgba(255, 245, 230, 0.14)",
    color: "#ffd9b6",
  },
  photoTipCategoryPrimarySoft: {
    background: "rgba(100, 132, 91, 0.12)",
    color: "#53744c",
  },
  photoTipCategoryPrimaryQuiet: {
    background: "rgba(76, 66, 58, 0.1)",
    color: "#5d5045",
  },
  photoTipTitle: {
    color: "#231d18",
    fontSize: "15px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },
  photoTipTitlePrimary: {
    color: "#2f2923",
    fontSize: "16px",
  },
  photoTipTitlePrimaryAction: {
    color: "#fff7ed",
    fontSize: "17px",
  },
  photoTipTitlePrimarySoft: {
    color: "#324f31",
  },
  photoTipTitlePrimaryQuiet: {
    color: "#2d2925",
  },
  photoTipBody: {
    margin: 0,
    color: "#5f564d",
    fontSize: "13px",
    lineHeight: 1.58,
  },
  photoTipBodyPrimary: {
    color: "#5f4f43",
    fontWeight: 600,
  },
  photoTipBodyPrimaryAction: {
    color: "rgba(255, 247, 237, 0.86)",
  },
  photoTipBodyPrimarySoft: {
    color: "#4f6949",
  },
  photoTipBodyPrimaryQuiet: {
    color: "#5b5148",
  },
  photoTipDetailButton: {
    justifySelf: "start",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    borderRadius: "999px",
    padding: "6px 10px",
    background: "rgba(255, 250, 244, 0.78)",
    color: "#4f392d",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },
  photoTipDetailButtonAction: {
    border: "1px solid rgba(255, 245, 230, 0.2)",
    background: "rgba(255, 245, 230, 0.12)",
    color: "#fff1df",
  },
  photoTipDetailPanel: {
    display: "grid",
    gap: "12px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(255, 250, 244, 0.9)",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    boxShadow: "0 18px 42px rgba(91, 60, 36, 0.1)",
  },
  photoTipDetailHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  photoTipDetailTitle: {
    color: "#231d18",
    fontSize: "16px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },
  photoTipDetailGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  },
  photoTipDetailRow: {
    display: "grid",
    gap: "3px",
  },
  photoTipDetailLabel: {
    color: "#8a5a38",
    fontSize: "10px",
    fontWeight: 900,
  },
  photoTipDetailText: {
    color: "#4f443c",
    fontSize: "12px",
    lineHeight: 1.45,
    fontWeight: 650,
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
  mainContentResultCardAction: {
    background:
      "linear-gradient(145deg, rgba(21,16,16,0.98), rgba(61,18,18,0.96), rgba(146,49,24,0.88))",
    border: "1px solid rgba(255, 126, 78, 0.22)",
    boxShadow: "0 28px 52px rgba(67, 18, 18, 0.28)",
  },
  mainContentResultCardSoft: {
    background:
      "linear-gradient(145deg, rgba(250,248,242,0.98), rgba(240,236,221,0.95), rgba(229,239,226,0.92))",
    border: "1px solid rgba(110, 145, 117, 0.14)",
  },
  mainContentResultCardQuiet: {
    background:
      "linear-gradient(145deg, rgba(250,249,247,0.98), rgba(236,233,227,0.95), rgba(223,222,227,0.9))",
    border: "1px solid rgba(56, 53, 48, 0.08)",
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
    objectFit: "contain",
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
  recommendedPhraseCardAction: {
    background:
      "linear-gradient(140deg, rgba(20,15,15,0.98), rgba(76,22,20,0.94), rgba(179,67,28,0.84))",
    border: "1px solid rgba(255, 149, 88, 0.28)",
    boxShadow: "0 20px 44px rgba(63, 18, 18, 0.28)",
  },
  recommendedPhraseCardSoft: {
    background:
      "linear-gradient(140deg, rgba(250,248,242,0.98), rgba(241,238,225,0.94), rgba(229,238,225,0.88))",
    border: "1px solid rgba(116, 150, 118, 0.15)",
  },
  recommendedPhraseCardQuiet: {
    background:
      "linear-gradient(140deg, rgba(249,248,245,0.98), rgba(236,233,228,0.93), rgba(229,228,235,0.88))",
    border: "1px solid rgba(70, 67, 62, 0.08)",
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
  recommendedPhraseBodyAction: {
    fontSize: "38px",
    lineHeight: 1.08,
    letterSpacing: "-0.05em",
    color: "#fff5ec",
    textShadow: "0 12px 28px rgba(0,0,0,0.28)",
  },
  recommendedPhraseBodySoft: {
    color: "#3b4f39",
  },
  recommendedPhraseBodyQuiet: {
    color: "#2d2925",
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
  recommendedPhraseScoreAction: {
    background: "rgba(255, 240, 226, 0.14)",
    color: "#ffd4b0",
  },
  recommendedPhraseScoreSoft: {
    background: "rgba(117, 150, 117, 0.12)",
    color: "#587254",
  },
  recommendedPhraseReason: {
    color: "#6b6055",
    fontSize: "13px",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  recommendedPhraseReasonAction: {
    color: "rgba(255, 235, 221, 0.78)",
  },
  tabStack: {
    display: "grid",
    gap: "10px",
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
    gap: "10px",
    padding: "12px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  editWorkspace: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-start",
  },
  previewColumn: {
    flex: "0 1 420px",
    minWidth: "280px",
    display: "grid",
  },
  controlsColumn: {
    flex: "1 1 360px",
    minWidth: "300px",
    display: "grid",
    gap: "10px",
    alignContent: "start",
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
  contentSetTitleAction: {
    color: "#fff3e6",
  },
  contentSetGrid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  contentSetReadyRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "16px",
    background: "rgba(93, 123, 86, 0.12)",
    border: "1px solid rgba(93, 123, 86, 0.18)",
  },
  contentSetReadyBadge: {
    borderRadius: "999px",
    padding: "5px 8px",
    background: "#3f573c",
    color: "#fffaf4",
    fontSize: "11px",
    fontWeight: 850,
  },
  contentSetReadyText: {
    color: "#344430",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1.45,
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
  currentSelectionCardAction: {
    background: "rgba(255, 247, 241, 0.96)",
    border: "1px solid rgba(255, 170, 102, 0.26)",
    boxShadow: "0 12px 28px rgba(24, 10, 8, 0.16)",
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
  currentSelectionTextAction: {
    fontSize: "24px",
    lineHeight: 1.22,
    letterSpacing: "-0.04em",
    color: "#3f170f",
  },
  currentSelectionTextSoft: {
    color: "#3f573c",
  },
  currentSelectionTextQuiet: {
    color: "#2b2823",
  },
  currentSelectionSubtext: {
    color: "#3e362f",
    fontSize: "13px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  currentSelectionSubtextAction: {
    color: "#4a2317",
    fontWeight: 600,
  },
  contentSetLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#7b6f63",
  },
  contentSetLabelAction: {
    color: "#8f4725",
  },
  livePreviewCard: {
    display: "grid",
    gap: "10px",
    padding: "10px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  livePreviewFrame: {
    position: "relative",
    display: "flex",
    width: "min(100%, 520px)",
    aspectRatio: "4 / 5",
    minHeight: "260px",
    maxHeight: "min(58vh, 420px)",
    padding: "14px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#211a16",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  livePreviewPhotoWindow: {
    position: "absolute",
    overflow: "hidden",
    background: "#f7f4ee",
  },
  editModeTabBar: {
    display: "grid",
    gap: "6px",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    padding: "6px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  editSaveBar: {
    display: "flex",
    justifyContent: "flex-end",
  },
  editSaveButton: {
    minHeight: "40px",
    padding: "0 18px",
    borderRadius: "999px",
    border: "1px solid #1f1b17",
    background: "#1f1b17",
    color: "#fff8f1",
    fontSize: "13px",
    fontWeight: 850,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(31, 27, 23, 0.14)",
  },
  editModeTabButton: {
    minHeight: "34px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    background: "rgba(255,255,255,0.82)",
    color: "#4c443c",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },
  editModeTabButtonActive: {
    border: "1px solid #1f1b17",
    background: "#1f1b17",
    color: "#fffaf4",
  },
  compactCompleteActionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-2px",
  },
  compactCompleteButton: {
    minHeight: "32px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "6px 10px",
    background: "rgba(255,255,255,0.86)",
    color: "#1f1b17",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  quickControlGroup: {
    display: "grid",
    gap: "8px",
  },
  quickOptionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  quickOptionButton: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    minHeight: "34px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "7px 10px",
    background: "rgba(255,255,255,0.88)",
    color: "#4c443c",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  quickOptionDescription: {
    maxWidth: "160px",
    fontSize: "10px",
    lineHeight: 1.25,
    fontWeight: 650,
    opacity: 0.78,
  },
  quickOptionButtonActive: {
    border: "1px solid #1f1b17",
    background: "#1f1b17",
    color: "#fffaf4",
  },
  quickOptionButtonDisabled: {
    opacity: 0.42,
    cursor: "not-allowed",
  },
  hiddenPanel: {
    display: "none",
  },
  livePreviewImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    transition: "filter 160ms ease",
  },
  livePreviewPortraitFocusImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
    filter: "saturate(1.08) contrast(1.04)",
    pointerEvents: "none",
  },
  manualFocusLayer: {
    position: "absolute",
    inset: 0,
    zIndex: 5,
    cursor: "crosshair",
    touchAction: "none",
  },
  manualFocusCircle: {
    position: "absolute",
    display: "grid",
    placeItems: "center",
    aspectRatio: "1 / 1",
    borderRadius: "999px",
    border: "2px solid rgba(255,250,244,0.92)",
    boxShadow:
      "0 0 0 1px rgba(19,16,13,0.34), 0 0 0 999px rgba(19,16,13,0.15)",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  manualFocusDot: {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    background: "rgba(255,250,244,0.95)",
    border: "1px solid rgba(19,16,13,0.52)",
    boxShadow: "0 2px 8px rgba(19,16,13,0.32)",
  },
  livePreviewFilter: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    transition: "opacity 140ms ease, background 140ms ease",
  },
  manualFocusPanel: {
    display: "grid",
    gap: "8px",
    padding: "10px",
    borderRadius: "16px",
    background: "rgba(255,250,244,0.78)",
    border: "1px solid rgba(64, 47, 30, 0.1)",
  },
  manualFocusRangeHint: {
    display: "flex",
    justifyContent: "space-between",
    color: "#7a6a5c",
    fontSize: "11px",
    fontWeight: 800,
  },
  manualFocusHelp: {
    margin: 0,
    color: "#5f5145",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1.55,
  },
  manualFocusCheckbox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minHeight: "42px",
    padding: "8px 10px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(64, 47, 30, 0.1)",
    color: "#2b241e",
    fontSize: "12px",
    fontWeight: 800,
  },
  manualFocusCheckboxText: {
    display: "grid",
    gap: "2px",
  },
  manualFocusResetButton: {
    justifySelf: "start",
    minHeight: "34px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "7px 12px",
    background: "rgba(31,27,23,0.9)",
    color: "#fffaf4",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },
  livePreviewFilmFrame: {
    position: "absolute",
    inset: "12px",
    zIndex: 3,
    border: "10px solid rgba(255, 245, 224, 0.92)",
    borderRadius: "12px",
    boxShadow: "inset 0 0 0 1px rgba(33, 23, 18, 0.22), 0 12px 28px rgba(19,16,13,0.2)",
    pointerEvents: "none",
  },
  livePreviewFilmDate: {
    position: "absolute",
    left: "18px",
    bottom: "14px",
    color: "rgba(255,245,224,0.94)",
    fontFamily: "'Courier New', monospace",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textShadow: "0 2px 10px rgba(19,16,13,0.46)",
  },
  livePreviewFilmMark: {
    position: "absolute",
    right: "18px",
    bottom: "14px",
    color: "rgba(255,245,224,0.8)",
    fontFamily: "'Courier New', monospace",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.14em",
    textShadow: "0 2px 10px rgba(19,16,13,0.46)",
  },
  livePreviewFilmNumber: {
    position: "absolute",
    left: "50%",
    bottom: "14px",
    transform: "translateX(-50%)",
    color: "rgba(255,245,224,0.74)",
    fontFamily: "'Courier New', monospace",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textShadow: "0 2px 10px rgba(19,16,13,0.46)",
  },
  livePreviewCinemaFilmFrame: {
    position: "absolute",
    inset: 0,
    zIndex: 6,
    pointerEvents: "none",
  },
  livePreviewCinemaFilmSprocketTop: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    height: "7%",
    background:
      "radial-gradient(ellipse at 14px 50%, rgba(255,250,244,0.92) 0 3px, rgba(12,10,9,0.98) 4px) 0 0 / 28px 100% repeat-x, linear-gradient(180deg, rgba(20,18,15,0.98), rgba(12,10,9,0.94))",
    boxShadow: "0 8px 16px rgba(16,14,12,0.18)",
  },
  livePreviewCinemaFilmSprocketBottom: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "0",
    height: "7%",
    background:
      "radial-gradient(ellipse at 14px 50%, rgba(255,250,244,0.92) 0 3px, rgba(12,10,9,0.98) 4px) 0 0 / 28px 100% repeat-x, linear-gradient(0deg, rgba(20,18,15,0.98), rgba(12,10,9,0.94))",
    boxShadow: "0 -8px 16px rgba(16,14,12,0.18)",
  },
  livePreviewCinemaFilmNumber: {
    position: "absolute",
    left: "18px",
    bottom: "8px",
    zIndex: 1,
    color: "rgba(255,255,255,0.88)",
    fontFamily: "'Courier New', monospace",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textShadow: "0 1px 2px rgba(0,0,0,0.45)",
  },
  livePreviewCinemaFilmDate: {
    position: "absolute",
    right: "20px",
    bottom: "8px",
    zIndex: 1,
    color: "rgba(255,250,244,0.74)",
    fontFamily: "'Courier New', monospace",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },
  livePreviewPolaroidFrame: {
    position: "absolute",
    inset: "10px 10px 16px",
    zIndex: 6,
    border: "10px solid rgba(255, 252, 247, 0.96)",
    borderBottomWidth: "64px",
    borderRadius: "10px",
    boxShadow: "0 16px 26px rgba(19,16,13,0.18), inset 0 0 0 1px rgba(96,74,58,0.08)",
    pointerEvents: "none",
  },
  livePreviewPolaroidCaption: {
    position: "absolute",
    left: "50%",
    bottom: "-30px",
    transform: "translateX(-50%)",
    color: "rgba(91, 73, 59, 0.8)",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.02em",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  livePreviewPolaroidDate: {
    position: "absolute",
    left: "50%",
    bottom: "-48px",
    transform: "translateX(-50%)",
    color: "rgba(132,110,93,0.72)",
    fontFamily: "Arial, sans-serif",
    fontSize: "8px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  livePreviewMinimalFrame: {
    position: "absolute",
    inset: "18px",
    zIndex: 6,
    border: "1.5px solid rgba(255,250,244,0.82)",
    borderRadius: "18px",
    boxShadow: "inset 0 0 0 1px rgba(19,16,13,0.08)",
    pointerEvents: "none",
  },
  livePreviewMinimalDate: {
    position: "absolute",
    right: "14px",
    bottom: "10px",
    color: "rgba(255,250,244,0.72)",
    fontFamily: "Arial, sans-serif",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  livePreviewText: {
    position: "relative",
    zIndex: 4,
    maxWidth: "78%",
    width: "fit-content",
    borderRadius: "14px",
    padding: "8px 12px",
    color: "#fffaf4",
    transition:
      "transform 140ms ease, color 140ms ease, background 140ms ease, font-size 140ms ease",
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
  },
  customizeSection: {
    display: "grid",
    gap: "10px",
    padding: "12px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.64)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  editSplitGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  editGroupCard: {
    display: "grid",
    alignContent: "start",
    gap: "10px",
    minWidth: 0,
    width: "100%",
    padding: "10px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  editBottomPanel: {
    display: "grid",
    gap: "12px",
    marginTop: "2px",
  },
  editBottomGrid: {
    width: "100%",
    display: "grid",
    gap: "18px",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    alignItems: "stretch",
  },
  editBottomGridCompact: {
    display: "grid",
    gap: "10px",
  },
  editGroupCardFullWidth: {
    gridColumn: "1 / -1",
  },
  textChangeGrid: {
    display: "grid",
    gap: "12px",
  },
  currentTextGrid: {
    display: "grid",
    gap: "8px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  currentTextCard: {
    display: "grid",
    gap: "6px",
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  currentTextValue: {
    color: "#231d18",
    fontSize: "17px",
    lineHeight: 1.35,
    letterSpacing: "-0.02em",
  },
  currentCaptionValue: {
    margin: 0,
    color: "#4c443c",
    fontSize: "13px",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  detailListButton: {
    justifySelf: "start",
    minHeight: "34px",
    borderRadius: "999px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "7px 12px",
    background: "rgba(255,255,255,0.9)",
    color: "#1f1b17",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  detailAccordionPanel: {
    display: "grid",
    gap: "12px",
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
  },
  advancedCustomizeHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentSetImage: {
    width: "100%",
    maxHeight: "clamp(260px, 34vw, 360px)",
    objectFit: "contain",
    display: "block",
    borderRadius: "18px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "#f7f2ec",
  },
  contentSetPreviewFrame: {
    position: "relative",
    display: "flex",
    width: "min(100%, 420px)",
    aspectRatio: "4 / 5",
    minHeight: "260px",
    maxHeight: "min(58vh, 420px)",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#211a16",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 18px 40px rgba(91, 60, 36, 0.1)",
  },
  contentSetPreviewImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center center",
    display: "block",
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
  commerceSalesDescriptionAction: {
    color: "rgba(255, 232, 214, 0.88)",
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
    display: "grid",
    gap: "8px",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
    gap: "4px",
    minWidth: "136px",
    padding: "9px 10px",
    borderRadius: "15px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    textAlign: "left",
    cursor: "pointer",
  },
  presetCardButtonSelected: {
    background: "rgba(255, 247, 239, 0.98)",
    border: "1px solid rgba(144, 77, 38, 0.42)",
    boxShadow: "0 12px 26px rgba(91, 60, 36, 0.14)",
  },
  presetCardTopLine: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  presetCardName: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#2f2923",
  },
  presetSelectedBadge: {
    flexShrink: 0,
    borderRadius: "999px",
    padding: "4px 7px",
    background: "#2f2923",
    color: "#fffaf4",
    fontSize: "10px",
    fontWeight: 800,
  },
  presetCardDescription: {
    fontSize: "11px",
    fontWeight: 750,
    color: "#4f4439",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  presetCardMeta: {
    fontSize: "10px",
    color: "#7b6f63",
    lineHeight: 1.3,
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
  textInput: {
    width: "100%",
    borderRadius: "14px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.92)",
    color: "#1f1b17",
    fontSize: "13px",
  },
  fieldHint: {
    color: "#7a6a5c",
    fontSize: "11px",
    fontWeight: 700,
  },
  emptyGuideCard: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.8)",
    border: "1px dashed rgba(64, 47, 30, 0.14)",
    color: "#746557",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  range: {
    width: "100%",
    accentColor: "#8f4725",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "grid",
    placeItems: "center",
    padding: "20px",
    background: "rgba(31, 27, 23, 0.42)",
    backdropFilter: "blur(8px)",
  },
  modalCard: {
    display: "grid",
    gap: "14px",
    width: "min(920px, 100%)",
    maxHeight: "86vh",
    overflowY: "auto",
    padding: "18px",
    borderRadius: "24px",
    background: "rgba(255, 250, 244, 0.96)",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    boxShadow: "0 24px 80px rgba(31, 27, 23, 0.26)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    position: "sticky",
    top: 0,
    zIndex: 1,
    padding: "4px 0 8px",
    background: "rgba(255, 250, 244, 0.96)",
  },
};
