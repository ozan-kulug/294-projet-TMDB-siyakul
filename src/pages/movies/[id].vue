<template>
  <div class="page">
    <AppSidebar @search="searchOpen = true" />
    <SearchDialog v-model="searchOpen" />

    <div class="content">
      <!-- Chargement -->
      <div v-if="loading" class="state">
        <v-progress-circular color="primary" indeterminate />
      </div>

      <!-- Erreur (ex. film introuvable) -->
      <div v-else-if="error" class="state">
        <v-alert
          :text="error"
          title="Impossible d'afficher ce film"
          type="error"
          variant="tonal"
        />
        <v-btn class="mt-4" prepend-icon="mdi-arrow-left" to="/" variant="text">
          Retour à l'accueil
        </v-btn>
      </div>

      <section v-else-if="movie" class="movie">
        <!-- Informations principales -->
        <header class="movie__header">
          <h1 class="movie__title">{{ movie.title }}</h1>
          <p class="movie__meta">
            <span>{{ releaseDate(movie) }}</span>
            <span>{{ movie.originalLanguage?.toUpperCase() }}</span>
            <span>Note {{ rating(movie) }}</span>
          </p>
        </header>

        <!-- Affiche -->
        <div class="movie__poster">
          <v-icon icon="mdi-movie-outline" size="48" />
          <v-img :alt="movie.title" class="movie__poster-img" cover :src="posterUrl(movie)" />
        </div>

        <!-- Résumé -->
        <section class="movie__overview">
          <h2 class="movie__subtitle">Résumé</h2>
          <p>{{ movie.overview || 'Aucun résumé disponible.' }}</p>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { apiGet, posterUrl, rating, releaseDate } from '@/utils/movies'

  const route = useRoute()

  // Fenêtre de recherche
  const searchOpen = ref(false)

  const movie = ref(null)
  const loading = ref(true)
  const error = ref(null)

  async function fetchMovie (id) {
    loading.value = true
    error.value = null
    movie.value = null
    try {
      movie.value = await apiGet(`/movies/${id}`)
    } catch (error_) {
      error.value = error_.message
    } finally {
      loading.value = false
    }
  }

  // Recharge le film quand l'id change dans l'URL (ex. passage d'un film à un autre)
  watch(() => route.params.id, id => {
    if (id) fetchMovie(id)
  }, { immediate: true })
</script>

<style scoped>
  .page {
    display: flex;
    min-height: 100%;
  }

  .content {
    flex: 1;
    min-width: 0;
    padding: 32px 48px;
  }

  .state {
    max-width: 560px;
    padding-top: 64px;
  }

  /* Mise en page : infos à gauche, affiche à droite, résumé en dessous */
  .movie {
    display: grid;
    grid-template-columns: 1fr 280px;
    grid-template-areas:
      'header poster'
      'overview poster';
    grid-template-rows: auto 1fr;
    column-gap: 48px;
    row-gap: 48px;
    max-width: 1100px;
  }

  .movie__header {
    grid-area: header;
  }

  .movie__title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .movie__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__poster {
    position: relative;
    grid-area: poster;
    display: grid;
    place-items: center;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__poster-img {
    position: absolute;
    inset: 0;
  }

  .movie__overview {
    grid-area: overview;
    max-width: 640px;
    line-height: 1.7;
  }

  .movie__subtitle {
    margin-bottom: 12px;
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* Mobile : affiche en haut, puis infos et résumé */
  @media (max-width: 760px) {
    .content {
      padding: 16px;
    }

    .movie {
      grid-template-columns: 1fr;
      grid-template-areas:
        'poster'
        'header'
        'overview';
      row-gap: 24px;
    }

    .movie__poster {
      width: min(240px, 70%);
      justify-self: center;
    }

    .movie__title {
      font-size: 1.8rem;
    }
  }
</style>
