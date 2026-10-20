<template>
  <!-- Carte d'un film : affiche, titre, année et note. Un clic ouvre la page du film -->
  <RouterLink class="movie-card" :to="`/movies/${movie.id}`">
    <v-icon icon="mdi-movie-outline" size="32" />
    <v-img
      :alt="movie.title"
      class="movie-card__img"
      :class="{ 'is-backdrop': !movie.posterPath }"
      cover
      :src="movieStore.getImageUrl(movie.posterPath || movie.backdropPath)"
    />
    <span class="movie-card__title">
      {{ movie.title }}
      <small class="d-block">{{ movie.releaseDate.slice(0, 4) }} • ⭐ {{ movie.voteAverage.toFixed(1) }}</small>
    </span>
  </RouterLink>
</template>

<script setup>
  import { RouterLink } from 'vue-router'
  import { useMovieStore } from '@/stores/movieStore'

  defineProps({
    movie: {
      type: Object,
      required: true,
    },
  })

  const movieStore = useMovieStore()
</script>

<style scoped>
  .movie-card {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 8px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    text-decoration: none;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .movie-card:hover {
    transform: translateY(-4px);
    border-color: rgba(var(--v-theme-on-surface), 0.3);
  }

  .movie-card__img {
    position: absolute;
    inset: 0;
  }

  .movie-card__title {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 24px 12px 10px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
    color: #fff;
    font-weight: 500;
    line-height: 1.3;
  }

  .movie-card__title small {
    opacity: 0.8;
    font-weight: 400;
  }

  /* Image de fond utilisée à la place d'une affiche manquante : elle est carrée avec des
     bandes noires en haut et en bas, on zoome pour ne garder que l'image (16:9) */
  .is-backdrop :deep(.v-img__img) {
    transform: scale(1.78);
  }
</style>
