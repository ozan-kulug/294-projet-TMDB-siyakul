<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useMovieStore } from '@/stores/movieStore'

  // Charge les films et les genres une seule fois au démarrage
  onMounted(async () => {
    const movieStore = useMovieStore()
    await movieStore.init()
  })
</script>

<!-- Style global (sans « scoped ») : il s'applique aussi aux images créées par v-img dans tous les composants -->
<style>
  /* Image de fond utilisée à la place d'une affiche manquante : elle est carrée avec des
     bandes noires en haut et en bas, on zoome pour ne garder que l'image (16:9) */
  .is-backdrop .v-img__img {
    transform: scale(1.78);
  }
</style>
