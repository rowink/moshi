<template>
  <main class="not-found-page">
    <h1 class="not-found-title">404</h1>
    <p class="not-found-subtitle">Page Not Found</p>

    <router-link to="/" class="go-home">Back Home</router-link>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

function setTheme() {
  document.getElementsByTagName("html")[0].setAttribute("data-theme", "docs");
}

onMounted(() => {
  setTheme();
});
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;
@use "@/styles/style-helpers" as *;

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

main.not-found-page {
  margin: 0;
  padding: 2rem;
  width: 100%;
  min-height: calc(100vh - var(--footer-height, 0px));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: default;
  background: #fafafa;
  box-sizing: border-box;

  h1.not-found-title {
    font-size: clamp(6rem, 15vh, 10rem);
    cursor: default;
    color: #db78fc;
    margin: 0;
    line-height: 1;
    letter-spacing: -0.04em;
    animation: fadeInUp 0.6s ease-out;
  }

  h2.not-found-sad-face {
    font-size: clamp(2rem, 5vh, 3.5rem);
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      sans-serif;
    font-weight: 300;
    cursor: default;
    color: #999;
    margin: 0.5rem 0 1rem;
    animation: fadeInUp 0.6s ease-out 0.1s both;
  }

  p.not-found-subtitle {
    font-size: clamp(1.2rem, 3vh, 1.8rem);
    font-weight: 500;
    color: #444;
    margin: 40px 0 2rem;
    letter-spacing: 0.02em;
    animation: fadeInUp 0.6s ease-out 0.2s both;
  }

  a.go-home {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    color: #fff;
    text-decoration: none;
    background: #dc7efc;
    box-shadow: 0 4px 14px rgba(184, 61, 221, 0.3);
    transition: all 0.2s ease;
    animation: fadeInUp 0.6s ease-out 0.3s both;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(184, 61, 221, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(184, 61, 221, 0.3);
    }
  }

  ::selection {
    background-color: #db78fc;
    color: #fff;
  }

  @include phone {
    padding: 1.5rem;

    h1.not-found-title {
      font-size: 5rem;
    }

    h2.not-found-sad-face {
      font-size: 1.8rem;
    }

    p.not-found-subtitle {
      font-size: 1.1rem;
    }
  }

  @include very-tiny-phone {
    padding: 1rem;

    h1.not-found-title {
      font-size: 4rem;
    }
  }
}
</style>
