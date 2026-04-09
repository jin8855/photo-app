import koMessages from "@/i18n/messages/ko.json";
import type { MockPreset } from "@/services/analyses/providers/analysis-preset";

type PromptInput = {
  originalName: string;
  preset: MockPreset;
};

type AnalysisPromptMessages = {
  system: string[];
  sections: {
    inputInfo: string;
    phraseRules: string;
    captionRules: string;
    styleExamples: string;
    captionExamples: string;
    outputSchema: string;
  };
  labels: {
    fileNameHint: string;
    moodCategory: string;
    sceneType: string;
    emotionGuide: string;
  };
  phraseRules: string[];
  captionRules: string[];
  styleExamples: string[];
  captionExamples: string[];
  outputSchema: string;
  emotionGuides: Record<string, string>;
};

function getAnalysisPromptMessages(): AnalysisPromptMessages {
  return koMessages.analysisPrompt as AnalysisPromptMessages;
}

function formatBullet(value: string): string {
  return `- ${value}`;
}

function resolveEmotionGuide(
  sceneType: string,
  messages: AnalysisPromptMessages["emotionGuides"],
): string {
  return messages[sceneType] ?? messages.default;
}

export function buildOpenAiTextGenerationPrompt({ originalName, preset }: PromptInput): string {
  const messages = getAnalysisPromptMessages();

  return [
    ...messages.system,
    "",
    messages.sections.inputInfo,
    formatBullet(`${messages.labels.fileNameHint}: ${originalName}`),
    formatBullet(`${messages.labels.moodCategory}: ${preset.mood_category}`),
    formatBullet(`${messages.labels.sceneType}: ${preset.scene_type}`),
    formatBullet(
      `${messages.labels.emotionGuide}: ${resolveEmotionGuide(
        preset.scene_type,
        messages.emotionGuides,
      )}`,
    ),
    "",
    messages.sections.phraseRules,
    ...messages.phraseRules.map(formatBullet),
    "",
    messages.sections.captionRules,
    ...messages.captionRules.map(formatBullet),
    "",
    messages.sections.styleExamples,
    ...messages.styleExamples.map(formatBullet),
    "",
    messages.sections.captionExamples,
    ...messages.captionExamples.map(formatBullet),
    "",
    messages.sections.outputSchema,
    messages.outputSchema,
  ].join("\n");
}
