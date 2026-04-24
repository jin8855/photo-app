export type ContentOverlayPosition =
  | "top_left"
  | "top_center"
  | "top_right"
  | "left_center"
  | "center"
  | "right_center"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right";

export type ContentOverlayFontFamily = "sans" | "serif" | "mono" | "display" | "handwritten";

export type ContentOverlayFontSize =
  | "xxsmall"
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge";

export type ContentOverlayFontWeight = "medium" | "semibold" | "bold";

export type ContentOverlayTextColor =
  | "light"
  | "warm"
  | "dark"
  | "cream"
  | "blush"
  | "sage"
  | "sky";

export type ContentImageFilter =
  | "none"
  | "black_and_white"
  | "soft_warm"
  | "moody_night"
  | "fog_calm"
  | "nature_fresh"
  | "travel_film"
  | "film_frame"
  | "portrait_focus"
  | "dawn_blue"
  | "vintage_cream"
  | "rose_mood"
  | "sunset_orange";

export type ContentOverlayShadow = "none" | "soft" | "strong";

export type ContentOverlayBackground = "none" | "soft_dark" | "soft_light";

export type ContentOverlayLineHeight = "tight" | "normal" | "relaxed";

export type CameraStyle = "none" | "natural" | "warmPortrait" | "crisp" | "classic";
export type ContentFrameStyle = "none" | "vintageFilmBorder" | "cinemaFilm" | "polaroid" | "minimal";
export type ContentFrameTextColor = "white" | "black" | "brown" | "cream";
export type ContentImageFitMode = "original" | "contain" | "cover";

export type ContentFocusStyle = "none" | "center" | "manual";
export type ContentFocusColorMode = "none" | "color-pop";

export type ContentFocusArea = {
  centerX: number;
  centerY: number;
  radius: number;
};

export type InstagramOutputAspectRatio = "1:1" | "4:5" | "9:16";

export type ContentOverlayStyle = {
  position: ContentOverlayPosition;
  fontFamily: ContentOverlayFontFamily;
  fontSize: ContentOverlayFontSize;
  fontWeight: ContentOverlayFontWeight;
  textColor: ContentOverlayTextColor;
  imageFilter: ContentImageFilter;
  filterStrength: number;
  xOffset: number;
  yOffset: number;
  shadow: ContentOverlayShadow;
  background: ContentOverlayBackground;
  lineHeight: ContentOverlayLineHeight;
  cameraStyle: CameraStyle;
  aspectRatio?: InstagramOutputAspectRatio;
  imageFitMode?: ContentImageFitMode;
  focusStyle?: ContentFocusStyle;
  focusColorMode?: ContentFocusColorMode;
  focusArea?: ContentFocusArea;
  frameStyle?: ContentFrameStyle;
  frameText?: string;
  frameTextColor?: ContentFrameTextColor;
  dateStampEnabled?: boolean;
  dateStampValue?: string;
  filmNumberEnabled?: boolean;
  filmNumberValue?: string;
};

export type GeneratedContentSet = {
  imageDownloadUrl: string;
  imageFileName: string;
  overlayText: string;
  captionText: string;
  hashtagText: string;
  combinedText: string;
  overlayStyle: ContentOverlayStyle;
  renderVariant: number;
};

export type GeneratedContentSetPayload = Omit<GeneratedContentSet, "imageDownloadUrl"> & {
  imageSvg: string;
};

export type CreateInstagramContentSetInput = {
  originalName: string;
  overlayText: string;
  captionText: string;
  hashtagText: string;
  moodCategory: string;
  overlayStyle: ContentOverlayStyle;
  renderVariant?: number;
};

export type SavedOverlayPreset = {
  id: string;
  name: string;
  style: ContentOverlayStyle;
};
