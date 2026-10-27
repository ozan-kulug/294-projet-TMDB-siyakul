<template>
  <v-container class="pa-4 pa-sm-6" fluid>
    <!-- En-tête -->
    <div class="d-flex justify-end align-center ga-2">
      <v-img
        alt="Logo"
        class="flex-grow-0"
        height="48"
        :src="logo"
        width="48"
      />
      <v-btn icon="mdi-heart-outline" size="large" title="Favoris" variant="text" />
    </div>

    <!-- Introduction -->
    <v-sheet class="mb-8" color="transparent" max-width="520">
      <h1 class="text-h4 font-weight-bold mb-2">Cinéclap</h1>
      <p class="text-body-1 text-medium-emphasis">
        Découvrez les films du moment, comparez leurs notes et trouvez votre prochaine séance.
      </p>
    </v-sheet>

    <!-- Recherche et filtres -->
    <section class="mb-8">
      <v-sheet class="d-flex flex-wrap align-center ga-3 mb-3" color="transparent" max-width="560">
        <!-- Champ en lecture seule : il sert uniquement à ouvrir la fenêtre de recherche -->
        <v-text-field
          class="search-field flex-grow-1"
          density="compact"
          hide-details
          label="Rechercher"
          min-width="220"
          prepend-inner-icon="mdi-magnify"
          readonly
          variant="outlined"
          @click="appStore.ouvrirRecherche()"
          @keydown.enter="appStore.ouvrirRecherche()"
        />
        <v-btn prepend-icon="mdi-dice-5-outline" variant="outlined">Au hasard</v-btn>
        <v-btn color="primary" icon="mdi-filter" title="Filtres" variant="text" />
      </v-sheet>

      <div class="d-flex flex-wrap ga-2">
        <v-chip v-for="n in 5" :key="n" variant="outlined">Genre {{ n }}</v-chip>
      </div>
    </section>

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
    <!-- Flèches en colonnes « auto » (leur largeur), films dans la colonne du milieu (le reste) -->
    <v-row align="center" class="mb-10" no-gutters>
      <v-col cols="auto">
        <v-btn
          :disabled="isLoading"
          icon="mdi-chevron-left"
          title="Précédent"
          variant="outlined"
          @click="filmPrecedent"
        />
      </v-col>

      <v-col class="px-3">
        <v-row align="center">
          <!-- Chargement : 3 cadres vides (seul celui du milieu sur mobile) -->
          <template v-if="isLoading">
            <v-col
              v-for="n in 3"
              :key="n"
              :class="{ 'd-none d-sm-block': n !== 2 }"
              cols="12"
              sm="4"
            >
              <v-responsive :aspect-ratio="16 / 9" class="rounded-lg bg-surface-light" />
            </v-col>
          </template>

          <!-- Les 3 films visibles (seul le film du centre sur mobile) -->
          <v-col
            v-for="movie in filmsVisibles"
            v-else
            :key="movie.id"
            :class="{ 'd-none d-sm-block': movie.id !== filmCourant.id }"
            cols="12"
            sm="4"
          >
            <v-card
              :color="movie.id === filmCourant.id ? 'primary' : undefined"
              hover
              rounded="lg"
              :to="`/movies/${movie.id}`"
              :variant="movie.id === filmCourant.id ? 'outlined' : 'elevated'"
            >
              <v-img
                :alt="movie.title"
                :aspect-ratio="16 / 9"
                class="align-end"
                cover
                gradient="to bottom, transparent 50%, rgba(0, 0, 0, 0.85)"
                :src="movieStore.getImageUrl(movie.backdropPath)"
              >
                <v-card-title class="text-white text-body-1 font-weight-medium text-wrap">
                  {{ movie.title }}
                </v-card-title>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="auto">
        <v-btn
          :disabled="isLoading"
          icon="mdi-chevron-right"
          title="Suivant"
          variant="outlined"
          @click="filmSuivant"
        />
      </v-col>
    </v-row>

    <!-- Catalogue (à gauche) + Top (à droite, en dessous sur petit écran) -->
    <v-row>
      <v-col cols="12" lg="9" md="8">
        <v-select
          class="mb-4"
          density="compact"
          hide-details
          :items="['Popularité', 'Note', 'Date de sortie', 'Titre']"
          label="Ordre"
          max-width="220"
          variant="outlined"
        />

        <v-row>
          <!-- Chargement : 6 cadres vides -->
          <template v-if="isLoading">
            <v-col v-for="n in 6" :key="n" cols="6" sm="4">
              <v-responsive :aspect-ratio="2 / 3" class="rounded-lg bg-surface-light" />
            </v-col>
          </template>

          <v-col
            v-for="movie in filmsDeLaPage"
            v-else
            :key="movie.id"
            cols="6"
            sm="4"
          >
            <MovieCard :movie="movie" />
          </v-col>
        </v-row>

        <p v-if="!isLoading && !error && movies.length === 0" class="text-medium-emphasis">
          Aucun film trouvé.
        </p>

        <v-pagination
          v-if="nombrePages > 1"
          v-model="page"
          class="mt-8"
          density="comfortable"
          :length="nombrePages"
          rounded="circle"
          :total-visible="5"
        />
      </v-col>

      <v-col cols="12" lg="3" md="4">
        <TopMovies />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import logo from '@/assets/logo.webp'
  import { useAppStore } from '@/stores/app'
  import { useMovieStore } from '@/stores/movieStore'

  // Nombre de films dans le carrousel
  const NOMBRE_FILMS_UNE = 5
  // Nombre de films par page du catalogue
  const FILMS_PAR_PAGE = 24

  const movieStore = useMovieStore()
  const { movies, moviesByPopularity, isLoading, error } = storeToRefs(movieStore)

  // Store de l'interface (pour ouvrir la fenêtre de recherche)
  const appStore = useAppStore()

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
  /* Le champ de recherche est en lecture seule : on affiche quand même la main au survol */
  .search-field :deep(input) {
    cursor: pointer;
  }
</style>
