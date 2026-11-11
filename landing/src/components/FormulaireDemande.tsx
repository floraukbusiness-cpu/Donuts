"use client";
import { useEffect, useRef, useState } from "react";
import { CRENEAUX_SUR_PLACE, DECO, JOURS_SUR_PLACE, MAX_ADULTES_SUR_PLACE, MAX_ENFANTS_SUR_PLACE, MINIMUM_DONUTS, PRESENTATIONS, PRIX, SOURCES } from "@/lib/catalogue";
import { dateMaximum, dateMinimum, dateMinimumSurPlace } from "@/lib/dates";
import {
  EVENEMENTS,
  formDataToObject,
  LIBELLES_TYPE,
  SECTEURS,
  USAGES,
  UTM_KEYS,
  valider,
  type ErreursChamps,
  type TypeDemande,
} from "@/lib/schema";
import { Calendrier } from "./Calendrier";
import { ChoixParfums } from "./ChoixParfums";
import { Champ, Choix, Erreur, Liste, Zone } from "./champs";
import { PhotosInspiration } from "./PhotosInspiration";
import { PHOTOS_TOTAL_MAX_OCTETS } from "@/lib/photos";

type Props = { type: TypeDemande; utm: Partial<Record<(typeof UTM_KEYS)[number], string>> };

export function FormulaireDemande({ type, utm }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const merciRef = useRef<HTMLDivElement>(null);
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [etat, setEtat] = useState<"saisie" | "envoi" | "envoye">("saisie");
  const [erreurGlobale, setErreurGlobale] = useState("");
  const [debut, setDebut] = useState(0);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [minSurPlace, setMinSurPlace] = useState("");
  const [dateSurPlace, setDateSurPlace] = useState("");

  // Champs qui font apparaître d'autres champs
  const [mode, setMode] = useState("");
  const [evenement, setEvenement] = useState("");
  const [secteur, setSecteur] = useState("");
  const [frequence, setFrequence] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    setDebut(Date.now());
    setMinDate(dateMinimum());
    setMaxDate(dateMaximum());
    setMinSurPlace(dateMinimumSurPlace());
  }, []);

  useEffect(() => {
    if (etat === "envoye") {
      merciRef.current?.focus({ preventScroll: true });
      merciRef.current?.scrollIntoView({ block: "center" });
    }
  }, [etat]);

  function focusPremiereErreur(errs: ErreursChamps) {
    const form = formRef.current;
    if (!form) return;
    const champs = Object.keys(errs);
    // Ordre d'apparition dans le formulaire
    const el = Array.from(form.querySelectorAll<HTMLElement>("input:not([type=hidden]), select, textarea, [data-champ]")).find((e) =>
      champs.includes(e.getAttribute("name") ?? e.getAttribute("data-champ") ?? ""),
    );
    el?.focus();
    el?.scrollIntoView({ block: "center" });
  }

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (etat === "envoi") return;
    setErreurGlobale("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const v = valider(type, formDataToObject(fd));
    const errs: ErreursChamps = v.ok ? {} : { ...v.erreurs };
    if (photos.reduce((t, f) => t + f.size, 0) > PHOTOS_TOTAL_MAX_OCTETS) errs.inspiration = "Photos trop lourdes : retirez-en une.";
    if (Object.keys(errs).length) {
      setErreurs(errs);
      setErreurGlobale(`Il manque des informations : ${Object.keys(errs).length} champ${Object.keys(errs).length > 1 ? "s" : ""} à corriger.`);
      focusPremiereErreur(errs);
      return;
    }
    setErreurs({});
    setEtat("envoi");
    for (const p of photos) fd.append("inspiration", p, p.name);
    try {
      const res = await fetch("/api/demande", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; erreurs?: ErreursChamps; erreur?: string };
      if (res.ok && data.ok) {
        setEtat("envoye");
        return;
      }
      if (data.erreurs) {
        setErreurs(data.erreurs);
        focusPremiereErreur(data.erreurs);
      }
      setErreurGlobale(data.erreur ?? "Certaines informations sont à corriger.");
    } catch {
      setErreurGlobale("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
    setEtat("saisie");
  }

  if (etat === "envoye") {
    return (
      <div ref={merciRef} tabIndex={-1} role="status" className="rounded-3xl bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-5xl" aria-hidden="true">
          🍩
        </p>
        <h3 className="mt-3 text-2xl font-bold text-violet sm:text-3xl">Merci, la boutique vous recontacte sous 48 h</h3>
        <p className="mt-3">Votre demande a bien été envoyée à Donuts &amp; Donuts Lyon Part-Dieu.</p>
      </div>
    );
  }

  const err = (k: string) => erreurs[k];
  const titreDate =
    type === "anniversaire" ? "Date de l'anniversaire" : type === "personnalisee" ? "Date de retrait" : "Date de la première commande";

  return (
    <form ref={formRef} onSubmit={envoyer} noValidate className="space-y-6 rounded-3xl bg-white p-5 shadow-sm sm:p-8" aria-label={`Demande : ${LIBELLES_TYPE[type].titre}`}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="t" value={debut} />
      {UTM_KEYS.map((k) => (
        <input key={k} type="hidden" name={k} value={utm[k] ?? ""} />
      ))}
      {/* Anti-spam : champ invisible que seuls les robots remplissent */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Ne pas remplir ce champ
          <input type="text" name="site_web" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <p className="aide">
        Les champs marqués d&apos;une <span className="text-magenta-fonce">*</span> sont obligatoires.
      </p>

      {/* ── Coordonnées ─────────────────────────────── */}
      <Groupe titre="Vos coordonnées">
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ name="prenom" label="Prénom" requis autoComplete="given-name" erreur={err("prenom")} />
          <Champ name="nom" label="Nom" requis autoComplete="family-name" erreur={err("nom")} />
          <Champ name="telephone" label="Téléphone" requis type="tel" inputMode="tel" autoComplete="tel" erreur={err("telephone")} />
          <Champ name="email" label="E-mail" requis type="email" inputMode="email" autoComplete="email" erreur={err("email")} />
        </div>
      </Groupe>

      {/* ── Spécifique professionnel ─────────────────── */}
      {type === "pro" && (
        <Groupe titre="Votre entreprise">
          <Champ name="societe" label="Nom de la société" requis autoComplete="organization" erreur={err("societe")} />
          <Liste name="secteur" label="Secteur" requis options={SECTEURS} erreur={err("secteur")} onChange={(e) => setSecteur(e.target.value)} />
          {secteur === "Autre" && <Champ name="secteur_autre" label="Précisez votre secteur" requis erreur={err("secteur_autre")} />}
          <Champ name="siret" label="SIRET" inputMode="numeric" aide="14 chiffres" erreur={err("siret")} />
          <Choix name="usage" label="Usage des donuts" requis options={USAGES.map((u) => ({ value: u, label: u }))} erreur={err("usage")} />
          <Champ name="quantite" label="Quantité souhaitée" requis aide="Ex. : 60 donuts, 200 mini donuts…" erreur={err("quantite")} />
          <Choix
            name="frequence"
            label="Fréquence"
            requis
            options={[
              { value: "ponctuelle", label: "Ponctuelle" },
              { value: "recurrente", label: "Récurrente" },
            ]}
            onValeur={(v) => setFrequence(v)}
            erreur={err("frequence")}
          />
          {frequence === "recurrente" && <Champ name="rythme" label="Rythme souhaité" requis aide="Ex. : chaque semaine, une fois par mois…" erreur={err("rythme")} />}
          <Champ name="budget" label="Budget idéal" requis aide="Ex. : 150 € par mois, 2 € par donut…" erreur={err("budget")} />
          <ChoixParfums avecADefinir erreur={err("parfums")} />
        </Groupe>
      )}

      {/* ── Spécifique anniversaire ──────────────────── */}
      {type === "anniversaire" && (
        <Groupe titre="L'anniversaire">
          <Choix
            name="mode"
            label="Sur place ou à emporter ?"
            requis
            options={[
              { value: "sur_place", label: "Sur place, à la boutique" },
              { value: "a_emporter", label: "À emporter" },
            ]}
            onValeur={(v) => setMode(v)}
            erreur={err("mode")}
          />
          {mode === "a_emporter" && (
            <Champ
              name="date"
              label="Date de l'anniversaire"
              requis
              type="date"
              min={minDate || undefined}
              max={maxDate || undefined}
              aide="Nous avons besoin d'au moins 7 jours pour préparer votre commande : les dates plus proches ne peuvent pas être choisies. La boutique est fermée le dimanche."
              erreur={err("date")}
            />
          )}
          {mode === "sur_place" && minSurPlace && (
            <>
              <Calendrier
                name="date"
                label="Date de l'anniversaire"
                aide="Anniversaires sur place : le mercredi et le samedi, à réserver au moins 5 jours à l'avance. Les jours disponibles sont en rose."
                min={minSurPlace}
                max={maxDate}
                joursOuverts={JOURS_SUR_PLACE}
                valeur={dateSurPlace}
                onChange={setDateSurPlace}
                erreur={err("date")}
              />
              {dateSurPlace ? (
                <Choix
                  name="creneau"
                  label="Créneau horaire souhaité"
                  requis
                  aide="Créneaux d'1 h, de 11h à 18h."
                  options={CRENEAUX_SUR_PLACE.map((c) => ({ value: c, label: c }))}
                  erreur={err("creneau")}
                />
              ) : (
                <p className="aide">Choisissez d'abord une date pour voir les créneaux.</p>
              )}
              <p className="rounded-xl bg-poudre p-3 font-bold text-violet">
                Sur place : {MAX_ENFANTS_SUR_PLACE} enfants et {MAX_ADULTES_SUR_PLACE} adulte maximum par créneau.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Champ name="enfants" label="Invités enfants" type="number" inputMode="numeric" min={0} max={MAX_ENFANTS_SUR_PLACE} aide={`${MAX_ENFANTS_SUR_PLACE} maximum`} erreur={err("enfants")} />
                <Champ name="adultes" label="Invités adultes" type="number" inputMode="numeric" min={0} max={MAX_ADULTES_SUR_PLACE} aide={`${MAX_ADULTES_SUR_PLACE} maximum`} erreur={err("adultes")} />
              </div>
            </>
          )}
          {mode === "a_emporter" && (
            <Champ name="heure_retrait" label="Heure de retrait" requis type="time" min="10:00" max="19:45" step={900} aide="Entre 10h et 20h." erreur={err("heure_retrait")} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Champ name="age" label="Âge fêté" type="number" inputMode="numeric" min={1} max={120} erreur={err("age")} />
            <Champ name="prenom_fete" label="Prénom fêté" erreur={err("prenom_fete")} />
          </div>
        </Groupe>
      )}

      {/* ── Spécifique commande personnalisée ────────── */}
      {type === "personnalisee" && (
        <Groupe titre="Votre événement">
          <Choix
            name="evenement"
            label="Type d'événement"
            requis
            options={EVENEMENTS.map((x) => ({ value: x, label: x }))}
            onValeur={(v) => setEvenement(v)}
            erreur={err("evenement")}
          />
          {evenement === "Autre" && <Champ name="evenement_autre" label="Précisez l'événement" requis erreur={err("evenement_autre")} />}
          <Zone name="theme" label="Thème, couleurs, message ou décor souhaité" requis aide="Plus c'est précis, mieux c'est !" erreur={err("theme")} />
          <PhotosInspiration fichiers={photos} onChange={setPhotos} erreur={err("inspiration")} />
        </Groupe>
      )}

      {/* ── Commande (anniversaire + personnalisée) ─── */}
      {type !== "pro" && (
        <Groupe titre="Votre commande">
          <p className="aide">
            Donut nappé ou fourré : {PRIX.donut} · Mini donut : {PRIX.mini} · Minimum {MINIMUM_DONUTS} donuts.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Champ name="nb_donuts" label="Donuts classiques" type="number" inputMode="numeric" min={0} max={5000} erreur={err("nb_donuts")} />
            <Champ name="nb_minis" label="Mini donuts" type="number" inputMode="numeric" min={0} max={5000} erreur={err("nb_minis")} />
          </div>
          <Choix
            name="presentation"
            label="Présentation"
            requis
            options={PRESENTATIONS.map((p) => ({ value: p.id, label: `${p.label} · ${p.detail}` }))}
            erreur={err("presentation")}
          />
          <label className="puce">
            <input type="checkbox" name="deco" />
            <span>
              {DECO.label} · {DECO.detail}
            </span>
          </label>
          <ChoixParfums erreur={err("parfums")} />
          {type === "anniversaire" && (
            <>
              <Zone name="theme" label="Thème et couleurs souhaités" rows={2} erreur={err("theme")} />
              <PhotosInspiration fichiers={photos} onChange={setPhotos} erreur={err("inspiration")} />
            </>
          )}
        </Groupe>
      )}

      {/* ── Date + retrait ───────────────────────────── */}
      {type !== "anniversaire" && (
      <Groupe titre={type === "personnalisee" ? "Retrait en boutique" : "Date"}>
        <Champ
          name="date"
          label={titreDate}
          requis
          type="date"
          min={minDate || undefined}
          max={maxDate || undefined}
          aide="Nous avons besoin d'au moins 7 jours pour préparer votre commande : les dates plus proches ne peuvent pas être choisies. La boutique est fermée le dimanche."
          erreur={err("date")}
        />
        {type === "personnalisee" && (
          <Champ name="heure_retrait" label="Heure de retrait" requis type="time" min="10:00" max="19:45" step={900} aide="Entre 10h et 20h." erreur={err("heure_retrait")} />
        )}
      </Groupe>
      )}

      {/* ── Fin commune ──────────────────────────────── */}
      <Groupe titre="Pour finir">
        <Zone name="message" label="Votre message" erreur={err("message")} />
        <Liste name="source" label="Comment nous avez-vous connus ?" options={SOURCES} erreur={err("source")} />
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="rgpd"
              className="mt-1 h-6 w-6 shrink-0 accent-magenta"
              aria-invalid={err("rgpd") ? true : undefined}
              aria-describedby={err("rgpd") ? `rgpd-err-${type}` : undefined}
            />
            <span>
              J&apos;accepte que Donuts &amp; Donuts Lyon Part-Dieu utilise ces informations pour me recontacter au sujet de ma demande.{" "}
              <a href="/mentions-legales#donnees" className="font-bold text-magenta-fonce underline">
                En savoir plus
              </a>
              <span className="text-magenta-fonce" aria-hidden="true"> *</span>
              <span className="sr-only"> (obligatoire)</span>
            </span>
          </label>
          <Erreur id={`rgpd-err-${type}`} message={err("rgpd")} />
        </div>
      </Groupe>

      {erreurGlobale && (
        <p role="alert" className="rounded-xl bg-[#ffe8ea] p-3 font-bold text-[#8a0013]">
          {erreurGlobale}
        </p>
      )}

      <button
        type="submit"
        disabled={etat === "envoi"}
        className="min-h-14 w-full rounded-full bg-magenta px-6 text-lg font-bold text-white shadow-md transition hover:bg-magenta-fonce disabled:opacity-70"
      >
        {etat === "envoi" ? "Envoi en cours…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t-2 border-poudre pt-5 first-of-type:border-0 first-of-type:pt-0">
      <h4 className="font-titre text-xl font-semibold text-violet">{titre}</h4>
      {children}
    </section>
  );
}
