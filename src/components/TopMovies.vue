<template>
  <v-card class="top-list" color="surface-light" rounded="xl" variant="flat">
    <v-card-item>
      <v-card-title>Top {{ topSize }}</v-card-title>
      <v-card-subtitle class="text-caption text-uppercase">Les mieux notés</v-card-subtitle>

      <!-- Choix du nombre de films affichés -->
      <template #append>
        <v-btn-toggle
          v-model="topSize"
          aria-label="Taille du classement"
          density="compact"
          mandatory
          rounded="pill"
          variant="tonal"
        >
          <v-btn v-for="size in TOP_SIZES" :key="size" size="x-small" :value="size">
            {{ size }}
          </v-btn>
        </v-btn-toggle>
      </template>
    </v-card-item>

    <v-progress-linear v-if="movieStore.isLoading" indeterminate />

    <!-- Liste des films, avec une barre de défilement si elle est trop longue -->
    <v-list
      v-else
      bg-color="transparent"
      class="overflow-y-auto"
      density="compact"
      max-height="65vh"
      nav
    >
      <v-list-item
        v-for="ligne in classement"
        :key="ligne.film.id"
        :subtitle="ligne.film.releaseDate.slice(0, 4)"
        :title="ligne.film.title"
        :to="`/movies/${ligne.film.id}`"
      >
        <template #prepend>
          <span class="text-caption text-disabled mr-3">
            {{ ligne.rang < 10 ? `0${ligne.rang}` : ligne.rang }}
          </span>
          <v-img
            :alt="ligne.film.title"
            class="mr-3"
            :class="{ 'is-backdrop': !ligne.film.posterPath }"
            cover
            height="48"
            rounded
            :src="movieStore.getImageUrl(ligne.film.posterPath || ligne.film.backdropPath)"
            width="32"
          />
        </template>

        <template #append>
          <span class="text-body-2 font-weight-bold">{{ ligne.film.voteAverage.toFixed(1) }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useMovieStore } from '@/stores/movieStore'

  // Tailles de classement proposées
  const TOP_SIZES = [10, 50, 100]

  const movieStore = useMovieStore()
  const topSize = ref(10)

  // Les « topSize » films les mieux notés, avec leur rang (1, 2, 3...)
  const classement = computed(() => {
    const lignes = []
    for (const [index, film] of movieStore.moviesByRating.entries()) {
      if (index < topSize.value) {
        lignes.push({ rang: index + 1, film: film })
      }
    }
    return lignes
  })
</script>

<style scoped>
  /* Le panneau reste visible quand on fait défiler le catalogue (sauf sur petit écran) */
  .top-list {
    position: sticky;
    top: 16px;
  }

  @media (max-width: 960px) {
    .top-list {
      position: static;
    }
  }

  /* Image de fond utilisée à la place d'une affiche manquante (voir MovieCard.vue) */
  .is-backdrop :deep(.v-img__img) {
    transform: scale(1.78);
  }
</style>
