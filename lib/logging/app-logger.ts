import { isAppError } from "@/lib/errors/app-error";

type LogDetails = Record<string, unknown>;

function toErrorPayload(error: unknown) {
  if (isAppError(error)) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      cause:
        error.cause instanceof Error
          ? {
              name: error.cause.name,
              message: error.cause.message,
            }
          : error.cause,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: error,
  };
}

export function logServerError(event: string, error: unknown, details: LogDetails = {}): void {
  console.error("[server-error]", {
    event,
    details,
    error: toErrorPayload(error),
    timestamp: new Date().toISOString(),
  });
}

export function logServerWarn(event: string, details: LogDetails = {}): void {
  console.warn("[server-warn]", {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
}
