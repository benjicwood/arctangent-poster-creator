<template>
  <div class="wrap">
    <h2 style="text-align: center; color: white">Latest Posters</h2>

    <div v-if="loading">Loading…</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="grid">
      <a
        v-for="p in posters"
        :key="p.public_id"
        :href="imgUrl(p)"
        target="_blank"
        rel="noreferrer"
      >
        <img :src="imgUrl(p)" alt="Poster" loading="lazy" />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { posters: [], loading: true, error: null };
  },

  async mounted() {
    try {
      // IMPORTANT: this is the TAG list endpoint
      const res = await fetch(
        "https://res.cloudinary.com/dhqkcdjcx/image/list/trees-gallery.json",
      );
      if (!res.ok) throw new Error(`List failed (${res.status})`);
      const data = await res.json();

      // sort newest first (just in case) + take latest 8
      this.posters = (data.resources || [])
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);
    } catch (e) {
      console.error(e);
      this.error = e?.message || "Failed to load gallery";
    } finally {
      this.loading = false;
    }
  },

  methods: {
    imgUrl(p) {
      // v<version> makes sure you don't get a cached old image
      return `https://res.cloudinary.com/dhqkcdjcx/image/upload/f_auto,q_auto,w_800/v${p.version}/${p.public_id}.png`;
    },
  },
};
</script>

<style scoped>
.wrap {
  padding: 24px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
img {
  width: 100%;
  display: block;
  border-radius: 8px;
}
@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
