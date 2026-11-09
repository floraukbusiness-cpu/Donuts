"use client";
import { useEffect, useRef, useState } from "react";
import { UTM_KEYS, type TypeDemande } from "@/lib/schema";
import { FormulaireDemande } from "./FormulaireDemande";

const CARTES: { type: TypeDemande; emoji: string; titre: string; texte: string }[] = [
  { type: "anniversaire", emoji: "🎂", titre: "Anniversaire", texte: "Sur place à la boutique ou à emporter." },
  {
    type: "personnalisee",
    emoji: "🎉",
    titre: "Commande personnalisée",
    texte: "Soirée, événement, baptême, mariage, EVJF… À emporter uniquement.",
  },
  {
    type: "pro",
    emoji: "💼",
    titre: "Vous êtes un professionnel",
    texte: "Traiteur, wedding planner, concept store, entreprise…",
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

export function Demandes() {
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
              <button
                type="button"
                onClick={() => ouvrir(c.type)}
                aria-expanded={estActif}
                aria-controls="formulaire-demande"
                className={`flex h-full w-full items-center gap-4 rounded-3xl border-[3px] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-col md:items-start md:p-6 ${
                  estActif ? "border-magenta ring-4 ring-magenta/20" : "border-transparent"
                }`}
              >
                <span className="text-4xl md:text-5xl" aria-hidden="true">
                  {c.emoji}
                </span>
                <span>
                  <span className="block font-titre text-xl font-semibold text-violet">{c.titre}</span>
                  <span className="mt-1 block text-[0.98rem]">{c.texte}</span>
                  <span className="mt-2 inline-block font-bold text-magenta-fonce">
                    {estActif ? "Formulaire ouvert ↓" : "Faire ma demande →"}
                  </span>
                </span>
              </button>
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
            </h3>
            {/* key : chaque type a son propre formulaire, remis à zéro quand on change */}
            <FormulaireDemande key={carte.type} type={carte.type} utm={utm} />
          </div>
        )}
      </div>
    </>
  );
}
