type OpenAiTextPayload = {
  phrases: string[];
  captions: string[];
};

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

export function validateOpenAiTextPayload(value: unknown): OpenAiTextPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Partial<OpenAiTextPayload>;

  if (!isNonEmptyStringArray(payload.phrases) || !isNonEmptyStringArray(payload.captions)) {
    return null;
  }

  if (payload.phrases.length !== 10 || payload.captions.length !== 5) {
    return null;
  }

  return {
    phrases: payload.phrases.map((item) => item.trim()),
    captions: payload.captions.map((item) => item.trim()),
  };
}
