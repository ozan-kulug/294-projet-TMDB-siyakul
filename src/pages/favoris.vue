<template>
  <v-container class="pa-4 pa-sm-6" fluid>
    <h1 class="text-h4 font-weight-bold mb-6">
      Mes favoris ({{ movieStore.totalFavorites }})
    </h1>

    <!-- Aucun favori -->
    <v-alert
      v-if="movieStore.totalFavorites === 0"
      text="Cliquez sur le cœur d'un film pour l'ajouter à vos favoris."
      title="Vous n'avez pas encore de favoris"
      type="info"
      variant="tonal"
    />

    <!-- Les mêmes cartes que sur l'accueil -->
    <v-row v-else>
      <v-col
        v-for="movie in movieStore.getFavorites"
        :key="movie.id"
        cols="6"
        lg="2"
        md="3"
        sm="4"
      >
        <MovieCard :movie="movie" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { useMovieStore } from '@/stores/movieStore'

  const movieStore = useMovieStore()
</script>
