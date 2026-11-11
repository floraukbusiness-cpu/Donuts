"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type PhotoGalerie = { src: string; alt: string };

/**
 * Galerie défilante : 4 photos visibles sur grand écran, 2 sur tablette,
 * environ 1,4 sur téléphone (la suivante dépasse, pour montrer qu'on peut balayer).
 * Flèches sur ordinateur, balayage au doigt sur mobile, flèches du clavier au focus.
 */
export function Galerie({ photos }: { photos: PhotoGalerie[] }) {
  const piste = useRef<HTMLUListElement>(null);
  const [peutReculer, setPeutReculer] = useState(false);
  const [peutAvancer, setPeutAvancer] = useState(true);

  function maj() {
    const el = piste.current;
    if (!el) return;
    setPeutReculer(el.scrollLeft > 4);
    setPeutAvancer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    maj();
    window.addEventListener("resize", maj);
    return () => window.removeEventListener("resize", maj);
  }, []);

  function defiler(sens: 1 | -1) {
    const el = piste.current;
    if (!el) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: sens * el.clientWidth * 0.9, behavior: reduit ? "auto" : "smooth" });
  }

  const fleche =
    "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl font-bold text-violet shadow-lg hover:bg-poudre md:flex";

  return (
    <div role="region" aria-label="Galerie de photos de nos réalisations" className="relative mt-8">
      <ul
        ref={piste}
        onScroll={maj}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-color:#e6007e_transparent] [scrollbar-width:thin] sm:gap-4"
      >
        {photos.map((g) => (
          <li
            key={g.src}
            className="w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
          >
            <Image
              src={g.src}
              alt={g.alt}
              width={600}
              height={600}
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 70vw"
              className="aspect-square h-auto w-full object-cover"
            />
          </li>
        ))}
      </ul>
      {peutReculer && (
        <button type="button" onClick={() => defiler(-1)} aria-label="Photos précédentes" className={`${fleche} -left-4`}>
          <span aria-hidden="true">‹</span>
        </button>
      )}
      {peutAvancer && (
        <button type="button" onClick={() => defiler(1)} aria-label="Photos suivantes" className={`${fleche} -right-4`}>
          <span aria-hidden="true">›</span>
        </button>
      )}
    </div>
  );
}
