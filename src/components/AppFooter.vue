<template>
  <v-footer app class="justify-center" height="40">
    <!-- Slot : le parent peut remplacer ce contenu -->
    <slot>© {{ new Date().getFullYear() }} Cinéclap</slot>
  </v-footer>
</template>
