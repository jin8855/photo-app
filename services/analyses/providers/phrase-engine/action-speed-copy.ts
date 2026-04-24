import koMessages from "@/i18n/messages/ko.json";

type ActionSpeedCopyMessages = {
  keywords: string[];
  phraseSets: {
    empathy: string[];
    comfort: string[];
    question: string[];
  };
  phrasePatterns: {
    starts: string[];
    ends: string[];
  };
  captionSets: {
    hook: string[];
    body: string[];
    close: string[];
  };
};

export function getActionSpeedCopyMessages(): ActionSpeedCopyMessages {
  return (koMessages as { analysisStyleStrategies: { actionSpeed: ActionSpeedCopyMessages } })
    .analysisStyleStrategies.actionSpeed;
}
