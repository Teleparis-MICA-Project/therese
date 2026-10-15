# Thérèse – site vitrine

Site vitrine de la revue trimestrielle **Thérèse**, construit avec [Astro](https://astro.build).
Le contenu (textes, liens, images, tarifs) est séparé du code : il vit dans de simples
fichiers du dossier `src/content/`, et chaque modification de ce dépôt reconstruit le site.

## Comment le site est organisé

```
src/
├─ content/              ← LE CONTENU : c'est ici qu'on modifie le site au quotidien
│  ├─ site.json          · nom, bandeau d'annonce, menu, liens du pied de page
│  ├─ accueil.json       · présentation, sommaire du numéro, éditorial
│  └─ abonnements.json   · offres, prix CB / SEPA, liens vers la boutique
├─ components/           ← la mise en forme de chaque bloc (en-tête, sommaire…)
├─ layouts/Base.astro    ← le gabarit commun à toutes les pages
├─ lib/contenu.ts        ← la vérification automatique du contenu
├─ pages/                ← les pages du site (index.astro = page d'accueil)
└─ styles/global.css     ← la charte : couleurs, polices
public/
├─ images/               ← les images (couvertures, visuels d'articles)
└─ favicon.svg
```

## Modifier le contenu

### Avec Claude (recommandé)

Demandez la modification en langage courant, par exemple :

- « Passe l'offre annuelle SEPA à 42 € »
- « Ajoute un article "Histoire" au sommaire, intitulé … »
- « Remplace le lien de la page Contact par https://… »

Claude modifie le fichier concerné sur une branche à part et ouvre une
**demande de fusion** (pull request). Une vérification automatique construit le site ;
si un aperçu est configuré chez l'hébergeur, il apparaît dans la demande de fusion.
Une personne relit puis clique sur **Merge** : la modification est mise en ligne.

### À la main

Ouvrez le fichier voulu dans `src/content/` sur GitHub, cliquez sur le crayon
(« Edit this file »), modifiez le texte **entre les guillemets**, puis choisissez
« Create a new branch and start a pull request ».

Règles à respecter :

- Les **prix** s'écrivent comme des nombres, sans « € » ni guillemets, avec un point :
  `4.9` pour 4,90 €, `45` pour 45 €.
- L'**économie** affichée sur l'offre annuelle est calculée automatiquement : il n'y a rien à saisir.
- Les **liens** commencent par `https://`, `/`, `#` ou `mailto:`. `#` signifie « pas encore de lien ».
- Les **images** se déposent dans `public/images/` et se référencent ainsi : `/images/nom-du-fichier.jpg`.
  Laissez `""` pour afficher un visuel de remplacement.

Si une règle n'est pas respectée, la vérification échoue et indique le fichier et le champ en cause :
rien n'est mis en ligne tant que ce n'est pas corrigé.

## Pour les développeurs

Prérequis : Node.js 22.12 ou plus récent.

```sh
npm install
npm run dev      # serveur de développement sur http://localhost:4321
npm run build    # construit le site statique dans dist/
npm run preview  # sert localement le site construit
```

### Hébergement

Le site est entièrement statique : n'importe quel hébergeur de fichiers convient.
Paramètres à indiquer (Netlify, Cloudflare Pages, Vercel…) :

| Réglage | Valeur |
|---|---|
| Commande de construction | `npm run build` |
| Dossier publié | `dist` |
| Version de Node | 22 |

Pensez à remplacer `site` dans `astro.config.mjs` par l'adresse définitive du site.
