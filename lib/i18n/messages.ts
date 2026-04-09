import koMessages from "@/i18n/messages/ko.json";

export const defaultLocale = "ko";

const messageCatalog = {
  ko: koMessages,
} as const;

export type Locale = keyof typeof messageCatalog;
export type Messages = (typeof messageCatalog)[Locale];

export function getMessages(locale: Locale = defaultLocale): Messages {
  return messageCatalog[locale];
}
