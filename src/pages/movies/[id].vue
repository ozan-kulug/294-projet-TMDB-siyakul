<template>
  <div class="page">
    <AppSidebar @search="searchOpen = true" />
    <SearchDialog v-model="searchOpen" />

    <div class="content">
      <section class="movie">
        <!-- Informations principales -->
        <header class="movie__header">
          <h1 class="movie__title">Titre du film</h1>
          <p class="movie__meta">
            <span>Date de sortie</span>
            <span>Durée</span>
          </p>
        </header>

        <!-- Affiche -->
        <div class="movie__poster">
          <v-icon icon="mdi-movie-outline" size="48" />
        </div>

        <!-- Résumé -->
        <section class="movie__overview">
          <h2 class="movie__subtitle">Résumé</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  // Fenêtre de recherche
  const searchOpen = ref(false)
</script>

<style scoped>
  .page {
    display: flex;
    min-height: 100%;
  }

  .content {
    flex: 1;
    min-width: 0;
    padding: 32px 48px;
  }

  /* Mise en page : infos à gauche, affiche à droite, résumé en dessous */
  .movie {
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
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .movie__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  .movie__poster {
    grid-area: poster;
    display: grid;
    place-items: center;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
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

    .movie {
      grid-template-columns: 1fr;
      grid-template-areas:
        'poster'
        'header'
        'overview';
      row-gap: 24px;
    }

    .movie__poster {
      width: min(240px, 70%);
      justify-self: center;
    }

    .movie__title {
      font-size: 1.8rem;
    }
  }
</style>
