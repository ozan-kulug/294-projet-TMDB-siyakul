<template>
  <div class="page">
    <AppSidebar @search="searchOpen = true" />
    <SearchDialog v-model="searchOpen" />

    <div class="content">
      <!-- Image de fond du film, fondue dans la couleur de la page -->
      <div v-if="movie" class="hero" :style="heroStyle" />

      <v-btn
        class="back"
        prepend-icon="mdi-arrow-left"
        size="small"
        to="/"
        variant="text"
      >
        Accueil
      </v-btn>

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
      </div>

      <section v-else-if="movie" class="movie">
        <!-- Informations principales -->
        <header class="movie__header">
          <h1 class="movie__title">{{ movie.title }}</h1>
          <p v-if="movie.originalTitle && movie.originalTitle !== movie.title" class="movie__original">
            {{ movie.originalTitle }}
          </p>

          <p class="movie__meta">
            <span>{{ releaseDate(movie) }}</span>
            <span v-if="movie.originalLanguage">{{ movie.originalLanguage.toUpperCase() }}</span>
          </p>

          <div class="movie__score">
            <strong>{{ rating(movie) }}</strong>
            <span>/ 10 · {{ votes }} votes</span>
          </div>

          <div v-if="movieGenres.length > 0" class="movie__genres">
            <v-chip v-for="genre in movieGenres" :key="genre" size="small" variant="tonal">
              {{ genre }}
            </v-chip>
          </div>
        </header>

        <!-- Affiche -->
        <div class="movie__poster">
          <v-icon icon="mdi-movie-outline" size="48" />
          <v-img
            :alt="movie.title"
            class="movie__poster-img"
            :class="{ 'is-backdrop': !movie.posterPath }"
            cover
            :src="posterUrl(movie)"
          />
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
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { apiGet, imageUrl, posterUrl, rating, releaseDate } from '@/utils/movies'

  const route = useRoute()

  // Fenêtre de recherche
  const searchOpen = ref(false)

  const movie = ref(null)
  const genres = ref([])
  const loading = ref(true)
  const error = ref(null)

  // Noms des genres du film : genreIds correspond au sourceId des genres
  const movieGenres = computed(() =>
    (movie.value?.genreIds ?? [])
      .map(id => genres.value.find(genre => genre.sourceId === id)?.name)
      .filter(Boolean),
  )

  const votes = computed(() => (movie.value?.voteCount ?? 0).toLocaleString('fr-CH'))

  // Image de fond : on prend le backdrop, ou l'affiche s'il n'y en a pas
  const heroStyle = computed(() => {
    const url = imageUrl(movie.value?.backdropPath ?? movie.value?.posterPath)
    return url ? { backgroundImage: `url(${url})` } : {}
  })

  async function fetchGenres () {
    try {
      const json = await apiGet('/genres?limit=100')
      genres.value = json.data
    } catch {
      // Les genres sont un bonus : la page reste utilisable sans eux
      genres.value = []
    }
  }

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

  fetchGenres()
</script>

<style scoped>
  .page {
    display: flex;
    min-height: 100%;
  }

  .content {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 24px 48px 48px;
    overflow: hidden;
  }

  /* Image de fond
     Les images de l'API sont carrées (500×500) avec des bandes noires en haut et en bas :
     l'image utile est un 16:9 au centre. On agrandit l'image pour que ce 16:9 couvre
     toute la zone et que les bandes noires sortent du cadre. */
  .hero {
    --hero-height: min(75vh, 640px);

    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: var(--hero-height);
    background-position: center;
    background-repeat: no-repeat;
    background-size: max(100%, calc(var(--hero-height) * 16 / 9));
    pointer-events: none;
  }

  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, rgb(var(--v-theme-background)) 0%, rgba(var(--v-theme-background), 0) 55%),
      linear-gradient(to right, rgba(var(--v-theme-background), 0.95) 0%, rgba(var(--v-theme-background), 0.7) 45%, rgba(var(--v-theme-background), 0.25) 100%);
  }

  .back {
    position: relative;
    margin-bottom: 32px;
  }

  .state {
    position: relative;
    max-width: 560px;
    padding-top: 32px;
  }

  /* Mise en page : infos à gauche, affiche à droite, résumé en dessous */
  .movie {
    position: relative;
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
    font-size: 2.75rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .movie__original {
    margin-top: 4px;
    font-style: italic;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 12px;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__score {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 20px;
  }

  .movie__score strong {
    font-size: 2rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .movie__score span {
    font-size: 0.85rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
  }

  .movie__poster {
    position: relative;
    grid-area: poster;
    display: grid;
    place-items: center;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__poster-img {
    position: absolute;
    inset: 0;
  }

/* Image de fond utilisée à la place d'une affiche manquante : elle est carrée avec des
     bandes noires en haut et en bas, on zoome pour ne garder que l'image (16:9) */
  .is-backdrop :deep(.v-img__img) {
    transform: scale(1.78);
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

    .hero {
      --hero-height: 360px;
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
      width: min(220px, 65%);
      justify-self: center;
    }

    .movie__title {
      font-size: 1.8rem;
    }
  }
</style>
