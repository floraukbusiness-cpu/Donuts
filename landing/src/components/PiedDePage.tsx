import Link from "next/link";
import { adresse, BOUTIQUE_IDS, BOUTIQUES } from "@/lib/catalogue";

export function PiedDePage() {
  return (
    <footer className="bg-encre px-4 py-10 text-white">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {BOUTIQUE_IDS.map((id) => {
          const b = BOUTIQUES[id];
          return (
            <div key={id}>
              <p className="font-titre text-xl font-semibold">{b.complet}</p>
              <address className="mt-2 not-italic">{adresse(b)}</address>
              {b.horaires && <p className="mt-2">{b.horaires}</p>}
              <p>{b.surPlace ? "Places assises sur place" : "Commandes à emporter"}</p>
              {b.instagram && (
                <p className="mt-2">
                  <a href={`https://www.instagram.com/${b.instagram}/`} className="underline" target="_blank" rel="noopener noreferrer">
                    Instagram @{b.instagram}
                  </a>
                </p>
              )}
            </div>
          );
        })}
        <div>
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
