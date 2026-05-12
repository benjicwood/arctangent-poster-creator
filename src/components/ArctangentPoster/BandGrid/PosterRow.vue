<template>
  <div
    ref="rowEl"
    :class="[
      'poster-row',
      rowClass,
      `align-${row?.textAlign || 'center'}`,
      `valign-${row?.verticalAlign || 'center'}`,
      {
        'always-highlight': alwaysHighlight && !hideEditingUI,
        'editing-ui-hidden': hideEditingUI,
      },
    ]"
    @click="$emit('click')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <span v-if="displayText" class="poster-row-text" :style="textStyle">
      {{ displayText }}
    </span>

    <span v-else-if="shouldShowPlaceholder" class="poster-row-placeholder">
      {{ placeholder }}
    </span>
  </div>
</template>

<script>
const sizeMap = {
  1: 11,
  2: 13,
  3: 15,
  4: 18,
  5: 22,
  6: 28,
  7: 36,
  8: 44,
};

export default {
  name: "PosterRow",
  emits: ["click"],
  props: {
    row: { type: Object, required: true },
    placeholder: { type: String, default: "CLICK TO ADD BANDS" },
    alwaysHighlight: { type: Boolean, default: false },
    showPlaceholderAlways: { type: Boolean, default: false },
    hideEditingUI: { type: Boolean, default: false },
  },

  data() {
    return {
      resolvedPx: 18,
      resolvedLetterSpacing: "0.04em",
      resizeObserver: null,
      isHovered: false,
    };
  },

  computed: {
    displayText() {
      const divider = this.row?.divider ?? "•";
      // const joiner = divider === " " ? " " : `\u00A0${divider}\u00A0`;
      // const joiner =
      //   divider === " " ? "\u00A0\u00A0\u00A0\u00A0" : `\u00A0${divider}\u00A0`;
      const joiner =
        divider === " " ? "\u00A0\u00A0\u00A0\u00A0" : ` ${divider} `;

      return (this.row?.bands || [])
        .map((band) => (band?.name || "").trim().toUpperCase())
        .filter(Boolean)
        .join(joiner);
    },

    shouldShowPlaceholder() {
      if (this.hideEditingUI) return false;
      if (this.displayText) return false;
      if (this.showPlaceholderAlways) return true;
      return this.isHovered || this.alwaysHighlight;
    },

    basePx() {
      const size = Number(this.row?.size) || 5;
      const min = Number(this.row?.minPx) || 10;
      const max = Number(this.row?.maxPx) || 18;

      const t = (size - 1) / 9;
      return Math.round(min + t * (max - min));
    },

    minPx() {
      return this.row?.minPx || 10;
    },

    baseLetterSpacing() {
      const weight = Number(this.row?.weight) || 400;
      if (weight <= 200) return 0.08;
      if (weight >= 800) return 0.02;
      return 0.04;
    },

    rowClass() {
      if (this.row?.size <= 3) return "is-small-row";
      if (this.row?.size >= 8) return "is-headliner-row";
      return "";
    },

    textStyle() {
      return {
        fontSize: `${this.resolvedPx}px`,
        fontWeight: String(Number(this.row?.weight) || 400),
        whiteSpace: this.row?.allowWrap ? "normal" : "nowrap",
        // lineHeight: this.row?.allowWrap ? "0.92" : "1",
        lineHeight: this.row?.allowWrap ? "1.05" : "1", // line height tbc
        letterSpacing: this.resolvedLetterSpacing,
        textAlign: this.row?.textAlign || "center",
      };
    },
  },

  mounted() {
    this.$nextTick(this.fitRowText);
    window.addEventListener("resize", this.fitRowText);

    if ("ResizeObserver" in window && this.$refs.rowEl instanceof Element) {
      this.resizeObserver = new ResizeObserver(() => this.fitRowText());
      this.resizeObserver.observe(this.$refs.rowEl);
    }
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.fitRowText);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  },

  watch: {
    row: {
      deep: true,
      handler() {
        this.$nextTick(this.fitRowText);
      },
    },
  },

  methods: {
    fitRowText() {
      const container = this.$refs.rowEl;

      if (!container || !this.displayText) {
        this.resolvedPx = this.basePx;
        this.resolvedLetterSpacing = `${this.baseLetterSpacing}em`;
        return;
      }

      const maxWidth = Math.max(container.clientWidth - 10, 0);
      const maxHeight = Math.max(container.clientHeight - 8, 0);

      if (!maxWidth || !maxHeight) {
        this.resolvedPx = this.basePx;
        this.resolvedLetterSpacing = `${this.baseLetterSpacing}em`;
        return;
      }

      // Step 1: find the largest size that fits
      let fittedPx = this.minPx;

      for (let px = 120; px >= this.minPx; px--) {
        if (
          this.textFits({
            text: this.displayText,
            fontSize: px,
            weight: this.row.weight,
            letterSpacing: this.baseLetterSpacing,
            maxWidth,
            maxHeight,
            allowWrap: !!this.row.allowWrap,
          })
        ) {
          fittedPx = px;
          break;
        }
      }

      // Step 2: slider controls scale relative to fitted size
      const scaleMap = {
        1: 0.55,
        2: 0.65,
        3: 0.75,
        4: 0.85,
        5: 0.95,
        6: 1.0,
        7: 1.05,
        8: 1.1,
        9: 1.15,
        10: 1.2,
      };

      const size = Number(this.row?.size) || 5;
      let targetPx = Math.round(fittedPx * (scaleMap[size] || 1));

      const isLikelySingleLine =
        this.row?.capSparseText && this.displayText.length < 40;

      if (isLikelySingleLine) {
        targetPx = Math.min(targetPx, 20); // adjust until correct
      }

      // Step 3: ensure it still fits
      for (let px = targetPx; px >= this.minPx; px--) {
        if (
          this.textFits({
            text: this.displayText,
            fontSize: px,
            weight: this.row.weight,
            letterSpacing: this.baseLetterSpacing,
            maxWidth,
            maxHeight,
            allowWrap: !!this.row.allowWrap,
          })
        ) {
          this.resolvedPx = px;
          this.resolvedLetterSpacing = `${this.baseLetterSpacing}em`;
          return;
        }
      }

      this.resolvedPx = this.minPx;
      this.resolvedLetterSpacing = `${this.baseLetterSpacing}em`;
    },

    getSpacingCandidates(base) {
      const candidates = [base];
      const tighter1 = Math.max(base - 0.01, 0);
      const tighter2 = Math.max(base - 0.02, 0);
      const wider1 = base + 0.01;

      if (!candidates.includes(tighter1)) candidates.push(tighter1);
      if (!candidates.includes(tighter2)) candidates.push(tighter2);
      if ((this.row?.size || 4) <= 2 && !candidates.includes(wider1)) {
        candidates.push(wider1);
      }

      return candidates;
    },

    textFits({
      text,
      fontSize,
      weight,
      letterSpacing,
      maxWidth,
      maxHeight,
      allowWrap,
    }) {
      const measure = document.createElement("span");
      measure.textContent = text;
      measure.style.position = "absolute";
      measure.style.visibility = "hidden";
      measure.style.pointerEvents = "none";
      measure.style.left = "-99999px";
      measure.style.top = "-99999px";
      measure.style.display = "block";
      measure.style.fontFamily = '"NeueHaasUnica", sans-serif';
      measure.style.fontWeight = String(Number(weight) || 400);
      measure.style.fontSize = `${fontSize}px`;
      measure.style.letterSpacing = `${letterSpacing}em`;
      measure.style.textTransform = "uppercase";
      measure.style.lineHeight = allowWrap ? "1.05" : "1";
      // measure.style.lineHeight = allowWrap ? "0.92" : "1";
      measure.style.whiteSpace = allowWrap ? "normal" : "nowrap";
      measure.style.width = allowWrap ? `${maxWidth}px` : "auto";
      measure.style.maxWidth = `${maxWidth}px`;

      document.body.appendChild(measure);

      const fits =
        measure.offsetWidth <= maxWidth + 1 &&
        measure.offsetHeight <= maxHeight + 1;

      document.body.removeChild(measure);
      return fits;
    },
  },
};
</script>

<style scoped lang="scss">
.poster-row {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0.25rem 0.35rem;
  border: 1px solid transparent;
}

.poster-row:hover:not(.editing-ui-hidden) {
  border-color: #c67d0e;
}

.poster-row-text {
  display: block;
  width: 100%;
  color: white;
  font-family: "NeueHaasUnica", sans-serif;
  text-transform: uppercase;
  font-synthesis: none;
}

.poster-row-placeholder {
  color: rgba(255, 255, 255, 0.45);
  font-family: "NeueHaasUnica", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.align-left {
  justify-content: flex-start;
}

.align-center {
  justify-content: center;
}

.align-right {
  justify-content: flex-end;
}

.valign-top {
  align-items: flex-start;
  padding-top: 0.6rem;
}

.valign-center {
  align-items: center;
}

.valign-bottom {
  align-items: flex-end;
}

.is-small-row .poster-row-text {
  text-rendering: geometricPrecision;
}

.is-headliner-row .poster-row-text {
  text-wrap: balance;
}

.always-highlight {
  border-color: #c67d0e !important;
}

.editing-ui-hidden {
  border-color: transparent !important;
}
</style>
