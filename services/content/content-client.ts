import type { CreateInstagramContentSetInput, GeneratedContentSet } from "@/lib/types/content";

type GenerateContentSetSuccess = {
  ok: true;
  data: {
    imageSvg: string;
    imageFileName: string;
    overlayText: string;
    captionText: string;
    hashtagText: string;
    combinedText: string;
    overlayStyle: CreateInstagramContentSetInput["overlayStyle"];
    renderVariant: number;
  };
};

type GenerateContentSetFailure = {
  ok: false;
  errorCode: "contentSetFailed" | "contentSetSaveFailed" | "unknown";
};

function createObjectUrlFromSvg(svgMarkup: string): string {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  return URL.createObjectURL(blob);
}

export async function generateInstagramContentSet(input: {
  analysisId: number;
  imageUrl: string;
} & CreateInstagramContentSetInput): Promise<GenerateContentSetFailure | { ok: true; data: GeneratedContentSet }> {
  const response = await fetch("/api/content-set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as GenerateContentSetSuccess | GenerateContentSetFailure;

  if (!payload.ok) {
    return payload;
  }

  return {
    ok: true,
    data: {
      ...payload.data,
      imageDownloadUrl: createObjectUrlFromSvg(payload.data.imageSvg),
    },
  };
}
