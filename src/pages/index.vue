<template>
  <v-container class="pa-4 pa-sm-6" fluid>
    <!-- Titre de la page : invisible à l'écran, mais lu par les lecteurs d'écran -->
    <h1 class="d-sr-only">Cinéclap</h1>

    <!-- En-tête : lien vers les favoris, avec le nombre de favoris -->
    <div class="d-flex justify-end mb-4">
      <v-btn
        icon
        size="large"
        title="Mes favoris"
        to="/favoris"
        variant="text"
      >
        <v-badge
          color="red"
          :content="movieStore.totalFavorites"
          :model-value="movieStore.totalFavorites > 0"
        >
          <v-icon icon="mdi-heart-outline" />
        </v-badge>
      </v-btn>
    </div>

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
    <v-row align="center" class="mb-8" no-gutters>
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
              <v-skeleton-loader class="rounded-lg" type="image" />
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

    <!-- Recherche et filtre par genre -->
    <section class="mb-8">
      <v-sheet class="d-flex flex-wrap align-center ga-3 mb-3" color="transparent" max-width="560">
        <v-text-field
          ref="champRecherche"
          v-model="recherche"
          class="flex-grow-1"
          clearable
          density="compact"
          hide-details
          label="Rechercher un film"
          min-width="220"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
        <v-btn
          :disabled="isLoading"
          prepend-icon="mdi-dice-5-outline"
          variant="outlined"
          @click="allerAuHasard"
        >
          Au hasard
        </v-btn>
      </v-sheet>

      <!-- Un clic choisit un genre, un 2e clic sur le même genre l'enlève -->
      <v-chip-group v-model="genreChoisi" color="primary" filter>
        <v-chip
          v-for="genre in genres"
          :key="genre.sourceId"
          :text="genre.name"
          :value="genre.sourceId"
          variant="outlined"
        />
      </v-chip-group>
    </section>

    <!-- Catalogue (à gauche) + Top (à droite, en dessous sur petit écran) -->
    <v-row>
      <v-col cols="12" lg="9" md="8">
        <!-- Tri -->
        <div class="d-flex align-center ga-2 mb-4">
          <v-select
            v-model="ordre"
            density="compact"
            hide-details
            :items="ORDRES"
            label="Ordre"
            max-width="220"
            variant="outlined"
          />
          <v-btn
            :icon="croissant ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
            :title="croissant ? 'Ordre croissant' : 'Ordre décroissant'"
            variant="text"
            @click="croissant = !croissant"
          />
          <span class="text-medium-emphasis">{{ filmsTries.length }} films</span>
        </div>

        <v-row>
          <!-- Chargement : 6 cadres vides -->
          <template v-if="isLoading">
            <v-col cols="12">
              <p class="text-medium-emphasis">
                <v-progress-circular class="mr-2" indeterminate size="20" width="2" />
                Chargement des films…
              </p>
            </v-col>
            <v-col v-for="n in 6" :key="n" cols="6" sm="4">
              <v-skeleton-loader class="rounded-lg" type="card" />
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

        <p v-if="!isLoading && !error && filmsTries.length === 0" class="text-medium-emphasis">
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
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAppStore } from '@/stores/app'
  import { useMovieStore } from '@/stores/movieStore'

  // Nombre de films dans le carrousel
  const NOMBRE_FILMS_UNE = 5
  // Nombre de films par page du catalogue
  const FILMS_PAR_PAGE = 24
  // Choix du menu « Ordre »
  const ORDRES = [
    { title: 'Popularité', value: 'popularite' },
    { title: 'Note', value: 'note' },
    { title: 'Date de sortie', value: 'date' },
    { title: 'Titre', value: 'titre' },
  ]

  const movieStore = useMovieStore()
  const { movies, genres, moviesByPopularity, isLoading, error } = storeToRefs(movieStore)

  // Store de l'interface (la loupe de la barre latérale demande le champ de recherche)
  const appStore = useAppStore()

  const router = useRouter()

  /**
   * Ouvre la page d'un film choisi au hasard
   */
  function allerAuHasard () {
    const film = movieStore.getRandomMovie()
    if (film) {
      router.push(`/movies/${film.id}`)
    }
  }

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

  // ----- Recherche, filtre et tri -----
  // Chaque computed part du précédent : films → genre → recherche → tri.
  // Les films du store ne sont jamais modifiés.

  const recherche = ref('')
  const genreChoisi = ref(null)
  const ordre = ref('popularite')
  const croissant = ref(false)

  // Champ de recherche (pour lui donner le focus)
  const champRecherche = ref(null)

  // 1. Films du genre choisi (tous les films si aucun genre)
  const filmsParGenre = computed(() => {
    if (!genreChoisi.value) {
      return movies.value
    }
    return movies.value.filter(film => (film.genreIds || []).includes(genreChoisi.value))
  })

  // 2. Films dont le titre contient le texte recherché (sans tenir compte des majuscules)
  const filmsRecherches = computed(() => {
    const texte = (recherche.value || '').trim().toLowerCase()
    if (texte === '') {
      return filmsParGenre.value
    }
    return filmsParGenre.value.filter(film => film.title.toLowerCase().includes(texte))
  })

  // 3. Films triés selon l'ordre choisi
  const filmsTries = computed(() => {
    const sens = croissant.value ? 1 : -1
    return filmsRecherches.value.toSorted((a, b) => {
      switch (ordre.value) {
        case 'note': {
          return (a.voteAverage - b.voteAverage) * sens
        }
        case 'date': {
          return (a.releaseDate || '').localeCompare(b.releaseDate || '') * sens
        }
        case 'titre': {
          return a.title.localeCompare(b.title, 'fr') * sens
        }
        default: {
          return (a.popularity - b.popularity) * sens
        }
      }
    })
  })

  // Les titres se lisent de A à Z, les autres ordres du plus grand au plus petit
  watch(ordre, nouvelOrdre => {
    croissant.value = nouvelOrdre === 'titre'
  })

  // Quand la recherche, le genre ou l'ordre change, on revient à la 1re page
  watch([recherche, genreChoisi, ordre, croissant], () => {
    page.value = 1
  })

  /**
   * Donne le focus au champ de recherche si la loupe de la barre latérale l'a demandé
   */
  function focusRecherche () {
    if (appStore.rechercheDemandee) {
      champRecherche.value.focus()
      appStore.terminerRecherche()
    }
  }

  // Loupe cliquée depuis une autre page (l'accueil vient de s'afficher)
  onMounted(focusRecherche)
  // Loupe cliquée alors qu'on est déjà sur l'accueil
  watch(() => appStore.rechercheDemandee, focusRecherche)

  // ----- Catalogue et pagination -----

  const page = ref(1)

  const nombrePages = computed(() => Math.ceil(filmsTries.value.length / FILMS_PAR_PAGE))

  // Films de la page actuelle
  const filmsDeLaPage = computed(() => {
    const debut = (page.value - 1) * FILMS_PAR_PAGE
    const fin = debut + FILMS_PAR_PAGE
    const films = []
    for (const [index, film] of filmsTries.value.entries()) {
      if (index >= debut && index < fin) {
        films.push(film)
      }
    }
    return films
  })
</script>
