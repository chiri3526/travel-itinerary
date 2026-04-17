const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;

const SAFE_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[a-z0-9+/=]+$/i;
const SAFE_REMOTE_IMAGE_PATTERN = /^https:\/\/.+/i;

export const COVER_IMAGE_MAX_BYTES = MAX_COVER_IMAGE_BYTES;

export const isSafeCoverImageValue = (value?: string | null): boolean => {
  if (!value) {
    return false;
  }

  if (value.length > 7_000_000) {
    return false;
  }

  return SAFE_DATA_URL_PATTERN.test(value) || SAFE_REMOTE_IMAGE_PATTERN.test(value);
};

export const getSafeCoverImage = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  return isSafeCoverImageValue(value) ? value : undefined;
};

export const validateCoverImageFile = (file: File): string | null => {
  const mimeType = file.type.toLowerCase();

  if (!mimeType.startsWith('image/')) {
    return '画像ファイルを選んでください。';
  }

  if (mimeType === 'image/svg+xml') {
    return 'SVGは利用できません。PNGかJPEGを選んでください。';
  }

  if (file.size > MAX_COVER_IMAGE_BYTES) {
    return '画像は5MB以内で選んでください。';
  }

  return null;
};
