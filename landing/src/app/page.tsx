import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BOUTIQUE_IDS, BOUTIQUES, estBoutique, type BoutiqueId } from "@/lib/catalogue";

type Recherche = Record<string, string | string[] | undefined>;

/** Paramètres de l'adresse (ex. utm_source) à conserver, hors « boutique ». */
function conserver(recherche: Recherche): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(recherche)) {
    if (k === "boutique") continue;
    for (const val of Array.isArray(v) ? v : v === undefined ? [] : [v]) p.append(k, val);
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

const SOUS_TITRE: Record<BoutiqueId, string> = {
  lyon: "Westfield La Part-Dieu · sur place ou à emporter",
  strasbourg: "Place des Halles · à emporter uniquement",
};

// Première page : « Lyon ou Strasbourg ? ». Un lien Instagram avec ?boutique=lyon (ou strasbourg)
// saute cette étape et arrive directement sur la page de la boutique.
export default async function Page({ searchParams }: { searchParams: Promise<Recherche> }) {
  const recherche = await searchParams;
  const demandee = typeof recherche.boutique === "string" ? recherche.boutique.toLowerCase() : "";
  if (estBoutique(demandee)) redirect(`/${demandee}${conserver(recherche)}`);

  const qs = conserver(recherche);
  return (
    <>
      <main id="contenu" className="fond-marbre flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center px-4 py-12 text-center">
        <Image src="/images/logo.webp" alt="Donuts & Donuts" width={400} height={358} priority className="h-auto w-32 md:w-40" />
        <h1 className="mt-6 text-4xl font-bold text-magenta-fonce sm:text-5xl md:text-6xl">Des donuts pour toutes vos occasions</h1>
        <p className="mt-4 max-w-xl text-lg md:text-xl">Anniversaires, soirées, mariages, baptêmes, EVJF ou commandes pour les pros.</p>

        <h2 className="mt-10 font-titre text-2xl font-semibold text-violet md:text-3xl">Dans quelle boutique souhaitez-vous commander ?</h2>
        <ul className="mt-6 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
          {BOUTIQUE_IDS.map((id) => (
            <li key={id}>
              <Link
                href={`/${id}${qs}`}
                className="flex h-full min-h-28 flex-col items-center justify-center rounded-3xl border-[3px] border-transparent bg-white p-6 shadow-md transition hover:-translate-y-0.5 hover:border-magenta hover:shadow-lg"
              >
                <span className="font-titre text-2xl font-semibold text-violet">📍 {BOUTIQUES[id].nom}</span>
                <span className="mt-1">{SOUS_TITRE[id]}</span>
                <span className="mt-3 font-bold text-magenta-fonce">Commander dans cette boutique →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <PiedDePage />
    </>
  );
}
