<template>
  <div :class="[position, size, 'band-slot', { 'always-highlight': alwaysHighlight }]" :style="bandStyle" @click="$emit('click')">
    <span v-if="!bandStyle.backgroundImage && band" class="band-text">{{ band }}</span>
  </div>
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
    alwaysHighlight: { type: Boolean, default: false },
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
.band-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center; // handles multi-word names
}

.band-text {
  color: white; // festival poster default
  font-family: 'Impact', sans-serif;
  line-height: 1.1;
  word-break: break-word;
  max-width: 90%; // stops text overflowing
  font-size: clamp(0.8rem, 4vw, 3rem); 
}

.always-highlight {
  border: solid #C67D0E 1px !important;
}
</style>
