# Landing page de commandes – Donuts & Donuts Lyon Part-Dieu

Page unique (mobile d'abord) pour recueillir les demandes : **Anniversaire**, **Commande personnalisée**, **Professionnel**.

- **Site** : Next.js, hébergé sur Vercel (dossier racine du projet Vercel : `landing`).
- **Demandes** : enregistrées dans Supabase (table `demandes`), images d'inspiration dans le stockage privé `inspirations`.
- **E-mail** : une notification par demande à `donutsdonuts.lyonpartdieu@gmail.com` via Resend. L'objet commence par `[ANNIVERSAIRE]`, `[PERSONNALISÉE]` ou `[PRO]`. « Répondre » écrit directement au client. Aucun e-mail n'est envoyé au client : il voit l'écran « Merci, la boutique vous recontacte sous 48 h ».

---

## 1. Mise en ligne (une seule fois)

### Supabase
1. Projet Supabase → **SQL Editor** → **New query** → coller tout le contenu de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
2. **Project Settings → API Keys** (ou **Data API**) : noter
   - l'**URL du projet** (`https://xxxx.supabase.co`) ;
   - la **clé secrète** (`sb_secret_…`, ou l'ancienne clé `service_role`). Elle ne doit jamais apparaître dans le code ni dans une conversation.

### Resend
Compte créé **avec l'adresse donutsdonuts.lyonpartdieu@gmail.com** (sans nom de domaine, Resend n'envoie qu'à l'adresse du titulaire du compte). **API Keys → Create API key** (Sending access).

### Vercel
1. **Add New → Project** → importer le dépôt GitHub `Donuts`.
2. **Root Directory** : `landing`.
3. **Environment Variables** :

| Nom | Valeur |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SECRET_KEY` | clé secrète Supabase |
| `RESEND_API_KEY` | clé Resend |
| `NOTIFY_EMAIL` | `donutsdonuts.lyonpartdieu@gmail.com` |
| `NOTIFY_EMAIL_STRASBOURG` *(facultatif)* | adresse qui reçoit les demandes de Strasbourg. Sans cette variable, elles arrivent sur `NOTIFY_EMAIL`. **Sans nom de domaine vérifié chez Resend, seule l'adresse du compte Resend peut recevoir** : si une autre adresse est refusée, la demande est envoyée à `NOTIFY_EMAIL` avec la mention « à transmettre à … ». |
| `SITE_URL` *(facultatif)* | adresse publique définitive, ex. `https://commandes-donuts-lyon.vercel.app` |

4. **Deploy**. Chaque modification poussée sur la branche `main` est ensuite mise en ligne automatiquement.

**Deux boutiques, un seul site.** L'adresse de base du site (`/`) pose la question « Lyon ou Strasbourg ? », puis envoie vers la page de la boutique. Pour les bios Instagram, un lien direct par compte (sans passer par la question) :
- Lyon : `https://<votre-adresse>.vercel.app/lyon?utm_source=instagram&utm_medium=bio`
- Strasbourg : `https://<votre-adresse>.vercel.app/strasbourg?utm_source=instagram&utm_medium=bio`

Les anciens liens du type `/?boutique=lyon&utm_source=instagram` redirigent automatiquement vers `/lyon?utm_source=instagram`.

---

## 2. Voir les demandes

Supabase → **Table Editor** :
- **`demandes_lisibles`** : vue pratique, la plus récente en premier (**boutique**, type, client, téléphone, date souhaitée, quantités, provenance UTM…). Colonne `boutique` : Lyon ou Strasbourg (filtre : **Filter** → `boutique`). Après une mise à jour de ce fichier, relancer `supabase/schema.sql` dans le SQL Editor pour que la vue la contienne.
- **`demandes`** : la table complète. Les champs propres à chaque formulaire sont dans la colonne `details`.
- Filtrer par type : bouton **Filter** → `type` = `anniversaire` / `personnalisee` / `pro`.
- Suivi : modifier la colonne `statut` dans `demandes` (ex. `rappelée`, `confirmée`, `annulée`).
- Export : bouton **Export → CSV**.
- Images d'inspiration : **Storage → inspirations** (le lien est aussi dans l'e-mail, valable 1 an).
- `email_envoye = false` signale une demande dont l'e-mail n'est pas parti : elle n'est pas perdue, il suffit de la lire ici.

---

## 3. Mettre à jour le contenu

| Je veux changer… | Fichier |
|---|---|
| **Boutiques** (adresse, horaires, Instagram, e-mail, sur place oui/non) : bloc `BOUTIQUES`, Lyon et Strasbourg ; chaque boutique a sa page (`/lyon`, `/strasbourg`) | [`src/lib/catalogue.ts`](src/lib/catalogue.ts) |
| Prix, minimum de commande, offre « 12 = 1 offert », présentations, options (dont `BOUGIE` 2 € et `BALLON` 3 € par enfant, anniversaire sur place), **parfums**, adresse, horaires, Instagram | [`src/lib/catalogue.ts`](src/lib/catalogue.ts) |
| Anniversaire sur place : jours ouverts (mercredi, samedi), délai (5 jours), créneaux (1 h, pause de 30 min, 11h-18h), limites d'invités | [`src/lib/catalogue.ts`](src/lib/catalogue.ts) : `JOURS_SUR_PLACE`, `DELAI_SUR_PLACE_JOURS`, `SUR_PLACE_DEBUT/FIN`, `CRENEAU_DUREE/PAUSE`, `MAX_ENFANTS/ADULTES_SUR_PLACE` |
| Textes des pages boutique, étapes, FAQ, galerie | [`src/app/[boutique]/page.tsx`](src/app/%5Bboutique%5D/page.tsx) |
| Première page « Lyon ou Strasbourg ? » | [`src/app/page.tsx`](src/app/page.tsx) |
| Photos du diaporama de chaque carte (Anniversaire, Personnalisée, Pro) | [`src/components/Demandes.tsx`](src/components/Demandes.tsx) : liste `photos` de la carte (une ligne par photo) |
| Mentions légales (bloc `EDITEUR` **à compléter**) | [`src/app/mentions-legales/page.tsx`](src/app/mentions-legales/page.tsx) |
| Champs des formulaires et règles (J+7, horaires de retrait…) | [`src/lib/schema.ts`](src/lib/schema.ts), [`src/components/FormulaireDemande.tsx`](src/components/FormulaireDemande.tsx) |
| Couleurs de la charte | [`src/app/globals.css`](src/app/globals.css) (bloc `@theme`) |

Le plus simple : modifier le fichier directement sur GitHub (icône crayon → **Commit changes**). Vercel remet le site en ligne en 1 à 2 minutes.

### Photos
1. Déposer les originaux dans `photos-source/` (ce dossier n'est pas envoyé sur GitHub) :
   - `hero-*.jpg` : photo du haut de page ;
   - `donut-*.png` : donut détouré (fond transparent), posé automatiquement sur un fond rose ;
   - tout autre nom : photo de galerie.
2. `npm run images` : crée les versions légères dans `public/images/` (WebP). Ensuite, Next.js sert automatiquement de l'AVIF/WebP à la bonne taille, avec chargement différé.
3. Ajouter ou retirer la photo dans la liste `GALERIE` de `src/app/page.tsx`.

---

## 4. Développement et vérifications

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # règles de validation (dates J+7, minimum, SIRET…)
npm run build
npm run test:e2e     # parcours complets mobile + ordinateur, avec un faux Supabase/Resend local
```

Les tests de bout en bout (`e2e/`) remplissent et envoient chacun des 3 formulaires, vérifient l'enregistrement (type, champs, UTM), l'e-mail (objet `[TYPE]`, contenu complet), le blocage des dates à moins de 7 jours, l'anti-spam (champ invisible + délai minimum), le minimum de 6 donuts, l'absence de défilement horizontal sur mobile et l'accessibilité (axe, WCAG 2.2 AA).

Anti-spam : champ invisible `site_web` + envoi refusé s'il arrive moins de 3 secondes après l'affichage du formulaire. Les robots reçoivent une fausse confirmation et rien n'est enregistré.
