type DeletePhotoSuccess = {
  ok: true;
};

type DeletePhotoFailure = {
  ok: false;
  errorCode: "photoNotFound" | "deleteFailed" | "unknown";
};

export async function deletePhoto(photoId: number): Promise<DeletePhotoSuccess | DeletePhotoFailure> {
  const response = await fetch(`/api/photos/${photoId}`, {
    method: "DELETE",
  });

  const payload = (await response.json()) as DeletePhotoSuccess | DeletePhotoFailure;
  return payload;
}
