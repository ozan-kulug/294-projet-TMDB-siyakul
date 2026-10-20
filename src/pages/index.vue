<template>
  <div class="page">
    <AppSidebar @rechercher="rechercheOuverte = true" />

    <div class="content">
      <!-- En-tête -->
      <header class="topbar">
        <div class="logo">Logo</div>
        <v-btn icon="mdi-heart-outline" size="large" title="Favoris" variant="text" />
      </header>

      <!-- Introduction -->
      <section class="intro">
        <h1 class="text-h4 font-weight-bold mb-2">Heading</h1>
        <p class="text-body-1 text-medium-emphasis">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </section>

      <!-- Recherche et filtres -->
      <section class="search">
        <div class="search__row">
          <!-- Champ en lecture seule : il sert uniquement à ouvrir la fenêtre de recherche -->
          <v-text-field
            class="search__field"
            density="compact"
            hide-details
            label="Rechercher"
            prepend-inner-icon="mdi-magnify"
            readonly
            variant="outlined"
            @click="rechercheOuverte = true"
            @keydown.enter="rechercheOuverte = true"
          />
          <v-btn prepend-icon="mdi-dice-5-outline" variant="outlined">Au hasard</v-btn>
          <v-btn color="primary" icon="mdi-filter" title="Filtres" variant="text" />
        </div>

        <div class="search__genres">
          <v-chip v-for="n in 5" :key="n" variant="outlined">Genre {{ n }}</v-chip>
        </div>
      </section>

      <!-- Fenêtre de recherche -->
      <SearchDialog :ouvert="rechercheOuverte" @fermer="rechercheOuverte = false" />

      <!-- Erreur de chargement -->
      <v-alert
        v-if="error"
        class="mb-6"
        :text="error"
        title="Impossible de charger les films"
        type="error"
        variant="tonal"
      />

      <!-- Carrousel des films les plus populaires -->
      <section class="carousel">
        <v-btn
          class="carousel__arrow"
          :disabled="isLoading"
          icon="mdi-chevron-left"
          title="Précédent"
          variant="outlined"
          @click="filmPrecedent"
        />

        <div class="carousel__track">
          <template v-if="isLoading">
            <v-skeleton-loader v-for="n in 3" :key="n" class="featured-skeleton" type="image" />
          </template>

          <RouterLink
            v-for="movie in filmsVisibles"
            v-else
            :key="movie.id"
            class="featured-card"
            :class="{ 'featured-card--active': movie.id === filmCourant.id }"
            :to="`/movies/${movie.id}`"
          >
            <v-img
              :alt="movie.title"
              class="featured-card__img"
              cover
              :src="movieStore.getImageUrl(movie.backdropPath)"
            />
            <span class="featured-card__title">{{ movie.title }}</span>
          </RouterLink>
        </div>

        <v-btn
          class="carousel__arrow"
          :disabled="isLoading"
          icon="mdi-chevron-right"
          title="Suivant"
          variant="outlined"
          @click="filmSuivant"
        />
      </section>

      <!-- Catalogue + Top -->
      <section class="catalogue">
        <div class="catalogue__main">
          <v-select
            class="catalogue__order"
            density="compact"
            hide-details
            :items="['Popularité', 'Note', 'Date de sortie', 'Titre']"
            label="Ordre"
            variant="outlined"
          />

          <div class="catalogue__grid">
            <template v-if="isLoading">
              <v-skeleton-loader v-for="n in 6" :key="n" class="poster-skeleton" type="image" />
            </template>

            <MovieCard v-for="movie in filmsDeLaPage" v-else :key="movie.id" :movie="movie" />
          </div>

          <p v-if="!isLoading && !error && movies.length === 0" class="text-medium-emphasis">
            Aucun film trouvé.
          </p>

          <v-pagination
            v-if="nombrePages > 1"
            v-model="page"
            class="catalogue__pagination"
            density="comfortable"
            :length="nombrePages"
            rounded="circle"
            :total-visible="5"
          />
        </div>

        <TopMovies />
      </section>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useMovieStore } from '@/stores/movieStore'

  // Nombre de films dans le carrousel
  const NOMBRE_FILMS_UNE = 5
  // Nombre de films par page du catalogue
  const FILMS_PAR_PAGE = 24

  const movieStore = useMovieStore()
  const { movies, moviesByPopularity, isLoading, error } = storeToRefs(movieStore)

  // Fenêtre de recherche
  const rechercheOuverte = ref(false)

  // ----- Carrousel -----

  // Position du film affiché au centre du carrousel
  const indexFilmCourant = ref(0)

  // Les films les plus populaires
  const filmsALaUne = computed(() => {
    const films = []
    for (const [index, film] of moviesByPopularity.value.entries()) {
      if (index < NOMBRE_FILMS_UNE) {
        films.push(film)
      }
    }
    return films
  })

  // Film affiché au centre
  const filmCourant = computed(() => filmsALaUne.value[indexFilmCourant.value])

  // Les 3 films visibles : précédent, courant (au centre) et suivant
  const filmsVisibles = computed(() => {
    const films = filmsALaUne.value
    const total = films.length
    if (total < 3) {
      return films
    }
    return [
      films[(indexFilmCourant.value - 1 + total) % total],
      films[indexFilmCourant.value],
      films[(indexFilmCourant.value + 1) % total],
    ]
  })

  /**
   * Affiche le film précédent au centre du carrousel
   */
  function filmPrecedent () {
    const total = filmsALaUne.value.length
    indexFilmCourant.value = (indexFilmCourant.value - 1 + total) % total
  }

  /**
   * Affiche le film suivant au centre du carrousel
   */
  function filmSuivant () {
    indexFilmCourant.value = (indexFilmCourant.value + 1) % filmsALaUne.value.length
  }

  // ----- Catalogue et pagination -----

  const page = ref(1)

  const nombrePages = computed(() => Math.ceil(movies.value.length / FILMS_PAR_PAGE))

  // Films de la page actuelle
  const filmsDeLaPage = computed(() => {
    const debut = (page.value - 1) * FILMS_PAR_PAGE
    const fin = debut + FILMS_PAR_PAGE
    const films = []
    for (const [index, film] of movies.value.entries()) {
      if (index >= debut && index < fin) {
        films.push(film)
      }
    }
    return films
  })
</script>

<style scoped>
  .page {
    --border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    --placeholder: rgba(var(--v-theme-on-surface), 0.06);

    display: flex;
    min-height: 100%;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 56px;
    height: 32px;
    border: var(--border);
    border-radius: 50%;
    font-size: 0.8rem;
  }

  /* Contenu principal */
  .content {
    flex: 1;
    min-width: 0;
    padding: 16px 24px 32px;
  }

  .topbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }

  .intro {
    max-width: 520px;
    margin-bottom: 32px;
  }

  /* Recherche */
  .search {
    margin-bottom: 32px;
  }

  .search__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    max-width: 560px;
    margin-bottom: 12px;
  }

  .search__field {
    flex: 1;
    min-width: 220px;
  }

  .search__field :deep(input) {
    cursor: pointer;
  }

  .search__genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Carrousel */
  .carousel {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
  }

  .carousel__track {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    align-items: center;
    gap: 16px;
  }

  .featured-card,
  .featured-skeleton {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border: var(--border);
    border-radius: 8px;
    background: var(--placeholder);
  }

  .featured-card {
    text-decoration: none;
    transition: transform 0.2s ease;
  }

  .featured-card:hover {
    transform: translateY(-4px);
  }

  .featured-card--active {
    border-width: 2px;
    border-color: rgb(var(--v-theme-primary));
  }

  .featured-card__img {
    position: absolute;
    inset: 0;
  }

  .featured-card__title {
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

  .featured-skeleton :deep(.v-skeleton-loader__image),
  .poster-skeleton :deep(.v-skeleton-loader__image) {
    height: 100%;
  }

  /* Catalogue */
  .catalogue {
    display: grid;
    grid-template-columns: 1fr 300px;
    align-items: start;
    gap: 32px;
  }

  .catalogue__order {
    max-width: 220px;
    margin-bottom: 16px;
  }

  .catalogue__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .poster-skeleton {
    aspect-ratio: 2 / 3;
    border-radius: 8px;
  }

  .catalogue__pagination {
    margin-top: 32px;
  }

  /* Responsive */
  @media (max-width: 960px) {
    .catalogue {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .content {
      padding: 12px 16px 24px;
    }

    .carousel__track {
      grid-template-columns: 1fr;
    }

    .carousel__track .featured-card:not(.featured-card--active),
    .carousel__track .featured-skeleton:not(:nth-child(2)) {
      display: none;
    }

    .catalogue__grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
  }
</style>
