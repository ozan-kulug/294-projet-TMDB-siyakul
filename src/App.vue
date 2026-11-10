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
