<template>
  <v-dialog v-model="open" max-width="720">
    <v-card class="search-dialog" rounded="xl">
      <v-text-field
        autofocus
        class="search-dialog__field"
        flat
        hide-details
        placeholder="Rechercher un film…"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
      />

      <div class="search-dialog__recent">
        <div v-for="n in 4" :key="n" class="search-dialog__item">
          Dernière recherche {{ n }}
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
  const open = defineModel({ type: Boolean, default: false })
</script>

<style scoped>
  .search-dialog {
    padding: 20px;
  }

  .search-dialog__field {
    margin-bottom: 20px;
  }

  .search-dialog__recent {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .search-dialog__item {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    padding: 12px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    font-size: 0.85rem;
    text-align: center;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  }

  @media (max-width: 600px) {
    .search-dialog__recent {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
