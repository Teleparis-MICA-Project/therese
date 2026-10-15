// @ts-check
import { defineConfig } from 'astro/config';

// Site statique : chaque modification du dépôt reconstruit les pages HTML.
export default defineConfig({
  // À remplacer par l'adresse définitive du site lors de la mise en production.
  site: 'https://example.com',
  output: 'static',
  trailingSlash: 'ignore',
});
