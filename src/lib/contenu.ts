/**
 * Chargement et validation du contenu du site.
 *
 * Tout le contenu modifiable vit dans `src/content/*.json`.
 * Ce fichier vérifie, au moment de la construction, que ce contenu est
 * complet et cohérent : si un prix est mal saisi ou un champ oublié,
 * la construction échoue avec un message clair au lieu de publier une
 * page cassée.
 */
import { z } from 'astro/zod';

import siteBrut from '../content/site.json';
import accueilBrut from '../content/accueil.json';
import abonnementsBrut from '../content/abonnements.json';
import mentionsLegalesBrut from '../content/mentions-legales.json';

/* ------------------------------------------------------------------ */
/* Schémas                                                             */
/* ------------------------------------------------------------------ */

const texte = z.string().trim().min(1, 'Ce texte ne peut pas être vide.');

/** Un lien : ancre (#…), chemin du site (/…) ou adresse complète (https://…). */
const lien = z
  .string()
  .trim()
  .refine(
    (v) => v === '#' || v.startsWith('#') || v.startsWith('/') || /^https?:\/\//.test(v) || v.startsWith('mailto:'),
    'Un lien doit commencer par « # », « / », « https:// » ou « mailto: ».',
  );

/** Une image optionnelle : chaîne vide, ou chemin vers public/images (ex. « /images/couverture.jpg »). */
const image = z
  .string()
  .trim()
  .refine((v) => v === '' || v.startsWith('/images/') || /^https:\/\//.test(v), 'Une image doit être vide ou commencer par « /images/ ».');

/** Un prix en euros, positif, avec au plus deux décimales. */
const prix = z
  .number()
  .positive('Un prix doit être supérieur à zéro.')
  .refine((v) => Math.abs(Math.round(v * 100) - v * 100) < 1e-6, 'Un prix ne peut pas avoir plus de deux décimales.');

const bouton = z.object({ libelle: texte, lien });

const siteSchema = z.object({
  nom: texte,
  sousTitre: texte,
  description: texte,
  bandeau: z.string().trim(),
  menu: z.array(z.object({ libelle: texte, lien })).min(1),
  boutonAbonnement: bouton,
  piedDePage: z.object({
    accroche: texte,
    liens: z.array(z.object({ libelle: texte, lien })),
    mentionEditeur: z.string().trim(),
  }),
});

const accueilSchema = z.object({
  presentation: z.object({
    surtitre: texte,
    titre: texte,
    texte: texte,
    boutonPrincipal: bouton,
    boutonSecondaire: bouton,
    couverture: z.object({
      numero: texte,
      image,
      texteAlternatif: texte,
      legendeSansImage: z.string().trim(),
    }),
  }),
  sommaire: z.object({
    titre: texte,
    lienComplet: bouton,
    articles: z
      .array(
        z.object({
          rubrique: texte,
          titre: texte,
          chapo: z.string().trim(),
          auteur: z.string().trim(),
          image,
          lien: z.union([z.literal(''), lien]),
        }),
      )
      .min(1, 'Le sommaire doit contenir au moins un article.'),
  }),
  editorial: z.object({
    surtitre: texte,
    extrait: texte,
    signature: z.string().trim(),
    bouton,
  }),
});

const offreSchema = z.object({
  identifiant: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'L’identifiant d’une offre ne contient que des minuscules, chiffres et tirets.'),
  nom: texte,
  periode: z.enum(['mois', 'an']),
  prixCarteBancaire: prix,
  prixSepa: prix,
  afficherEconomie: z.boolean(),
  bouton: z.object({ libelle: texte, lienCarteBancaire: lien, lienSepa: lien }),
});

const abonnementsSchema = z.object({
  surtitre: texte,
  titre: texte,
  texte: texte,
  noteBoutique: z.string().trim(),
  offres: z
    .array(offreSchema)
    .min(1, 'Il faut au moins une offre d’abonnement.')
    .refine((offres) => new Set(offres.map((o) => o.identifiant)).size === offres.length, 'Deux offres ont le même identifiant.'),
});

const mentionsLegalesSchema = z.object({
  titre: texte,
  introduction: z.string().trim(),
  miseAJour: z.string().trim(),
  sections: z
    .array(
      z.object({
        titre: texte,
        informations: z.array(z.object({ libelle: texte, valeur: texte, lien: lien.optional() })).default([]),
        paragraphes: z.array(texte).default([]),
        lien: bouton.optional(),
      }),
    )
    .min(1, 'Les mentions légales doivent contenir au moins une rubrique.'),
});

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function valider<S extends z.ZodType>(schema: S, donnees: unknown, fichier: string): z.output<S> {
  const resultat = schema.safeParse(donnees);
  if (!resultat.success) {
    const details = resultat.error.issues
      .map((i) => `  • ${i.path.length ? i.path.map(String).join(' › ') : '(racine)'} : ${i.message}`)
      .join('\n');
    throw new Error(`Contenu invalide dans src/content/${fichier} :\n${details}`);
  }
  return resultat.data;
}

export const site = valider(siteSchema, siteBrut, 'site.json');
export const accueil = valider(accueilSchema, accueilBrut, 'accueil.json');
export const abonnements = valider(abonnementsSchema, abonnementsBrut, 'abonnements.json');
export const mentionsLegales = valider(mentionsLegalesSchema, mentionsLegalesBrut, 'mentions-legales.json');

/* ------------------------------------------------------------------ */
/* Prix                                                                */
/* ------------------------------------------------------------------ */

/** Les calculs se font en centimes pour éviter les erreurs d'arrondi. */
const enCentimes = (euros: number) => Math.round(euros * 100);

/** Formate un prix à la française : « 4,90 € », « 49 € ». */
export function formaterPrix(euros: number): string {
  const centimes = enCentimes(euros);
  const entier = centimes % 100 === 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: entier ? 0 : 2,
    maximumFractionDigits: entier ? 0 : 2,
  }).format(centimes / 100);
}

export type ModePaiement = 'carteBancaire' | 'sepa';
export type Offre = z.infer<typeof offreSchema>;

export const prixSelonMode = (offre: Offre, mode: ModePaiement) =>
  mode === 'carteBancaire' ? offre.prixCarteBancaire : offre.prixSepa;

/**
 * Économie d'une offre annuelle par rapport à douze mois de l'offre mensuelle,
 * pour un même mode de paiement. Calculée automatiquement : il n'y a jamais
 * à la saisir à la main. Renvoie `null` si elle n'a pas de sens.
 */
export function economieAnnuelle(offre: Offre, mode: ModePaiement): number | null {
  if (!offre.afficherEconomie || offre.periode !== 'an') return null;
  const mensuelle = abonnements.offres.find((o) => o.periode === 'mois');
  if (!mensuelle) return null;
  const economie = enCentimes(prixSelonMode(mensuelle, mode)) * 12 - enCentimes(prixSelonMode(offre, mode));
  return economie > 0 ? economie / 100 : null;
}
