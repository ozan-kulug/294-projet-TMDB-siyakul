<template>
  <!-- Carte d'un film : affiche, titre, année et note. Un clic ouvre la page du film -->
  <v-card class="movie-card" hover rounded="lg" :to="`/movies/${movie.id}`">
    <v-img
      :alt="movie.title"
      :aspect-ratio="2 / 3"
      class="align-end"
      :class="{ 'is-backdrop': !movie.posterPath }"
      cover
      gradient="to bottom, transparent 50%, rgba(0, 0, 0, 0.85)"
      :src="movieStore.getImageUrl(movie.posterPath || movie.backdropPath)"
    >
      <!-- Affiché pendant le chargement de l'image -->
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-icon icon="mdi-movie-outline" size="32" />
        </div>
      </template>

      <v-card-title class="text-white text-body-1 font-weight-medium text-wrap pb-0">
        {{ movie.title }}
      </v-card-title>
      <v-card-subtitle class="text-white pb-3">
        {{ movie.releaseDate.slice(0, 4) }} • ⭐ {{ movie.voteAverage.toFixed(1) }}
      </v-card-subtitle>
    </v-img>

    <!-- Bouton favori en haut à droite de l'affiche -->
    <!-- .stop.prevent : le clic ne doit pas ouvrir la page du film (la carte est un lien) -->
    <v-btn
      class="ma-2"
      :color="estFavori ? 'red' : 'white'"
      density="comfortable"
      :icon="estFavori ? 'mdi-heart' : 'mdi-heart-outline'"
      location="top end"
      position="absolute"
      :title="estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      variant="text"
      @click.stop.prevent="changerFavori"
    />

    <!-- Message de confirmation -->
    <v-snackbar v-model="afficherMessage" color="primary" :timeout="2000">
      {{ message }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useMovieStore } from '@/stores/movieStore'

  const props = defineProps({
    movie: {
      type: Object,
      required: true,
    },
  })

  const movieStore = useMovieStore()

  // Le film est-il dans les favoris ? (calculé une seule fois pour le cœur)
  const estFavori = computed(() => movieStore.isFavorite(props.movie))

  // Snackbar affiché après un clic sur le cœur
  const afficherMessage = ref(false)
  const message = ref('')

  /**
   * Ajoute ou retire le film des favoris et affiche un message de confirmation
   */
  function changerFavori () {
    const etaitFavori = estFavori.value
    movieStore.toggleFavorite(props.movie)
    message.value = etaitFavori ? 'Retiré des favoris' : 'Ajouté aux favoris'
    afficherMessage.value = true
  }
</script>

<style scoped>
  /* Image de fond utilisée à la place d'une affiche manquante : elle est carrée avec des
     bandes noires en haut et en bas, on zoome pour ne garder que l'image (16:9) */
  .is-backdrop :deep(.v-img__img) {
    transform: scale(1.78);
  }
</style>
