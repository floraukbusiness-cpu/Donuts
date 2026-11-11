import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const MOCK = "http://127.0.0.1:4010";

type Call = { method: string; path: string; json?: Record<string, unknown>; headers: Record<string, string>; size: number };

async function appels(page: Page): Promise<Call[]> {
  return (await page.request.get(`${MOCK}/__calls`)).json();
}

function dansJours(n: number) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  now.setDate(now.getDate() + n);
  if (n >= 7 && now.getDay() === 0) now.setDate(now.getDate() + 1); // boutique fermée le dimanche
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

async function ouvrir(page: Page, carte: RegExp, url = "/") {
  await page.goto(url);
  await page.getByRole("button", { name: carte }).click();
  const form = page.locator("form");
  await expect(form).toBeVisible();
  return form;
}

async function coordonnees(page: Page) {
  const f = page.locator("form");
  await f.locator('[name="prenom"]').fill("Camille");
  await f.locator('[name="nom"]').fill("Martin");
  await f.locator('[name="telephone"]').fill("06 12 34 56 78");
  await f.locator('[name="email"]').fill("camille@example.com");
}

async function finir(page: Page, date: string | null = dansJours(10)) {
  const f = page.locator("form");
  if (date) await f.locator('[name="date"]').fill(date);
  await f.locator('[name="message"]').fill("Merci !");
  await f.locator('[name="source"]').selectOption("Instagram");
  await f.locator('[name="rgpd"]').check();
  // Le filtre anti-robots refuse les envois en moins de 3 secondes
  await page.waitForTimeout(3100);
  await f.getByRole("button", { name: "Envoyer ma demande" }).click();
}

const CRENEAUX_ATTENDUS = ["11h00 – 12h00", "12h30 – 13h30", "14h00 – 15h00", "15h30 – 16h30", "17h00 – 18h00"];

/** Prochaine date (mercredi ou samedi) à au moins n jours, au format AAAA-MM-JJ. */
function prochainJourOuvert(n: number) {
  for (let i = n; i < n + 14; i++) {
    const d = dansJours(i);
    const j = new Date(d + "T00:00:00Z").getUTCDay();
    if (j === 3 || j === 6) return d;
  }
  throw new Error("introuvable");
}

/** Clique le premier jour disponible du calendrier « sur place » et renvoie sa date. */
async function choisirJourSurPlace(page: Page, avecJour?: string): Promise<string> {
  const f = page.locator("form");
  const cible = avecJour ? f.locator(`button[data-date="${avecJour}"]`) : f.locator("table button:not([disabled])").first();
  if ((await cible.count()) === 0) await f.getByRole("button", { name: "Mois suivant" }).click();
  await cible.first().click();
  return f.locator('input[name="date"]').evaluate((el) => (el as HTMLInputElement).value);
}

async function cocherParfum(page: Page, categorie: string, parfum: string) {
  const cat = page.locator("form details", { hasText: categorie }).first();
  await cat.locator("summary").click();
  await cat.getByLabel(parfum, { exact: true }).check();
}

test.beforeEach(async ({ page }) => {
  await page.request.delete(`${MOCK}/__calls`);
});

test("page d'accueil : contenu, SEO, pas de défilement horizontal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Des donuts pour toutes vos occasions");
  await expect(page.getByRole("link", { name: "Faire ma demande" }).first()).toBeVisible();
  for (const t of ["Quelle est votre demande ?", "Comment ça marche ?", "Nos réalisations", "Parfums et prix", "Questions fréquentes"]) {
    await expect(page.getByRole("heading", { name: t })).toBeVisible();
  }
  await expect(page.getByText("3,50 €").first()).toBeVisible();
  await expect(page.getByText("1,75 €").first()).toBeVisible();
  await expect(page.getByText("Champagne").first()).toBeVisible();
  await expect(page.getByText("Ferrero Rocher").first()).toBeVisible();
  await expect(page.getByText("Rocher", { exact: true })).toHaveCount(0);
  await expect(page).toHaveTitle(/Donuts pour anniversaires, événements et professionnels à Lyon Part-Dieu/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  await expect(page.getByRole("link", { name: /Instagram @donutsanddonuts_lyonpartdieu/ }).first()).toBeVisible();
  const deborde = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(deborde).toBe(false);
});

test("accessibilité (axe, WCAG AA) : accueil + formulaire ouvert + mentions", async ({ page }) => {
  await page.goto("/");
  let r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations, JSON.stringify(r.violations, null, 1)).toEqual([]);

  await page.getByRole("button", { name: /Anniversaire/ }).click();
  await page.getByLabel("Sur place, à la boutique").check();
  await page.locator("form").getByRole("button", { name: "Envoyer ma demande" }).click(); // affiche les erreurs
  r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations, JSON.stringify(r.violations, null, 1)).toEqual([]);

  await page.goto("/mentions-legales");
  r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations, JSON.stringify(r.violations, null, 1)).toEqual([]);
});

test("formulaire vide : messages d'erreur et rien n'est envoyé", async ({ page }) => {
  const f = await ouvrir(page, /Commande personnalisée/);
  await f.getByRole("button", { name: "Envoyer ma demande" }).click();
  await expect(f.getByRole("alert")).toContainText("champs à corriger");
  await expect(f.getByText("Indiquez votre prénom.")).toBeVisible();
  await expect(f.getByText("Cochez cette case pour que la boutique puisse vous recontacter.")).toBeVisible();
  await expect(f.locator('[name="prenom"]')).toBeFocused();
  expect(await appels(page)).toHaveLength(0);
});

test("calendrier : dates à moins de 7 jours bloquées avec explication", async ({ page }) => {
  const f = await ouvrir(page, /Anniversaire/);
  await page.getByLabel("À emporter").check(); // la date apparaît dès ce choix
  const date = f.locator('[name="date"]');
  await expect(date).toHaveAttribute("min", dansJours(7));
  await expect(f.getByText(/au moins 7 jours/).first()).toBeVisible();
  await expect(f.getByText(/fermée le dimanche/).first()).toBeVisible();
  await coordonnees(page);
  await f.locator('[name="heure_retrait"]').fill("15:00");
  await f.locator('[name="nb_donuts"]').fill("12");
  await page.getByLabel(/Boîte\(s\)/).check();
  await finir(page, dansJours(3));
  await expect(f.getByText(/choisissez une date à partir de J\+7/)).toBeVisible();
  expect(await appels(page)).toHaveLength(0);
});

test("anniversaire sur place : calendrier mercredi/samedi dès J+5, créneaux d'1 h, 4 enfants et 1 adulte maximum", async ({ page }) => {
  const f = await ouvrir(page, /Anniversaire/);
  await expect(f.locator('input[name="date"]')).toHaveCount(0); // pas avant d'avoir choisi sur place / à emporter
  await page.getByLabel("Sur place, à la boutique").check();
  await expect(f.getByRole("table")).toBeVisible();
  await expect(f.getByText("Aucune date choisie pour l'instant.")).toBeVisible();
  await expect(f.getByLabel("11h00 – 12h00")).toHaveCount(0); // créneaux visibles seulement après avoir choisi une date

  // Seuls les mercredis et samedis, à partir de J+5, sont cliquables (mois affiché + mois suivant)
  const lire = () => f.locator("table button:not([disabled])").evaluateAll((bs) => bs.map((b) => (b as HTMLElement).dataset.date!));
  let dispos = await lire();
  await f.getByRole("button", { name: "Mois suivant" }).click();
  dispos = [...dispos, ...(await lire())];
  expect(dispos.length).toBeGreaterThan(0);
  for (const d of dispos) {
    expect([3, 6]).toContain(new Date(d + "T00:00:00Z").getUTCDay());
    expect(d >= dansJours(5)).toBe(true);
  }
  expect(dispos[0]).toBe(prochainJourOuvert(5)); // le premier jour proposé est bien le prochain mer./sam. à J+5 ou plus
  await f.getByRole("button", { name: "Mois précédent" }).click();

  const jour = await choisirJourSurPlace(page);
  await expect(f.getByText(/Date choisie/)).toContainText(String(Number(jour.slice(8))));
  const noms = await f.locator('input[name="creneau"]').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
  expect(noms).toEqual(CRENEAUX_ATTENDUS); // 5 créneaux d'1 h avec 30 min de pause
  await expect(f.getByText("4 enfants et 1 adulte maximum par créneau")).toBeVisible();
  await expect(f.locator('[name="enfants"]')).toHaveAttribute("max", "4");
  await expect(f.locator('[name="adultes"]')).toHaveAttribute("max", "1");
  await coordonnees(page);
  await f.getByLabel("14h00 – 15h00").check();
  await f.locator('[name="enfants"]').fill("5");
  await f.locator('[name="adultes"]').fill("2");
  await f.locator('[name="nb_donuts"]').fill("12");
  await page.getByLabel(/Boîte\(s\)/).check();
  await finir(page, null);
  await expect(f.getByText("Sur place, 4 enfants maximum par créneau.")).toBeVisible();
  await expect(f.getByText("Sur place, 1 adulte maximum par créneau.")).toBeVisible();
  expect(await appels(page)).toHaveLength(0);
});

test("anniversaire sur place : sans date, le message d'erreur s'affiche sur le calendrier", async ({ page }) => {
  const f = await ouvrir(page, /Anniversaire/);
  await page.getByLabel("Sur place, à la boutique").check();
  await coordonnees(page);
  await f.locator('[name="nb_donuts"]').fill("12");
  await page.getByLabel(/Boîte\(s\)/).check();
  await finir(page, null);
  await expect(f.getByText("Choisissez une date.")).toBeVisible();
  expect(await appels(page)).toHaveLength(0);
});

test("minimum de 6 donuts contrôlé", async ({ page }) => {
  const f = await ouvrir(page, /Anniversaire/);
  await coordonnees(page);
  await page.getByLabel("À emporter").check();
  await f.locator('[name="heure_retrait"]').fill("15:00");
  await f.locator('[name="nb_donuts"]').fill("3");
  await f.locator('[name="nb_minis"]').fill("2");
  await page.getByLabel(/Boîte\(s\)/).check();
  await finir(page);
  await expect(f.locator(".erreur", { hasText: /Minimum 6 donuts/ })).toBeVisible();
  expect(await appels(page)).toHaveLength(0);
});

test("ANNIVERSAIRE sur place : envoi de bout en bout + UTM", async ({ page }) => {
  await ouvrir(page, /Anniversaire/, "/?utm_source=instagram&utm_medium=bio&utm_campaign=noel");
  await coordonnees(page);
  const f = page.locator("form");
  await page.getByLabel("Sur place, à la boutique").check();
  const jour = await choisirJourSurPlace(page);
  await f.getByLabel("14h00 – 15h00").check();
  await f.locator('[name="enfants"]').fill("4");
  await f.locator('[name="adultes"]').fill("1");
  await f.locator('[name="age"]').fill("7");
  await f.locator('[name="prenom_fete"]').fill("Léa");
  await f.locator('[name="nb_donuts"]').fill("12");
  await f.locator('[name="nb_minis"]').fill("6");
  await page.getByLabel(/Pièce montée/).check();
  await f.locator('[name="deco"]').check();
  await cocherParfum(page, "Les Chocolatés", "Nutella");
  await cocherParfum(page, "Le Festif", "Champagne");
  await f.locator('[name="theme"]').fill("Licorne, rose et doré");
  await expect(f.getByText(/sans pouvoir les reproduire à l'identique/)).toBeVisible();
  await f.locator('input[type="file"]').setInputFiles(["public/images/donut-p8.webp", "public/images/salle-p28.webp"]);
  await expect(f.getByRole("button", { name: "Retirer la photo 2" })).toBeVisible();
  await finir(page, null);

  await expect(page.getByRole("status")).toContainText("Merci, la boutique vous recontacte sous 48 h");

  const c = await appels(page);
  const insert = c.find((x) => x.path === "/rest/v1/demandes" && x.method === "POST")!;
  expect(insert.headers.apikey).toBe("sb_secret_test");
  expect(insert.json).toMatchObject({
    type: "anniversaire",
    prenom: "Camille",
    nom: "Martin",
    email: "camille@example.com",
    date_souhaitee: jour,
    source: "Instagram",
    utm_source: "instagram",
    utm_medium: "bio",
    utm_campaign: "noel",
    details: {
      mode: "sur_place",
      creneau: "14h00 – 15h00",
      enfants: 4,
      adultes: 1,
      age: "7",
      prenom_fete: "Léa",
      nb_donuts: 12,
      nb_minis: 6,
      presentation: "piece-montee",
      deco: "on",
      parfums: ["Chocolatés : Nutella", "Festif : Champagne"],
      theme: "Licorne, rose et doré",
    },
  });
  const mail = c.find((x) => x.path === "/emails")!;
  expect(String(mail.json!.subject)).toMatch(/^\[ANNIVERSAIRE\] Camille Martin – /);
  expect(mail.json!.to).toEqual(["donutsdonuts.lyonpartdieu@gmail.com"]);
  expect(mail.json!.reply_to).toBe("camille@example.com");
  for (const t of ["Sur place", "14h00 – 15h00", "Léa", "Pièce montée", "Chocolatés : Nutella", "Licorne, rose et doré", "utm_source=instagram"]) {
    expect(String(mail.json!.text)).toContain(t);
  }
  const uploads = c.filter((x) => x.method === "POST" && x.path.startsWith("/storage/v1/object/inspirations/"));
  expect(uploads).toHaveLength(2);
  expect((insert.json!.details as { inspirations: string[] }).inspirations).toHaveLength(2);
  expect(String(mail.json!.text)).toContain("Photo d'inspiration 2");
  expect(c.some((x) => x.method === "PATCH")).toBe(true); // statut « e-mail envoyé » mis à jour
  // Une seule notification : pas d'e-mail au client
  expect(c.filter((x) => x.path === "/emails")).toHaveLength(1);
});

test("PERSONNALISÉE avec image d'inspiration : envoi de bout en bout", async ({ page }) => {
  await ouvrir(page, /Commande personnalisée/);
  await coordonnees(page);
  const f = page.locator("form");
  await page.getByLabel("Autre", { exact: true }).check();
  await f.locator('[name="evenement_autre"]').fill("Gender reveal");
  await f.locator('[name="theme"]').fill("Bleu et rose, message « Boy or girl ? »");
  await f.locator('input[type="file"]').setInputFiles("public/images/donut-p2.webp");
  await f.locator('[name="nb_minis"]').fill("24");
  await page.getByLabel(/Bouquet de brochettes/).check();
  await cocherParfum(page, "Les Fruités", "Framboise");
  await f.locator('[name="heure_retrait"]').fill("11:30");
  await finir(page);

  await expect(page.getByRole("status")).toContainText("Merci, la boutique vous recontacte sous 48 h");
  const c = await appels(page);
  const upload = c.find((x) => x.method === "POST" && x.path.startsWith("/storage/v1/object/inspirations/"))!;
  expect(["image/webp", "image/jpeg"]).toContain(upload.headers["content-type"]);
  expect(upload.size).toBeGreaterThan(1000);
  const insert = c.find((x) => x.path === "/rest/v1/demandes")!;
  expect(insert.json).toMatchObject({
    type: "personnalisee",
    image_path: expect.stringMatching(/\.(webp|jpg)$/),
    details: { evenement: "Autre", evenement_autre: "Gender reveal", nb_minis: 24, presentation: "brochettes", heure_retrait: "11:30" },
  });
  const mail = c.find((x) => x.path === "/emails")!;
  expect(String(mail.json!.subject)).toMatch(/^\[PERSONNALISÉE\] Camille Martin – /);
  expect(String(mail.json!.html)).toContain("Voir la photo");
  expect(String(mail.json!.text)).toContain("Autre : Gender reveal");
});

test("photos : 3 maximum, retrait possible", async ({ page }) => {
  const f = await ouvrir(page, /Anniversaire/);
  const input = f.locator('input[type="file"]');
  await input.setInputFiles(["public/images/donut-p2.webp", "public/images/donut-p7.webp", "public/images/donut-p8.webp", "public/images/donut-p12.webp"]);
  await expect(f.getByText(/3 photos maximum/)).toBeVisible();
  await expect(f.getByRole("img", { name: /Photo ajoutée/ })).toHaveCount(3);
  await expect(input).toHaveCount(0); // bouton d'ajout masqué une fois plein
  await f.getByRole("button", { name: "Retirer la photo 1" }).click();
  await expect(f.getByRole("img", { name: /Photo ajoutée/ })).toHaveCount(2);
  await expect(f.getByText("Ajouter une autre photo")).toBeVisible();
});

test("cartes : diaporama de photos (clic, flèches, points) sans ouvrir le formulaire", async ({ page }) => {
  await page.goto("/");
  const carrousel = page.getByRole("region", { name: /Photos : Anniversaire/ });
  const statut = carrousel.locator("p[aria-live]");
  await expect(statut).toHaveText("Photo 1 sur 4");
  await carrousel.getByRole("button", { name: "Photo suivante" }).click();
  await expect(statut).toHaveText("Photo 2 sur 4");
  await carrousel.getByRole("img").nth(1).click(); // un clic sur l'image visible fait avancer
  await expect(statut).toHaveText("Photo 3 sur 4");
  await carrousel.getByRole("button", { name: "Photo précédente" }).click();
  await expect(statut).toHaveText("Photo 2 sur 4");
  await carrousel.getByRole("button", { name: "Afficher la photo 4" }).click();
  await expect(statut).toHaveText("Photo 4 sur 4");
  await carrousel.getByRole("button", { name: "Photo suivante" }).click(); // reboucle
  await expect(statut).toHaveText("Photo 1 sur 4");
  // Clavier : on atteint la zone avec Tab, puis flèche droite
  await carrousel.getByRole("group").first().evaluate((el) => (el.parentElement as HTMLElement).focus());
  await page.keyboard.press("ArrowRight");
  await expect(statut).toHaveText("Photo 2 sur 4");
  // Clics rapides : deux « suivante » d'affilée = deux photos plus loin
  const suivante = carrousel.getByRole("button", { name: "Photo suivante" });
  await suivante.click();
  await suivante.click();
  await expect(statut).toHaveText("Photo 4 sur 4");
  await suivante.click();
  await expect(statut).toHaveText("Photo 1 sur 4");
  await expect(page.locator("form")).toHaveCount(0); // aucun formulaire ouvert par ces clics
  // La carte pro n'a qu'une photo : pas de flèches
  await expect(page.getByRole("region", { name: /Photos : Vous êtes un professionnel/ }).getByRole("button")).toHaveCount(0);
});

test("galerie : 4 photos visibles sur grand écran, défilement pour voir les autres", async ({ page }) => {
  await page.goto("/");
  const galerie = page.getByRole("region", { name: /Galerie de photos/ });
  const piste = galerie.locator("ul");
  await piste.scrollIntoViewIfNeeded();
  const largeur = page.viewportSize()!.width;
  const photos = piste.locator("li");
  expect(await photos.count()).toBeGreaterThan(4);
  const visible = async (i: number) =>
    photos.nth(i).evaluate((li) => {
      const r = li.getBoundingClientRect();
      const c = li.parentElement!.getBoundingClientRect();
      return r.left >= c.left - 1 && r.right <= c.right + 1;
    });
  expect(await piste.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true); // il y a de quoi défiler
  if (largeur >= 1024) {
    for (let i = 0; i < 4; i++) expect(await visible(i)).toBe(true);
    expect(await visible(4)).toBe(false);
    await expect(galerie.getByRole("button", { name: "Photos précédentes" })).toHaveCount(0);
    await galerie.getByRole("button", { name: "Photos suivantes" }).click();
    await expect.poll(() => piste.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
    await expect(galerie.getByRole("button", { name: "Photos précédentes" })).toBeVisible();
  } else {
    // Téléphone : plus d'une photo mais pas la suivante entière (elle dépasse), balayage natif
    expect(await visible(0)).toBe(true);
    expect(await visible(1)).toBe(false);
    await piste.evaluate((el) => el.scrollBy({ left: el.clientWidth, behavior: "instant" }));
    await expect.poll(() => piste.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  }
  const deborde = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(deborde).toBe(false);
});

test("PRO récurrent, parfums à définir : envoi de bout en bout", async ({ page }) => {
  await ouvrir(page, /Vous êtes un professionnel/);
  await coordonnees(page);
  const f = page.locator("form");
  await f.locator('[name="societe"]').fill("Traiteur Bellecour");
  await f.locator('[name="secteur"]').selectOption("Traiteur");
  await f.locator('[name="siret"]').fill("123 456 789 00012");
  await page.getByLabel("Revente").check();
  await f.locator('[name="quantite"]').fill("100 donuts");
  await page.getByLabel("Récurrente").check();
  await f.locator('[name="rythme"]').fill("Chaque vendredi");
  await f.locator('[name="budget"]').fill("300 € par semaine");
  await page.getByLabel("À définir ensemble").check();
  await expect(f.getByText("3,50 €")).toHaveCount(0); // pas de prix pour les pros
  await finir(page);

  await expect(page.getByRole("status")).toContainText("Merci, la boutique vous recontacte sous 48 h");
  const c = await appels(page);
  expect(c.find((x) => x.path === "/rest/v1/demandes")!.json).toMatchObject({
    type: "pro",
    details: { societe: "Traiteur Bellecour", secteur: "Traiteur", siret: "12345678900012", usage: "Revente", frequence: "recurrente", rythme: "Chaque vendredi", parfums: ["À définir ensemble"] },
  });
  const mail = c.find((x) => x.path === "/emails")!;
  expect(String(mail.json!.subject)).toMatch(/^\[PRO\] Camille Martin \(Traiteur Bellecour\) – /);
  expect(String(mail.json!.text)).toContain("Date de la première commande");
});

test("anti-spam : champ invisible rempli → rien n'est enregistré ni envoyé", async ({ page }) => {
  const fd = {
    type: "pro",
    site_web: "http://spam.example",
    t: String(Date.now() - 60_000),
    prenom: "Bot",
    nom: "Bot",
    telephone: "0612345678",
    email: "bot@example.com",
    date: dansJours(10),
    rgpd: "on",
  };
  const res = await page.request.post("/api/demande", { multipart: fd });
  expect(res.ok()).toBe(true);
  // Envoi trop rapide (moins de 3 s) → ignoré aussi
  const res2 = await page.request.post("/api/demande", { multipart: { ...fd, site_web: "", t: String(Date.now()) } });
  expect(res2.ok()).toBe(true);
  expect(await appels(page)).toHaveLength(0);
});

test("le serveur refuse une date à moins de 7 jours même hors du site", async ({ page }) => {
  const res = await page.request.post("/api/demande", {
    multipart: {
      type: "pro", t: String(Date.now() - 60_000), prenom: "A", nom: "B", telephone: "0612345678", email: "a@example.com",
      date: dansJours(2), rgpd: "on", societe: "X", secteur: "Entreprise", usage: "Revente", quantite: "10", frequence: "ponctuelle",
      budget: "100 €", parfums: "À définir ensemble",
    },
  });
  expect(res.status()).toBe(422);
  expect((await res.json()).erreurs.date).toMatch(/J\+7/);
  expect(await appels(page)).toHaveLength(0);
});

test("le serveur refuse un anniversaire sur place un jour fermé ou trop proche", async ({ page }) => {
  const base = {
    type: "anniversaire", t: String(Date.now() - 60_000), prenom: "A", nom: "B", telephone: "0612345678", email: "a@example.com",
    rgpd: "on", mode: "sur_place", creneau: "14h00 – 15h00", enfants: "2", adultes: "1", nb_donuts: "12", presentation: "boite",
  };
  // un mardi à plus de 5 jours
  let ferme = "";
  for (let i = 8; i < 22 && !ferme; i++) if (new Date(dansJours(i) + "T00:00:00Z").getUTCDay() === 2) ferme = dansJours(i);
  const r1 = await page.request.post("/api/demande", { multipart: { ...base, date: ferme } });
  expect(r1.status()).toBe(422);
  expect((await r1.json()).erreurs.date).toMatch(/mercredi et le samedi/);
  // un mercredi/samedi à moins de 5 jours
  let proche = "";
  for (let i = 0; i < 5 && !proche; i++) if ([3, 6].includes(new Date(dansJours(i) + "T00:00:00Z").getUTCDay())) proche = dansJours(i);
  if (proche) {
    const r2 = await page.request.post("/api/demande", { multipart: { ...base, date: proche } });
    expect(r2.status()).toBe(422);
    expect((await r2.json()).erreurs.date).toMatch(/au moins 5 jours/);
  }
  // un créneau inventé
  const r3 = await page.request.post("/api/demande", { multipart: { ...base, date: prochainJourOuvert(5), creneau: "12h00 – 13h00" } });
  expect(r3.status()).toBe(422);
  expect((await r3.json()).erreurs.creneau).toBeTruthy();
  expect(await appels(page)).toHaveLength(0);
});
