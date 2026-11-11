"use client";
import { useState, type ReactNode } from "react";
import { jourSemaine } from "@/lib/dates";
import { Erreur } from "./champs";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = [
  ["L", "lundi"],
  ["M", "mardi"],
  ["M", "mercredi"],
  ["J", "jeudi"],
  ["V", "vendredi"],
  ["S", "samedi"],
  ["D", "dimanche"],
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const NOM_JOUR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function formatLong(i: string) {
  const [y, m, d] = i.split("-").map(Number);
  return `${NOM_JOUR[jourSemaine(i)]} ${d} ${MOIS[m - 1]} ${y}`;
}

type Props = {
  name: string;
  label: ReactNode;
  aide?: ReactNode;
  /** Première date choisissable (AAAA-MM-JJ) */
  min: string;
  /** Dernière date choisissable (AAAA-MM-JJ) */
  max: string;
  /** Jours ouverts : 0 = dimanche … 6 = samedi */
  joursOuverts: readonly number[];
  valeur: string;
  onChange: (date: string) => void;
  erreur?: string;
};

/** Calendrier mensuel : seuls les jours ouverts, à partir de la date minimale, sont cliquables. */
export function Calendrier({ name, label, aide, min, max, joursOuverts, valeur, onChange, erreur }: Props) {
  const [minY, minM] = min.split("-").map(Number);
  const [maxY, maxM] = max.split("-").map(Number);
  const [vue, setVue] = useState({ y: minY, m: minM - 1 });

  const premier = (new Date(Date.UTC(vue.y, vue.m, 1)).getUTCDay() + 6) % 7; // lundi = 0
  const nbJours = new Date(Date.UTC(vue.y, vue.m + 1, 0)).getUTCDate();
  const cases: (number | null)[] = [...Array(premier).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];
  while (cases.length % 7) cases.push(null);
  const lignes = Array.from({ length: cases.length / 7 }, (_, i) => cases.slice(i * 7, i * 7 + 7));

  const peutReculer = vue.y * 12 + vue.m > minY * 12 + (minM - 1);
  const peutAvancer = vue.y * 12 + vue.m < maxY * 12 + (maxM - 1);
  const changerMois = (delta: number) => setVue(({ y, m }) => ({ y: y + Math.floor((m + delta) / 12), m: (((m + delta) % 12) + 12) % 12 }));

  const nav =
    "flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d9b8cf] bg-white text-2xl font-bold text-violet disabled:opacity-30";

  return (
    <fieldset
      tabIndex={-1}
      data-champ={name}
      aria-describedby={erreur ? `${name}-cal-err` : undefined}
      className="rounded-2xl outline-none"
    >
      <legend className="label">
        {label}
        <span className="text-magenta-fonce" aria-hidden="true"> *</span>
        <span className="sr-only"> (obligatoire)</span>
      </legend>
      {aide && <p className="aide mb-2">{aide}</p>}
      <input type="hidden" name={name} value={valeur} />

      <div className="rounded-2xl border-2 border-[#d9b8cf] bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" className={nav} onClick={() => changerMois(-1)} disabled={!peutReculer} aria-label="Mois précédent">
            <span aria-hidden="true">‹</span>
          </button>
          <p className="font-titre text-lg font-semibold capitalize text-violet" aria-live="polite">
            {MOIS[vue.m]} {vue.y}
          </p>
          <button type="button" className={nav} onClick={() => changerMois(1)} disabled={!peutAvancer} aria-label="Mois suivant">
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <table className="w-full table-fixed border-separate border-spacing-1 text-center">
          <caption className="sr-only">
            {MOIS[vue.m]} {vue.y}
          </caption>
          <thead>
            <tr>
              {JOURS.map(([court, long]) => (
                <th key={long} scope="col" className="pb-1 text-sm font-bold text-[#5d3a58]">
                  <abbr title={long} className="no-underline">
                    {court}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => (
              <tr key={i}>
                {ligne.map((jour, j) => {
                  if (!jour) return <td key={j} />;
                  const date = iso(vue.y, vue.m, jour);
                  const ouvert = date >= min && date <= max && joursOuverts.includes(jourSemaine(date));
                  const choisi = date === valeur;
                  return (
                    <td key={j}>
                      <button
                        type="button"
                        data-date={date}
                        disabled={!ouvert}
                        aria-pressed={ouvert ? choisi : undefined}
                        aria-label={`${formatLong(date)}${ouvert ? "" : ", indisponible"}`}
                        onClick={() => onChange(date)}
                        className={`h-11 w-full rounded-xl text-base ${
                          choisi
                            ? "bg-magenta font-bold text-white"
                            : ouvert
                              ? "border-2 border-magenta bg-[#fff3f9] font-bold text-magenta-fonce hover:bg-[#ffe3f1]"
                              : "text-[#8a7185]"
                        }`}
                      >
                        {jour}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="aide mt-2" aria-live="polite">
        {valeur ? (
          <>
            Date choisie : <strong>{formatLong(valeur)}</strong>
          </>
        ) : (
          "Aucune date choisie pour l'instant."
        )}
      </p>
      <Erreur id={`${name}-cal-err`} message={erreur} />
    </fieldset>
  );
}
