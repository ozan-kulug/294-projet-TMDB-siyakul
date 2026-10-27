<template>
  <!-- Barre latérale commune à toutes les pages -->
  <AppSidebar @rechercher="appStore.ouvrirRecherche()" />

  <v-main>
    <router-view />
  </v-main>

  <AppFooter />

  <!-- Fenêtre de recherche, ouverte depuis la barre latérale ou depuis l'accueil -->
  <SearchDialog :ouvert="appStore.rechercheOuverte" @fermer="appStore.fermerRecherche()" />
</template>

<script setup>
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
</script>
