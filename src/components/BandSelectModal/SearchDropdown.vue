<template>
  <div class="dropdown" v-if="options">
    <div class="dropdown-toggle">
      <input
        :key="id"
        :name="name"
        v-model="searchFilter"
        :disabled="disabled"
        :placeholder="placeholder"
        autocomplete="off"
        @focus="showOptions"
        @blur="onBlurCommit"
        @keydown="onKeydown"
      />
    </div>

    <transition name="fade">
      <ul class="dropdown-menu" v-show="optionsShown && filteredOptions.length">
        <li
          v-for="(option, index) in filteredOptions"
          :key="index"
          @mousedown.prevent="selectOption(option)"
        >
          <a href="javascript:void(0)">
            {{ optionLabel(option) }}
          </a>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  name: "SearchDropdown",
  props: {
    name: { type: String, default: "input" },
    options: { type: Array, required: true },
    placeholder: { type: String, default: "Start typing..." },
    disabled: { type: Boolean, default: false },
    maxItem: { type: Number, default: 1200 },
    id: { type: Number, default: 0 },

    /* v-model */
    modelValue: { type: String, default: "" },
  },
  emits: ["selected", "commit", "filter", "update:modelValue"],
  data() {
    return {
      selected: null,
      optionsShown: false,
      searchFilter: "",
    };
  },
  computed: {
    filteredOptions() {
      const out = [];
      const term = (this.searchFilter || "").trim();

      // escape regex special chars
      const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeTerm, "i");

      for (const option of this.options) {
        const label = this.optionLabel(option);
        if (!term || regex.test(label)) {
          out.push(option);
          if (out.length >= this.maxItem) break;
        }
      }
      return out;
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        this.searchFilter = val || "";
      },
    },
    searchFilter(val) {
      this.$emit("update:modelValue", val);
      this.$emit("filter", val);

      // if user types, clear selected state (until they click an option)
      this.selected = null;
    },
  },
  methods: {
    optionLabel(option) {
      return (option?.name || option?.id || "-").toString();
    },

    showOptions() {
      if (this.disabled) return;
      this.optionsShown = true;
    },

    hideOptions() {
      this.optionsShown = false;
    },

    selectOption(option) {
      this.selected = option || null;
      const label = this.optionLabel(option);

      this.searchFilter = label;
      this.hideOptions();

      // “real” selection (asset band)
      this.$emit("selected", option);
      // also commit so parent can treat it as final
      this.$emit("commit", { type: "option", text: label, option });
    },

    commitTypedText() {
      const text = (this.searchFilter || "").trim();
      this.hideOptions();

      // if empty, treat as clear
      if (!text) {
        this.$emit("commit", { type: "clear", text: "" });
        return;
      }

      // if typed text EXACTLY matches an option label, commit as option
      const match = this.options.find((o) => {
        const label = this.optionLabel(o).toLowerCase();
        return label === text.toLowerCase();
      });

      if (match) {
        this.$emit("selected", match);
        this.$emit("commit", { type: "option", text, option: match });
      } else {
        // custom text
        this.$emit("commit", { type: "custom", text });
      }
    },

    onBlurCommit() {
      // blur fires after mousedown selection, but we used @mousedown.prevent
      // so selection happens first; committing again is safe (it’ll match exact label)
      this.commitTypedText();
    },

    onKeydown(e) {
      if (e.key === "Escape") {
        this.hideOptions();
        e.preventDefault();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        // If there’s a filtered option and user likely wants first, you can choose:
        // - commitTypedText (keeps what typed)
        // - or auto-select first option when input matches partially
        // We'll commit typed text; exact match becomes option automatically.
        this.commitTypedText();
        return;
      }

      if (e.key === "ArrowDown") {
        this.showOptions();
      }
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown {
  min-width: 160px;
  height: 40px;
  position: relative;
  margin: 10px 1px;
  display: inline-block;
  vertical-align: middle;
}

.dropdown-toggle input {
  border: none;
  background: #0002;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0.5rem;
  outline: none;
  transition: 0.2s ease-in;
  color: gray;
  border-radius: 4px;
  height: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.dropdown-toggle:hover input {
  background: #0004;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 2000;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  margin: 0;
  list-style: none;
  font-size: 14px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  box-sizing: border-box;
}

.dropdown-menu > li > a {
  padding: 10px 20px;
  display: block;
  color: #333;
  white-space: nowrap;
  text-decoration: none;
}

.dropdown-menu > li > a:hover {
  background: #efefef;
  color: #409fcb;
  border-radius: 4px;
}

.dropdown-menu > li {
  margin: 0;
}
</style>