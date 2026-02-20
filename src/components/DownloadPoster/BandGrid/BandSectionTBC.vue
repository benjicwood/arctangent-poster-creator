<template>
  <div
    :class="[position, size]"
    :style="bandStyle"
    @click="$emit('click')"
  ></div>
</template>

<script>
import { bands } from "@benjicwood/artist-assets";

export default {
  name: "BandSection",
  props: {
    band: String,
    position: String,
    size: String,
    chosenImage: String,
  },
  computed: {
    bandData() {
      return bands.find((b) => b.id === this.band) || null;
    },
    bandStyle() {
      const img = this.chosenImage || this.bandData?.logo;
      if (img) {
        return {
          backgroundImage: `url(${img})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        };
      }
      return {};
    },
  },
};
</script>

<style scoped lang="scss">
</style>