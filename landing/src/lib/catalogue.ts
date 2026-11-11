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
export const OFFRE_DOUZE = "12 donuts commandés = 1 donut offert";

export const PRESENTATIONS = [
  { id: "boite", label: "Boîte(s)", detail: "Incluse" },
  { id: "piece-montee", label: "Pièce montée (donuts classiques, fourrés possibles)", detail: "+20 €" },
  { id: "brochettes", label: "Bouquet de brochettes (mini donuts nappés uniquement)", detail: "+5 €" },
] as const;

export const DECO = { label: "Décoration (fleurs, etc.)", detail: "+5 €" } as const;

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

export const BOUTIQUE = {
  nom: "Donuts & Donuts Lyon Part-Dieu",
  lieu: "Centre commercial Westfield La Part-Dieu, niveau 2",
  rue: "17 rue du Docteur Bouchut",
  codePostal: "69003",
  ville: "Lyon",
  horaires: "Ouvert du lundi au samedi, de 10h à 20h",
  instagram: "donutsanddonuts_lyonpartdieu",
  email: "donutsdonuts.lyonpartdieu@gmail.com",
} as const;
