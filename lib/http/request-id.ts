export function createRequestId(): string {
  return crypto.randomUUID();
}

export function withRequestId(response: Response, requestId: string): Response {
  response.headers.set("x-request-id", requestId);
  return response;
}
