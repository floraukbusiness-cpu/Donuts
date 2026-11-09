import Link from "next/link";
import { BOUTIQUE } from "@/lib/catalogue";

export function PiedDePage() {
  return (
    <footer className="bg-encre px-4 py-10 text-white">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <div>
          <p className="font-titre text-xl font-semibold">Donuts &amp; Donuts Lyon Part-Dieu</p>
          <address className="mt-2 not-italic">
            {BOUTIQUE.lieu}
            <br />
            {BOUTIQUE.rue}, {BOUTIQUE.codePostal} {BOUTIQUE.ville}
          </address>
        </div>
        <div>
          <p className="font-bold">Horaires</p>
          <p>{BOUTIQUE.horaires}</p>
          <p>Places assises sur place</p>
        </div>
        <div>
          <p className="font-bold">Suivez-nous</p>
          <a href={`https://www.instagram.com/${BOUTIQUE.instagram}/`} className="underline" target="_blank" rel="noopener noreferrer">
            Instagram @{BOUTIQUE.instagram}
          </a>
          <p className="mt-3">
            <Link href="/mentions-legales" className="underline">
              Mentions légales et données personnelles
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
