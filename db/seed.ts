import path from "node:path";
import { fileURLToPath } from "node:url";

import { initializeDatabase } from "@/db/init";
import koMessages from "@/i18n/messages/ko.json";
import { closeDatabase } from "@/lib/db/client";
import { createLocalDatabaseServices } from "@/services/db/local-database-service";

type MockPreset = {
  file_hints: string[];
  scene_type: string;
  mood_category: string;
  short_review: string;
  long_review: string;
  recommended_text_position: string;
  wallpaper_score: number;
  social_score: number;
  commercial_score: number;
  phrase_sets: {
    empathy: string[];
    comfort: string[];
    question: string[];
  };
  caption_sets: {
    emotion: string[];
    expansion: string[];
    pause: string[];
  };
  hashtags: string[];
};

function buildSeedPhrases(preset: MockPreset): string[] {
  return [
    ...preset.phrase_sets.empathy.slice(0, 4),
    ...preset.phrase_sets.comfort.slice(0, 3),
    ...preset.phrase_sets.question.slice(0, 3),
  ];
}

function buildSeedCaptions(preset: MockPreset): string[] {
  return Array.from({ length: 5 }, (_, index) => {
    return [
      preset.caption_sets.emotion[index % preset.caption_sets.emotion.length],
      preset.caption_sets.expansion[index % preset.caption_sets.expansion.length],
      preset.caption_sets.pause[index % preset.caption_sets.pause.length],
    ].join("\n");
  });
}

function getSeedPreset(): MockPreset {
  const presets = (koMessages.analysisMock as { presets: MockPreset[] }).presets;
  return presets[0];
}

export async function seedDatabase(): Promise<void> {
  initializeDatabase();

  const { photoService, analysisService } = createLocalDatabaseServices();
  const preset = getSeedPreset();
  const existingSample = (await photoService
    .listPhotos())
    .find((photo) => photo.originalName === "sample-sunrise.jpg");

  if (existingSample) {
    return;
  }

  const samplePhoto = await photoService.createPhoto({
    originalName: "sample-sunrise.jpg",
    filePath: path.join("data", "uploads", "sample-sunrise.jpg"),
  });

  await analysisService.createAnalysis({
    photoId: samplePhoto.id,
    sceneType: preset.scene_type,
    moodCategory: preset.mood_category,
    shortReview: preset.short_review,
    longReview: preset.long_review,
    recommendedTextPosition: preset.recommended_text_position,
    wallpaperScore: preset.wallpaper_score,
    socialScore: preset.social_score,
    commercialScore: preset.commercial_score,
    phrasesJson: JSON.stringify(buildSeedPhrases(preset)),
    captionsJson: JSON.stringify(buildSeedCaptions(preset)),
    hashtagsJson: JSON.stringify(preset.hashtags),
    generationSource: "mock",
    generationWarning: null,
  });
}

const currentFilePath = fileURLToPath(import.meta.url);
const executedFromCli =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath);

if (executedFromCli) {
  seedDatabase()
    .then(() => {
      closeDatabase();
      console.log("Sample local seed completed.");
    })
    .catch((error) => {
      closeDatabase();
      console.error(error);
      process.exitCode = 1;
    });
}
