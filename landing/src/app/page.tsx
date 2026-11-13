import Image from "next/image";
import { Demandes } from "@/components/Demandes";
import { Galerie } from "@/components/Galerie";
import { PiedDePage } from "@/components/PiedDePage";
import { adresse, BALLON, BOUGIE, BOUTIQUES, CATEGORIES_PARFUMS, DECO, MINIMUM_DONUTS, OFFRE_DOUZE, PRESENTATIONS, PRIX } from "@/lib/catalogue";

// Ordre : on alterne une illustration (IA) et une vraie photo de la boutique.
const GALERIE = [
  { src: "/images/galerie-mariage.webp", alt: "Présentoir de donuts roses et dorés pour un mariage, avec étiquettes « Bride to be »" }, // IA
  { src: "/images/carte-anniversaire.webp", alt: "Pièce montée de donuts fleurie pour un anniversaire, avec le chiffre 10 et le mot « Joyeux anniversaire »" }, // vraie
  { src: "/images/galerie-anniversaire.webp", alt: "Plateau de donuts colorés d'anniversaire : licorne, princesse, étoiles et ballons" }, // IA
  { src: "/images/galerie-brochettes.webp", alt: "Bouquet de brochettes de mini donuts roses et de bonbons, emballé dans du papier Donuts & Donuts" }, // vraie
  { src: "/images/galerie-bapteme-1.webp", alt: "Donuts pastel vert et blanc sur présentoir pour un baptême" }, // IA
  { src: "/images/galerie-donuts-bonbons.webp", alt: "Douze donuts au glaçage rouge décorés d'une sucette en cœur, d'un bonbon et d'une feuille" }, // vraie
  { src: "/images/galerie-bapteme-2.webp", alt: "Donuts bleu ciel et blancs personnalisés au prénom pour un baptême" }, // IA
  { src: "/images/carte-personnalisee.webp", alt: "Pièce montée de donuts décorée de fleurs" }, // vraie
  { src: "/images/galerie-plateau-super-heros.webp", alt: "Plateau de six donuts super-héros rouges, bleus et jaunes, dont un personnalisé au prénom Ethan" }, // IA
];

const ETAPES = [
  { n: 1, titre: "Je fais ma demande", texte: "En 3 minutes, depuis ce site." },
  { n: 2, titre: "La boutique me recontacte", texte: "Pour confirmer les détails, le prix et la date." },
  { n: 3, titre: "Je récupère ma commande", texte: "En boutique… ou je viens fêter mon anniversaire sur place !" },
];

const FAQ = [
  {
    q: "Combien de temps à l'avance dois-je commander ?",
    r: "Au minimum une semaine avant la date souhaitée : c'est le temps qu'il nous faut pour préparer des donuts personnalisés. Le calendrier des formulaires ne propose donc que des dates à partir de J+7.",
  },
  {
    q: "Où récupérer ma commande ?",
    r: `Les commandes se retirent dans la boutique que vous avez choisie. ${BOUTIQUES.lyon.nom} : ${adresse(BOUTIQUES.lyon)}. ${BOUTIQUES.lyon.horaires}, fermé le dimanche. ${BOUTIQUES.strasbourg.nom} : ${adresse(BOUTIQUES.strasbourg)}. Les anniversaires sur place sont possibles à Lyon uniquement ; à Strasbourg, tout se récupère à emporter.`,
  },
  {
    q: "Comment se passe le paiement ?",
    r: "Une fois votre commande validée avec la boutique, un acompte de 30 % vous sera demandé, à régler en ligne. Le solde se règle à la réception de la commande.",
  },
  {
    q: "Vous êtes un professionnel ?",
    r: "Traiteurs, wedding planners, concept stores, entreprises : choisissez « Vous êtes un professionnel ». Indiquez vos quantités, votre fréquence et votre budget, et la boutique revient vers vous avec une proposition adaptée.",
  },
];

export default function Page() {
  return (
    <>
      <header className="fond-marbre overflow-x-clip">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-5 md:grid-cols-2 md:gap-12 md:pb-16 md:pt-8">
          <div>
            <Image src="/images/logo.webp" alt="Donuts & Donuts" width={400} height={358} priority className="h-auto w-28 md:w-36" />
            <p className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-sm font-bold text-violet">📍 Lyon Part-Dieu · Strasbourg</p>
            <h1 className="mt-3 text-4xl font-bold text-magenta-fonce sm:text-5xl md:text-6xl">Des donuts pour toutes vos occasions</h1>
            <p className="mt-4 text-lg md:text-xl">
              Anniversaires, soirées, mariages, baptêmes, EVJF ou commandes pour les pros : dites-nous ce dont vous rêvez, on s&apos;occupe du reste.
            </p>
            <a
              href="#demande"
              className="mt-6 inline-flex min-h-14 items-center justify-center rounded-full bg-magenta px-8 text-lg font-bold text-white shadow-lg transition hover:bg-magenta-fonce"
            >
              Faire ma demande
            </a>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:max-w-md">
            <div className="absolute -inset-3 -rotate-3 rounded-[2.5rem] bg-rose/60" aria-hidden="true" />
            <Image
              src="/images/hero-milkshake.webp"
              alt="Milkshake chantilly et donut nappé au chocolat à la boutique Donuts & Donuts"
              width={640}
              height={960}
              priority
              sizes="(min-width: 768px) 448px, 90vw"
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover object-[center_75%] shadow-xl"
            />
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* ── Choix du type de demande ────────────────────── */}
        <section id="demande" aria-labelledby="titre-demande" className="scroll-mt-2 bg-poudre px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 id="titre-demande" className="text-center text-3xl font-bold text-violet md:text-4xl">
              Quelle est votre demande ?
            </h2>
            <p className="mb-8 mt-2 text-center">Choisissez votre boutique, puis votre type de demande pour ouvrir le formulaire.</p>
            <Demandes />
          </div>
        </section>

        {/* ── Comment ça marche ───────────────────────────── */}
        <section aria-labelledby="titre-etapes" className="px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 id="titre-etapes" className="text-center text-3xl font-bold text-violet md:text-4xl">
              Comment ça marche ?
            </h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {ETAPES.map((e) => (
                <li key={e.n} className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm md:flex-col">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-magenta font-titre text-2xl font-bold text-white" aria-hidden="true">
                    {e.n}
                  </span>
                  <span>
                    <span className="block font-titre text-xl font-semibold text-violet">{e.titre}</span>
                    <span className="block">{e.texte}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Galerie ─────────────────────────────────────── */}
        <section aria-labelledby="titre-galerie" className="fond-marbre px-4 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 id="titre-galerie" className="text-center text-3xl font-bold text-violet md:text-4xl">
              Nos réalisations
            </h2>
            <Galerie photos={GALERIE} />
            <p className="mt-6 text-center">
              Encore plus de photos sur{" "}
              <a href={`https://www.instagram.com/${BOUTIQUES.lyon.instagram}/`} className="font-bold text-magenta-fonce underline" target="_blank" rel="noopener noreferrer">
                Instagram @{BOUTIQUES.lyon.instagram}
              </a>
            </p>
          </div>
        </section>

        {/* ── Parfums et prix ─────────────────────────────── */}
        <section aria-labelledby="titre-prix" className="px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 id="titre-prix" className="text-center text-3xl font-bold text-violet md:text-4xl">
              Parfums et prix
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-magenta p-6 text-white shadow-sm">
                <p className="font-titre text-xl font-semibold">Donut nappé ou fourré</p>
                <p className="mt-1 font-titre text-4xl font-bold">{PRIX.donut}</p>
              </div>
              <div className="rounded-3xl bg-violet p-6 text-white shadow-sm">
                <p className="font-titre text-xl font-semibold">Mini donut nappé</p>
                <p className="mt-1 font-titre text-4xl font-bold">{PRIX.mini}</p>
              </div>
              <div className="rounded-3xl border-[3px] border-dashed border-magenta bg-white p-6 shadow-sm">
                <p className="font-titre text-xl font-semibold text-violet">🎁 Offre</p>
                <p className="mt-1 text-lg font-bold">{OFFRE_DOUZE}</p>
                <p className="mt-1">Minimum {MINIMUM_DONUTS} donuts par commande.</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-titre text-xl font-semibold text-violet">Présentations et options</h3>
              <ul className="mt-3 divide-y divide-poudre">
                {[...PRESENTATIONS, DECO, { label: `${BOUGIE.label} (anniversaire sur place)`, detail: BOUGIE.detail }, { label: `${BALLON.label} (anniversaire sur place)`, detail: BALLON.detail }].map((p) => (
                  <li key={p.label} className="flex items-baseline justify-between gap-4 py-2">
                    <span>{p.label}</span>
                    <span className="shrink-0 font-bold">{p.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="aide mt-3">Commandes professionnelles : tarifs sur devis.</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {CATEGORIES_PARFUMS.map((cat) => (
                <div key={cat.id} className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="font-titre text-xl font-semibold text-violet">
                    <span aria-hidden="true">{cat.emoji} </span>
                    {cat.titre}
                  </h3>
                  {cat.note && <p className="aide">{cat.note}</p>}
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {cat.parfums.map((p) => (
                      <li key={p} className="rounded-full bg-poudre px-3 py-1 text-[0.95rem]">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <section aria-labelledby="titre-faq" className="bg-poudre px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 id="titre-faq" className="text-center text-3xl font-bold text-violet md:text-4xl">
              Questions fréquentes
            </h2>
            <div className="mt-8 space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-2xl bg-white shadow-sm">
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-5 py-3 font-bold">
                    {f.q}
                    <span className="text-2xl text-magenta transition group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5">{f.r}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-center">
              <a href="#demande" className="inline-flex min-h-14 items-center rounded-full bg-magenta px-8 text-lg font-bold text-white shadow-md hover:bg-magenta-fonce">
                Faire ma demande
              </a>
            </p>
          </div>
        </section>
      </main>

      <PiedDePage />
    </>
  );
}
