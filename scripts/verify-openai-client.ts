import { getOpenAiConfig, hasOpenAiApiKey } from "@/resources/config/openai";
import { OpenAiResponsesClient } from "@/services/ai/openai-responses-client";

const liveMode = process.argv.includes("--live");

function assertValidNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }
}

async function main(): Promise<void> {
  const config = getOpenAiConfig();

  assertValidNumber(config.timeoutMs, "OPENAI_TIMEOUT_MS");
  assertValidNumber(config.maxRetries, "OPENAI_MAX_RETRIES");

  const client = new OpenAiResponsesClient();
  const clientReady = client instanceof OpenAiResponsesClient;
  let liveCheck: { attempted: boolean; success: boolean; model?: string; latencyMs?: number } = {
    attempted: false,
    success: false,
  };

  if (liveMode && hasOpenAiApiKey()) {
    const result = await client.createJsonResponse({
      systemPrompt: "Return only valid JSON.",
      userPrompt:
        'Return {"phrases":["a","b","c","d","e","f","g","h","i","j"],"captions":["a\\nb\\nc","d\\ne\\nf","g\\nh\\ni","j\\nk\\nl","m\\nn\\no"]}.',
      schemaName: "verify_openai_payload",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          phrases: {
            type: "array",
            minItems: 10,
            maxItems: 10,
            items: { type: "string" },
          },
          captions: {
            type: "array",
            minItems: 5,
            maxItems: 5,
            items: { type: "string" },
          },
        },
        required: ["phrases", "captions"],
      },
    });

    liveCheck = {
      attempted: true,
      success: true,
      model: result.meta.model,
      latencyMs: result.meta.latencyMs,
    };
  } else if (liveMode) {
    liveCheck = {
      attempted: true,
      success: false,
    };
  }

  const summary = {
    hasApiKey: hasOpenAiApiKey(),
    model: config.model,
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    maxRetries: config.maxRetries,
    clientReady,
    mode: hasOpenAiApiKey() ? "openai-ready" : "mock-fallback-ready",
    liveCheck,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
