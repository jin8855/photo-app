"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { AnalysisResultPanel } from "@/features/upload/components/analysis-result-panel";
import type { AnalysisMessages } from "@/features/upload/i18n/upload-page-messages";
import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";
import type {
  ContentOverlayStyle,
  GeneratedContentSet,
  GeneratedContentSetPayload,
  SavedOverlayPreset,
} from "@/lib/types/content";
import type { UploadedPhotoRecord } from "@/lib/types/database";
import { generateCommerceContent } from "@/services/commerce/commerce-client";
import {
  deleteOverlayPreset,
  exportOverlayPresets,
  importOverlayPresets,
  listSavedOverlayPresets,
  renameOverlayPreset,
  saveOverlayPreset,
} from "@/services/content/content-preset-storage";
import { generateInstagramContentSet } from "@/services/content/content-client";

const overlayPresets = {
  emotional_card: {
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
  bright_intro: {
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
  deep_focus: {
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
  dawn_blue: {
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
  vintage_cream: {
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
  sunset_glow: {
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
} satisfies Record<string, ContentOverlayStyle>;

const defaultOverlayStyle: ContentOverlayStyle = {
  position: "bottom_left",
  fontFamily: "sans",
  fontSize: "medium",
  fontWeight: "bold",
  textColor: "light",
  imageFilter: "none",
  filterStrength: 40,
  xOffset: 0,
  yOffset: 0,
  shadow: "soft",
  background: "none",
  lineHeight: "normal",
};

type AnalysisResultViewerProps = {
  uploaded: UploadedPhotoRecord;
  analysis: PhotoAnalysisResult;
  initialContentSetPayload?: GeneratedContentSetPayload | null;
  initialCommerceContent?: GeneratedCommerceContent | null;
  onFeedback?: (message: string) => void;
  messages: AnalysisMessages;
};

function createObjectUrlFromSvg(svgMarkup: string): string {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  return URL.createObjectURL(blob);
}

function hydrateGeneratedContentSet(
  payload: GeneratedContentSetPayload,
): GeneratedContentSet {
  return {
    ...payload,
    imageDownloadUrl: createObjectUrlFromSvg(payload.imageSvg),
  };
}

export function AnalysisResultViewer({
  uploaded,
  analysis,
  initialContentSetPayload = null,
  initialCommerceContent = null,
  onFeedback,
  messages,
}: AnalysisResultViewerProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [contentSet, setContentSet] = useState<GeneratedContentSet | null>(() =>
    initialContentSetPayload ? hydrateGeneratedContentSet(initialContentSetPayload) : null,
  );
  const [isGeneratingContentSet, setIsGeneratingContentSet] = useState(false);
  const [commerceContent, setCommerceContent] = useState<GeneratedCommerceContent | null>(
    initialCommerceContent,
  );
  const [contentVariant, setContentVariant] = useState(0);
  const [selectedOverlayText, setSelectedOverlayText] = useState(
    analysis.phrases[0]?.phrase ?? analysis.short_review,
  );
  const [selectedCaptionText, setSelectedCaptionText] = useState(analysis.captions[0]?.caption ?? "");
  const [overlayStyle, setOverlayStyle] = useState<ContentOverlayStyle>(defaultOverlayStyle);
  const [presetName, setPresetName] = useState("");
  const [savedPresets, setSavedPresets] = useState<SavedOverlayPreset[]>([]);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const hashtagBundle = useMemo(() => analysis.hashtags.join(" "), [analysis.hashtags]);

  const getContentSetErrorMessage = (errorCode: string) => {
    if (errorCode === "contentSetSaveFailed") {
      return messages.contentSetSaveFailed;
    }

    if (errorCode === "contentSetFailed") {
      return messages.contentSetFailed;
    }

    return messages.copyError;
  };

  const getCommerceErrorMessage = (errorCode: string) => {
    if (errorCode === "commerceSaveFailed") {
      return messages.commerceSaveFailed;
    }

    if (errorCode === "commerceFailed") {
      return messages.commerceFailed;
    }

    return messages.copyError;
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(value);
      onFeedback?.(messages.copySuccess);
    } catch {
      onFeedback?.(messages.copyError);
    }
  };

  const generateContentSet = async (notify = true, variantOverride?: number) => {
    try {
      setIsGeneratingContentSet(true);
      const nextVariant = variantOverride ?? contentVariant;

      const nextContentSet = await generateInstagramContentSet({
        analysisId: analysis.id,
        imageUrl: uploaded.previewUrl,
        originalName: uploaded.originalName,
        overlayText: selectedOverlayText,
        captionText: selectedCaptionText,
        hashtagText: hashtagBundle,
        moodCategory: analysis.mood_category,
        overlayStyle,
        renderVariant: nextVariant,
      });

      if (!nextContentSet.ok) {
        onFeedback?.(getContentSetErrorMessage(nextContentSet.errorCode));
        return;
      }

      setContentSet((current) => {
        if (current) {
          URL.revokeObjectURL(current.imageDownloadUrl);
        }

        return nextContentSet.data;
      });
      setContentVariant(nextVariant);

      if (notify) {
        onFeedback?.(messages.contentSetSuccess);
      }
    } catch {
      if (notify) {
        onFeedback?.(messages.contentSetFailed);
      }
    } finally {
      setIsGeneratingContentSet(false);
    }
  };

  const handleGenerateContentSet = async () => {
    await generateContentSet(true, contentVariant + 1);
  };

  const handleGenerateCommerceContent = () => {
    void (async () => {
      const nextContent = await generateCommerceContent(analysis.id, analysis);

      if (!nextContent.ok) {
        onFeedback?.(getCommerceErrorMessage(nextContent.errorCode));
        return;
      }

      setCommerceContent(nextContent.data);
      onFeedback?.(messages.commerceSuccess);
    })();
  };

  const handleCopyCommerceContent = () => {
    if (!commerceContent) {
      return;
    }

    const nextText = [
      commerceContent.productTitle,
      commerceContent.oneLineIntro,
      commerceContent.productDescription,
      commerceContent.usageGuide,
      commerceContent.recommendedFor,
      commerceContent.keywords.length > 0 ? commerceContent.keywords.join(", ") : null,
    ]
      .filter((item): item is string => Boolean(item))
      .join("\n\n");

    if (!nextText) {
      return;
    }

    void handleCopy(nextText);
  };

  const handleApplyRecommendedPhrase = () => {
    const nextPhrase = analysis.phrases[0]?.phrase;

    if (!nextPhrase) {
      return;
    }

    setSelectedOverlayText(nextPhrase);
    onFeedback?.(messages.applySuccess);
  };

  const handleApplyOverlayPreset = (presetKey: keyof typeof overlayPresets) => {
    setOverlayStyle(overlayPresets[presetKey]);
  };

  const handleSaveOverlayPreset = () => {
    const nextItems = saveOverlayPreset(presetName, overlayStyle);
    setSavedPresets(nextItems);
    setPresetName("");
  };

  const handleDeleteOverlayPreset = (id: string) => {
    setSavedPresets(deleteOverlayPreset(id));
    if (editingPresetId === id) {
      setEditingPresetId(null);
      setEditingPresetName("");
    }
  };

  const handleApplySavedOverlayPreset = (style: ContentOverlayStyle) => {
    setOverlayStyle(style);
  };

  const handleStartRenameOverlayPreset = (item: SavedOverlayPreset) => {
    setEditingPresetId(item.id);
    setEditingPresetName(item.name);
  };

  const handleCancelRenameOverlayPreset = () => {
    setEditingPresetId(null);
    setEditingPresetName("");
  };

  const handleConfirmRenameOverlayPreset = () => {
    if (!editingPresetId) {
      return;
    }

    const nextItems = renameOverlayPreset(editingPresetId, editingPresetName);
    setSavedPresets(nextItems);
    setEditingPresetId(null);
    setEditingPresetName("");
  };

  const handleExportOverlayPresets = () => {
    const blob = new Blob([exportOverlayPresets()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "photo-caption-overlay-presets.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportOverlayPresets = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    setSavedPresets(importOverlayPresets(text));
    event.target.value = "";
  };

  useEffect(() => {
    setSavedPresets(listSavedOverlayPresets());
  }, []);

  useEffect(() => {
    return () => {
      if (contentSet) {
        URL.revokeObjectURL(contentSet.imageDownloadUrl);
      }
    };
  }, [contentSet]);

  useEffect(() => {
    setSelectedOverlayText(analysis.phrases[0]?.phrase ?? analysis.short_review);
    setSelectedCaptionText(analysis.captions[0]?.caption ?? "");
    setOverlayStyle(defaultOverlayStyle);
    setContentVariant(0);
    setContentSet((current) => {
      if (current) {
        URL.revokeObjectURL(current.imageDownloadUrl);
      }

      return initialContentSetPayload ? hydrateGeneratedContentSet(initialContentSetPayload) : null;
    });
    setCommerceContent(initialCommerceContent);
  }, [analysis, initialContentSetPayload, initialCommerceContent]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void generateContentSet(false);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [selectedOverlayText, selectedCaptionText, hashtagBundle, overlayStyle, uploaded.previewUrl]);

  return (
    <AnalysisResultPanel
      uploaded={uploaded}
      analysis={analysis}
      copiedItem={copiedItem}
      onCopy={handleCopy}
      onGenerateContentSet={handleGenerateContentSet}
      isGeneratingContentSet={isGeneratingContentSet}
      contentSet={contentSet}
      commerceContent={commerceContent}
      onGenerateCommerceContent={handleGenerateCommerceContent}
      onCopyCommerceContent={handleCopyCommerceContent}
      onApplyRecommendedPhrase={handleApplyRecommendedPhrase}
      selectedOverlayText={selectedOverlayText}
      selectedCaptionText={selectedCaptionText}
      overlayStyle={overlayStyle}
      onApplyOverlayPreset={handleApplyOverlayPreset}
      presetName={presetName}
      savedPresets={savedPresets}
      editingPresetId={editingPresetId}
      editingPresetName={editingPresetName}
      onPresetNameChange={setPresetName}
      onEditingPresetNameChange={setEditingPresetName}
      onSaveOverlayPreset={handleSaveOverlayPreset}
      importInputRef={importInputRef}
      onDeleteOverlayPreset={handleDeleteOverlayPreset}
      onApplySavedOverlayPreset={handleApplySavedOverlayPreset}
      onStartRenameOverlayPreset={handleStartRenameOverlayPreset}
      onCancelRenameOverlayPreset={handleCancelRenameOverlayPreset}
      onConfirmRenameOverlayPreset={handleConfirmRenameOverlayPreset}
      onExportOverlayPresets={handleExportOverlayPresets}
      onOpenImportOverlayPresets={() => importInputRef.current?.click()}
      onImportOverlayPresets={handleImportOverlayPresets}
      onSelectOverlayText={setSelectedOverlayText}
      onSelectCaptionText={setSelectedCaptionText}
      onChangeOverlayStyle={setOverlayStyle}
      messages={messages}
    />
  );
}
