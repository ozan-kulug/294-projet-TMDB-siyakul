<template>
  <aside class="sidebar">
    <router-link class="sidebar__logo" title="Accueil" to="/">Logo</router-link>

    <v-btn
      color="primary"
      icon="mdi-magnify"
      title="Rechercher"
      variant="text"
      @click="$emit('rechercher')"
    />
    <v-btn color="primary" icon="mdi-menu" title="Menu" variant="text" />
    <v-btn icon="mdi-dice-5-outline" title="Film au hasard" variant="text" />

    <v-spacer />

    <v-btn icon="mdi-cog-outline" title="Paramètres" variant="text" />
  </aside>
</template>

<script setup>
  // Événement envoyé au parent quand on clique sur la loupe
  defineEmits(['rechercher'])
</script>

<style scoped>
  .sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 64px;
    height: calc(100dvh - var(--v-layout-bottom, 0px));
    padding: 12px 0;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    flex-shrink: 0;
  }

  .sidebar__logo {
    display: grid;
    place-items: center;
    width: 48px;
    height: 32px;
    margin-bottom: 12px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 50%;
    font-size: 0.8rem;
    color: inherit;
    text-decoration: none;
  }
</style>
