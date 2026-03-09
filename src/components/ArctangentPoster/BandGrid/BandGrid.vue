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
        :showPlaceholderAlways="!posterStarted"
        :hideEditingUI="hideEditingUI"
      />

      <PosterRow
        class="wednesday-second-row"
        :row="days.dayFour.secondRow"
        placeholder="CLICK TO ADD WEDNESDAY BANDS"
        @click="openEditor('dayFour', 'secondRow', 'Wednesday Bands')"
        :alwaysHighlight="
          alwaysHighlight || isActiveRow('dayFour', 'secondRow')
        "
        :showPlaceholderAlways="!posterStarted"
        :hideEditingUI="hideEditingUI"
      />

      <PosterRow
        class="wednesday-fourth-row"
        :row="days.dayFour.fourthRow"
        placeholder="CLICK TO ADD EXTRA WEDNESDAY BANDS"
        @click="openEditor('dayFour', 'fourthRow', 'Wednesday Extra Row')"
        :alwaysHighlight="
          alwaysHighlight || isActiveRow('dayFour', 'fourthRow')
        "
        :showPlaceholderAlways="!posterStarted"
        :hideEditingUI="hideEditingUI"
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
      :posterStarted="posterStarted"
      :hideEditingUI="hideEditingUI"
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
      :posterStarted="posterStarted"
      :hideEditingUI="hideEditingUI"
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
      :posterStarted="posterStarted"
      :hideEditingUI="hideEditingUI"
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
  size = 5,
  weight = 500,
  maxBands = 5,
  minPx = 10,
  maxPx = 18,
  allowWrap = false,
} = {}) => ({
  bands: [],
  size,
  weight,
  maxBands,
  minPx,
  maxPx,
  allowWrap,
});

const makeStandardDay = () => ({
  headliner: makeRow({
    size: 7,
    weight: 900,
    maxBands: 1,
    minPx: 18,
    maxPx: 56,
    allowWrap: true,
  }),
  coHeadliner: makeRow({
    size: 7,
    weight: 900,
    maxBands: 1,
    minPx: 18,
    maxPx: 50,
    allowWrap: true,
  }),
  secondRow: makeRow({
    size: 6,
    weight: 500,
    maxBands: 5,
    minPx: 11,
    maxPx: 28,
  }),
  thirdRow: makeRow({
    size: 5,
    weight: 500,
    maxBands: 8,
    minPx: 9,
    maxPx: 20,
  }),
  fourthRow: makeRow({
    size: 4,
    weight: 500,
    maxBands: 10,
    minPx: 8,
    maxPx: 15,
  }),
  fifthRow: makeRow({
    size: 4,
    weight: 500,
    maxBands: 10,
    minPx: 8,
    maxPx: 15,
  }),
});

const makeWednesday = () => ({
  headliner: makeRow({
    size: 7,
    weight: 900,
    maxBands: 1,
    minPx: 18,
    maxPx: 56,
    allowWrap: true,
  }),
  secondRow: makeRow({
    size: 5,
    weight: 500,
    maxBands: 4,
    minPx: 10,
    maxPx: 24,
  }),
  fourthRow: makeRow({
    size: 4,
    weight: 500,
    maxBands: 8,
    minPx: 8,
    maxPx: 14,
  }),
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
      hideEditingUI: false,

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
      if (this.activeSlug === "dayThree") return "top";
      if (this.activeSlug === "dayTwo") return "top";
      return "bottom";
    },

    posterStarted() {
      return Object.values(this.days).some((day) =>
        Object.values(day).some(
          (value) => Array.isArray(value?.bands) && value.bands.length > 0,
        ),
      );
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
      if (this.hideEditingUI) return;
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
        !this.hideEditingUI &&
        this.isEditorVisible &&
        this.activeSlug === slug &&
        this.activeRowKey === rowKey
      );
    },

    setPreviewMode(isPreview) {
      this.hideEditingUI = !!isPreview;
      if (isPreview) this.closeEditor();
    },

    async runWithoutEditingUI(fn) {
      const previous = this.hideEditingUI;
      this.hideEditingUI = true;
      this.closeEditor();

      await this.$nextTick();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      try {
        return await fn();
      } finally {
        this.hideEditingUI = previous;
        await this.$nextTick();
      }
    },

    normalizeBandName(name) {
      return (name || "").trim().toUpperCase();
    },

    getAnalyticsDayLabel(slug) {
      const map = {
        dayFour: "Wednesday",
        dayOne: "Thursday",
        dayTwo: "Friday",
        dayThree: "Saturday",
      };

      return map[slug] || slug;
    },

    getAnalyticsRowLabel(rowKey) {
      const map = {
        headliner: "headliner",
        coHeadliner: "co_headliner",
        secondRow: "main_support",
        thirdRow: "midday_bands",
        fourthRow: "afternoon_bands",
        fifthRow: "opening_bands",
      };

      return map[rowKey] || rowKey;
    },

    addBandToRow(band) {
      const row = this.activeRow;
      if (!row) return;
      if (row.bands.length >= row.maxBands) return;

      const normalizedName = this.normalizeBandName(band.name);
      const normalizedId = band.id || null;
      const normalizedSource = band.source || "custom";

      // Prevent duplicates in the same row
      const alreadyExists = row.bands.some((existingBand) => {
        const existingName = this.normalizeBandName(existingBand.name);
        const existingId = existingBand.id || null;

        // Prefer ID match for catalog bands
        if (normalizedId && existingId) {
          return existingId === normalizedId;
        }

        // Fall back to normalized name match
        return existingName === normalizedName;
      });

      if (alreadyExists) {
        return;
      }

      row.bands.push({
        id: normalizedId,
        name: normalizedName,
        source: normalizedSource,
      });

      this.trackBandEvent("poster_band_added", {
        poster_day: this.getAnalyticsDayLabel(this.activeSlug),
        poster_row_key: this.activeRowKey,
        poster_row_label: this.getAnalyticsRowLabel(this.activeRowKey),
        band_id: normalizedId || "",
        band_name: normalizedName,
        band_source: normalizedSource,
      });
    },

    removeBandFromRow(index) {
      const row = this.activeRow;
      if (!row || index < 0 || index >= row.bands.length) return;

      row.bands.splice(index, 1);
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
      row.size = Number(size) || 5;
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

    // trackBandEvent(eventName, payload) {
    //   if (typeof window !== "undefined" && typeof window.gtag === "function") {
    //     window.gtag("event", eventName, payload);
    //   }
    // },
    trackBandEvent(eventName, payload) {
      console.log("TRACKING EVENT:", eventName, payload);

      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      } else {
        console.log("gtag not found");
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
  height: 44%;
}

.wednesday-second-row {
  height: 24%;
}

.wednesday-fourth-row {
  height: 22%;
}
</style>
