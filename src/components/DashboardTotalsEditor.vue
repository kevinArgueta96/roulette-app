<template>
  <div class="totals-editor">
    <div class="section-heading">
      <span class="section-heading__deco" aria-hidden="true"></span>
      <h3 class="section-heading__text">Totals Configuration</h3>
      <span class="section-heading__deco" aria-hidden="true"></span>
    </div>

    <div class="totals-grid">
      <div
        v-for="field in fields"
        :key="field.key"
        class="field-group"
        :class="{ 'field-group--error': errors[field.key] }"
      >
        <label :for="field.key" class="field-label">{{ field.label }}</label>
        <div class="field-input-wrap">
          <input
            :id="field.key"
            type="number"
            :name="field.key"
            min="0"
            class="field-input"
            inputmode="numeric"
            autocomplete="off"
            :aria-invalid="errors[field.key] ? 'true' : 'false'"
            :aria-describedby="errors[field.key] ? `${field.key}-error` : null"
            :value="values[field.key]"
            @input="onInput(field.key, $event.target.value)"
            @blur="validateField(field.key)"
          />
        </div>
        <transition name="err-fade">
          <p
            v-if="errors[field.key]"
            :id="`${field.key}-error`"
            class="field-error"
            aria-live="polite"
          >
            {{ errors[field.key] }}
          </p>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

const FIELDS = [
  { key: "totalReplay", label: "Total Replay" },
  { key: "totalSpecialPrice", label: "Special Price" },
  { key: "totalSpecialSurprise", label: "Special Surprise" },
  { key: "totalTopPrice", label: "Top Price" },
  { key: "totalGiftCard", label: "Gift Cards" },
  { key: "totalSpin", label: "Total Spins" }
];

const MUTATION_MAP = {
  totalReplay: "setTotalReplay",
  totalSpecialPrice: "setTotalSpecialPrice",
  totalSpecialSurprise: "setTotalSpecialSurprise",
  totalTopPrice: "setTotalTopPrice",
  totalGiftCard: "setTotalGiftCard",
  totalSpin: "setTotalSpin"
};

export default {
  name: "DashboardTotalsEditor",
  data() {
    return {
      fields: FIELDS,
      errors: {
        totalReplay: "",
        totalSpecialPrice: "",
        totalSpecialSurprise: "",
        totalTopPrice: "",
        totalGiftCard: "",
        totalSpin: ""
      }
    };
  },
  computed: {
    ...mapGetters([
      "totalReplay",
      "totalSpecialPrice",
      "totalSpecialSurprise",
      "totalTopPrice",
      "totalGiftCard",
      "totalSpin"
    ]),
    values() {
      return {
        totalReplay: this.totalReplay,
        totalSpecialPrice: this.totalSpecialPrice,
        totalSpecialSurprise: this.totalSpecialSurprise,
        totalTopPrice: this.totalTopPrice,
        totalGiftCard: this.totalGiftCard,
        totalSpin: this.totalSpin
      };
    }
  },
  methods: {
    onInput(key, rawValue) {
      const val = parseInt(rawValue, 10);
      if (!isNaN(val)) {
        this.$store.commit(MUTATION_MAP[key], val);
      }
      this.validateField(key);
    },
    validateField(key) {
      const val = this.values[key];
      this.errors[key] = val < 0 ? "Value cannot be negative" : "";
    },
    validate() {
      let valid = true;
      for (const field of FIELDS) {
        this.validateField(field.key);
        if (this.errors[field.key]) {
          valid = false;
        }
      }
      return valid;
    }
  }
};
</script>

<style scoped>
.totals-editor {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.4rem;
}

.section-heading__text {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.section-heading__deco {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(var(--rgb-border), 0.18) 25%, rgba(var(--rgb-border), 0.48) 50%, transparent 75%);
  border-radius: 1px;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  align-content: stretch;
  gap: 1.2rem 1.6rem;
  flex: 1 1 auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.45rem;
  min-height: 0;
  padding: 1rem 1rem;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(var(--rgb-panel), 0.92) 0%, rgba(var(--rgb-panel-soft), 0.96) 100%);
  border: 1px solid rgba(var(--rgb-border), 0.18);
}

.field-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(var(--rgb-muted), 0.72);
  cursor: pointer;
  transition: color 0.2s;
}

.field-group:focus-within .field-label {
  color: var(--color-primary);
}

.field-group--error .field-label {
  color: var(--color-accent-dark);
}

.field-input-wrap {
  position: relative;
}

.field-input-wrap::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-border);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease;
  border-radius: 1px;
}

.field-group:focus-within .field-input-wrap::after {
  transform: scaleX(1);
}

.field-group--error .field-input-wrap::after {
  background: var(--color-accent-dark);
  transform: scaleX(1);
}

.field-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(var(--rgb-border), 0.28);
  padding: 0.3rem 0 0.15rem 0;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
  transition: border-color 0.2s;
}

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.field-group--error .field-input {
  border-bottom-color: rgba(var(--rgb-danger), 0.4);
  color: var(--color-accent-dark);
}

.field-error {
  margin: 0;
  font-size: 0.64rem;
  color: var(--color-accent-dark);
  letter-spacing: 0.04em;
}

.err-fade-enter-active,
.err-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.err-fade-enter,
.err-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .totals-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .totals-grid {
    grid-template-columns: 1fr;
  }
}
</style>
