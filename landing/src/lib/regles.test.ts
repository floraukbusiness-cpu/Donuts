import { describe, expect, it } from "vitest";
import { lignesDemande, sujet } from "./email";
import { aujourdhuiParis, ajouterJours, dateMinimum, estDimanche } from "./dates";
import { valider } from "./schema";

describe("dates", () => {
  it("J+7 calculé à l'heure de Lyon", () => {
    // 9 nov. 2026 23h30 à Paris = 22h30 UTC
    const now = new Date("2026-11-09T22:30:00Z");
    expect(aujourdhuiParis(now)).toBe("2026-11-09");
    expect(dateMinimum(now)).toBe("2026-11-16");
  });
  it("passage de mois / d'année", () => {
    expect(ajouterJours("2026-12-28", 7)).toBe("2027-01-04");
  });
});

const dateOuvrable = () => {
  let d = ajouterJours(aujourdhuiParis(), 8);
  while (estDimanche(d)) d = ajouterJours(d, 1);
  return d;
};
const base = {
  prenom: "Camille",
  nom: "Martin",
  telephone: "+33 6 12 34 56 78",
  email: "Camille@Example.com",
  date: dateOuvrable(),
  rgpd: "on",
};

describe("validation", () => {
  it("dimanche refusé", () => {
    // premier dimanche à au moins 8 jours
    let d = ajouterJours(aujourdhuiParis(), 8);
    while (!estDimanche(d)) d = ajouterJours(d, 1);
    const r = valider("pro", { ...base, date: d, type: "pro", societe: "X", secteur: "Entreprise", usage: "Revente", quantite: "50", frequence: "ponctuelle", budget: "200 €", parfums: ["À définir ensemble"] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreurs.date).toMatch(/dimanche/);
  });
  it("anniversaire à emporter valide", () => {
    const r = valider("anniversaire", { ...base, type: "anniversaire", mode: "a_emporter", heure_retrait: "16:30", nb_donuts: "12", presentation: "boite" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.demande.email).toBe("camille@example.com");
  });
  it("heure hors ouverture refusée", () => {
    const r = valider("anniversaire", { ...base, type: "anniversaire", mode: "a_emporter", heure_retrait: "21:00", nb_donuts: "12", presentation: "boite" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreurs.heure_retrait).toMatch(/10h à 20h/);
  });
  it("sur place : créneau et invités obligatoires", () => {
    const r = valider("anniversaire", { ...base, type: "anniversaire", mode: "sur_place", nb_donuts: "6", presentation: "boite" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.erreurs)).toEqual(expect.arrayContaining(["creneau", "enfants"]));
  });
  it("sur place : 4 enfants et 1 adulte maximum par créneau", () => {
    const sp = { ...base, type: "anniversaire", mode: "sur_place", creneau: "14h – 16h", nb_donuts: "12", presentation: "boite" };
    expect(valider("anniversaire", { ...sp, enfants: "4", adultes: "1" }).ok).toBe(true);
    const r = valider("anniversaire", { ...sp, enfants: "5", adultes: "2" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.erreurs)).toEqual(expect.arrayContaining(["enfants", "adultes"]));
    // à emporter : pas de limite d'invités
    expect(valider("anniversaire", { ...base, type: "anniversaire", mode: "a_emporter", heure_retrait: "12:00", nb_donuts: "12", presentation: "boite", enfants: "9" }).ok).toBe(true);
  });
  it("parfum inventé refusé", () => {
    const r = valider("anniversaire", { ...base, type: "anniversaire", mode: "a_emporter", heure_retrait: "12:00", nb_donuts: "6", presentation: "boite", parfums: ["Fourrés : Saumon"] });
    expect(r.ok).toBe(false);
  });
  it("pro : SIRET de 14 chiffres, sinon erreur", () => {
    const pro = { ...base, type: "pro", societe: "X", secteur: "Entreprise", usage: "Revente", quantite: "50", frequence: "ponctuelle", budget: "200 €", parfums: ["À définir ensemble"] };
    expect(valider("pro", { ...pro, siret: "123" }).ok).toBe(false);
    const ok = valider("pro", { ...pro, siret: "123 456 789 00012" });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(sujet(ok.demande)).toMatch(/^\[PRO\] Camille Martin \(X\)/);
      expect(lignesDemande(ok.demande).find(([k]) => k === "SIRET")?.[1]).toBe("12345678900012");
    }
  });
});
