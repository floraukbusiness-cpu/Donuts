"use client";
import Image from "next/image";
import { useRef, useState } from "react";

export type Photo = { src: string; alt: string; position?: string };

type Props = {
  photos: Photo[];
  titre: string;
  /** Classes de proportion de l'image (ex. "aspect-[16/10] md:aspect-[4/3]") */
  proportions: string;
};

/**
 * Diaporama de photos : un clic sur la photo passe à la suivante, flèches, points
 * et balayage au doigt (défilement natif). Sans flèches ni points s'il n'y a qu'une photo.
 */
export function Carrousel({ photos, titre, proportions }: Props) {
  const piste = useRef<HTMLDivElement>(null);
  const [courante, setCourante] = useState(0);
  const enAnimation = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = photos.length;

  function aller(i: number) {
    const el = piste.current;
    if (!el) return;
    const cible = (i + total) % total;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCourante(cible);
    // Pendant l'animation, on ignore les événements de défilement (sinon la photo
    // « courante » se recalcule en route et un clic rapide saute à la mauvaise photo).
    if (enAnimation.current) clearTimeout(enAnimation.current);
    enAnimation.current = setTimeout(() => (enAnimation.current = null), reduit ? 50 : 700);
    el.scrollTo({ left: cible * el.clientWidth, behavior: reduit ? "auto" : "smooth" });
  }

  function auDefilement() {
    const el = piste.current;
    if (!el || !el.clientWidth || enAnimation.current) return;
    setCourante(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div role="region" aria-roledescription="carrousel" aria-label={`Photos : ${titre}`} className="relative">
      <div
        ref={piste}
        onScroll={auDefilement}
        onClick={() => total > 1 && aller(courante + 1)}
        // Zone de défilement accessible au clavier : Tab pour y aller, flèches ← → pour changer de photo
        tabIndex={0}
        onKeyDown={(e) => {
          if (total < 2) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            aller(courante + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            aller(courante - 1);
          }
        }}
        className={`flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${proportions} ${
          total > 1 ? "cursor-pointer" : ""
        }`}
      >
        {photos.map((p, i) => (
          <div key={p.src} role="group" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${total}`} className="h-full w-full shrink-0 snap-center">
            <Image
              src={p.src}
              alt={p.alt}
              width={800}
              height={600}
              sizes="(min-width: 768px) 33vw, 100vw"
              style={{ objectPosition: p.position ?? "center" }}
              className="h-full w-full select-none object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => aller(courante - 1)}
            aria-label="Photo précédente"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-violet shadow-md hover:bg-white"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => aller(courante + 1)}
            aria-label="Photo suivante"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-violet shadow-md hover:bg-white"
          >
            <span aria-hidden="true">›</span>
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 rounded-full bg-black/40 px-1">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => aller(i)}
                aria-label={`Afficher la photo ${i + 1}`}
                aria-current={i === courante}
                className="p-[7px]"
              >
                <span className={`block h-2.5 w-2.5 rounded-full ${i === courante ? "bg-white" : "bg-white/50"}`} />
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Photo {courante + 1} sur {total}
          </p>
        </>
      )}
    </div>
  );
}
