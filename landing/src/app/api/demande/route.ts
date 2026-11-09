// Réception d'une demande : anti-spam → validation → image → enregistrement → e-mail.
import { NextResponse } from "next/server";
import { corpsEmail, sujet, type Utm } from "@/lib/email";
import { formDataToObject, TYPES, UTM_KEYS, valider, type TypeDemande } from "@/lib/schema";
import { enregistrerDemande, envoyerEmail, marquerEmailEnvoye, stockerImage } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_MAX = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const DELAI_MIN_REMPLISSAGE_MS = 3000; // un humain met plus de 3 s à remplir le formulaire

const ok = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  }

  // ── Anti-spam : champ invisible rempli ou envoi instantané → on fait semblant d'accepter
  const piege = String(fd.get("site_web") ?? "");
  const debut = Number(fd.get("t") ?? 0);
  if (piege !== "" || !debut || Date.now() - debut < DELAI_MIN_REMPLISSAGE_MS) {
    return ok();
  }

  const type = String(fd.get("type") ?? "") as TypeDemande;
  if (!TYPES.includes(type)) return NextResponse.json({ ok: false, erreur: "Type de demande inconnu." }, { status: 400 });

  const v = valider(type, formDataToObject(fd));
  if (!v.ok) return NextResponse.json({ ok: false, erreurs: v.erreurs }, { status: 422 });
  const d = v.demande;

  // ── Image d'inspiration (commande personnalisée uniquement, facultative)
  const fichier = type === "personnalisee" ? fd.get("inspiration") : null;
  let image: { path: string; url: string } | null = null;
  if (fichier instanceof File && fichier.size > 0) {
    if (fichier.size > IMAGE_MAX) return NextResponse.json({ ok: false, erreurs: { inspiration: "Image trop lourde (5 Mo maximum)." } }, { status: 422 });
    if (!IMAGE_TYPES.has(fichier.type)) return NextResponse.json({ ok: false, erreurs: { inspiration: "Format accepté : JPG, PNG, WebP ou HEIC." } }, { status: 422 });
    try {
      image = await stockerImage(fichier);
    } catch (e) {
      console.error("[demande] image non stockée", e); // la demande passe quand même
    }
  }

  const utm: Utm = {};
  for (const k of UTM_KEYS) {
    const val = String(fd.get(k) ?? "").trim().slice(0, 200);
    if (val) utm[k] = val;
  }

  const { type: _t, prenom, nom, telephone, email, date, message, source, rgpd: _r, ...details } = d;
  const row = {
    type,
    prenom,
    nom,
    telephone,
    email,
    date_souhaitee: date,
    message: message || null,
    source: source || null,
    details,
    image_path: image?.path ?? null,
    ...utm,
    email_envoye: false,
  };

  // ── Enregistrement puis e-mail. Si l'un des deux échoue, l'autre garde la trace.
  let id: string | null = null;
  try {
    id = await enregistrerDemande(row);
  } catch (e) {
    console.error("[demande] enregistrement échoué", e);
  }

  let emailOk = false;
  try {
    const { html, text } = corpsEmail(d, utm, image?.url ?? null);
    await envoyerEmail({ subject: sujet(d), html, text, replyTo: email });
    emailOk = true;
    if (id) await marquerEmailEnvoye(id).catch((e) => console.error("[demande] statut e-mail non mis à jour", e));
  } catch (e) {
    console.error("[demande] e-mail échoué", e);
  }

  if (!id && !emailOk) {
    return NextResponse.json(
      { ok: false, erreur: "Votre demande n'a pas pu être envoyée. Réessayez dans quelques minutes ou écrivez-nous sur Instagram." },
      { status: 502 },
    );
  }
  return ok();
}
