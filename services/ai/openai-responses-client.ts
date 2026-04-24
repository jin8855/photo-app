import OpenAI from "openai";
import type {
  ResponseCreateParamsNonStreaming,
  ResponseInputContent,
  ResponseInputMessageContentList,
} from "openai/resources/responses/responses";

import { getOpenAiConfig } from "@/resources/config/openai";
import { AI_ERROR_CODES, AiClientError } from "@/services/ai/ai-errors";
import { validateOpenAiTextPayload } from "@/services/ai/openai-response-validators";

type CreateJsonResponseInput = {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schema: Record<string, unknown>;
};

type ResponseImageInput = {
  kind: "url" | "data";
  value: string;
};

type CreateStructuredResponseInput<TPayload> = CreateJsonResponseInput & {
  image?: ResponseImageInput;
  validate: (value: unknown) => TPayload | null;
};

type JsonResponseResult<TPayload> = {
  payload: TPayload;
  meta: {
    model: string;
    latencyMs: number;
    retryCount: number;
  };
};

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("name" in error && error.name === "AbortError") {
    return true;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status === 408 || error.status === 409 || error.status === 429 || error.status >= 500;
  }

  return false;
}

export class OpenAiResponsesClient {
  private readonly config = getOpenAiConfig();
  private readonly client = new OpenAI({
    apiKey: this.config.apiKey,
    baseURL: this.config.baseUrl,
  });

  async createJsonResponse(
    input: CreateJsonResponseInput,
  ): Promise<JsonResponseResult<{ phrases: string[]; captions: string[] }>> {
    return this.createStructuredResponse({
      ...input,
      validate: validateOpenAiTextPayload,
    });
  }

  async createStructuredResponse<TPayload>(
    input: CreateStructuredResponseInput<TPayload>,
  ): Promise<JsonResponseResult<TPayload>> {
    const userContent: ResponseInputMessageContentList = [
      { type: "input_text", text: input.userPrompt },
      ...(input.image
        ? [
            {
              type: "input_image" as const,
              image_url: input.image.value,
              detail: "auto" as const,
            } satisfies ResponseInputContent,
          ]
        : []),
    ];

    const requestBody = {
      model: this.config.model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: input.systemPrompt }],
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: input.schemaName,
          schema: input.schema,
        },
      },
    } satisfies ResponseCreateParamsNonStreaming;

    const response = await this.executeWithRetry(requestBody);
    const outputText =
      typeof response.response.output_text === "string" ? response.response.output_text.trim() : "";

    if (!outputText) {
      throw new AiClientError(AI_ERROR_CODES.openAiEmptyResponse);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new AiClientError(AI_ERROR_CODES.openAiInvalidJsonResponse);
    }

    const payload = input.validate(parsed);

    if (!payload) {
      throw new AiClientError(AI_ERROR_CODES.openAiInvalidPayload);
    }

    return {
      payload,
      meta: {
        model: this.config.model,
        latencyMs: response.latencyMs,
        retryCount: response.retryCount,
      },
    };
  }

  private async executeWithRetry(requestBody: ResponseCreateParamsNonStreaming) {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        const startedAt = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

        try {
          const response = await this.client.responses.create(requestBody, {
            signal: controller.signal,
          });

          return {
            response,
            latencyMs: Date.now() - startedAt,
            retryCount: attempt,
          };
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        lastError = error;

        if (attempt >= this.config.maxRetries || !isRetryableError(error)) {
          throw error;
        }

        await delay((attempt + 1) * 400);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new AiClientError(AI_ERROR_CODES.openAiRequestFailed);
  }
}
