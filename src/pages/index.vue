<template>
  <div class="page">
    <AppSidebar @search="searchOpen = true" />

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
            @click="searchOpen = true"
            @keydown.enter="searchOpen = true"
          />
          <v-btn prepend-icon="mdi-dice-5-outline" variant="outlined">Au hasard</v-btn>
          <v-btn color="primary" icon="mdi-filter" title="Filtres" variant="text" />
        </div>

        <div class="search__genres">
          <v-chip v-for="n in 5" :key="n" variant="outlined">Genre {{ n }}</v-chip>
        </div>
      </section>

      <!-- Fenêtre de recherche -->
      <SearchDialog v-model="searchOpen" />

      <!-- Erreur de chargement -->
      <v-alert
        v-if="error"
        class="mb-6"
        :text="error"
        title="Impossible de charger les films"
        type="error"
        variant="tonal"
      />

      <!-- Carrousel des films à la une -->
      <section class="carousel">
        <v-btn
          class="carousel__arrow"
          :disabled="allLoading"
          icon="mdi-chevron-left"
          title="Précédent"
          variant="outlined"
          @click="previousFeatured"
        />

        <div class="carousel__track">
          <template v-if="allLoading">
            <div
              v-for="n in 3"
              :key="n"
              class="film-card film-card--wide"
              :class="{ 'film-card--active': n === 2 }"
            >
              <v-icon icon="mdi-movie-open-outline" size="40" />
            </div>
          </template>

          <router-link
            v-for="(movie, i) in visibleFeatured"
            v-else
            :key="movie.id"
            class="film-card film-card--wide"
            :class="{ 'film-card--active': i === 1 }"
            :to="`/movies/${movie.id}`"
          >
            <v-img :alt="movie.title" class="film-card__img" cover :src="imageUrl(movie.backdropPath)" />
            <span class="film-card__title">{{ movie.title }}</span>
          </router-link>
        </div>

        <v-btn
          class="carousel__arrow"
          :disabled="allLoading"
          icon="mdi-chevron-right"
          title="Suivant"
          variant="outlined"
          @click="nextFeatured"
        />
      </section>

      <!-- Catalogue + Top -->
      <section ref="catalogueRef" class="catalogue">
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
            <template v-if="loading">
              <div v-for="n in 6" :key="n" class="film-card film-card--poster">
                <v-icon icon="mdi-movie-outline" size="32" />
              </div>
            </template>

            <router-link
              v-for="movie in movies"
              v-else
              :key="movie.id"
              class="film-card film-card--poster"
              :to="`/movies/${movie.id}`"
            >
              <v-icon icon="mdi-movie-outline" size="32" />
              <v-img :alt="movie.title" class="film-card__img" cover :src="posterUrl(movie)" />
              <span class="film-card__title">
                {{ movie.title }}
                <small class="d-block">{{ releaseYear(movie) }} • ⭐ {{ rating(movie) }}</small>
              </span>
            </router-link>
          </div>

          <p v-if="!loading && !error && movies.length === 0" class="text-medium-emphasis">
            Aucun film trouvé.
          </p>

          <v-pagination
            v-if="pageCount > 1"
            v-model="page"
            class="catalogue__pagination"
            density="comfortable"
            :length="pageCount"
            rounded="circle"
            :total-visible="5"
          />
        </div>

        <aside class="top-list">
          <header class="top-list__header">
            <div>
              <h2 class="top-list__heading">Top {{ topSize }}</h2>
              <span class="top-list__caption">Les mieux notés</span>
            </div>

            <div aria-label="Taille du classement" class="top-switch" role="group">
              <button
                v-for="size in TOP_SIZES"
                :key="size"
                :aria-pressed="topSize === size"
                class="top-switch__btn"
                :class="{ 'top-switch__btn--active': topSize === size }"
                type="button"
                @click="topSize = size"
              >
                {{ size }}
              </button>
            </div>
          </header>

          <v-progress-linear v-if="allLoading" indeterminate />
          <ol v-else class="top-list__items">
            <li v-for="(movie, i) in topMovies" :key="movie.id">
              <router-link class="top-item" :to="`/movies/${movie.id}`">
                <span class="top-item__rank">{{ String(i + 1).padStart(2, '0') }}</span>
                <v-img
                  :alt="movie.title"
                  class="top-item__poster"
                  cover
                  :src="posterUrl(movie)"
                />
                <div class="top-item__info">
                  <span class="top-item__title">{{ movie.title }}</span>
                  <span class="top-item__meta">{{ releaseYear(movie) }}</span>
                </div>
                <span class="top-item__score">{{ rating(movie) }}</span>
              </router-link>
            </li>
          </ol>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { getMovies, imageUrl, posterUrl, rating, releaseYear } from '@/utils/movies'

  const FEATURED_COUNT = 5
  const PAGE_SIZE = 24

  // Fenêtre de recherche
  const searchOpen = ref(false)

  // Catalogue (une page de films)
  const movies = ref([])
  const loading = ref(true)
  const error = ref(null)
  const page = ref(1)
  const pageCount = ref(1)
  const catalogueRef = ref(null)

  // Tous les films de l'API (pour le carrousel et le classement)
  const allMovies = ref([])
  const allLoading = ref(true)

  // Les films les plus populaires (l'API les renvoie déjà triés par popularité)
  const featuredIndex = ref(0)
  const featuredMovies = computed(() => allMovies.value.slice(0, FEATURED_COUNT))

  // Les 3 films visibles du carrousel : précédent, actuel (au centre), suivant
  const visibleFeatured = computed(() => {
    const list = featuredMovies.value
    if (list.length < 3) return list
    return [-1, 0, 1].map(offset => list[(featuredIndex.value + offset + list.length) % list.length])
  })

  // Classement selon la note, parmi tous les films de l'API
  const TOP_SIZES = [10, 50, 100]
  const topSize = ref(10)

  const topMovies = computed(() =>
    allMovies.value
      .toSorted((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0))
      .slice(0, topSize.value),
  )

  function previousFeatured () {
    const count = featuredMovies.value.length
    featuredIndex.value = (featuredIndex.value - 1 + count) % count
  }

  function nextFeatured () {
    featuredIndex.value = (featuredIndex.value + 1) % featuredMovies.value.length
  }

  async function fetchMovies () {
    const requestedPage = page.value
    loading.value = true
    error.value = null
    try {
      const json = await getMovies(`limit=${PAGE_SIZE}&page=${requestedPage}`)
      // Ignore la réponse si l'utilisateur a déjà changé de page entre-temps
      if (requestedPage !== page.value) return
      movies.value = json.data
      pageCount.value = json.pagination.pages
    } catch (error_) {
      error.value = error_.message
    } finally {
      if (requestedPage === page.value) loading.value = false
    }
  }

  // L'API limite à 100 films par page : on charge la 1re page, puis les suivantes
  async function fetchAllMovies () {
    allLoading.value = true
    try {
      const first = await getMovies('limit=100&page=1')
      const otherPages = Array.from({ length: first.pagination.pages - 1 }, (_, i) => i + 2)
      const others = await Promise.all(otherPages.map(p => getMovies(`limit=100&page=${p}`)))
      allMovies.value = [first, ...others].flatMap(json => json.data)
    } catch (error_) {
      error.value = error_.message
    } finally {
      allLoading.value = false
    }
  }

  // Changement de page : on charge les nouveaux films et on remonte en haut du catalogue
  watch(page, () => {
    fetchMovies()
    catalogueRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  onMounted(() => {
    fetchMovies()
    fetchAllMovies()
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

  /* Cartes de films (placeholders) */
  .film-card {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border: var(--border);
    border-radius: 8px;
    background: var(--placeholder);
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    text-decoration: none;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .film-card:hover {
    transform: translateY(-4px);
    border-color: rgba(var(--v-theme-on-surface), 0.3);
  }

  .film-card__img {
    position: absolute;
    inset: 0;
  }

  .film-card__title {
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

  .film-card__title small {
    opacity: 0.8;
    font-weight: 400;
  }

  .film-card--wide {
    aspect-ratio: 16 / 9;
  }

  .film-card--poster {
    aspect-ratio: 2 / 3;
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

  .film-card--active {
    border-width: 2px;
    border-color: rgb(var(--v-theme-primary));
  }

  /* Catalogue */
  .catalogue {
    display: grid;
    grid-template-columns: 1fr 300px;
    scroll-margin-top: 16px;
    align-items: start;
    gap: 32px;
  }

  .catalogue__pagination {
    margin-top: 32px;
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

  /* Top 10 */
  .top-list {
    position: sticky;
    top: 16px;
    padding: 20px 8px 8px;
    border-radius: 16px;
    background: rgba(var(--v-theme-on-surface), 0.03);
  }

  .top-list__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 0 12px 12px;
  }

  .top-switch {
    display: flex;
    padding: 3px;
    border-radius: 999px;
    background: rgba(var(--v-theme-on-surface), 0.06);
  }

  .top-switch__btn {
    min-width: 34px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .top-switch__btn:hover {
    color: rgb(var(--v-theme-on-surface));
  }

  .top-switch__btn:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 1px;
  }

  .top-switch__btn--active {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  }

  .top-list__heading {
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .top-list__caption {
    font-size: 0.7rem;
    white-space: nowrap;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
  }

  .top-list__items {
    max-height: 65vh;
    overflow-y: auto;
    list-style: none;
    scrollbar-width: thin;
  }

  .top-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 10px;
    color: inherit;
    text-decoration: none;
    transition: background-color 0.2s ease;
  }

  .top-item:hover {
    background: rgba(var(--v-theme-on-surface), 0.06);
  }

  .top-item__rank {
    width: 20px;
    flex-shrink: 0;
    font-size: 0.8rem;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
  }

  .top-item__poster {
    flex: 0 0 32px;
    height: 48px;
    border-radius: 6px;
    background: var(--placeholder);
  }

  .top-item__info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .top-item__title {
    overflow: hidden;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .top-item__meta {
    font-size: 0.72rem;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .top-item__score {
    flex-shrink: 0;
    font-size: 0.8rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /* Responsive */
  @media (max-width: 960px) {
    .catalogue {
      grid-template-columns: 1fr;
    }

    .top-list {
      position: static;
    }
  }

  @media (max-width: 600px) {
    .content {
      padding: 12px 16px 24px;
    }

    .carousel__track {
      grid-template-columns: 1fr;
    }

    .carousel__track .film-card:not(.film-card--active) {
      display: none;
    }

    .catalogue__grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
  }
</style>
