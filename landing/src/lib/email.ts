// Mise en forme de l'e-mail de notification envoyé à la boutique.
import { BALLON, BOUGIE, DECO, PRESENTATIONS } from "./catalogue";
import { formatDateFr } from "./dates";
import { LIBELLES_TYPE, type Demande } from "./schema";

export type Utm = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content", string>>;

type Ligne = [string, string];

const presentationLabel = (id: string) => {
  const p = PRESENTATIONS.find((x) => x.id === id);
  return p ? `${p.label} (${p.detail})` : id;
};

function lignesCommande(d: { nb_donuts: number; nb_minis: number; presentation: string; deco?: string; parfums: string[] }): Ligne[] {
  return [
    ["Donuts classiques", String(d.nb_donuts)],
    ["Mini donuts", String(d.nb_minis)],
    ["Présentation", presentationLabel(d.presentation)],
    [DECO.label, d.deco === "on" ? `Oui (${DECO.detail})` : "Non"],
    ["Parfums", d.parfums.length ? d.parfums.join(", ") : "Non précisés"],
  ];
}

function lignesOptionsSurPlace(d: { apport?: string; bougie?: string; ballon?: string; enfants: number }): Ligne[] {
  if (d.apport !== "boutique") return [["Bougies et déco", "Le client apporte ses bougies et sa déco"]];
  const lignes: Ligne[] = [];
  if (d.bougie) lignes.push([BOUGIE.label, `Oui (${BOUGIE.detail})`]);
  if (d.ballon) lignes.push([BALLON.label, `Oui : ${d.enfants} enfant${d.enfants > 1 ? "s" : ""} × ${BALLON.prix} € = ${d.enfants * BALLON.prix} €`]);
  return lignes;
}

export function lignesDemande(d: Demande): Ligne[] {
  const contact: Ligne[] = [
    ["Prénom", d.prenom],
    ["Nom", d.nom],
    ["Téléphone", d.telephone],
    ["E-mail", d.email],
  ];
  const fin: Ligne[] = [
    ["Message", d.message || "—"],
    ["Nous a connus via", d.source || "—"],
    ["Consentement RGPD", "Oui"],
  ];

  if (d.type === "anniversaire") {
    const surPlace = d.mode === "sur_place";
    return [
      ...contact,
      ["Date souhaitée", formatDateFr(d.date)],
      ["Formule", surPlace ? "Sur place" : "À emporter"],
      ...(surPlace
        ? ([
            ["Créneau souhaité", d.creneau],
            ["Invités enfants", String(d.enfants)],
            ["Invités adultes", String(d.adultes)],
            ...lignesOptionsSurPlace(d),
          ] as Ligne[])
        : ([["Heure de retrait", d.heure_retrait]] as Ligne[])),
      ["Âge fêté", d.age || "—"],
      ["Prénom fêté", d.prenom_fete || "—"],
      ...lignesCommande(d),
      ["Thème et couleurs", d.theme || "—"],
      ...fin,
    ];
  }
  if (d.type === "personnalisee") {
    return [
      ...contact,
      ["Date de retrait", formatDateFr(d.date)],
      ["Heure de retrait", d.heure_retrait],
      ["Type d'événement", d.evenement === "Autre" ? `Autre : ${d.evenement_autre}` : d.evenement],
      ["Thème, couleurs, message, décor", d.theme],
      ...lignesCommande(d),
      ...fin,
    ];
  }
  return [
    ...contact,
    ["Société", d.societe],
    ["Secteur", d.secteur === "Autre" ? `Autre : ${d.secteur_autre}` : d.secteur],
    ["SIRET", d.siret || "—"],
    ["Usage", d.usage],
    ["Quantité souhaitée", d.quantite],
    ["Fréquence", d.frequence === "recurrente" ? `Récurrente : ${d.rythme}` : "Ponctuelle"],
    ["Budget idéal", d.budget],
    ["Parfums", d.parfums.join(", ")],
    ["Date de la première commande", formatDateFr(d.date)],
    ...fin,
  ];
}

export function sujet(d: Demande): string {
  const extra = d.type === "pro" ? ` (${d.societe})` : "";
  return `${LIBELLES_TYPE[d.type].tag} ${d.prenom} ${d.nom}${extra} – ${formatDateFr(d.date)}`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function corpsEmail(d: Demande, utm: Utm, imageUrls: string[]) {
  const lignes = lignesDemande(d);
  imageUrls.forEach((u, i) => lignes.push([`Photo d'inspiration ${i + 1}`, u]));
  const utmTxt = Object.entries(utm)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(" · ");
  lignes.push(["Provenance (UTM)", utmTxt || "—"]);

  const text =
    `Nouvelle demande : ${LIBELLES_TYPE[d.type].titre}\n\n` +
    lignes.map(([k, v]) => `${k} : ${v}`).join("\n") +
    `\n\nRépondez directement à cet e-mail pour écrire au client.`;

  const rows = lignes
    .map(([k, v]) => {
      const val = k.startsWith("Photo d'inspiration") ? `<a href="${esc(v)}">Voir la photo</a>` : esc(v).replace(/\n/g, "<br>");
      return `<tr><td style="padding:6px 12px 6px 0;color:#6b2160;font-weight:bold;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#222">${val}</td></tr>`;
    })
    .join("");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5">
<h2 style="color:#e6007e;margin:0 0 12px">Nouvelle demande : ${esc(LIBELLES_TYPE[d.type].titre)}</h2>
<table style="border-collapse:collapse">${rows}</table>
<p style="color:#666;margin-top:16px">Répondez directement à cet e-mail pour écrire au client (${esc(d.email)}).</p></div>`;

  return { text, html };
}
