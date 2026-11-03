/**
 * stores/app.js
 *
 * Store de l'interface : état partagé entre le layout et les pages
 * (ex. la loupe de la barre latérale qui demande le champ de recherche de l'accueil)
 */

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    rechercheDemandee: false,
  }),

  actions: {
    /**
     * Demande à l'accueil de donner le focus au champ de recherche
     */
    demanderRecherche () {
      this.rechercheDemandee = true
    },

    /**
     * Le champ de recherche a reçu le focus : la demande est terminée
     */
    terminerRecherche () {
      this.rechercheDemandee = false
    },
  },
})
