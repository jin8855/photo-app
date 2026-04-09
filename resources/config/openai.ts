export function getOpenAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? "gpt-5.2",
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS ?? "15000"),
    maxRetries: Number(process.env.OPENAI_MAX_RETRIES ?? "2"),
  };
}

export function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
}
