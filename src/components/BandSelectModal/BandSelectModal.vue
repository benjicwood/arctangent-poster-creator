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
        <slot name="header"> Select your {{ title }} </slot>
        <button type="button" class="btn-close" @click="close">x</button>
      </header>

      <section class="modal-body">
        <!-- ✅ single field typeahead -->
        <SearchDropdown
          :options="bands"
          v-model="inputText"
          @commit="onCommit"
          placeholder="Type a band name (or pick from list)"
        />

        <!-- Co-headliner toggles -->
        <template v-if="title && title === 'Thursday Headliner'">
          <div style="margin: auto; padding-bottom: 1rem">
            <label>
              <input type="checkbox" v-model="thursdayCoHeadlinerModel" />
              <span style="color: black; margin-left: 2px">
                is Co-Headliner (Thursday)
              </span>
            </label>
          </div>
        </template>

        <template v-if="title && title === 'Friday Headliner'">
          <div style="margin: auto; padding-bottom: 1rem">
            <label>
              <input type="checkbox" v-model="fridayCoHeadlinerModel" />
              <span style="color: black; margin-left: 2px">
                is Co-Headliner (Friday)
              </span>
            </label>
          </div>
        </template>

        <template v-if="title && title === 'Saturday Headliner'">
          <div style="margin: auto; padding-bottom: 1rem">
            <label>
              <input type="checkbox" v-model="saturdayCoHeadlinerModel" />
              <span style="color: black; margin-left: 2px">
                is Co-Headliner (Saturday)
              </span>
            </label>
          </div>
        </template>

        <!-- ✅ Text controls (always available once something is typed or already exists) -->
        <div v-if="hasBand || inputText.trim().length" class="slider-container">
          <label for="slider">Text size: {{ sliderValue }}</label>
          <input
            type="range"
            id="slider"
            v-model.number="sliderValue"
            :min="1"
            :max="7"
            :step="1"
            @input="emitSize"
          />

          <label style="margin-top: 0.75rem">Weight</label>
          <select v-model.number="fontWeight" @change="emitWeight">
            <option :value="200">Ultra Light (200)</option>
            <option :value="400">Regular (400)</option>
            <option :value="500">Medium (500)</option>
            <!-- <option :value="700">Bold (700)</option> -->
            <option :value="800">Heavy (800)</option>
            <option :value="900">Black (900)</option>
          </select>
        </div>
      </section>

      <div class="clear-selection">
        <button type="button" class="button-clear" @click="clearSelection">
          Clear Selection
        </button>
        <button type="button" class="button-confirm" @click="close">
          Confirm Selection
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SearchDropdown from "./SearchDropdown.vue";
import { bands } from "@benjicwood/artist-assets";

export default {
  name: "BandSelectModal",
  props: {
    title: String,
    hasBand: Boolean,
    thursdayCoHeadliner: Boolean,
    fridayCoHeadliner: Boolean,
    saturdayCoHeadliner: Boolean,
    currentBand: String, // stored text
    position: String,
  },
  components: { SearchDropdown },
  emits: ["selected", "size", "weight", "close", "co-headliner"],
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
    thursdayCoHeadlinerModel: {
      get() {
        return this.thursdayCoHeadliner;
      },
      set(value) {
        this.$emit("co-headliner", { day: "Thursday", value });
      },
    },
    fridayCoHeadlinerModel: {
      get() {
        return this.fridayCoHeadliner;
      },
      set(value) {
        this.$emit("co-headliner", { day: "Friday", value });
      },
    },
    saturdayCoHeadlinerModel: {
      get() {
        return this.saturdayCoHeadliner;
      },
      set(value) {
        this.$emit("co-headliner", { day: "Saturday", value });
      },
    },
  },
  mounted() {
    window.addEventListener("mousemove", this.onDrag);
    window.addEventListener("mouseup", this.stopDrag);
    window.addEventListener("touchmove", this.onDrag);
    window.addEventListener("touchend", this.stopDrag);

    this.inputText = (this.currentBand || "").trim();
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.onDrag);
    window.removeEventListener("mouseup", this.stopDrag);
    window.removeEventListener("touchmove", this.onDrag);
    window.removeEventListener("touchend", this.stopDrag);
  },
  methods: {
    emitSize() {
      this.$emit("size", this.sliderValue);
    },
    emitWeight() {
      this.$emit("weight", this.fontWeight);
    },

    onCommit(payload) {
      // payload: { type: "option"|"custom"|"clear", text, option? }
      if (!payload || payload.type === "clear") {
        this.inputText = "";
        this.$emit("selected", { custom: true, name: "" });
        return;
      }

      const text = (payload.text || "").trim();

      if (payload.type === "option") {
        this.inputText = text;
        this.$emit("selected", {
          custom: false,
          name: text,
          id: payload.option?.id ?? null,
        });
        return;
      }

      // custom
      this.inputText = text;
      this.$emit("selected", { custom: true, name: text });
    },

    clearSelection() {
      this.inputText = "";
      this.$emit("selected", { custom: true, name: "" });
    },

    close() {
      this.drag.offsetX = 0;
      this.drag.offsetY = 0;
      this.$emit("close");
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
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  // justify-content: center;
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
  animation: fadeInScale 0.2s ease-out;
  border: 2px solid #711214;
}

@media screen and (min-width: 992px) {
  .modal {
    max-width: 80%;
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
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
  // justify-content: center;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.modal-body {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 70vh;
  position: relative;
  overflow: visible;
}

.btn-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border: none;
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-weight: bold;
  color: rgb(60, 54, 54);
  background: transparent;
  transition: color 0.2s;
}
.btn-close:hover {
  color: #ff8c8c;
}

.slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.custom-band-input input {
  border: none;
  background: #0002;
  padding: 0.75rem 0.5rem;
  outline: none;
  color: gray;
  border-radius: 6px;
  width: 100%;
}

.clear-selection {
  text-align: center;
  padding: 0.8rem;

  button {
    border: 1px solid white;
    color: white;
    padding: 0.8rem 1rem;
    cursor: pointer;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: filter 0.2s ease;

    &.button-confirm {
      background: green;
    }
    &.button-clear {
      background: #711214;
    }

    &:hover {
      filter: brightness(0.8);
    }
  }
}
</style>
