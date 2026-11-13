// ─────────────────────────────────────────────────────────────────────────────
// CATALOGUE : parfums, prix et options affichés sur la page et dans les formulaires.
// Pour modifier un prix ou un parfum, c'est ICI (et uniquement ici).
// Les parfums reprennent à l'identique la liste du Google Form de commande.
// ─────────────────────────────────────────────────────────────────────────────

export const PRIX = {
  donut: "3,50 €", // donut nappé ou fourré
  mini: "1,75 €", // mini donut nappé
} as const;

export const MINIMUM_DONUTS = 6;

// Anniversaire sur place : jours ouverts, délai, créneaux et capacité.
// Jours : 0 = dimanche, 1 = lundi … 3 = mercredi … 6 = samedi.
export const JOURS_SUR_PLACE = [3, 6]; // mercredi et samedi
export const DELAI_SUR_PLACE_JOURS = 5; // réservation au moins 5 jours à l'avance
const SUR_PLACE_DEBUT = 11 * 60; // premier créneau : 11h
const SUR_PLACE_FIN = 18 * 60; // le dernier créneau se termine à 18h au plus tard
const CRENEAU_DUREE = 60; // créneaux d'1 h
const CRENEAU_PAUSE = 30; // 30 min de pause entre deux créneaux

const hhmm = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;
/** 11h00 – 12h00, 12h30 – 13h30, 14h00 – 15h00, 15h30 – 16h30, 17h00 – 18h00 */
export const CRENEAUX_SUR_PLACE: readonly string[] = (() => {
  const out: string[] = [];
  for (let d = SUR_PLACE_DEBUT; d + CRENEAU_DUREE <= SUR_PLACE_FIN; d += CRENEAU_DUREE + CRENEAU_PAUSE) out.push(`${hhmm(d)} – ${hhmm(d + CRENEAU_DUREE)}`);
  return out;
})();

// Capacité maximale par créneau
export const MAX_ENFANTS_SUR_PLACE = 4;
export const MAX_ADULTES_SUR_PLACE = 1;
export const OFFRE_DOUZE = "12 donuts commandés = 1 donut offert";

export const PRESENTATIONS = [
  { id: "boite", label: "Boîte(s)", detail: "Incluse" },
  { id: "piece-montee", label: "Pièce montée (donuts classiques, fourrés possibles)", detail: "+20 €" },
  { id: "brochettes", label: "Bouquet de brochettes (mini donuts nappés uniquement)", detail: "+5 €" },
] as const;

export const DECO = { label: "Décoration (fleurs, etc.)", detail: "+5 €" } as const;

// Options de l'anniversaire sur place (le client peut aussi apporter ses bougies et sa déco)
export const BOUGIE = { label: "Bougie d'anniversaire", detail: "+2 €", prix: 2 } as const;
export const BALLON = { label: "Ballon hélium", detail: "+3 € par enfant", prix: 3 } as const;

export type CategorieParfums = {
  id: string;
  titre: string;
  emoji: string;
  note: string;
  parfums: readonly string[];
};

export const CATEGORIES_PARFUMS: readonly CategorieParfums[] = [
  {
    id: "chocolates",
    titre: "Les Chocolatés",
    emoji: "🍫",
    note: "Nappés · classiques et mini",
    parfums: [
      "M'M's", "Nutella", "Chocolat cacahuète", "Chocolat Daim", "Chocolat Spéculoos",
      "Chocolat noisette", "Chocolat orange", "Chocolat banane", "Chocolat ourson",
      "Chocolat pop corn", "Kinder Maxi", "Kinder Schokobon", "Kitkat", "Brownie",
      "Maltesers", "Napolitain", "Chocolat blanc", "Chocolat blanc cerise", "Chocolat blanc rose",
      "Choco blanc framboise", "Chocolat blanc fraise", "Raffaello",
    ],
  },
  {
    id: "gourmands",
    titre: "Les Gourmands",
    emoji: "😋",
    note: "Nappés · classiques et mini",
    parfums: [
      "Spéculoos", "Country", "Bueno", "Vanille", "Tiramisù", "Amande praline rose",
      "Caramel au beurre salé", "Noisette", "Lion", "Bounty", "Nougat", "Caramel", "Pop corn",
      "Cookie", "Caramel Twix", "Caramel Snickers", "Poire chocolat", "Pain d'épices", "Meringue",
      "Barbe à papa", "Guimauve", "Pomme d'amour", "Tutti frutti", "Peanut butter", "Sucre",
    ],
  },
  {
    id: "fruites",
    titre: "Les Fruités",
    emoji: "🍓",
    note: "Nappés · classiques et mini",
    parfums: [
      "Fraise", "Framboise", "Mangue", "Citron", "Citron meringué", "Poire", "Cerise", "Pistache",
      "Pistache framboise", "Ananas", "Ananas coco", "Pêche", "Passion", "Groseille", "Myrtille",
      "Framboise matcha", "Litchi", "Melon", "Kiwi", "Abricot", "Fraise tagada", "Fraise basilic",
      "Framboise meringue", "Pomme kiwi", "Amande", "Coquelicot", "Lavande", "Fleur d'oranger",
      "Hibiscus", "Violette", "Rose",
    ],
  },
  {
    id: "fourres",
    titre: "Les Fourrés",
    emoji: "🍩",
    note: "Classiques uniquement (pas en mini)",
    parfums: ["Fraise", "Mangue", "Dubai", "Citron vert - framboise", "Choco noisette", "Pomme cannelle"],
  },
  {
    id: "festif",
    titre: "Le Festif",
    emoji: "🎉",
    note: "",
    parfums: ["Champagne", "Ferrero Rocher"],
  },
];

/** Identifiant unique d'un parfum (certains noms existent dans 2 catégories, ex. « Fraise »). */
export const parfumValue = (cat: CategorieParfums, parfum: string) => `${cat.titre.replace(/^Les? /, "")} : ${parfum}`;

export const TOUS_LES_PARFUMS: ReadonlySet<string> = new Set(
  CATEGORIES_PARFUMS.flatMap((c) => c.parfums.map((p) => parfumValue(c, p))),
);
export const PARFUMS_A_DEFINIR = "À définir ensemble";

export const SOURCES = ["Instagram", "TikTok", "En boutique", "Bouche-à-oreille", "Autre"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// BOUTIQUES : la page sert Lyon et Strasbourg (un lien par compte Instagram).
//   https://…/?boutique=lyon         → Lyon présélectionnée
//   https://…/?boutique=strasbourg   → Strasbourg présélectionnée
// Un champ vide n'est simplement pas affiché sur le site (à compléter quand on l'a).
// ─────────────────────────────────────────────────────────────────────────────
export type BoutiqueId = "lyon" | "strasbourg";
export const BOUTIQUE_IDS: readonly BoutiqueId[] = ["lyon", "strasbourg"];

export type Boutique = {
  id: BoutiqueId;
  nom: string; // nom court, pour les boutons
  complet: string; // nom complet, pour les textes
  lieu: string;
  rue: string;
  codePostal: string;
  ville: string;
  ouverture: string; // HH:MM, du lundi au samedi
  fermeture: string; // HH:MM
  instagram: string;
  email: string; // adresse de contact affichée (mentions légales)
  surPlace: boolean; // anniversaires sur place possibles ?
};

export const BOUTIQUES: Record<BoutiqueId, Boutique> = {
  lyon: {
    id: "lyon",
    nom: "Lyon Part-Dieu",
    complet: "Donuts & Donuts Lyon Part-Dieu",
    lieu: "Centre commercial Westfield La Part-Dieu, niveau 2",
    rue: "17 rue du Docteur Bouchut",
    codePostal: "69003",
    ville: "Lyon",
    ouverture: "10:00",
    fermeture: "20:00",
    instagram: "donutsanddonuts_lyonpartdieu",
    email: "donutsdonuts.lyonpartdieu@gmail.com",
    surPlace: true,
  },
  strasbourg: {
    id: "strasbourg",
    nom: "Strasbourg",
    complet: "Donuts & Donuts Strasbourg",
    lieu: "Centre commercial Place des Halles",
    rue: "24 place des Halles",
    codePostal: "67000",
    ville: "Strasbourg",
    ouverture: "09:30",
    fermeture: "20:00",
    instagram: "donutsanddonuts_strasbourg",
    email: "donutsdonuts.strasbourg@gmail.com",
    surPlace: false, // à Strasbourg : à emporter uniquement
  },
};

const pad2 = (n: number) => String(n).padStart(2, "0");
/** « 09:30 » → « 9h30 », « 20:00 » → « 20h » */
export function heureLisible(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
/** « de 9h30 à 20h » */
export const plageHoraire = (b: Boutique) => `de ${heureLisible(b.ouverture)} à ${heureLisible(b.fermeture)}`;
/** « Ouvert du lundi au samedi, de 10h à 20h » */
export const horairesTexte = (b: Boutique) => `Ouvert du lundi au samedi, ${plageHoraire(b)}`;
/** Dernière heure de retrait possible : 15 min avant la fermeture. */
export function heureRetraitMax(b: Boutique): string {
  const [h, m] = b.fermeture.split(":").map(Number);
  const t = h * 60 + m - 15;
  return `${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`;
}

/** Boutique historique (Lyon) : mentions légales, données structurées. */
export const BOUTIQUE = BOUTIQUES.lyon;

export const estBoutique = (v: unknown): v is BoutiqueId => typeof v === "string" && (BOUTIQUE_IDS as readonly string[]).includes(v);

/** « Centre commercial X, rue, 67000 Strasbourg » sans les morceaux vides */
export function adresse(b: Boutique): string {
  return [b.lieu, b.rue, `${b.codePostal} ${b.ville}`].filter(Boolean).join(", ");
}
