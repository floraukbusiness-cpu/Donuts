"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BOUTIQUES, type BoutiqueId } from "@/lib/catalogue";
import { UTM_KEYS, type TypeDemande } from "@/lib/schema";
import { Carrousel, type Photo } from "./Carrousel";
import { FormulaireDemande } from "./FormulaireDemande";

// Photos de chaque carte (diaporama) : fichiers dans public/images (voir README > Photos).
// Pour ajouter une photo, ajouter une ligne dans la liste `photos` de la carte.
type Carte = {
  type: TypeDemande;
  emoji: string;
  titre: string;
  texte: string;
  /** Texte propre à Strasbourg (à emporter uniquement), si différent */
  texteStrasbourg?: string;
  photos: Photo[];
  photoFormulaire?: { src: string; alt: string };
};

const CARTES: Carte[] = [
  {
    type: "anniversaire",
    emoji: "🎂",
    titre: "Anniversaire",
    texte: "Sur place à la boutique ou à emporter.",
    texteStrasbourg: "À emporter uniquement.",
    photos: [
      { src: "/images/anniversaire-princesse.webp", alt: "Enfants en princesses riant devant un plateau de donuts roses à la couronne", position: "center 35%" },
      { src: "/images/carte-anniversaire.webp", alt: "Pièce montée de donuts fleurie avec le chiffre 10 et « Joyeux anniversaire »", position: "center 55%" },
      { src: "/images/galerie-plateau-super-heros.webp", alt: "Plateau de donuts super-héros, dont un personnalisé au prénom Ethan", position: "center 78%" },
      { src: "/images/galerie-anniversaire.webp", alt: "Plateau de donuts colorés d'anniversaire : licorne, princesse, étoiles" },
    ],
    // Photo affichée au-dessus du formulaire quand la carte est ouverte
    photoFormulaire: {
      src: "/images/anniversaire-super-heros.webp",
      alt: "Enfants déguisés en super-héros riant autour d'un plateau de donuts rouges, bleus et jaunes",
    },
  },
  {
    type: "personnalisee",
    emoji: "🎉",
    titre: "Commande personnalisée",
    texte: "Soirée, événement, baptême, mariage, EVJF… À emporter uniquement.",
    photos: [
      { src: "/images/carte-personnalisee.webp", alt: "Pièce montée de donuts décorée de fleurs", position: "center 40%" },
      { src: "/images/galerie-mariage.webp", alt: "Présentoir de donuts roses et dorés pour un mariage, étiquettes « Bride to be »" },
      { src: "/images/galerie-bapteme-1.webp", alt: "Donuts pastel vert et blanc sur présentoir pour un baptême" },
      { src: "/images/galerie-bapteme-2.webp", alt: "Donuts bleu ciel et blancs personnalisés au prénom pour un baptême" },
    ],
  },
  {
    type: "pro",
    emoji: "💼",
    titre: "Vous êtes un professionnel",
    texte: "Traiteur, wedding planner, concept store, entreprise…",
    photos: [{ src: "/images/carte-pro.webp", alt: "Donuts bleus et blancs personnalisés aux couleurs d'une entreprise" }],
  },
];

type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Lit les paramètres UTM de l'URL et les garde pendant la visite. */
function lireUtm(): Utm {
  const utm: Utm = {};
  try {
    const params = new URLSearchParams(window.location.search);
    let trouve = false;
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) {
        utm[k] = v.slice(0, 200);
        trouve = true;
      }
    }
    if (trouve) {
      sessionStorage.setItem("dd_utm", JSON.stringify(utm));
      return utm;
    }
    return JSON.parse(sessionStorage.getItem("dd_utm") ?? "{}") as Utm;
  } catch {
    return utm;
  }
}

export function Demandes({ boutique }: { boutique: BoutiqueId }) {
  const [actif, setActif] = useState<TypeDemande | null>(null);
  const [utm, setUtm] = useState<Utm>({});
  const panneauRef = useRef<HTMLDivElement>(null);

  useEffect(() => setUtm(lireUtm()), []);

  function ouvrir(t: TypeDemande) {
    setActif(t);
    requestAnimationFrame(() => {
      panneauRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      panneauRef.current?.querySelector<HTMLElement>("h3")?.focus({ preventScroll: true });
    });
  }

  const carte = CARTES.find((c) => c.type === actif);

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-3">
        {CARTES.map((c) => {
          const estActif = actif === c.type;
          return (
            <li key={c.type}>
              <div
                className={`flex h-full flex-col overflow-hidden rounded-3xl border-[3px] bg-white shadow-sm transition hover:shadow-md ${
                  estActif ? "border-magenta ring-4 ring-magenta/20" : "border-transparent"
                }`}
              >
                <Carrousel photos={c.photos} titre={c.titre} proportions="aspect-[16/10] md:aspect-[4/3]" />
                <button
                  type="button"
                  onClick={() => ouvrir(c.type)}
                  aria-expanded={estActif}
                  aria-controls="formulaire-demande"
                  className="block w-full flex-1 p-5 text-left md:p-6"
                >
                  <span className="block font-titre text-xl font-semibold text-violet">
                    <span aria-hidden="true">{c.emoji} </span>
                    {c.titre}
                  </span>
                  <span className="mt-1 block text-[0.98rem]">{boutique === "strasbourg" && c.texteStrasbourg ? c.texteStrasbourg : c.texte}</span>
                  <span className="mt-2 inline-block font-bold text-magenta-fonce">
                    {estActif ? "Formulaire ouvert ↓" : "Faire ma demande →"}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div id="formulaire-demande" ref={panneauRef} className="scroll-mt-4">
        {carte && (
          <div className="mt-8">
            <h3 tabIndex={-1} className="mb-4 text-center font-titre text-2xl font-semibold text-violet outline-none sm:text-3xl">
              <span aria-hidden="true">{carte.emoji} </span>
              {carte.titre}
              <span className="block text-lg font-normal text-[#5d3a58]">{BOUTIQUES[boutique].nom}</span>
            </h3>
            {carte.photoFormulaire && (
              <Image
                src={carte.photoFormulaire.src}
                alt={carte.photoFormulaire.alt}
                width={1200}
                height={800}
                sizes="(min-width: 768px) 768px, 100vw"
                className="mx-auto mb-4 h-64 w-full rounded-3xl object-cover object-[center_35%] shadow-sm sm:h-80 md:max-w-3xl"
              />
            )}
            {/* key : chaque type a son propre formulaire, remis à zéro quand on change */}
            <FormulaireDemande key={`${carte.type}-${boutique}`} type={carte.type} utm={utm} boutique={boutique} />
          </div>
        )}
      </div>
    </>
  );
}
