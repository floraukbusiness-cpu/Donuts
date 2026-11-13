import type { Metadata } from "next";
import Link from "next/link";
import { PiedDePage } from "@/components/PiedDePage";
import { BOUTIQUES } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Mentions légales | Donuts & Donuts Lyon Part-Dieu",
  description: "Mentions légales et politique de données personnelles du site de demandes de commandes Donuts & Donuts Lyon Part-Dieu.",
  alternates: { canonical: "/mentions-legales" },
};

// Source : registre officiel des entreprises (SIREN 991 118 936 : 3 établissements, Bordeaux, Lyon et Strasbourg).
// À vérifier par la société : directeur de la publication et n° de TVA (calculé à partir du SIREN).
const EDITEUR = {
  raisonSociale: "JUST D'OH IT",
  forme: "SAS, société par actions simplifiée, au capital de 100 000 €",
  siege: "Centre commercial Mériadeck, 57 rue du Château d'Eau, 33000 Bordeaux",
  siren: "SIREN 991 118 936 – RCS Bordeaux",
  etablissements: [
    "Établissement de Lyon Part-Dieu : SIRET 991 118 936 00020, 17 rue du Docteur Bouchut, 69003 Lyon",
    "Établissement de Strasbourg : SIRET 991 118 936 00038, 24 place des Halles, 67000 Strasbourg",
  ],
  tva: "FR09 991118936",
  directeur: "Cédric Roptin, Président",
};

const Titre = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h2 id={id} className="mt-10 scroll-mt-4 text-2xl font-bold text-violet">
    {children}
  </h2>
);

export default function MentionsLegales() {
  return (
    <>
      <main id="contenu" className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="font-bold text-magenta-fonce underline">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-magenta-fonce">Mentions légales</h1>

        <Titre>Éditeur du site</Titre>
        <p className="mt-3">
          Ce site de demandes de commandes est édité pour les boutiques {BOUTIQUES.lyon.complet} et {BOUTIQUES.strasbourg.complet} par :
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>{EDITEUR.raisonSociale}</li>
          <li>{EDITEUR.forme}</li>
          <li>Siège social : {EDITEUR.siege}</li>
          <li>{EDITEUR.siren}</li>
          {EDITEUR.etablissements.map((e) => (
            <li key={e}>{e}</li>
          ))}
          <li>TVA : {EDITEUR.tva}</li>
          <li>Directeur de la publication : {EDITEUR.directeur}</li>
          <li>
            Contact Lyon : <a href={`mailto:${BOUTIQUES.lyon.email}`} className="underline">{BOUTIQUES.lyon.email}</a>
          </li>
          <li>
            Contact Strasbourg : <a href={`mailto:${BOUTIQUES.strasbourg.email}`} className="underline">{BOUTIQUES.strasbourg.email}</a>
          </li>
        </ul>
        <p className="mt-3">
          La boutique est exploitée sous la marque Donuts &amp; Donuts (DONUTS AND DONUTS, SAS, 1-3 rue des Sept Agaches, 59800 Lille, SIREN 921 971 800).
        </p>

        <Titre>Hébergement</Titre>
        <p className="mt-3">Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis – vercel.com.</p>

        <Titre>Propriété intellectuelle</Titre>
        <p className="mt-3">
          Les textes, photos, logos et éléments graphiques de ce site sont la propriété de Donuts &amp; Donuts ou utilisés avec son autorisation.
          Toute reproduction sans autorisation écrite préalable est interdite.
        </p>

        <Titre id="donnees">Données personnelles</Titre>
        <div className="mt-3 space-y-3">
          <p>
            <strong>Données collectées :</strong> les informations saisies dans les formulaires (nom, prénom, téléphone, e-mail, détails de la
            demande, image d&apos;inspiration éventuelle) ainsi que la provenance de la visite (paramètres « utm » de l&apos;adresse, par
            exemple « instagram »).
          </p>
          <p>
            <strong>Finalité et base légale :</strong> traiter votre demande et vous recontacter pour l&apos;organiser, sur la base de votre
            consentement (case à cocher) et des mesures précontractuelles prises à votre demande.
          </p>
          <p>
            <strong>Destinataires :</strong> uniquement l&apos;équipe de la boutique concernée (Lyon Part-Dieu ou Strasbourg). Les données sont hébergées par Supabase
            (base de données, serveurs dans l&apos;Union européenne), transmises par e-mail via Resend et le site est hébergé par Vercel.
            Elles ne sont ni vendues ni utilisées à des fins publicitaires.
          </p>
          <p>
            <strong>Durée de conservation :</strong> 3 ans à compter de votre dernier échange avec la boutique, puis suppression.
          </p>
          <p>
            <strong>Vos droits :</strong> vous pouvez accéder à vos données, les rectifier, les effacer, vous opposer à leur traitement ou
            retirer votre consentement en écrivant à la boutique concernée : <a href={`mailto:${BOUTIQUES.lyon.email}`} className="underline">{BOUTIQUES.lyon.email}</a> (Lyon) ou <a href={`mailto:${BOUTIQUES.strasbourg.email}`} className="underline">{BOUTIQUES.strasbourg.email}</a> (Strasbourg). Vous
            pouvez aussi adresser une réclamation à la CNIL (cnil.fr).
          </p>
          <p>
            <strong>Cookies :</strong> ce site n&apos;utilise ni cookie publicitaire ni outil de mesure d&apos;audience. La provenance de la
            visite est seulement conservée dans votre navigateur le temps de la visite, pour être jointe à votre demande.
          </p>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
