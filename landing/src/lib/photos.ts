// Règles et compression des photos d'inspiration (côté navigateur).
// Vercel refuse les envois de plus de 4,5 Mo : on réduit donc chaque photo
// (1600 px max, JPEG) avant l'envoi. Une photo de téléphone de 5 Mo passe à ~300 Ko.

export const PHOTOS_MAX = 3;
export const PHOTO_MAX_OCTETS = 1.5 * 1024 * 1024; // après compression
export const PHOTOS_TOTAL_MAX_OCTETS = 4 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const COTE_MAX = 1600;

export async function compresserPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // fond blanc pour les PNG transparents
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    const nom = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nom, { type: "image/jpeg" });
  } catch {
    // Format non lisible par ce navigateur (ex. HEIC hors Safari) : on garde l'original
    return file;
  }
}
