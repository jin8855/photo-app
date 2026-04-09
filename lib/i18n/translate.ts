import { getMessages, type Locale } from "@/lib/i18n/messages";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type MessageNode = JsonValue;

function resolveMessage(node: MessageNode, segments: string[]): string {
  if (segments.length === 0) {
    if (typeof node !== "string") {
      throw new Error("Message key does not resolve to a string.");
    }

    return node;
  }

  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    throw new Error("Message key path is invalid.");
  }

  const [head, ...tail] = segments;
  const nextNode = node[head];

  if (!nextNode) {
    throw new Error(`Missing message segment: ${head}`);
  }

  return resolveMessage(nextNode, tail);
}

export function createTranslator(locale: Locale = "ko") {
  const messages = getMessages(locale);

  return function translate(key: string): string {
    return resolveMessage(messages as unknown as MessageNode, key.split("."));
  };
}
