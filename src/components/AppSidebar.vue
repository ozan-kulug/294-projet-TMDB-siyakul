<template>
  <!-- Barre latérale étroite (rail) toujours visible, fournie par Vuetify -->
  <v-navigation-drawer permanent rail rail-width="64">
    <div class="d-flex flex-column align-center ga-2 py-3 fill-height">
      <router-link class="sidebar__logo mb-3" title="Accueil" to="/">Logo</router-link>

      <v-btn
        color="primary"
        icon="mdi-magnify"
        title="Rechercher"
        variant="text"
        @click="$emit('rechercher')"
      />
      <v-btn color="primary" icon="mdi-menu" title="Menu" variant="text" />
      <v-btn
        :disabled="movieStore.isLoading"
        icon="mdi-dice-5-outline"
        title="Film au hasard"
        variant="text"
        @click="allerAuHasard"
      />

      <v-spacer />

      <v-btn icon="mdi-cog-outline" title="Paramètres" variant="text" />
    </div>
  </v-navigation-drawer>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { useMovieStore } from '@/stores/movieStore'

  // Événement envoyé au parent quand on clique sur la loupe
  defineEmits(['rechercher'])

  const router = useRouter()
  const movieStore = useMovieStore()

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

<style scoped>
  /* Logo ovale (pas d'équivalent direct dans Vuetify) */
  .sidebar__logo {
    display: grid;
    place-items: center;
    width: 48px;
    height: 32px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 50%;
    font-size: 0.8rem;
    color: inherit;
    text-decoration: none;
  }
</style>
