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
        :weight="bands.headliner.weight"
        :chosenImage="null"
        :alwaysHighlight="alwaysHighlight"
        :textOnly="true"
      />
      <BandSection
        v-if="coHeadliner"
        position="main-headliner"
        @click="emitOpen('coHeadliner', `${day} Headliner`)"
        :band="bands.coHeadliner.band"
        :size="bands.coHeadliner.size"
        :weight="bands.coHeadliner.weight"
        :chosenImage="null"
        :alwaysHighlight="alwaysHighlight"
        :textOnly="true"
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
        :weight="slot.weight"
        :chosenImage="null"
        :alwaysHighlight="alwaysHighlight"
        :textOnly="true"
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
        :weight="slot.weight"
        :chosenImage="null"
        :alwaysHighlight="alwaysHighlight"
        :textOnly="true"
      />
    </div>

    <!-- Inputs -->
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
    day: { type: String, required: true },
    slug: { type: String, required: true },
    bands: { type: Object, required: true },
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
  height: 27.5%;
  box-sizing: border-box;
  margin: 0;
  flex-shrink: 0;
}

.headliners-row.headliners-one {
  display: grid;
  grid-template-columns: 1fr;
  height: 31%;
}

.headliners-row.headliners-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 31%;
  gap: 0;
}

.headliners-row.two-headliners > * {
  flex: 1;
  max-width: 50%;
}
</style>