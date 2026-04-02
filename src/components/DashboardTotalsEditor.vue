<template>
  <div class="totals-editor">
    <div class="section-heading">
      <span class="section-heading__deco" aria-hidden="true"></span>
      <h3 class="section-heading__text">Configuración de Totales</h3>
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
            min="0"
            class="field-input"
            :value="values[field.key]"
            @input="onInput(field.key, $event.target.value)"
            @blur="validateField(field.key)"
          />
        </div>
        <transition name="err-fade">
          <p v-if="errors[field.key]" class="field-error">{{ errors[field.key] }}</p>
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
      this.errors[key] = val < 0 ? "El valor no puede ser negativo" : "";
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
  color: #1f5a3f;
  white-space: nowrap;
}

.section-heading__deco {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #cdae68 40%, #e8d5a3 60%, transparent);
  border-radius: 1px;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem 1.6rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.55);
  cursor: pointer;
  transition: color 0.2s;
}

.field-group:focus-within .field-label {
  color: #1f5a3f;
}

.field-group--error .field-label {
  color: #b92d22;
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
  background: #cdae68;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease;
  border-radius: 1px;
}

.field-group:focus-within .field-input-wrap::after {
  transform: scaleX(1);
}

.field-group--error .field-input-wrap::after {
  background: #b92d22;
  transform: scaleX(1);
}

.field-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(205, 174, 104, 0.35);
  padding: 0.45rem 0 0.45rem 0;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1d2b22;
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
  border-bottom-color: rgba(185, 45, 34, 0.4);
  color: #b92d22;
}

.field-error {
  margin: 0;
  font-size: 0.64rem;
  color: #b92d22;
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
</style>
