// Phone screenshots are often several megabytes, which exceeds the serverless
// request limit once base64-encoded. Downscale to a size that still keeps chat
// text legible and re-encode as JPEG.
const MAX_DIMENSION = 1600;
const MAX_DATA_URL_LENGTH = 3_500_000;

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Could not read the image.'));
  image.src = src;
});

const readAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error || new Error('Could not read the file.'));
  reader.onloadend = () => resolve(reader.result as string);
  reader.readAsDataURL(file);
});

export const prepareImageForUpload = async (file: File): Promise<string> => {
  const original = await readAsDataUrl(file);
  const image = await loadImage(original);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  if (scale === 1 && original.length <= MAX_DATA_URL_LENGTH && /^data:image\/(jpeg|png|webp)/.test(original)) {
    return original;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext('2d');
  if (!context) return original;
  // JPEG has no alpha channel; paint a white background for transparent PNGs.
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
  }
  throw new Error('Image is too large.');
};
