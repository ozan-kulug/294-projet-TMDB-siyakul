<template>
  <v-container class="position-relative overflow-hidden px-4 px-md-12 pt-6 pb-12" fluid>
    <!-- Image de fond du film, fondue dans la couleur de la page -->
    <div v-if="movie" class="hero" :style="styleImageFond" />

    <!-- position-relative : le contenu passe au-dessus de l'image de fond -->
    <div class="position-relative">
      <v-btn
        class="mb-8"
        prepend-icon="mdi-arrow-left"
        size="small"
        to="/"
        variant="text"
      >
        Accueil
      </v-btn>

      <!-- État 1 : chargement -->
      <div v-if="isLoading" class="pt-8">
        <v-progress-circular color="primary" indeterminate />
      </div>

      <!-- État 2 : erreur de l'API -->
      <v-sheet v-else-if="error" class="pt-8" color="transparent" max-width="560">
        <v-alert
          :text="error"
          title="Impossible d'afficher ce film"
          type="error"
          variant="tonal"
        />
      </v-sheet>

      <!-- Aucun film avec cet id -->
      <v-sheet v-else-if="!movie" class="pt-8" color="transparent" max-width="560">
        <v-alert
          text="Ce film n'existe pas ou a été supprimé."
          title="Film introuvable"
          type="warning"
          variant="tonal"
        />
      </v-sheet>

      <!-- État 3 : données -->
      <v-sheet v-else color="transparent" max-width="1100">
        <!-- Infos à gauche, affiche à droite (sur mobile : affiche en haut) -->
        <v-row>
          <v-col class="order-2 order-md-1" cols="12" md="8">
            <h1 class="text-h4 text-md-h3 font-weight-bold">{{ movie.title }}</h1>
            <p v-if="movie.originalTitle !== movie.title" class="mt-1 font-italic text-medium-emphasis">
              {{ movie.originalTitle }}
            </p>

            <p class="mt-3 text-medium-emphasis">{{ dateDeSortie }}</p>

            <!-- Note sur 5 étoiles, arrondie à la demi-étoile (l'API donne une note sur 10) -->
            <div class="d-flex flex-wrap align-center ga-3 mt-5">
              <v-rating
                active-color="amber"
                color="amber"
                density="compact"
                half-increments
                :model-value="Math.round(movie.voteAverage) / 2"
                readonly
                size="small"
              />
              <span class="text-body-2 text-medium-emphasis">
                <strong class="text-body-1 text-high-emphasis">{{ movie.voteAverage.toFixed(1) }}</strong>
                / 10 · {{ movie.voteCount }} votes
              </span>
            </div>

            <!-- Fiche du film -->
            <v-row class="mt-5" dense tag="dl">
              <v-col cols="12">
                <dt class="text-overline text-medium-emphasis">Genres</dt>
                <dd v-if="genres.length > 0" class="d-flex flex-wrap ga-2">
                  <v-chip v-for="genre in genres" :key="genre" size="small" variant="tonal">
                    {{ genre }}
                  </v-chip>
                </dd>
                <dd v-else>–</dd>
              </v-col>

              <v-col class="pr-sm-10" cols="6" sm="auto">
                <dt class="text-overline text-medium-emphasis">Langue originale</dt>
                <dd class="font-weight-medium">{{ nomDeLangue(movie.originalLanguage) }}</dd>
              </v-col>

              <v-col class="pr-sm-10" cols="6" sm="auto">
                <dt class="text-overline text-medium-emphasis">Classement</dt>
                <dd class="font-weight-medium">
                  {{ rangEnFrancais(rangNote) }}
                  <small class="text-medium-emphasis">sur {{ movieStore.totalMovies }}</small>
                </dd>
              </v-col>

              <v-col cols="6" sm="auto">
                <dt class="text-overline text-medium-emphasis">Popularité</dt>
                <dd class="font-weight-medium">
                  {{ rangEnFrancais(rangPopularite) }}
                  <small class="text-medium-emphasis">sur {{ movieStore.totalMovies }}</small>
                </dd>
              </v-col>
            </v-row>

            <!-- Résumé -->
            <v-sheet class="mt-8 mt-md-12" color="transparent" max-width="640">
              <h2 class="text-h5 font-weight-medium mb-3">Résumé</h2>
              <p class="text-body-1">{{ movie.overview || 'Aucun résumé disponible.' }}</p>
            </v-sheet>
          </v-col>

          <!-- Affiche -->
          <v-col class="order-1 order-md-2" cols="12" md="4">
            <v-card class="mx-auto" elevation="16" max-width="280" rounded="lg">
              <v-img
                :alt="movie.title"
                :aspect-ratio="2 / 3"
                :class="{ 'is-backdrop': !movie.posterPath }"
                cover
                :src="movieStore.getImageUrl(movie.posterPath || movie.backdropPath)"
              >
                <!-- Affiché pendant le chargement de l'image -->
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon icon="mdi-movie-outline" size="48" />
                  </div>
                </template>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-sheet>
    </div>
  </v-container>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useMovieStore } from '@/stores/movieStore'

  const route = useRoute()
  const movieStore = useMovieStore()
  const { isLoading, error } = storeToRefs(movieStore)

  // Film correspondant à l'id de l'URL (ex. /movies/25 → id = '25', converti en nombre)
  const movie = computed(() => movieStore.getMovieById(Number(route.params.id)))

  // Noms des genres du film
  const genres = computed(() => movieStore.getGenreNames(movie.value))

  // Date de sortie en français, ex. « 29 juillet 2026 »
  const dateDeSortie = computed(() => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(movie.value.releaseDate).toLocaleDateString('fr-FR', options)
  })

  // Position du film parmi tous les films, par note et par popularité (1 = le meilleur)
  const rangNote = computed(() => movieStore.moviesByRating.indexOf(movie.value) + 1)
  const rangPopularite = computed(() => movieStore.moviesByPopularity.indexOf(movie.value) + 1)

  // Image de fond : l'image « backdrop » du film, ou son affiche s'il n'en a pas
  const styleImageFond = computed(() => {
    const url = movieStore.getImageUrl(movie.value.backdropPath || movie.value.posterPath)
    return { backgroundImage: `url(${url})` }
  })

  /**
   * Retourne le nom en français d'une langue à partir de son code
   * @param {string} code - code de la langue (ex. « en »)
   * @return {string} nom de la langue (ex. « Anglais »)
   */
  function nomDeLangue (code) {
    switch (code) {
      case 'en': {
        return 'Anglais'
      }
      case 'fr': {
        return 'Français'
      }
      case 'es': {
        return 'Espagnol'
      }
      case 'de': {
        return 'Allemand'
      }
      case 'ja': {
        return 'Japonais'
      }
      case 'ko': {
        return 'Coréen'
      }
      case 'zh': {
        return 'Chinois'
      }
      case 'hi': {
        return 'Hindi'
      }
      case 'ta': {
        return 'Tamoul'
      }
      case 'te': {
        return 'Télougou'
      }
      case 'id': {
        return 'Indonésien'
      }
      case 'tl': {
        return 'Tagalog'
      }
      case 'tr': {
        return 'Turc'
      }
      case 'ru': {
        return 'Russe'
      }
      default: {
        return code ? code.toUpperCase() : 'Inconnue'
      }
    }
  }

  /**
   * Retourne un rang en français : 1 → « 1er », 12 → « 12e »
   * @param {number} rang - position dans le classement
   * @return {string} rang en français
   */
  function rangEnFrancais (rang) {
    return rang === 1 ? '1er' : `${rang}e`
  }
</script>

<style scoped>
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

  /* Fondu vers la couleur de la page : par le bas et par la gauche (derrière le texte) */
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, rgb(var(--v-theme-background)) 0%, rgba(var(--v-theme-background), 0) 55%),
      linear-gradient(to right, rgba(var(--v-theme-background), 0.95) 0%, rgba(var(--v-theme-background), 0.7) 45%, rgba(var(--v-theme-background), 0.25) 100%);
  }

  @media (max-width: 760px) {
    .hero {
      --hero-height: 360px;
    }
  }

  /* Image de fond utilisée à la place d'une affiche manquante : elle est carrée avec des
     bandes noires en haut et en bas, on zoome pour ne garder que l'image (16:9) */
  .is-backdrop :deep(.v-img__img) {
    transform: scale(1.78);
  }
</style>
