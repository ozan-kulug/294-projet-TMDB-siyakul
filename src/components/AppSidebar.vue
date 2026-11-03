<template>
  <!-- Barre latérale étroite (rail) toujours visible, fournie par Vuetify -->
  <v-navigation-drawer permanent rail rail-width="64">
    <div class="d-flex flex-column align-center ga-2 py-3 fill-height">
      <router-link class="mb-3" title="Accueil" to="/">
        <v-img alt="Logo - retour à l'accueil" height="48" :src="logo" width="48" />
      </router-link>

      <v-btn
        color="primary"
        icon="mdi-magnify"
        title="Rechercher"
        variant="text"
        @click="allerALaRecherche"
      />
      <v-btn
        :disabled="movieStore.isLoading"
        icon="mdi-dice-5-outline"
        title="Film au hasard"
        variant="text"
        @click="allerAuHasard"
      />

      <v-spacer />

      <!-- Mode sombre : soleil pour passer en clair / mode clair : lune pour passer en sombre -->
      <v-btn
        :icon="theme.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        :title="theme.current.value.dark ? 'Mode clair' : 'Mode sombre'"
        variant="text"
        @click="changerTheme"
      />
    </div>
  </v-navigation-drawer>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import logo from '@/assets/logo.webp'
  import { useAppStore } from '@/stores/app'
  import { useMovieStore } from '@/stores/movieStore'

  const router = useRouter()
  const movieStore = useMovieStore()
  const appStore = useAppStore()
  const theme = useTheme()

  /**
   * Passe du mode sombre au mode clair, et inversement
   */
  function changerTheme () {
    theme.change(theme.current.value.dark ? 'light' : 'dark')
  }

  /**
   * Va sur l'accueil et donne le focus au champ de recherche
   */
  function allerALaRecherche () {
    appStore.demanderRecherche()
    router.push('/')
  }

  /**
   * Ouvre la page d'un film choisi au hasard
   */
  function allerAuHasard () {
    const film = movieStore.getRandomMovie()
    if (film) {
      router.push(`/movies/${film.id}`)
    }
  }
</script>
