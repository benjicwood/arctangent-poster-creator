<template>
  <div class="poster-content">
    <!-- Wednesday -->
    <div class="band-grid-wednesday">
      <PosterRow
        class="wednesday-headliner"
        :row="days.dayFour.headliner"
        placeholder="CLICK TO ADD WEDNESDAY HEADLINER"
        @click="openEditor('dayFour', 'headliner', 'Wednesday Headliner')"
        :alwaysHighlight="
          alwaysHighlight || isActiveRow('dayFour', 'headliner')
        "
      />

      <PosterRow
        class="wednesday-second-row"
        :row="days.dayFour.secondRow"
        placeholder="CLICK TO ADD WEDNESDAY BANDS"
        @click="openEditor('dayFour', 'secondRow', 'Wednesday Bands')"
        :alwaysHighlight="
          alwaysHighlight || isActiveRow('dayFour', 'secondRow')
        "
      />

      <PosterRow
        class="wednesday-fourth-row"
        :row="days.dayFour.fourthRow"
        placeholder="CLICK TO ADD EXTRA WEDNESDAY BANDS"
        @click="openEditor('dayFour', 'fourthRow', 'Wednesday Extra Row')"
        :alwaysHighlight="
          alwaysHighlight || isActiveRow('dayFour', 'fourthRow')
        "
      />
    </div>

    <!-- Thursday -->
    <DayGrid
      day="Thursday"
      slug="dayOne"
      :bands="days.dayOne"
      :coHeadliner="coHeadliner.thursday"
      :alwaysHighlight="alwaysHighlight"
      :activeRowKey="
        activeSlug === 'dayOne' && isEditorVisible ? activeRowKey : null
      "
      @open="openEditor"
    />

    <!-- Friday -->
    <DayGrid
      day="Friday"
      slug="dayTwo"
      :bands="days.dayTwo"
      :coHeadliner="coHeadliner.friday"
      :alwaysHighlight="alwaysHighlight"
      :activeRowKey="
        activeSlug === 'dayTwo' && isEditorVisible ? activeRowKey : null
      "
      @open="openEditor"
    />

    <!-- Saturday -->
    <DayGrid
      day="Saturday"
      slug="dayThree"
      :bands="days.dayThree"
      :coHeadliner="coHeadliner.saturday"
      :alwaysHighlight="alwaysHighlight"
      :activeRowKey="
        activeSlug === 'dayThree' && isEditorVisible ? activeRowKey : null
      "
      @open="openEditor"
    />
  </div>

  <RowEditorTray
    :title="editorTitle"
    :row="isEditorVisible ? activeRow : null"
    :slug="activeSlug"
    :rowKey="activeRowKey"
    :placement="trayPlacement"
    :thursdayCoHeadliner="coHeadliner.thursday"
    :fridayCoHeadliner="coHeadliner.friday"
    :saturdayCoHeadliner="coHeadliner.saturday"
    @add-band="addBandToRow"
    @remove-band="removeBandFromRow"
    @move-band="moveBandInRow"
    @set-size="setRowSize"
    @set-weight="setRowWeight"
    @co-headliner="handleCoHeadliner"
    @close="closeEditor"
  />
</template>

<script>
import DayGrid from "./DayGrid.vue";
import PosterRow from "./PosterRow.vue";
import RowEditorTray from "../../BandSelectModal/RowEditorTray.vue";

const makeRow = ({
  size = 4,
  weight = 500,
  maxBands = 5,
  minPx = 10,
  allowWrap = false,
} = {}) => ({
  bands: [],
  size,
  weight,
  maxBands,
  minPx,
  allowWrap,
});

const makeStandardDay = () => ({
  headliner: makeRow({
    size: 6,
    weight: 900,
    maxBands: 1,
    minPx: 18,
    allowWrap: true,
  }),
  coHeadliner: makeRow({
    size: 6,
    weight: 900,
    maxBands: 1,
    minPx: 18,
    allowWrap: true,
  }),
  secondRow: makeRow({ size: 5, weight: 500, maxBands: 5, minPx: 11 }),
  thirdRow: makeRow({ size: 3, weight: 500, maxBands: 8, minPx: 9 }),
  fourthRow: makeRow({ size: 2, weight: 500, maxBands: 10, minPx: 8 }),
  fifthRow: makeRow({ size: 2, weight: 500, maxBands: 10, minPx: 8 }),
});

const makeWednesday = () => ({
  headliner: makeRow({
    size: 6,
    weight: 900,
    maxBands: 1,
    minPx: 18,
    allowWrap: true,
  }),
  secondRow: makeRow({ size: 4, weight: 500, maxBands: 4, minPx: 10 }),
  fourthRow: makeRow({ size: 2, weight: 500, maxBands: 8, minPx: 8 }),
});

export default {
  name: "BandGrid",
  components: { DayGrid, PosterRow, RowEditorTray },
  props: {
    alwaysHighlight: { type: Boolean, default: false },
  },

  data() {
    return {
      isEditorVisible: false,
      activeSlug: null,
      activeRowKey: null,
      editorTitle: "",
      isTrayMobile: false,

      days: {
        dayOne: makeStandardDay(),
        dayTwo: makeStandardDay(),
        dayThree: makeStandardDay(),
        dayFour: makeWednesday(),
      },

      coHeadliner: {
        thursday: false,
        friday: false,
        saturday: false,
      },
    };
  },

  computed: {
    activeRow() {
      if (!this.activeSlug || !this.activeRowKey) return null;
      return this.days[this.activeSlug]?.[this.activeRowKey] || null;
    },

    trayPlacement() {
      // Saturday always top
      if (this.activeSlug === "dayThree") return "top";

      // Friday also top on desktop + mobile for consistency
      if (this.activeSlug === "dayTwo") return "top";

      // Wednesday + Thursday bottom
      return "bottom";
    },
  },

  mounted() {
    this.updateTrayViewport();
    window.addEventListener("resize", this.updateTrayViewport);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateTrayViewport);
  },

  methods: {
    updateTrayViewport() {
      this.isTrayMobile = window.innerWidth <= 700;
    },

    openEditor(slug, rowKey, title) {
      this.activeSlug = slug;
      this.activeRowKey = rowKey;
      this.editorTitle = title;
      this.isEditorVisible = true;
    },

    closeEditor() {
      this.isEditorVisible = false;
    },

    isActiveRow(slug, rowKey) {
      return (
        this.isEditorVisible &&
        this.activeSlug === slug &&
        this.activeRowKey === rowKey
      );
    },

    addBandToRow(band) {
      const row = this.activeRow;
      if (!row) return;
      if (row.bands.length >= row.maxBands) return;

      row.bands.push({
        id: band.id || null,
        name: (band.name || "").trim(),
        source: band.source || "custom",
      });

      this.trackBandEvent("poster_band_added", {
        day: this.activeSlug,
        row: this.activeRowKey,
        band_id: band.id || "",
        band_name: band.name || "",
        source: band.source || "custom",
      });
    },

    removeBandFromRow(index) {
      const row = this.activeRow;
      if (!row || index < 0 || index >= row.bands.length) return;

      const removed = row.bands[index];
      row.bands.splice(index, 1);

      this.trackBandEvent("poster_band_removed", {
        day: this.activeSlug,
        row: this.activeRowKey,
        band_id: removed.id || "",
        band_name: removed.name || "",
        source: removed.source || "custom",
      });
    },

    moveBandInRow({ index, direction }) {
      const row = this.activeRow;
      if (!row) return;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= row.bands.length) return;

      const copy = [...row.bands];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      row.bands = copy;
    },

    setRowSize(size) {
      const row = this.activeRow;
      if (!row) return;
      row.size = Number(size) || 4;
    },

    setRowWeight(weight) {
      const row = this.activeRow;
      if (!row) return;
      row.weight = Number(weight) || 500;
    },

    handleCoHeadliner({ day, value }) {
      if (day === "Thursday") this.coHeadliner.thursday = value;
      if (day === "Friday") this.coHeadliner.friday = value;
      if (day === "Saturday") this.coHeadliner.saturday = value;
    },

    trackBandEvent(eventName, payload) {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@use "../../../assets/scss/styles.scss";

.poster-content {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(2.67px, 0.8vh, 10.67px);
  box-sizing: border-box;
  padding-top: 17%;
  padding-bottom: 8%;
  padding-left: 7%;
  padding-right: 4%;
  border: 3px solid white;
}

.band-grid-wednesday {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: stretch;
  gap: 1%;
  height: 12.5%;
  box-sizing: border-box;
}

.wednesday-headliner {
  height: 52%;
}

.wednesday-second-row {
  height: 24%;
}

.wednesday-fourth-row {
  height: 14%;
}
</style>
