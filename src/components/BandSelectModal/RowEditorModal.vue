<template>
  <div class="modal-backdrop">
    <div
      class="modal"
      :style="{
        transform: `translate(${drag.offsetX}px, ${drag.offsetY}px)`,
        cursor: drag.active ? 'grabbing' : 'default',
      }"
    >
      <header
        class="modal-header"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @touchmove.prevent="onDrag"
        style="cursor: grab"
      >
        <slot name="header">Edit {{ title }}</slot>
        <button type="button" class="btn-close" @click="$emit('close')">
          x
        </button>
      </header>

      <section class="modal-body">
        <SearchDropdown
          :id="row.bands.length"
          :options="bands"
          v-model="inputText"
          @commit="onCommit"
          :placeholder="addPlaceholder"
        />

        <div class="helper">
          {{ row.bands.length }} / {{ row.maxBands }} bands in this row
        </div>

        <div v-if="showCoHeadlinerToggle" class="toggle-wrap">
          <label v-if="title.includes('Thursday')">
            <input
              type="checkbox"
              :checked="thursdayCoHeadliner"
              @change="
                $emit('co-headliner', {
                  day: 'Thursday',
                  value: $event.target.checked,
                })
              "
            />
            <span>Enable Thursday co-headliner</span>
          </label>

          <label v-if="title.includes('Friday')">
            <input
              type="checkbox"
              :checked="fridayCoHeadliner"
              @change="
                $emit('co-headliner', {
                  day: 'Friday',
                  value: $event.target.checked,
                })
              "
            />
            <span>Enable Friday co-headliner</span>
          </label>

          <label v-if="title.includes('Saturday')">
            <input
              type="checkbox"
              :checked="saturdayCoHeadliner"
              @change="
                $emit('co-headliner', {
                  day: 'Saturday',
                  value: $event.target.checked,
                })
              "
            />
            <span>Enable Saturday co-headliner</span>
          </label>
        </div>

        <div v-if="row.bands.length" class="selected-list">
          <div
            v-for="(band, index) in row.bands"
            :key="`${band.id || band.name}-${index}`"
            class="selected-item"
          >
            <div class="selected-name">
              {{ band.name.toUpperCase() }}
              <small>({{ band.source }})</small>
            </div>

            <div class="selected-actions">
              <button
                type="button"
                @click="$emit('move-band', { index, direction: 'up' })"
                :disabled="index === 0"
              >
                ↑
              </button>
              <button
                type="button"
                @click="$emit('move-band', { index, direction: 'down' })"
                :disabled="index === row.bands.length - 1"
              >
                ↓
              </button>
              <button
                type="button"
                class="danger"
                @click="$emit('remove-band', index)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div class="slider-container">
          <label for="slider">Row text size: {{ sliderValue }}</label>
          <input
            id="slider"
            type="range"
            v-model.number="sliderValue"
            min="1"
            max="7"
            step="1"
            @input="$emit('set-size', sliderValue)"
          />

          <label style="margin-top: 0.75rem">Weight</label>
          <select
            v-model.number="fontWeight"
            @change="$emit('set-weight', fontWeight)"
          >
            <option :value="200">Ultra Light (200)</option>
            <option :value="400">Regular (400)</option>
            <option :value="500">Medium (500)</option>
            <option :value="800">Heavy (800)</option>
            <option :value="900">Black (900)</option>
          </select>
        </div>
      </section>

      <div class="footer-actions">
        <button type="button" class="button-confirm" @click="$emit('close')">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SearchDropdown from "./SearchDropdown.vue";
import { bands } from "@benjicwood/artist-assets";

export default {
  name: "RowEditorModal",
  components: { SearchDropdown },
  emits: [
    "add-band",
    "remove-band",
    "move-band",
    "set-size",
    "set-weight",
    "co-headliner",
    "close",
  ],
  props: {
    title: String,
    row: { type: Object, required: true },
    slug: String,
    rowKey: String,
    thursdayCoHeadliner: Boolean,
    fridayCoHeadliner: Boolean,
    saturdayCoHeadliner: Boolean,
  },

  data() {
    return {
      bands,
      inputText: "",
      sliderValue: 4,
      fontWeight: 400,
      drag: {
        active: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
      },
    };
  },

  computed: {
    addPlaceholder() {
      return this.row.bands.length >= this.row.maxBands
        ? "Row is full"
        : "Search and add a band";
    },

    showCoHeadlinerToggle() {
      return this.rowKey === "headliner" && this.slug !== "dayFour";
    },
  },

  mounted() {
    this.sliderValue = Number(this.row.size) || 4;
    this.fontWeight = Number(this.row.weight) || 400;

    window.addEventListener("mousemove", this.onDrag);
    window.addEventListener("mouseup", this.stopDrag);
    window.addEventListener("touchmove", this.onDrag);
    window.addEventListener("touchend", this.stopDrag);
  },

  beforeUnmount() {
    window.removeEventListener("mousemove", this.onDrag);
    window.removeEventListener("mouseup", this.stopDrag);
    window.removeEventListener("touchmove", this.onDrag);
    window.removeEventListener("touchend", this.stopDrag);
  },

  methods: {
    onCommit(payload) {
      if (!payload || payload.type === "clear") {
        this.inputText = "";
        return;
      }

      if (this.row.bands.length >= this.row.maxBands) {
        this.inputText = "";
        return;
      }

      const text = (payload.text || "").trim();
      if (!text) {
        this.inputText = "";
        return;
      }

      const normalized = text.toUpperCase();

      // Prevent exact duplicate consecutive adds / duplicate rows
      const alreadyExists = this.row.bands.some(
        (band) => (band?.name || "").trim().toUpperCase() === normalized,
      );

      if (alreadyExists) {
        this.inputText = "";
        return;
      }

      if (payload.type === "option") {
        this.$emit("add-band", {
          id: payload.option?.id ?? null,
          name: text,
          source: "catalog",
        });
      } else {
        this.$emit("add-band", {
          id: null,
          name: text,
          source: "custom",
        });
      }

      this.inputText = "";
    },

    startDrag(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      this.drag.active = true;
      this.drag.startX = clientX - this.drag.offsetX;
      this.drag.startY = clientY - this.drag.offsetY;

      document.body.style.userSelect = "none";
    },

    onDrag(e) {
      if (!this.drag.active) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const newOffsetX = clientX - this.drag.startX;
      const newOffsetY = clientY - this.drag.startY;

      const maxX = window.innerWidth * 0.75;
      const maxY = window.innerHeight / 2;

      this.drag.offsetX = Math.min(Math.max(newOffsetX, -maxX), maxX);
      this.drag.offsetY = Math.min(Math.max(newOffsetY, -maxY), maxY);
    },

    stopDrag() {
      this.drag.active = false;
      document.body.style.userSelect = "";
    },
  },
};
</script>

<style lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 1rem;
  box-sizing: border-box;
}

.modal {
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
  font-family: "NeueHaasUnica", sans-serif;
  position: relative;
  border: 2px solid #711214;
}

@media screen and (min-width: 992px) {
  .modal {
    max-width: 80%;
  }
}

.modal-header {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #711214;
  background-color: #e5f5f4;
  color: rgb(60, 54, 54);
  font-weight: 600;
}

.modal-body {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  font-weight: bold;
  color: rgb(60, 54, 54);
  background: transparent;
}

.helper {
  color: #555;
  font-size: 0.9rem;
}

.toggle-wrap label {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  background: #f6f6f6;
  padding: 0.75rem;
  border-radius: 6px;
}

.selected-name {
  font-weight: 600;

  small {
    font-weight: 400;
    color: #666;
    margin-left: 0.35rem;
  }
}

.selected-actions {
  display: flex;
  gap: 0.35rem;

  button {
    border: none;
    padding: 0.45rem 0.65rem;
    border-radius: 6px;
    cursor: pointer;
    background: #ddd;
  }

  .danger {
    background: #711214;
    color: white;
  }
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input[type="range"] {
  width: 100%;
  max-width: 300px;
}

select {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
}

.footer-actions {
  padding: 0.8rem;
  text-align: center;
}

.button-confirm {
  border: 1px solid white;
  color: white;
  padding: 0.8rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
  background: green;
}
</style>
