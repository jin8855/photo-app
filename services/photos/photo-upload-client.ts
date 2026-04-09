type UploadSuccess = {
  ok: true;
  data: {
    id: number;
    originalName: string;
    filePath: string;
    createdAt: string;
    previewUrl: string;
  };
};

type UploadFailure = {
  ok: false;
  errorCode: "noFile" | "invalidType" | "uploadFailed" | "saveFailed" | "unknown";
};

export async function uploadPhoto(file: File): Promise<UploadSuccess | UploadFailure> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch("/api/photos/upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as UploadSuccess | UploadFailure;
  return payload;
}
