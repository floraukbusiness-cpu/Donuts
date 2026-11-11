import { DELAI_SUR_PLACE_JOURS } from "./catalogue";

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

/** Jour de la semaine d'une date AAAA-MM-JJ (0 = dimanche … 6 = samedi). */
export function jourSemaine(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Première date réservable pour un anniversaire sur place : aujourd'hui + 5 jours. */
export function dateMinimumSurPlace(now: Date = new Date()): string {
  return ajouterJours(aujourdhuiParis(now), DELAI_SUR_PLACE_JOURS);
}

/** La boutique est fermée le dimanche. */
export function estDimanche(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0;
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
