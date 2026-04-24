export type ShootingSituation =
  | "rain"
  | "snow"
  | "cloudy"
  | "sunny"
  | "sunset"
  | "backlight"
  | "night"
  | "concert"
  | "indoor"
  | "natural_light";

export type ShootingSubject =
  | "person"
  | "food"
  | "landscape"
  | "sea"
  | "mountain"
  | "flower"
  | "car"
  | "product"
  | "pet"
  | "street";

export type ShootingDistance = "close_up" | "medium" | "wide";

export type ShootingGuideDeviceType =
  | "galaxy_s25_ultra"
  | "galaxy_s26_ultra"
  | "generic_smartphone";

export type ShootingContext = {
  situation: ShootingSituation;
  subject: ShootingSubject;
  distance: ShootingDistance;
  deviceType: ShootingGuideDeviceType;
};

export type ShootingExampleImage = {
  src: string;
  label: string;
  alt?: string;
  fallbackSrc?: string;
};

export type ShootingTip = {
  tipTitle: string;
  tipShort: string;
  tipDetail: string;
  tipWhy: string;
  tipWhen: string;
  tipExample: string;
  approxWhiteBalance?: string;
  approxAperture?: string;
  approxShutterSpeed?: string;
  approxISO?: string;
  approxExposureComp?: string;
  focusHint?: string;
  lensHint?: string;
  phoneCameraHint?: string;
  exampleImages?: ShootingExampleImage[];
  recommendedCopyDirection?: string[];
};

export type ShootingTipMapping = {
  situation: ShootingSituation | "default";
  subject: ShootingSubject | "default";
  distance: ShootingDistance | "default";
  tips: ShootingTip[];
};

export type ShootingGuideEntry = {
  context: ShootingContext;
  tips: ShootingTip[];
};

export type ShootingGuideOption<TValue extends string> = {
  value: TValue;
  label: string;
};
