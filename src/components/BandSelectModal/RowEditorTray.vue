<template>
  <div
    class="editor-tray"
    :class="[placement, { open: !!row }]"
    :style="mobileTrayStyle"
  >
    <div v-if="row" class="editor-tray-inner">
      <div class="tray-drag-handle" @pointerdown="startTrayDrag">
        <span></span>
      </div>
      <div class="editor-tray-body">
        <div class="search-block">
          <div class="search-row">
            <SearchDropdown
              ref="searchDropdown"
              :id="row.bands.length"
              :options="bands"
              v-model="inputText"
              @commit="onCommit"
              :placeholder="addPlaceholder"
            />

            <button
              type="button"
              class="add-band-btn"
              :disabled="!canAddBand"
              @click="onAddButtonClick"
            >
              Add band
            </button>
          </div>

          <div class="helper">
            {{ row.bands.length }} / {{ row.maxBands }} bands in this row ·
            Press Enter or click Add band
          </div>
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

        <div v-if="row.bands.length" class="selected-wrap">
          <!-- <button
            type="button"
            class="collapse-toggle"
            @click="bandsExpanded = !bandsExpanded"
          >
            {{
              bandsExpanded
                ? "Hide selected bands"
                : `Show selected bands (${row.bands.length})`
            }}
          </button> -->

          <div class="selected-list">
            <div
              v-for="(band, index) in row.bands"
              :key="`${band.id || band.name}-${index}`"
              class="selected-item"
            >
              <div class="selected-name">
                <template v-if="editingIndex === index">
                  <input
                    :ref="`editInput-${index}`"
                    class="edit-band-input"
                    v-model="editingName"
                    @keydown.enter.prevent="saveBandEdit(index)"
                    @keydown.esc.prevent="cancelBandEdit"
                  />
                </template>

                <template v-else>
                  {{ band.name.toUpperCase() }}
                  <small>({{ band.source }})</small>
                </template>
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
                  v-if="editingIndex !== index"
                  type="button"
                  @click="startBandEdit(index, band)"
                >
                  Edit
                </button>

                <button
                  v-if="editingIndex === index"
                  type="button"
                  @click="saveBandEdit(index)"
                >
                  Save
                </button>

                <button
                  v-if="editingIndex === index"
                  type="button"
                  @click="cancelBandEdit"
                >
                  Cancel
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
        </div>

        <div class="controls-row">
          <div class="control-group grow">
            {{
              isAutoCappedRow ? "Text size (add more bands first)" : "Text size"
            }}
            <input
              id="row-size"
              type="range"
              :disabled="isAutoCappedRow"
              v-model.number="sliderValue"
              min="1"
              max="10"
              step="1"
              @input="$emit('set-size', sliderValue)"
            />
          </div>

          <div class="control-group weight-group">
            <label for="row-weight">Text weight</label>
            <select
              id="row-weight"
              v-model.number="fontWeight"
              @change="$emit('set-weight', fontWeight)"
            >
              <option :value="200">Light</option>
              <option :value="500">Medium</option>
              <option :value="900">Bold</option>
            </select>
          </div>

          <div class="control-group align-group">
            <label for="row-align">Text align</label>
            <select
              id="row-align"
              :value="row.textAlign || 'center'"
              @change="$emit('set-align', $event.target.value)"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div class="done-wrap">
            <button type="button" class="done-btn" @click="$emit('close')">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchDropdown from "./SearchDropdown.vue";
import { bands } from "../../assets/data/bands";

export default {
  name: "RowEditorTray",
  components: { SearchDropdown },
  emits: [
    "add-band",
    "edit-band",
    "remove-band",
    "move-band",
    "set-size",
    "set-weight",
    "set-align",
    "co-headliner",
    "close",
  ],
  props: {
    title: String,
    row: { type: Object, default: null },
    slug: String,
    rowKey: String,
    thursdayCoHeadliner: Boolean,
    fridayCoHeadliner: Boolean,
    saturdayCoHeadliner: Boolean,
    placement: {
      type: String,
      default: "bottom",
    },
  },

  data() {
    return {
      bands,
      inputText: "",
      sliderValue: 5,
      fontWeight: 500,
      // bandsExpanded: false,
      editingIndex: null,
      editingName: "",
      mobileOffsetY: 0,
      dragStartY: 0,
      dragStartOffsetY: 0,
      isDraggingTray: false,
    };
  },

  computed: {
    addPlaceholder() {
      if (!this.row) return "Search for a band or type your own";
      return this.row.bands.length >= this.row.maxBands
        ? "Row is full"
        : "Search for a band or type your own";
    },

    showCoHeadlinerToggle() {
      return this.rowKey === "headliner" && this.slug !== "dayFour";
    },

    canAddBand() {
      if (!this.row) return false;
      if (this.row.bands.length >= this.row.maxBands) return false;
      return !!this.inputText.trim();
    },

    isAutoCappedRow() {
      if (!this.row) return false;

      if (this.rowKey !== "lowerLineup") return false;

      const text = this.row.bands.map((band) => band?.name || "").join(" • ");

      return text.length < 40;
    },
    mobileTrayStyle() {
      return {
        "--tray-offset-y": `${this.mobileOffsetY}px`,
      };
    },
  },

  watch: {
    row: {
      immediate: true,
      handler(row) {
        if (!row) return;

        this.mobileOffsetY = 0;

        this.sliderValue = Number(row.size) || 5;

        const allowed = [200, 500, 900];
        this.fontWeight = allowed.includes(Number(row.weight))
          ? Number(row.weight)
          : 500;

        this.inputText = "";
        // this.bandsExpanded = false;

        this.$nextTick(() => {
          this.$refs.searchDropdown?.focus?.();
        });
      },
    },
  },

  methods: {
    onAddButtonClick() {
      if (!this.row) return;
      this.$refs.searchDropdown?.commitTypedText();
    },

    startBandEdit(index, band) {
      this.editingIndex = index;
      this.editingName = band?.name || "";

      this.$nextTick(() => {
        const input = this.$refs[`editInput-${index}`];

        if (Array.isArray(input)) {
          input[0]?.focus();
          input[0]?.select();
        } else {
          input?.focus();
          input?.select();
        }
      });
    },

    cancelBandEdit() {
      this.editingIndex = null;
      this.editingName = "";
    },

    saveBandEdit(index) {
      const name = this.editingName.trim();
      if (!name) return;

      this.$emit("edit-band", {
        index,
        name,
      });

      this.cancelBandEdit();
    },

    onCommit(payload) {
      if (!this.row) return;

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
    startTrayDrag(event) {
      if (window.innerWidth > 700) return;

      this.isDraggingTray = true;
      this.dragStartY = event.clientY;
      this.dragStartOffsetY = this.mobileOffsetY;

      window.addEventListener("pointermove", this.onTrayDrag);
      window.addEventListener("pointerup", this.stopTrayDrag);

      event.preventDefault();
    },

    onTrayDrag(event) {
      if (!this.isDraggingTray) return;

      const diff = event.clientY - this.dragStartY;
      const nextOffset = this.dragStartOffsetY + diff;

      const trayHeight = this.$el.offsetHeight;

      if (this.placement === "bottom") {
        this.mobileOffsetY = Math.max(
          -(window.innerHeight - trayHeight),
          Math.min(nextOffset, 0),
        );
      } else {
        this.mobileOffsetY = Math.max(
          0,
          Math.min(nextOffset, window.innerHeight - trayHeight),
        );
      }
    },

    stopTrayDrag() {
      this.isDraggingTray = false;

      window.removeEventListener("pointermove", this.onTrayDrag);
      window.removeEventListener("pointerup", this.stopTrayDrag);
    },
  },
};
</script>

<style scoped lang="scss">
.editor-tray {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1200;
  pointer-events: none;
  transition: transform 0.25s ease;
}

.editor-tray.bottom {
  bottom: 0;
  transform: translateY(100%);
}

.editor-tray.top {
  top: 0;
  transform: translateY(-100%);
}

.editor-tray.open {
  pointer-events: auto;
}

.editor-tray.bottom.open,
.editor-tray.top.open {
  transform: translateY(var(--tray-offset-y, 0));
}

.editor-tray-inner {
  // width: min(1100px, calc(100vw - 1rem));
  margin: 0 auto;
  background: rgba(255, 255, 255, 1);
  color: #222;
  border: 1px solid #111f18;
  font-family: "NeueHaasUnica", sans-serif;
  max-height: 32vh;
  overflow: hidden;
}

.editor-tray.bottom .editor-tray-inner {
  border-bottom: none;
  // border-radius: 14px 14px 0 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.2);
}

.editor-tray.top .editor-tray-inner {
  border-top: none;
  // border-radius: 0 0 14px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.editor-tray-body {
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 32vh;
  overflow: hidden;
}

.search-block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: start;
}

.helper {
  color: #666;
  font-size: 0.82rem;
}

.add-band-btn {
  border: none;
  background: #3c765b;
  color: white;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  height: fit-content;

  &:disabled {
    background: #c9c9c9;
    color: #666;
    cursor: not-allowed;
  }
}

.toggle-wrap label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.92rem;
}

.selected-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

// .collapse-toggle {
//   align-self: flex-start;
//   border: none;
//   background: #e9ecef;
//   color: #333;
//   padding: 0.45rem 0.7rem;
//   border-radius: 8px;
//   cursor: pointer;
//   font-size: 0.85rem;
// }

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  background: #f6f6f6;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
}

.selected-name {
  font-weight: 600;
  word-break: break-word;
  font-size: 0.92rem;

  small {
    font-weight: 400;
    color: #666;
    margin-left: 0.35rem;
  }
}

.selected-actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;

  button {
    border: none;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    background: #ddd;
    font-size: 0.82rem;
  }

  .danger {
    background: #711214;
    color: white;
  }
}

.controls-row {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px 170px auto;
  gap: 0.7rem;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.82rem;
    color: #444;
  }
}

.grow {
  min-width: 0;
}

.weight-group {
  min-width: 0;
}

input[type="range"],
select {
  width: 100%;
}

select {
  padding: 0.42rem;
}

.done-wrap {
  display: flex;
  justify-content: flex-end;
}

.done-btn {
  border: none;
  background: #3c765b;
  color: white;
  padding: 0.56rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .editor-tray-inner {
    width: 100vw;
    border-left: none;
    border-right: none;
    max-height: 48vh;
    overflow: hidden;
  }

  .editor-tray-body {
    padding: 0.75rem 1rem 1rem;
    max-height: calc(42vh - 22px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-block,
  .toggle-wrap,
  .controls-row {
    flex-shrink: 0;
  }

  .selected-wrap {
    min-height: 0;
    flex: 1;
  }

  .selected-list {
    max-height: none;
    min-height: 0;
    overflow-y: auto;
  }

  .controls-row {
    grid-template-columns: 1fr 1fr auto;
    gap: 0.6rem;
    align-items: end;
  }

  .control-group.grow {
    grid-column: 1 / -1;
    flex-direction: column;
    align-items: stretch;
  }

  .weight-group,
  .align-group {
    min-width: 0;
  }

  .done-wrap {
    grid-column: auto;
    justify-content: stretch;
  }

  .done-btn {
    width: auto;
    height: 100%;
    padding: 0.56rem 0.8rem;
  }
}

input[type="range"]:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tray-drag-handle {
  display: none;
}

@media (max-width: 700px) {
  .tray-drag-handle {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.45rem 0 0.2rem;
    cursor: grab;
    touch-action: none;

    span {
      width: 42px;
      height: 5px;
      border-radius: 999px;
      background: #bbb;
      display: block;
    }
  }
}

@media (max-width: 700px) {
  .editor-tray {
    transition: transform 0.15s ease;
  }
}
</style>
