# Consignes pour Claude – site Thérèse

Site vitrine statique (Astro 6) de la revue trimestrielle Thérèse. Les personnes qui
demandent des modifications ne sont pas techniciennes : réponds en français simple,
sans jargon, et dis toujours ce qui a changé sur le site, pas dans le code.

## Où se trouve quoi

- **Contenu** (ce qu'on modifie au quotidien) : `src/content/*.json`
  - `site.json` : nom, bandeau d'annonce, menu, pied de page
  - `accueil.json` : présentation, sommaire du numéro, éditorial
  - `abonnements.json` : offres, prix CB / SEPA, liens boutique
- **Validation du contenu** : `src/lib/contenu.ts` (schémas Zod ; la construction échoue si le contenu est invalide)
- **Mise en forme** : `src/components/`, `src/layouts/`, `src/styles/global.css`
- **Images** : `public/images/`, référencées en `/images/fichier.jpg`

## Règles pour une demande de contenu (textes, liens, images, tarifs)

1. Ne modifie **que** les fichiers de `src/content/` (et `public/images/` pour une image).
   Ne touche pas aux composants, styles ou schémas pour une simple demande de contenu.
2. Les prix sont des **nombres en euros** (`4.9`, `45`), jamais des chaînes, jamais avec « € ».
   L'économie de l'offre annuelle est calculée automatiquement : ne l'écris nulle part.
3. Conserve la typographie française : apostrophe typographique (’), espaces insécables
   avant « € » gérées par le formatage, guillemets « ».
4. Un lien inconnu reste `"#"`. Une image absente reste `""`. N'invente jamais un nom,
   une date, un prix ou une adresse : laisse le texte entre crochets `[…]` et signale-le.
5. Si la demande touche aux tarifs, rappelle que la boutique externe doit afficher les
   mêmes prix et que sa mise à jour n'est pas faite par ce dépôt.

## Règles pour une demande de mise en forme ou une nouvelle page

- Réutilise les variables de `src/styles/global.css` (couleurs, polices) ; pas de couleur en dur nouvelle.
- Tout nouveau contenu modifiable va dans un fichier de `src/content/` avec son schéma dans `src/lib/contenu.ts`,
  jamais en dur dans un composant.
- Accessibilité : vrais `<a>`/`<button>`, textes alternatifs, contrastes suffisants, cibles ≥ 44 px, page utilisable sur mobile.
- Pas de dépendance nouvelle sans le signaler ; pas de service tiers qui charge des ressources externes (RGPD).

## Circuit de publication (obligatoire)

- **Ne pousse jamais directement sur `main`.** Crée une branche (`contenu/…` ou `design/…`),
  fais un commit au message clair en français, pousse la branche et ouvre une pull request
  décrivant le changement visible.
- Vérifie que le workflow « Vérification du site » passe ; s'il échoue, lis le journal
  (le message indique le fichier et le champ) et corrige avant de demander la relecture.
- C'est une personne qui fusionne la pull request. Ne la fusionne pas toi-même sauf demande explicite.

## Commandes

```sh
npm install
npm run build    # doit réussir avant toute pull request (si l'environnement le permet)
npm run dev
```
