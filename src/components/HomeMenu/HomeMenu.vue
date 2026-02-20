<template>
  <div class="menu-screen">
    <router-link to="/trees" class="menu-square stacked">
      <!-- <p>Stacked Days Poster</p> -->
    </router-link>
    <router-link to="/download" class="menu-square columned">
      <!-- <p>Column Poster</p> -->
    </router-link>
  </div>
</template>

<script>
export default {
  name: "HomeMenu",
};
</script>

<style scoped>
.menu-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  min-height: 100vh;
  width: 100vw;
  /* background: #111; */
  flex-wrap: wrap; /* stacks on mobile */
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.3); /* tweak opacity to taste */
  background-image: url(../../assets/background/squarespace-bg.png);
}

.menu-square {
  flex: 1 1 200px;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e5f5f4;
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 1rem;
  text-decoration: none;
  transition:
    background 0.3s,
    transform 0.2s;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: top center;
  border: 1px solid #ef492f;
}

.columned {
  background-image: url(../../assets/icons/columned-light.png);
}

.stacked {
  background-image: url(../../assets/icons/stacked-light.png);
}

.menu-square:hover {
  /* background: #555; */
  transform: scale(1.05);
}
</style>
