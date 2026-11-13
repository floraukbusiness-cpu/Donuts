// Règles de validation des 3 formulaires, partagées entre le navigateur
// (messages d'erreur immédiats) et le serveur (contrôle final, non contournable).
import { z } from "zod";
import { BOUTIQUE_IDS, CRENEAUX_SUR_PLACE, JOURS_SUR_PLACE, MAX_ADULTES_SUR_PLACE, MAX_ENFANTS_SUR_PLACE, MINIMUM_DONUTS, PARFUMS_A_DEFINIR, PRESENTATIONS, SOURCES, TOUS_LES_PARFUMS } from "./catalogue";
import { dateMaximum, dateMinimum, dateMinimumSurPlace, estDimanche, jourSemaine } from "./dates";

export const TYPES = ["anniversaire", "personnalisee", "pro"] as const;
export type TypeDemande = (typeof TYPES)[number];

export const CRENEAUX = CRENEAUX_SUR_PLACE;
export const EVENEMENTS = ["Soirée", "Événement", "Baptême", "Mariage", "EVJF", "Autre"] as const;
export const SECTEURS = ["Traiteur", "Wedding planner", "Concept store", "Entreprise", "Autre"] as const;
export const USAGES = ["Revente", "Pour mes salariés ou clients", "Pour un événement"] as const;

const txt = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);
const requis = (msg: string, max = 120) => z.string().trim().min(1, msg).max(max, `${max} caractères maximum.`);
const optionnel = (max: number) => txt(max).optional().default("");

const heureBoutique = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Indiquez une heure.")
  .refine((h) => h >= "10:00" && h <= "19:45", "La boutique est ouverte de 10h à 20h.");

const entier = (msg: string) =>
  z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((v) => (v === "" ? 0 : Number(v)))
    .refine((n) => Number.isInteger(n) && n >= 0 && n <= 5000, msg);

const parfums = z
  .array(z.string())
  .default([])
  .refine((l) => l.every((p) => TOUS_LES_PARFUMS.has(p) || p === PARFUMS_A_DEFINIR), "Parfum inconnu.");

function dateSouhaitee() {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date.")
    .refine((d) => d >= dateMinimum(), "Nous avons besoin d'au moins 7 jours pour préparer votre commande : choisissez une date à partir de J+7.")
    .refine((d) => d <= dateMaximum(), "Choisissez une date dans les 12 prochains mois.")
    .refine((d) => !estDimanche(d), "La boutique est fermée le dimanche : choisissez un autre jour.");
}

const telephone = z
  .string()
  .trim()
  .refine((v) => /^\+?[\d\s.\-()]+$/.test(v) && v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15, "Indiquez un numéro de téléphone valide.");

function commun() {
  return {
    // Optionnelle (Lyon par défaut) : une ancienne page restée ouverte n'envoie pas ce champ
    boutique: z.enum(BOUTIQUE_IDS as [string, ...string[]], { errorMap: () => ({ message: "Choisissez une boutique." }) }).optional().default("lyon"),
    prenom: requis("Indiquez votre prénom.", 60),
    nom: requis("Indiquez votre nom.", 60),
    telephone,
    email: z.string().trim().toLowerCase().email("Indiquez une adresse e-mail valide.").max(160),
    date: dateSouhaitee(),
    message: optionnel(2000),
    source: z.union([z.enum(SOURCES), z.literal("")]).optional().default(""),
    rgpd: z.literal("on", { errorMap: () => ({ message: "Cochez cette case pour que la boutique puisse vous recontacter." }) }),
  };
}

const presentation = z.enum(PRESENTATIONS.map((p) => p.id) as [string, ...string[]], {
  errorMap: () => ({ message: "Choisissez une présentation." }),
});

function commande() {
  return {
    nb_donuts: entier("Indiquez un nombre entier."),
    nb_minis: entier("Indiquez un nombre entier."),
    presentation,
    deco: z.literal("on").optional(),
    parfums,
  };
}

type Commande = { nb_donuts: number; nb_minis: number; presentation: string };
function verifierCommande(v: Commande, ctx: z.RefinementCtx) {
  if (v.nb_donuts + v.nb_minis < MINIMUM_DONUTS) {
    ctx.addIssue({ code: "custom", path: ["nb_donuts"], message: `Minimum ${MINIMUM_DONUTS} donuts par commande (classiques et mini confondus).` });
  }
  if (v.presentation === "brochettes" && v.nb_minis === 0) {
    ctx.addIssue({ code: "custom", path: ["nb_minis"], message: "Les brochettes se font avec des mini donuts : indiquez le nombre de mini donuts." });
  }
  if (v.presentation === "piece-montee" && v.nb_donuts === 0) {
    ctx.addIssue({ code: "custom", path: ["nb_donuts"], message: "La pièce montée se fait avec des donuts classiques : indiquez leur nombre." });
  }
}

export const anniversaireSchema = z
  .object({
    type: z.literal("anniversaire"),
    ...commun(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date."), // règles ci-dessous, selon le mode
    mode: z.enum(["sur_place", "a_emporter"], { errorMap: () => ({ message: "Choisissez « sur place » ou « à emporter »." }) }),
    creneau: z.string().optional().default(""),
    enfants: entier("Indiquez un nombre entier."),
    adultes: entier("Indiquez un nombre entier."),
    heure_retrait: z.string().optional().default(""),
    age: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) <= 120), "Indiquez un âge valide."),
    prenom_fete: optionnel(60),
    // Anniversaire sur place : le client apporte ses bougies et sa déco, ou Donuts & Donuts s'occupe de tout
    // (bougie + 1 ballon hélium par enfant)
    apport: z.enum(["apporte", "boutique"]).optional(),
    ...commande(),
    theme: optionnel(500),
  })
  .superRefine((v, ctx) => {
    verifierCommande(v, ctx);
    if (v.mode === "sur_place" && v.boutique === "strasbourg") {
      ctx.addIssue({ code: "custom", path: ["mode"], message: "À Strasbourg, les anniversaires sont uniquement à emporter." });
    }
    if (v.mode === "sur_place") {
      if (!v.apport) ctx.addIssue({ code: "custom", path: ["apport"], message: "Indiquez si vous apportez vos bougies et votre déco, ou si Donuts & Donuts s'occupe de tout." });
      if (v.date < dateMinimumSurPlace()) ctx.addIssue({ code: "custom", path: ["date"], message: "Pour un anniversaire sur place, réservez au moins 5 jours à l'avance." });
      else if (v.date > dateMaximum()) ctx.addIssue({ code: "custom", path: ["date"], message: "Choisissez une date dans les 12 prochains mois." });
      else if (!JOURS_SUR_PLACE.includes(jourSemaine(v.date))) ctx.addIssue({ code: "custom", path: ["date"], message: "Sur place, les anniversaires ont lieu le mercredi et le samedi." });
      if (!(CRENEAUX as readonly string[]).includes(v.creneau)) ctx.addIssue({ code: "custom", path: ["creneau"], message: "Choisissez un créneau horaire." });
      if (v.enfants + v.adultes < 1) ctx.addIssue({ code: "custom", path: ["enfants"], message: "Indiquez le nombre d'invités (enfants et/ou adultes)." });
      if (v.enfants > MAX_ENFANTS_SUR_PLACE) ctx.addIssue({ code: "custom", path: ["enfants"], message: `Sur place, ${MAX_ENFANTS_SUR_PLACE} enfants maximum par créneau.` });
      if (v.adultes > MAX_ADULTES_SUR_PLACE) ctx.addIssue({ code: "custom", path: ["adultes"], message: `Sur place, ${MAX_ADULTES_SUR_PLACE} adulte maximum par créneau.` });
    }
    if (v.mode === "a_emporter") {
      if (v.date < dateMinimum()) ctx.addIssue({ code: "custom", path: ["date"], message: "Nous avons besoin d'au moins 7 jours pour préparer votre commande : choisissez une date à partir de J+7." });
      else if (v.date > dateMaximum()) ctx.addIssue({ code: "custom", path: ["date"], message: "Choisissez une date dans les 12 prochains mois." });
      else if (estDimanche(v.date)) ctx.addIssue({ code: "custom", path: ["date"], message: "La boutique est fermée le dimanche : choisissez un autre jour." });
      const r = heureBoutique.safeParse(v.heure_retrait);
      if (!r.success) ctx.addIssue({ code: "custom", path: ["heure_retrait"], message: v.heure_retrait ? r.error.issues[0].message : "Indiquez l'heure de retrait." });
    }
  });

export const personnaliseeSchema = z
  .object({
    type: z.literal("personnalisee"),
    ...commun(),
    evenement: z.enum(EVENEMENTS, { errorMap: () => ({ message: "Choisissez le type d'événement." }) }),
    evenement_autre: optionnel(80),
    theme: requis("Décrivez le thème, les couleurs, le message ou le décor souhaité.", 1000),
    ...commande(),
    heure_retrait: z.string().min(1, "Indiquez l'heure de retrait.").pipe(heureBoutique),
  })
  .superRefine((v, ctx) => {
    verifierCommande(v, ctx);
    if (v.evenement === "Autre" && !v.evenement_autre) ctx.addIssue({ code: "custom", path: ["evenement_autre"], message: "Précisez le type d'événement." });
  });

export const proSchema = z
  .object({
    type: z.literal("pro"),
    ...commun(),
    societe: requis("Indiquez le nom de votre société.", 120),
    secteur: z.enum(SECTEURS, { errorMap: () => ({ message: "Choisissez votre secteur." }) }),
    secteur_autre: optionnel(80),
    siret: z
      .string()
      .trim()
      .optional()
      .default("")
      .transform((v) => v.replace(/\s/g, ""))
      .refine((v) => v === "" || /^\d{14}$/.test(v), "Le SIRET comporte 14 chiffres."),
    usage: z.enum(USAGES, { errorMap: () => ({ message: "Choisissez l'usage prévu." }) }),
    quantite: requis("Indiquez la quantité souhaitée.", 200),
    frequence: z.enum(["ponctuelle", "recurrente"], { errorMap: () => ({ message: "Choisissez la fréquence." }) }),
    rythme: optionnel(200),
    budget: requis("Indiquez votre budget idéal.", 200),
    parfums,
  })
  .superRefine((v, ctx) => {
    if (v.secteur === "Autre" && !v.secteur_autre) ctx.addIssue({ code: "custom", path: ["secteur_autre"], message: "Précisez votre secteur." });
    if (v.frequence === "recurrente" && !v.rythme) ctx.addIssue({ code: "custom", path: ["rythme"], message: "Indiquez le rythme souhaité (ex. chaque semaine)." });
    if (v.parfums.length === 0) ctx.addIssue({ code: "custom", path: ["parfums"], message: "Choisissez des parfums ou « À définir ensemble »." });
  });

export const SCHEMAS = { anniversaire: anniversaireSchema, personnalisee: personnaliseeSchema, pro: proSchema } as const;

export type Anniversaire = z.infer<typeof anniversaireSchema>;
export type Personnalisee = z.infer<typeof personnaliseeSchema>;
export type Pro = z.infer<typeof proSchema>;
export type Demande = Anniversaire | Personnalisee | Pro;

export const MULTI = new Set(["parfums"]);
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Transforme un FormData en objet simple (les cases multiples deviennent des tableaux). */
export function formDataToObject(fd: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue; // fichiers traités à part
    if (MULTI.has(k)) {
      const prev = out[k];
      out[k] = Array.isArray(prev) ? [...prev, v] : [v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

export type ErreursChamps = Record<string, string>;

export function valider(type: TypeDemande, data: Record<string, unknown>):
  | { ok: true; demande: Demande }
  | { ok: false; erreurs: ErreursChamps } {
  const r = SCHEMAS[type].safeParse(data);
  if (r.success) return { ok: true, demande: r.data };
  const erreurs: ErreursChamps = {};
  for (const issue of r.error.issues) {
    const champ = String(issue.path[0] ?? "formulaire");
    if (!erreurs[champ]) erreurs[champ] = issue.message;
  }
  return { ok: false, erreurs };
}

export const LIBELLES_TYPE: Record<TypeDemande, { tag: string; titre: string }> = {
  anniversaire: { tag: "[ANNIVERSAIRE]", titre: "Anniversaire" },
  personnalisee: { tag: "[PERSONNALISÉE]", titre: "Commande personnalisée" },
  pro: { tag: "[PRO]", titre: "Professionnel" },
};
