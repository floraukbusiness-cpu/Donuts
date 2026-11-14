import Link from "next/link";
import { adresse, BOUTIQUES, horairesTexte, type BoutiqueId } from "@/lib/catalogue";

/**
 * Pied de page. Avec `boutique` : seules les informations de CETTE boutique s'affichent
 * (Lyon n'apparaît que sur la page de Lyon, Strasbourg que sur celle de Strasbourg).
 * Sans `boutique` (première page, mentions légales) : seulement le lien vers les mentions légales.
 */
export function PiedDePage({ boutique }: { boutique?: BoutiqueId }) {
  const b = boutique ? BOUTIQUES[boutique] : null;
  return (
    <footer className="bg-encre px-4 py-10 text-white">
      <div className={`mx-auto grid max-w-5xl gap-8 ${b ? "md:grid-cols-2" : ""}`}>
        {b && (
          <div>
            <p className="font-titre text-xl font-semibold">{b.complet}</p>
            <address className="mt-2 not-italic">{adresse(b)}</address>
            <p className="mt-2">{horairesTexte(b)}</p>
            <p>{b.surPlace ? "Places assises sur place" : "Commandes à emporter"}</p>
            {b.instagram && (
              <p className="mt-2">
                <a href={`https://www.instagram.com/${b.instagram}/`} className="underline" target="_blank" rel="noopener noreferrer">
                  Instagram @{b.instagram}
                </a>
              </p>
            )}
          </div>
        )}
        <div className={b ? "" : "text-center"}>
          <p className="font-bold">Informations</p>
          <p className="mt-2">
            <Link href="/mentions-legales" className="underline">
              Mentions légales et données personnelles
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
