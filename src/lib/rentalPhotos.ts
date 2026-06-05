/** 招租可选照片：压缩后以 data URL 存入 localStorage */

export const MAX_RENTAL_PHOTOS = 4;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_EDGE_PX = 1200;
const JPEG_QUALITY = 0.82;

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("单张图片请小于 8MB");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法处理图片");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (dataUrl.length > 900_000) {
    throw new Error("图片压缩后仍过大，请换一张更小的图");
  }
  return dataUrl;
}

export function isRentalPhotosList(v: unknown): v is string[] | undefined {
  if (v === undefined) return true;
  if (!Array.isArray(v)) return false;
  if (v.length > MAX_RENTAL_PHOTOS) return false;
  return v.every(
    (x) => typeof x === "string" && x.startsWith("data:image/")
  );
}
