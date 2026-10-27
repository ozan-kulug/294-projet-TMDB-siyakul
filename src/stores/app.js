/**
 * stores/app.js
 *
 * Store de l'interface : état partagé entre le layout et les pages
 * (ex. la fenêtre de recherche ouverte depuis la barre latérale ou depuis l'accueil)
 */

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    rechercheOuverte: false,
  }),

  actions: {
    /**
     * Ouvre la fenêtre de recherche
     */
    ouvrirRecherche () {
      this.rechercheOuverte = true
    },

    /**
     * Ferme la fenêtre de recherche
     */
    fermerRecherche () {
      this.rechercheOuverte = false
    },
  },
})
