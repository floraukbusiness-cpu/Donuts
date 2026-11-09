// Appels aux services externes (côté serveur uniquement) :
// Supabase (enregistrement + stockage d'images) et Resend (e-mail à la boutique).
// Appels HTTP directs, sans SDK, pour garder le site léger.
import "server-only";

function env(name: string, ...fallbacks: string[]): string {
  for (const n of [name, ...fallbacks]) {
    const v = process.env[n];
    if (v) return v;
  }
  throw new Error(`Variable d'environnement manquante : ${name}`);
}

const supabaseUrl = () => env("SUPABASE_URL").replace(/\/$/, "");
const supabaseKey = () => env("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
const supabaseHeaders = () => ({ apikey: supabaseKey(), Authorization: `Bearer ${supabaseKey()}` });

export const BUCKET = "inspirations";

export async function enregistrerDemande(row: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/demandes`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase insert ${res.status}: ${await res.text()}`);
  const [created] = (await res.json()) as { id: string }[];
  return created.id;
}

export async function marquerEmailEnvoye(id: string): Promise<void> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/demandes?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ email_envoye: true }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase update ${res.status}: ${await res.text()}`);
}

/** Envoie l'image dans le stockage privé et renvoie son chemin + un lien signé valable 1 an. */
export async function stockerImage(file: File): Promise<{ path: string; url: string }> {
  const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" } as Record<string, string>)[file.type] ?? "bin";
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const up = await fetch(`${supabaseUrl()}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": file.type, "x-upsert": "false" },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
  });
  if (!up.ok) throw new Error(`Supabase storage ${up.status}: ${await up.text()}`);

  const sign = await fetch(`${supabaseUrl()}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 365 }),
    cache: "no-store",
  });
  if (!sign.ok) throw new Error(`Supabase sign ${sign.status}: ${await sign.text()}`);
  const { signedURL } = (await sign.json()) as { signedURL: string };
  return { path, url: `${supabaseUrl()}/storage/v1${signedURL}` };
}

export async function envoyerEmail(opts: { subject: string; html: string; text: string; replyTo: string }): Promise<void> {
  const res = await fetch(`${process.env.RESEND_API_URL || "https://api.resend.com"}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Sans nom de domaine vérifié, Resend impose cette adresse d'expédition
      // et n'envoie qu'à l'adresse du titulaire du compte Resend.
      from: process.env.EMAIL_FROM || "Demandes Donuts Lyon <onboarding@resend.dev>",
      to: [env("NOTIFY_EMAIL")],
      reply_to: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
