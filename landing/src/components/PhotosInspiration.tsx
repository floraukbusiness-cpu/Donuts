"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { compresserPhoto, PHOTO_MAX_OCTETS, PHOTO_TYPES, PHOTOS_MAX } from "@/lib/photos";
import { Erreur } from "./champs";

type Props = {
  fichiers: File[];
  onChange: (fichiers: File[]) => void;
  erreur?: string;
};

/** Ajout de 1 à 3 photos d'inspiration, avec aperçu et bouton « Retirer ». */
export function PhotosInspiration({ fichiers, onChange, erreur }: Props) {
  const id = useId();
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const apercus = useMemo(() => fichiers.map((f) => URL.createObjectURL(f)), [fichiers]);
  useEffect(() => () => apercus.forEach((u) => URL.revokeObjectURL(u)), [apercus]);

  async function ajouter(e: React.ChangeEvent<HTMLInputElement>) {
    const choisis = Array.from(e.target.files ?? []);
    e.target.value = ""; // permet de re-choisir la même photo après l'avoir retirée
    if (!choisis.length) return;
    setMessage("");
    const place = PHOTOS_MAX - fichiers.length;
    if (choisis.length > place) setMessage(`${PHOTOS_MAX} photos maximum : seules les ${place} premières ont été ajoutées.`);
    setEnCours(true);
    const prets: File[] = [];
    for (const f of choisis.slice(0, Math.max(place, 0))) {
      if (!PHOTO_TYPES.includes(f.type) && !/\.(heic|heif)$/i.test(f.name)) {
        setMessage("Format non accepté : choisissez une photo (JPG, PNG, WebP ou HEIC).");
        continue;
      }
      const c = await compresserPhoto(f);
      if (c.size > PHOTO_MAX_OCTETS) {
        setMessage(`« ${f.name} » est trop lourde. Essayez une capture d'écran de la photo.`);
        continue;
      }
      prets.push(c);
    }
    setEnCours(false);
    onChange([...fichiers, ...prets]);
  }

  const plein = fichiers.length >= PHOTOS_MAX;

  return (
    <div>
      <p id={`${id}-titre`} className="label">
        Photos d&apos;inspiration <span className="font-normal text-[#5d3a58]">(facultatif)</span>
      </p>
      <p id={`${id}-aide`} className="aide mb-2">
        Une idée, un exemple qui vous plaît ? Ajoutez jusqu&apos;à {PHOTOS_MAX} photos : nous nous en inspirerons pour créer vos donuts, sans
        pouvoir les reproduire à l&apos;identique.
      </p>

      {fichiers.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-3" aria-label="Photos ajoutées">
          {fichiers.map((f, i) => (
            <li key={apercus[i]} className="w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={apercus[i]} alt={`Photo ajoutée ${i + 1}`} className="h-28 w-28 rounded-xl border-2 border-[#ecd3e3] object-cover" />
              <button
                type="button"
                onClick={() => onChange(fichiers.filter((_, j) => j !== i))}
                className="mt-1 min-h-11 w-full rounded-full border-2 border-[#d9b8cf] bg-white text-sm font-bold text-magenta-fonce"
              >
                Retirer<span className="sr-only"> la photo {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!plein && (
        <label
          htmlFor={`${id}-input`}
          className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-magenta bg-[#fff3f9] px-4 py-3 text-center font-bold text-magenta-fonce has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bleu"
        >
          <span aria-hidden="true">📷</span>
          {enCours ? "Préparation de la photo…" : fichiers.length ? "Ajouter une autre photo" : "Ajouter des photos"}
          <input
            id={`${id}-input`}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={enCours}
            data-champ="inspiration"
            aria-describedby={`${id}-aide${erreur ? ` ${id}-err` : ""}`}
            aria-invalid={erreur ? true : undefined}
            onChange={ajouter}
          />
        </label>
      )}
      <p className="aide mt-1" aria-live="polite">
        {fichiers.length > 0 && `${fichiers.length} photo${fichiers.length > 1 ? "s" : ""} sur ${PHOTOS_MAX}. `}
        {message}
      </p>
      <Erreur id={`${id}-err`} message={erreur} />
    </div>
  );
}
