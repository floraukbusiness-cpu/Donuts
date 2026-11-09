export const DELAI_MIN_JOURS = 7;

/** Date du jour à Lyon, au format AAAA-MM-JJ (indépendant du fuseau du serveur). */
export function aujourdhuiParis(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Ajoute n jours à une date AAAA-MM-JJ. */
export function ajouterJours(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/** Première date sélectionnable : aujourd'hui + 7 jours. */
export function dateMinimum(now: Date = new Date()): string {
  return ajouterJours(aujourdhuiParis(now), DELAI_MIN_JOURS);
}

/** 12 mois max à l'avance, pour éviter les fautes de frappe (ex. 2062). */
export function dateMaximum(now: Date = new Date()): string {
  return ajouterJours(aujourdhuiParis(now), 366);
}

export function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
