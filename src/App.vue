<script setup>
import {RouterLink, RouterView} from 'vue-router'
import HomeView from "@/views/HomeView.vue";
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/" active-class="active-link">
        Accueil
      </RouterLink>
      <RouterLink to="/projet" active-class="active-link">
        Projet
      </RouterLink>
    </nav>
  </header>
  <RouterView/>

  <footer>
    <small>©️ Cyndel Herolt - 2024</small>
  </footer>
</template>

<style scoped>
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: var(--color-background);
  width: 100%;
  padding: 5px 10px;
}

a {
  padding: 0 15px;
}

.active-link {
  background-color: rgba(224, 212, 202, 0.25);
}
</style>
