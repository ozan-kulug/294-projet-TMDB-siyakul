<template>
  <div class="page">
    <AppSidebar @rechercher="rechercheOuverte = true" />
    <SearchDialog :ouvert="rechercheOuverte" @fermer="rechercheOuverte = false" />

    <div class="content">
      <!-- Image de fond du film, fondue dans la couleur de la page -->
      <div v-if="movie" class="hero" :style="styleImageFond" />

      <v-btn
        class="back"
        prepend-icon="mdi-arrow-left"
        size="small"
        to="/"
        variant="text"
      >
        Accueil
      </v-btn>

      <!-- État 1 : chargement -->
      <div v-if="isLoading" class="state">
        <v-progress-circular color="primary" indeterminate />
      </div>

      <!-- État 2 : erreur de l'API -->
      <div v-else-if="error" class="state">
        <v-alert
          :text="error"
          title="Impossible d'afficher ce film"
          type="error"
          variant="tonal"
        />
      </div>

      <!-- Aucun film avec cet id -->
      <div v-else-if="!movie" class="state">
        <v-alert
          text="Ce film n'existe pas ou a été supprimé."
          title="Film introuvable"
          type="warning"
          variant="tonal"
        />
      </div>

      <!-- État 3 : données -->
      <section v-else class="movie">
        <!-- Informations principales -->
        <header class="movie__header">
          <h1 class="movie__title">{{ movie.title }}</h1>
          <p v-if="movie.originalTitle !== movie.title" class="movie__original">
            {{ movie.originalTitle }}
          </p>

          <p class="movie__meta">{{ dateDeSortie }}</p>

          <!-- Note sur 5 étoiles, arrondie à la demi-étoile (l'API donne une note sur 10) -->
          <div class="movie__rating">
            <v-rating
              active-color="amber"
              color="amber"
              density="compact"
              half-increments
              :model-value="Math.round(movie.voteAverage) / 2"
              readonly
              size="small"
            />
            <span class="movie__rating-text">
              <strong>{{ movie.voteAverage.toFixed(1) }}</strong> / 10 · {{ movie.voteCount }} votes
            </span>
          </div>

          <!-- Fiche du film -->
          <dl class="facts">
            <div class="facts__item facts__item--wide">
              <dt>Genres</dt>
              <dd v-if="genres.length > 0" class="facts__genres">
                <v-chip v-for="genre in genres" :key="genre" size="small" variant="tonal">
                  {{ genre }}
                </v-chip>
              </dd>
              <dd v-else>–</dd>
            </div>

            <div class="facts__item">
              <dt>Langue originale</dt>
              <dd>{{ nomDeLangue(movie.originalLanguage) }}</dd>
            </div>

            <div class="facts__item">
              <dt>Classement</dt>
              <dd>{{ rangEnFrancais(rangNote) }} <small>sur {{ movieStore.totalMovies }}</small></dd>
            </div>

            <div class="facts__item">
              <dt>Popularité</dt>
              <dd>{{ rangEnFrancais(rangPopularite) }} <small>sur {{ movieStore.totalMovies }}</small></dd>
            </div>
          </dl>
        </header>

        <!-- Affiche -->
        <div class="movie__poster">
          <v-icon icon="mdi-movie-outline" size="48" />
          <v-img
            :alt="movie.title"
            class="movie__poster-img"
            :class="{ 'is-backdrop': !movie.posterPath }"
            cover
            :src="movieStore.getImageUrl(movie.posterPath || movie.backdropPath)"
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
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useMovieStore } from '@/stores/movieStore'

  const route = useRoute()
  const movieStore = useMovieStore()
  const { isLoading, error } = storeToRefs(movieStore)

  // Fenêtre de recherche
  const rechercheOuverte = ref(false)

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

  /* Note en étoiles */
  .movie__rating {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    margin-top: 20px;
  }

  .movie__rating-text {
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__rating-text strong {
    font-size: 1.1rem;
    color: rgb(var(--v-theme-on-surface));
  }

  /* Fiche du film */
  .facts {
    display: grid;
    grid-template-columns: repeat(3, auto);
    justify-content: start;
    gap: 20px 40px;
    margin-top: 28px;
  }

  .facts__item--wide {
    grid-column: 1 / -1;
  }

  .facts dt {
    margin-bottom: 6px;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .facts dd {
    font-weight: 500;
  }

  .facts dd small {
    font-weight: 400;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .facts__genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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

    .facts {
      grid-template-columns: repeat(2, auto);
      gap: 16px 24px;
    }
  }
</style>
