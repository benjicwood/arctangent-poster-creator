<template>
  <div
    :class="[
      'band-grid',
      `band-grid-${slug}`,
      coHeadliner ? 'headliners-two' : 'headliners-one',
    ]"
  >
    <div
      class="headliners-row"
      :class="coHeadliner ? 'headliners-two' : 'headliners-one'"
    >
      <PosterRow
        :row="bands.headliner"
        :placeholder="`CLICK TO ADD ${day.toUpperCase()} HEADLINER(S)`"
        :alwaysHighlight="alwaysHighlight || activeRowKey === 'headliner'"
        :showPlaceholderAlways="!posterStarted"
        :hideEditingUI="hideEditingUI"
        @click="$emit('open', slug, 'headliner', `${day} Headliner`)"
      />

      <PosterRow
        v-if="coHeadliner"
        :row="bands.coHeadliner"
        :placeholder="`CLICK TO ADD ${day.toUpperCase()} CO-HEADLINER`"
        :alwaysHighlight="alwaysHighlight || activeRowKey === 'coHeadliner'"
        :showPlaceholderAlways="!posterStarted"
        :hideEditingUI="hideEditingUI"
        @click="$emit('open', slug, 'coHeadliner', `${day} Co-Headliner`)"
      />
    </div>

    <PosterRow
      class="second-row"
      :row="bands.secondRow"
      :placeholder="`CLICK TO ADD ${day.toUpperCase()} BANDS`"
      :alwaysHighlight="alwaysHighlight || activeRowKey === 'secondRow'"
      :showPlaceholderAlways="!posterStarted"
      :hideEditingUI="hideEditingUI"
      @click="$emit('open', slug, 'secondRow', `${day} Second Row`)"
    />

    <PosterRow
      class="third-row"
      :row="bands.thirdRow"
      :placeholder="`CLICK TO ADD ${day.toUpperCase()} LOWER LINEUP`"
      :alwaysHighlight="alwaysHighlight || activeRowKey === 'thirdRow'"
      :showPlaceholderAlways="!posterStarted"
      :hideEditingUI="hideEditingUI"
      @click="$emit('open', slug, 'thirdRow', `${day} Third Row`)"
    />

    <PosterRow
      class="fourth-row"
      :row="bands.fourthRow"
      :placeholder="`CLICK TO ADD ${day.toUpperCase()} EXTRA BANDS`"
      :alwaysHighlight="alwaysHighlight || activeRowKey === 'fourthRow'"
      :showPlaceholderAlways="!posterStarted"
      :hideEditingUI="hideEditingUI"
      @click="$emit('open', slug, 'fourthRow', `${day} Extra Row`)"
    />

    <PosterRow
      class="fifth-row"
      :row="bands.fifthRow"
      :placeholder="`CLICK TO ADD ${day.toUpperCase()} MORE BANDS`"
      :alwaysHighlight="alwaysHighlight || activeRowKey === 'fifthRow'"
      :showPlaceholderAlways="!posterStarted"
      :hideEditingUI="hideEditingUI"
      @click="$emit('open', slug, 'fifthRow', `${day} Final Row`)"
    />
  </div>
</template>

<script>
import PosterRow from "./PosterRow.vue";

export default {
  name: "DayGrid",
  components: { PosterRow },
  props: {
    day: { type: String, required: true },
    slug: { type: String, required: true },
    bands: { type: Object, required: true },
    coHeadliner: { type: Boolean, default: false },
    alwaysHighlight: { type: Boolean, default: false },
    activeRowKey: { type: String, default: null },
    posterStarted: { type: Boolean, default: false },
    hideEditingUI: { type: Boolean, default: false },
  },
  emits: ["open"],
};
</script>

<style scoped lang="scss">
@use "../../../assets/scss/styles.scss";

.band-grid {
  height: 27.5%;
  box-sizing: border-box;
  margin: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1%;
}

.headliners-row.headliners-one {
  display: grid;
  grid-template-columns: 1fr;
  height: 29%;
}

.headliners-row.headliners-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 29%;
  gap: 0;
}

.second-row {
  height: 17%;
}

.third-row {
  height: 14%;
}

.fourth-row {
  height: 11%;
}

.fifth-row {
  height: 11%;
}
</style>
