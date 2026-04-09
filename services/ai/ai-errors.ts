export const AI_ERROR_CODES = {
  openAiEmptyResponse: "openaiEmptyResponse",
  openAiInvalidJsonResponse: "openaiInvalidJsonResponse",
  openAiInvalidPayload: "openaiInvalidPayload",
  openAiRequestFailed: "openaiRequestFailed",
} as const;

export type AiErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];

export class AiClientError extends Error {
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AiClientError";
    this.code = code;
  }
}
