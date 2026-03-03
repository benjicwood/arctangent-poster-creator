<template>
  <div class="poster-content">
    <!-- Wednesday -->
    <div class="band-grid-wednesday">
      <div class="band-row">
        <BandSection
          class="headliner"
          position="headliner"
          @click="
            openModal({
              slug: 'dayFour',
              position: 'headliner',
              title: 'Wednesday Headliner',
            })
          "
          :band="days.dayFour.headliner.band"
          :size="days.dayFour.headliner.size"
          :weight="days.dayFour.headliner.weight"
          :chosenImage="null"
          :alwaysHighlight="alwaysHighlight"
          :textOnly="true"
        />

        <BandSection
          v-for="(slot, i) in days.dayFour.secondRow"
          :key="`wednesday-${i}`"
          class="main-sub"
          :position="`secondRow.${i}`"
          @click="
            openModal({
              slug: 'dayFour',
              position: `secondRow.${i}`,
              title: `Wednesday Band ${i + 1}`,
            })
          "
          :band="slot.band"
          :size="slot.size"
          :weight="slot.weight"
          :chosenImage="null"
          :alwaysHighlight="alwaysHighlight"
          :textOnly="true"
        />
      </div>

      <div class="band-input-row">
        <BandInput size="small" />
      </div>
    </div>

    <!-- Thursday -->
    <DayGrid
      day="Thursday"
      slug="dayOne"
      :bands="days.dayOne"
      :coHeadliner="coHeadliner.thursday"
      @open="openModal"
      :alwaysHighlight="alwaysHighlight"
    />

    <!-- Friday -->
    <DayGrid
      day="Friday"
      slug="dayTwo"
      :bands="days.dayTwo"
      :coHeadliner="coHeadliner.friday"
      @open="openModal"
      :alwaysHighlight="alwaysHighlight"
    />

    <!-- Saturday -->
    <DayGrid
      day="Saturday"
      slug="dayThree"
      :bands="days.dayThree"
      :coHeadliner="coHeadliner.saturday"
      @open="openModal"
      :alwaysHighlight="alwaysHighlight"
    />
  </div>

  <!-- Modal -->
  <BandSelectModal
    v-show="isModalVisible"
    @selected="onSelect"
    @size="onResize"
    @weight="onWeight"
    @close="closeModal"
    @co-headliner="handleCoHeadliner"
    :title="modalTitle"
    :position="modalPosition"
    :key="key ? key.toString() : ''"
    :hasBand="activeBand"
    :thursdayCoHeadliner="coHeadliner.thursday"
    :fridayCoHeadliner="coHeadliner.friday"
    :saturdayCoHeadliner="coHeadliner.saturday"
    :currentBand="currentBand"
    :currentImage="null"
  />
</template>

<script>
import DayGrid from "./DayGrid.vue";
import BandSelectModal from "../../BandSelectModal/BandSelectModal.vue";
import BandSection from "./BandSection.vue";
import BandInput from "./BandInput.vue";

const makeSlot = (band = "", size = "text-size-4", weight = 400) => ({
  band,
  size,
  weight,
  chosenImage: null,
});

export default {
  name: "BandGrid",
  props: {
    alwaysHighlight: { type: Boolean, default: false },
  },
  components: { DayGrid, BandSelectModal, BandSection, BandInput },
  data() {
    return {
      isModalVisible: false,
      modalTitle: "",
      modalPosition: null,
      modalSlug: null,
      key: 0,
      activeBand: null,

      days: {
        dayOne: {
          headliner: makeSlot("", "text-size-6", 700),
          coHeadliner: makeSlot("", "text-size-6", 700),
          secondRow: [makeSlot(), makeSlot(), makeSlot()],
          thirdRow: [makeSlot(), makeSlot(), makeSlot(), makeSlot()],
        },
        dayTwo: {
          headliner: makeSlot("", "text-size-6", 700),
          coHeadliner: makeSlot("", "text-size-6", 700),
          secondRow: [makeSlot(), makeSlot(), makeSlot()],
          thirdRow: [makeSlot(), makeSlot(), makeSlot(), makeSlot()],
        },
        dayThree: {
          headliner: makeSlot("", "text-size-6", 700),
          coHeadliner: makeSlot("", "text-size-6", 700),
          secondRow: [makeSlot(), makeSlot(), makeSlot()],
          thirdRow: [makeSlot(), makeSlot(), makeSlot(), makeSlot()],
        },
        dayFour: {
          headliner: makeSlot("", "text-size-6", 700),
          secondRow: [makeSlot(), makeSlot(), makeSlot()],
        },
      },

      coHeadliner: {
        thursday: false,
        friday: false,
        saturday: false,
      },
    };
  },
  computed: {
    currentBand() {
      const slot = this.getSlot(this.modalSlug, this.modalPosition);
      return slot?.band ?? "";
    },
  },
  methods: {
    openModal({ slug, position, title }) {
      this.modalSlug = slug;
      this.modalPosition = position;
      this.modalTitle = title;
      this.key = `${slug}-${position}`;

      const slot = this.getSlot(slug, position);
      this.activeBand = !!slot?.band;

      this.isModalVisible = true;
    },

    onSelect(selected) {
      const slot = this.getSlot(this.modalSlug, this.modalPosition);
      if (!slot) return;

      // Always store TEXT only
      // slot.band = selected?.name || selected?.id || "";
      slot.band = (selected?.name || selected?.id || "").toUpperCase();

      // Always no images in text-only mode
      slot.chosenImage = null;
    },

    onResize(sizeNum) {
      const slot = this.getSlot(this.modalSlug, this.modalPosition);
      if (!slot) return;
      slot.size = `text-size-${sizeNum}`;
    },

    onWeight(weight) {
      const slot = this.getSlot(this.modalSlug, this.modalPosition);
      if (!slot) return;
      slot.weight = Number(weight) || 400;
    },

    handleCoHeadliner({ day, value }) {
      if (day === "Thursday") this.coHeadliner.thursday = value;
      if (day === "Friday") this.coHeadliner.friday = value;
      if (day === "Saturday") this.coHeadliner.saturday = value;
    },

    closeModal() {
      this.isModalVisible = false;
    },

    getSlot(slug, position) {
      if (!slug || !position) return null;
      const path = position.split(".");
      let slot = this.days[slug];
      for (const key of path) {
        if (slot == null) return null;
        slot = slot[key];
      }
      return slot;
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

.row {
  flex-grow: 1;
  display: flex;
  // justify-content: center;
}

.band-grid-wednesday {
  display: flex;
  flex-direction: column;
  width: 100%;
  // justify-content: center;
  align-items: stretch;
  gap: 1%;
  height: 12.5%;
  box-sizing: border-box;
}

.band-grid-wednesday .headliner {
  width: 40%;
}

.band-row {
  display: flex;
  // justify-content: center;
  align-items: stretch;
  gap: 1%;
  flex: 1;
}

.band-input-row {
  width: 100%;
}

.band-grid-wednesday .main-sub {
  width: 20%;
}

.band-grid-wednesday .headliner,
.band-grid-wednesday .main-sub {
  border: 1px solid transparent;
  box-sizing: border-box;
}

.band-grid-wednesday .headliner:hover,
.band-grid-wednesday .main-sub:hover {
  border-color: #c67d0e;
}
</style>