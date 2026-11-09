"use client";
import { useId, useState } from "react";
import { CATEGORIES_PARFUMS, PARFUMS_A_DEFINIR, parfumValue } from "@/lib/catalogue";
import { Erreur } from "./champs";

/** Sélection multiple des parfums, rangés par catégorie (repliables pour rester lisible sur mobile). */
export function ChoixParfums({ erreur, avecADefinir = false }: { erreur?: string; avecADefinir?: boolean }) {
  const id = useId();
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [aDefinir, setADefinir] = useState(false);

  const basculer = (v: string, on: boolean) =>
    setSelection((s) => {
      const n = new Set(s);
      if (on) n.add(v);
      else n.delete(v);
      return n;
    });

  return (
    <fieldset aria-describedby={`${id}-aide${erreur ? ` ${id}-err` : ""}`}>
      <legend className="label">
        Parfums souhaités
        {avecADefinir ? <><span className="text-magenta-fonce" aria-hidden="true"> *</span><span className="sr-only"> (obligatoire)</span></> : <span className="font-normal text-[#5d3a58]"> (facultatif)</span>}
      </legend>
      <p id={`${id}-aide`} className="aide mb-2">
        Plusieurs choix possibles. Ouvrez une catégorie pour voir ses parfums.{" "}
        <span aria-live="polite">{selection.size > 0 && <strong>{selection.size} parfum{selection.size > 1 ? "s" : ""} choisi{selection.size > 1 ? "s" : ""}.</strong>}</span>
      </p>

      {avecADefinir && (
        <label className="puce mb-3">
          <input type="checkbox" name="parfums" value={PARFUMS_A_DEFINIR} checked={aDefinir} onChange={(e) => setADefinir(e.target.checked)} />
          <span>{PARFUMS_A_DEFINIR}</span>
        </label>
      )}

      <div className={`space-y-2 ${aDefinir ? "hidden" : ""}`}>
        {CATEGORIES_PARFUMS.map((cat) => {
          const nb = cat.parfums.filter((p) => selection.has(parfumValue(cat, p))).length;
          return (
            <details key={cat.id} className="rounded-xl border-2 border-[#ecd3e3] bg-white">
              <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-2 px-4 py-2 font-bold">
                <span>
                  <span aria-hidden="true">{cat.emoji} </span>
                  {cat.titre}
                  {cat.note && <span className="block text-sm font-normal text-[#5d3a58]">{cat.note}</span>}
                </span>
                {nb > 0 && <span className="rounded-full bg-magenta px-2.5 py-0.5 text-sm text-white">{nb}</span>}
              </summary>
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {cat.parfums.map((p) => {
                  const v = parfumValue(cat, p);
                  return (
                    <label key={v} className="puce">
                      <input type="checkbox" name="parfums" value={v} disabled={aDefinir} onChange={(e) => basculer(v, e.target.checked)} />
                      <span>{p}</span>
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
      <Erreur id={`${id}-err`} message={erreur} />
    </fieldset>
  );
}
