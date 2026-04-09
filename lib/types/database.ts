export type TimestampString = string;

export type PhotoRecord = {
  id: number;
  originalName: string;
  filePath: string;
  createdAt: TimestampString;
};

export type AnalysisRecord = {
  id: number;
  photoId: number;
  sceneType: string;
  moodCategory: string;
  shortReview: string;
  longReview: string;
  recommendedTextPosition: string;
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
  phrasesJson: string;
  captionsJson: string;
  hashtagsJson: string;
  generationSource: string;
  generationWarning: string | null;
  contentSetJson: string | null;
  commerceContentJson: string | null;
  createdAt: TimestampString;
};

export type CreatePhotoInput = {
  originalName: string;
  filePath: string;
};

export type CreateAnalysisInput = {
  photoId: number;
  sceneType: string;
  moodCategory: string;
  shortReview: string;
  longReview: string;
  recommendedTextPosition: string;
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
  phrasesJson: string;
  captionsJson: string;
  hashtagsJson: string;
  generationSource: string;
  generationWarning: string | null;
};

export type UploadedPhotoRecord = PhotoRecord & {
  previewUrl: string;
};
