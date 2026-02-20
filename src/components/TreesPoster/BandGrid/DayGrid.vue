<template>
  <div
    :class="[
      'band-grid',
      `band-grid-${slug}`,
      coHeadliner ? 'headliners-two' : 'headliners-one',
    ]"
  >
    <!-- Headliner(s) -->
    <div
      class="headliners-row"
      :class="coHeadliner ? 'headliners-two' : 'headliners-one'"
    >
      <BandSection
        position="main-headliner"
        @click="emitOpen('headliner', `${day} Headliner`)"
        :band="bands.headliner.band"
        :size="bands.headliner.size"
        :chosenImage="bands.headliner.chosenImage"
        :alwaysHighlight="alwaysHighlight"
      />
      <BandSection
        v-if="coHeadliner"
        position="main-headliner"
        @click="emitOpen('coHeadliner', `${day} Headliner`)"
        :band="bands.coHeadliner.band"
        :size="bands.coHeadliner.size"
        :chosenImage="bands.coHeadliner.chosenImage"
        :alwaysHighlight="alwaysHighlight"
      />
    </div>

    <!-- Second row -->
    <div class="sub-grid">
      <BandSection
        v-for="(slot, i) in bands.secondRow"
        :key="`second-${i}`"
        position="main-sub"
        @click="emitOpen(`secondRow.${i}`, `${day} Band`)"
        :band="slot.band"
        :size="slot.size"
        :chosenImage="slot.chosenImage"
        :alwaysHighlight="alwaysHighlight"
      />
    </div>

    <!-- Third row -->
    <div class="sub-grid-four">
      <BandSection
        v-for="(slot, i) in bands.thirdRow"
        :key="`third-${i}`"
        position="main-sub"
        @click="emitOpen(`thirdRow.${i}`, `${day} Band`)"
        :band="slot.band"
        :size="slot.size"
        :chosenImage="slot.chosenImage"
        :alwaysHighlight="alwaysHighlight"
      />
    </div>

    <!-- Inputs (optional, could also be slotted in) -->
    <div class="input-grid">
      <BandInput size="medium" />
      <BandInput size="small" />
    </div>
  </div>
</template>

<script>
import BandSection from "../BandGrid/BandSection.vue";
import BandInput from "../BandGrid/BandInput.vue";

export default {
  name: "DayGrid",
  components: { BandSection, BandInput },
  props: {
    day: { type: String, required: true }, // e.g. "Thursday"
    slug: { type: String, required: true }, // e.g. "dayOne"
    bands: { type: Object, required: true }, // nested object with headliner/coHeadliner/secondRow/thirdRow
    coHeadliner: { type: Boolean, default: false },
    alwaysHighlight: { type: Boolean, default: false },
  },
  emits: ["open"],
  methods: {
    emitOpen(position, title) {
      this.$emit("open", { slug: this.slug, position, title });
    },
  },
};
</script>

<style scoped lang="scss">
@use "../../../assets/scss/styles.scss";

.band-grid {
  height: 30%;
  box-sizing: border-box;
}

.smallest-band-logo {
  transform: scale(0.7);
}
.smaller-band-logo {
  transform: scale(0.8);
}
.small-band-logo {
  transform: scale(0.9);
}
.normal-band-logo {
  transform: scale(1);
}
.large-band-logo {
  transform: scale(1.1);
}
.larger-band-logo {
  transform: scale(1.2);
}
.largest-band-logo {
  transform: scale(1.3);
}

.headliners-row.headliners-one {
  display: grid;
  grid-template-columns: 1fr; /* single column */
  height: 31%;
}

.headliners-row.headliners-two {
  display: grid;
  grid-template-columns: 1fr 1fr; /* two equal columns */
  height: 31%;
  gap: 0;
}

.headliners-row.two-headliners > * {
  flex: 1; /* equal width for both headliners */
  max-width: 50%; /* optional, to prevent them from getting too wide */
}
</style>
