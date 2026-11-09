// Prépare les photos pour le web : redimensionne, convertit en WebP (poids réduit)
// et place le résultat dans public/images. Next.js sert ensuite automatiquement
// des versions AVIF/WebP à la bonne taille, avec chargement différé.
//
// Utilisation : déposer les originaux dans photos-source/ puis `npm run images`.
//   - donut-*.png  : donuts détourés (fond transparent) -> posés sur un fond rose
//   - hero-*.jpg   : photo du haut de page
//   - autres       : photos de galerie, simplement redimensionnées
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "photos-source";
const OUT = "public/images";
const PINK_BG = { r: 253, g: 232, b: 240, alpha: 1 }; // rose très clair de la charte

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));

for (const file of files) {
  const name = path.parse(file).name;
  const input = path.join(SRC, file);

  if (name === "logo") {
    await sharp(input).resize({ width: 400 }).webp({ quality: 90 }).toFile(path.join(OUT, "logo.webp"));
    await sharp(input).resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile("src/app/apple-icon.png");
    await sharp(input).resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile("src/app/icon.png");
    continue;
  }

  if (name.startsWith("donut-")) {
    // Donut détouré : carré 900 px, donut centré avec une marge, fond rose.
    const donut = await sharp(input).resize(760, 760, { fit: "inside" }).toBuffer();
    await sharp({ create: { width: 900, height: 900, channels: 4, background: PINK_BG } })
      .composite([{ input: donut, gravity: "center" }])
      .flatten({ background: PINK_BG })
      .webp({ quality: 80 })
      .toFile(path.join(OUT, `${name}.webp`));
    continue;
  }

  await sharp(input)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 78 })
    .toFile(path.join(OUT, `${name}.webp`));
}

// Image d'aperçu de partage (Instagram, WhatsApp, Facebook…) : 1200 x 630
const logo = await sharp(path.join(SRC, "logo.avif")).resize({ height: 420 }).toBuffer();
const hero = await sharp(path.join(SRC, "hero-milkshake.jpg")).resize(560, 630, { fit: "cover" }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: { r: 230, g: 0, b: 126, alpha: 1 } } })
  .composite([
    { input: hero, left: 640, top: 0 },
    { input: logo, left: 90, top: 105 },
  ])
  .flatten()
  .jpeg({ quality: 82 })
  .toFile("src/app/opengraph-image.jpg");

console.log(`${files.length} fichiers traités -> ${OUT}`);
