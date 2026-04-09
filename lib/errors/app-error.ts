export type AppErrorCode =
  | "noFile"
  | "invalidType"
  | "uploadFailed"
  | "saveFailed"
  | "photoNotFound"
  | "analyzeFailed"
  | "analysisSaveFailed"
  | "contentSetFailed"
  | "contentSetSaveFailed"
  | "commerceFailed"
  | "commerceSaveFailed"
  | "deleteFailed"
  | "unknown";

type AppErrorOptions = {
  code: AppErrorCode;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;
  override readonly cause?: unknown;

  constructor({ code, message, status = 500, details, cause }: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.cause = cause;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(
  error: unknown,
  fallback: Omit<AppErrorOptions, "cause">,
): AppError {
  if (isAppError(error)) {
    return error;
  }

  return new AppError({
    ...fallback,
    cause: error,
  });
}
