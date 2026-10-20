<template>
  <aside class="top-list">
    <header class="top-list__header">
      <div>
        <h2 class="top-list__heading">Top {{ topSize }}</h2>
        <span class="top-list__caption">Les mieux notés</span>
      </div>

      <!-- Choix du nombre de films affichés -->
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

    <v-progress-linear v-if="movieStore.isLoading" indeterminate />
    <ol v-else class="top-list__items">
      <li v-for="ligne in classement" :key="ligne.film.id">
        <RouterLink class="top-item" :to="`/movies/${ligne.film.id}`">
          <span class="top-item__rank">{{ ligne.rang < 10 ? `0${ligne.rang}` : ligne.rang }}</span>
          <v-img
            :alt="ligne.film.title"
            class="top-item__poster"
            :class="{ 'is-backdrop': !ligne.film.posterPath }"
            cover
            :src="movieStore.getImageUrl(ligne.film.posterPath || ligne.film.backdropPath)"
          />
          <div class="top-item__info">
            <span class="top-item__title">{{ ligne.film.title }}</span>
            <span class="top-item__meta">{{ ligne.film.releaseDate.slice(0, 4) }}</span>
          </div>
          <span class="top-item__score">{{ ligne.film.voteAverage.toFixed(1) }}</span>
        </RouterLink>
      </li>
    </ol>
  </aside>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { RouterLink } from 'vue-router'
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

  /* Boutons 10 / 50 / 100 */
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

  /* Liste */
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
    background: rgba(var(--v-theme-on-surface), 0.06);
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

  /* Image de fond utilisée à la place d'une affiche manquante (voir MovieCard.vue) */
  .is-backdrop :deep(.v-img__img) {
    transform: scale(1.78);
  }

  @media (max-width: 960px) {
    .top-list {
      position: static;
    }
  }
</style>
