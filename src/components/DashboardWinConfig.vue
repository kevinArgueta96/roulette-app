<template>
  <div class="win-config">
    <div class="win-config__category" v-for="cat in categories" :key="cat.key">
      <div class="category-header">
        <div class="category-header__title">
          <span class="category-dot" :class="`category-dot--${cat.key}`" aria-hidden="true"></span>
          <div>
            <p class="category-eyebrow">{{ cat.eyebrow }}</p>
            <h4 class="category-name">{{ cat.label }}</h4>
            <p class="category-description">{{ cat.description }}</p>
          </div>
        </div>

        <div class="category-daily">
          <div class="daily-field" :class="{ 'daily-field--error': errors[cat.key] }">
            <label :for="`${cat.key}-daily`" class="daily-label">Daily limit</label>
            <input
              :id="`${cat.key}-daily`"
              type="number"
              min="0"
              class="daily-input"
              :value="localConfig[cat.key].dailyLimit"
              @input="onDailyLimitChange(cat.key, $event.target.value)"
              @blur="validateCategory(cat.key)"
            />
          </div>
          <div class="daily-given">
            <span class="daily-given__value">{{ localConfig[cat.key].givenToday }}</span>
            <span class="daily-given__sep">/</span>
            <span class="daily-given__limit">{{ localConfig[cat.key].dailyLimit }}</span>
            <span class="daily-given__label">today</span>
          </div>
        </div>
      </div>

      <transition name="err-fade">
        <p v-if="errors[cat.key]" class="category-error">{{ errors[cat.key] }}</p>
      </transition>

      <!-- Progress bar -->
      <div class="daily-progress" :aria-label="`${cat.label} daily progress`">
        <div
          class="daily-progress__fill"
          :class="`daily-progress__fill--${cat.key}`"
          :style="{ width: dailyProgressPct(cat.key) + '%' }"
        ></div>
      </div>

      <!-- Hour slots -->
      <div class="slots-list">
        <div class="slots-head" v-if="localConfig[cat.key].slots.length">
          <span>Slot</span>
          <span>Start</span>
          <span>End</span>
          <span>Limit</span>
          <span>Given</span>
          <span class="slots-head__actions">Actions</span>
        </div>
        <div
          v-for="(slot, idx) in localConfig[cat.key].slots"
          :key="idx"
          class="slot-row"
        >
          <span class="slot-idx">{{ String(idx + 1).padStart(2, "0") }}</span>

          <div class="slot-time-field">
            <label :for="`${cat.key}-start-${idx}`" class="slot-time-label slot-time-label--row">Start</label>
            <input
              :id="`${cat.key}-start-${idx}`"
              :name="`${cat.key}-start-${idx}`"
              type="time"
              class="slot-time-input"
              autocomplete="off"
              :value="slot.startTime"
              @input="onSlotChange(cat.key, idx, 'startTime', $event.target.value)"
            />
          </div>
          <div class="slot-time-field">
            <label :for="`${cat.key}-end-${idx}`" class="slot-time-label slot-time-label--row">End</label>
            <input
              :id="`${cat.key}-end-${idx}`"
              :name="`${cat.key}-end-${idx}`"
              type="time"
              class="slot-time-input"
              autocomplete="off"
              :value="slot.endTime"
              @input="onSlotChange(cat.key, idx, 'endTime', $event.target.value)"
            />
          </div>

          <div class="slot-limit-field">
            <label :for="`${cat.key}-limit-${idx}`" class="slot-time-label slot-time-label--row">Limit</label>
            <input
              :id="`${cat.key}-limit-${idx}`"
              type="number"
              min="0"
              class="slot-limit-input"
              :value="slot.limit"
              @input="onSlotChange(cat.key, idx, 'limit', parseInt($event.target.value, 10) || 0)"
            />
          </div>

          <div class="slot-given">
            <span class="slot-given__value">{{ slot.given }}</span>
            <span class="slot-given__label">given</span>
          </div>

          <button
            class="slot-remove"
            type="button"
            :aria-label="`Remove slot ${idx + 1}`"
            @click="removeSlot(cat.key, idx)"
          >×</button>
        </div>

        <div v-if="!localConfig[cat.key].slots.length" class="slots-empty">
          No slots configured — wins can happen at any time within the daily limit.
        </div>
      </div>

      <button class="add-slot-btn" type="button" @click="addSlot(cat.key)">
        + Add hour slot
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

const CATEGORIES = [
  {
    key: "mainWin",
    label: "Main win",
    eyebrow: "Category A",
    description: "High-value outcome with the strictest daily and time-slot limits."
  },
  {
    key: "smallWin",
    label: "Small win",
    eyebrow: "Category B",
    description: "Mid-tier reward distributed more frequently across configured hours."
  }
];

export default {
  name: "DashboardWinConfig",
  data() {
    return {
      categories: CATEGORIES,
      localConfig: {
        mainWin: { dailyLimit: 5, givenToday: 0, slots: [] },
        smallWin: { dailyLimit: 20, givenToday: 0, slots: [] }
      },
      errors: { mainWin: "", smallWin: "" }
    };
  },
  computed: {
    ...mapGetters(["winDistribution"])
  },
  watch: {
    winDistribution: {
      immediate: true,
      handler(val) {
        if (val) {
          this.localConfig = {
            mainWin: {
              dailyLimit: val.mainWin?.dailyLimit ?? 5,
              givenToday: val.mainWin?.givenToday ?? 0,
              slots: (val.mainWin?.slots || []).map((s) => ({ ...s }))
            },
            smallWin: {
              dailyLimit: val.smallWin?.dailyLimit ?? 20,
              givenToday: val.smallWin?.givenToday ?? 0,
              slots: (val.smallWin?.slots || []).map((s) => ({ ...s }))
            }
          };
        }
      }
    }
  },
  methods: {
    dailyProgressPct(catKey) {
      const cat = this.localConfig[catKey];
      if (!cat.dailyLimit) return 0;
      return Math.min(100, Math.round((cat.givenToday / cat.dailyLimit) * 100));
    },
    onDailyLimitChange(catKey, rawValue) {
      const val = Math.max(0, parseInt(rawValue, 10) || 0);
      this.$set(this.localConfig, catKey, { ...this.localConfig[catKey], dailyLimit: val });
      this.validateCategory(catKey);
    },
    onSlotChange(catKey, slotIdx, field, value) {
      const slots = this.localConfig[catKey].slots.map((slot, i) =>
        i === slotIdx ? { ...slot, [field]: value } : slot
      );
      this.$set(this.localConfig, catKey, { ...this.localConfig[catKey], slots });
      this.validateCategory(catKey);
    },
    addSlot(catKey) {
      const slots = [
        ...this.localConfig[catKey].slots,
        { startTime: "09:00", endTime: "18:00", limit: 1, given: 0 }
      ];
      this.$set(this.localConfig, catKey, { ...this.localConfig[catKey], slots });
    },
    removeSlot(catKey, idx) {
      const slots = this.localConfig[catKey].slots.filter((_, i) => i !== idx);
      this.$set(this.localConfig, catKey, { ...this.localConfig[catKey], slots });
      this.validateCategory(catKey);
    },
    validateCategory(catKey) {
      const cat = this.localConfig[catKey];
      if (cat.dailyLimit < 0) {
        this.errors[catKey] = "Daily limit cannot be negative.";
        return false;
      }
      const slotTotal = cat.slots.reduce((sum, s) => sum + (Number(s.limit) || 0), 0);
      if (slotTotal > cat.dailyLimit) {
        this.errors[catKey] = `Slot limits total (${slotTotal}) exceeds daily limit (${cat.dailyLimit}).`;
        return false;
      }
      this.errors[catKey] = "";
      return true;
    },
    validate() {
      const mainOk = this.validateCategory("mainWin");
      const smallOk = this.validateCategory("smallWin");
      return mainOk && smallOk;
    },
    getConfig() {
      return {
        mainWin: { ...this.localConfig.mainWin, slots: this.localConfig.mainWin.slots.map((s) => ({ ...s })) },
        smallWin: { ...this.localConfig.smallWin, slots: this.localConfig.smallWin.slots.map((s) => ({ ...s })) }
      };
    }
  }
};
</script>

<style scoped>
.win-config {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.win-config__category {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.1rem 1.15rem;
  border-radius: 1.1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.68) 0%, rgba(246, 250, 245, 0.86) 100%);
  border: 1px solid rgba(122, 151, 131, 0.14);
}

.win-config__category + .win-config__category {
  margin-top: 0.2rem;
}

/* Category header */
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.category-header__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-dot--mainWin { background: #1B1A17; box-shadow: 0 0 0 3px rgba(205, 174, 104, 0.3); }
.category-dot--smallWin { background: #F8F0D8; border: 2px solid #cdae68; }

.category-eyebrow {
  margin: 0 0 0.1rem;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #1f5a3f;
}

.category-name {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  color: #1d2b22;
  letter-spacing: 0.04em;
}

.category-description {
  margin: 0.2rem 0 0;
  max-width: 42rem;
  color: rgba(29, 43, 34, 0.6);
  line-height: 1.45;
  font-size: 0.84rem;
}

.category-daily {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 0.8rem;
  border-radius: 0.95rem;
  background: rgba(255, 251, 243, 0.8);
  border: 1px solid rgba(205, 174, 104, 0.14);
}

.daily-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 5rem;
}

.daily-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.45);
}

.daily-input {
  width: 5rem;
  background: #fff;
  border: 1px solid rgba(122, 151, 131, 0.18);
  border-radius: 0.65rem;
  padding: 0.55rem 0.7rem;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1d2b22;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.daily-input:focus {
  border-color: #7a9783;
  box-shadow: 0 0 0 3px rgba(122, 151, 131, 0.14);
}
.daily-input::-webkit-inner-spin-button,
.daily-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.daily-field--error .daily-input { border-color: #b92d22; color: #b92d22; }

.daily-given {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-size: 0.82rem;
  color: rgba(29, 43, 34, 0.55);
}

.daily-given__value { font-weight: 700; color: #1f5a3f; font-size: 1rem; }
.daily-given__sep { color: rgba(29, 43, 34, 0.3); }
.daily-given__limit { font-weight: 700; color: #1d2b22; }
.daily-given__label { font-size: 0.68rem; }

/* Progress bar */
.daily-progress {
  height: 6px;
  border-radius: 999px;
  background: rgba(122, 151, 131, 0.14);
  overflow: hidden;
}

.daily-progress__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.daily-progress__fill--mainWin { background: linear-gradient(90deg, #1f5a3f, #cdae68); }
.daily-progress__fill--smallWin { background: linear-gradient(90deg, #cdae68, #e8d5a3); }

.category-error {
  margin: 0;
  font-size: 0.72rem;
  color: #b92d22;
  font-weight: 600;
}

/* Slots */
.slots-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
}

.slots-head {
  display: grid;
  grid-template-columns: 2.1rem minmax(0, 1fr) minmax(0, 1fr) 5.5rem 4rem 2rem;
  gap: 0.8rem;
  padding: 0 0.8rem;
  color: rgba(49, 88, 70, 0.56);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.slots-head__actions {
  text-align: right;
}

.slot-row {
  display: grid;
  grid-template-columns: 2.1rem minmax(0, 1fr) minmax(0, 1fr) 5.5rem 4rem 2rem;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.85rem 0.9rem;
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(122, 151, 131, 0.14);
  box-sizing: border-box;
}

.slot-idx {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(49, 88, 70, 0.62);
  background: rgba(122, 151, 131, 0.12);
}

.slot-time-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.slot-time-label {
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.4);
}

.slot-time-label--row {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.slot-time-input {
  width: 100%;
  background: #fff;
  border: 1px solid rgba(122, 151, 131, 0.16);
  border-radius: 0.65rem;
  padding: 0.62rem 0.75rem;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1d2b22;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.slot-time-input:focus {
  border-color: #7a9783;
  box-shadow: 0 0 0 3px rgba(122, 151, 131, 0.14);
}

.slot-limit-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.slot-limit-input {
  width: 100%;
  background: #fff;
  border: 1px solid rgba(122, 151, 131, 0.16);
  border-radius: 0.65rem;
  padding: 0.62rem 0.4rem;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  color: #1d2b22;
  outline: none;
  text-align: center;
  font-variant-numeric: tabular-nums;
  -moz-appearance: textfield;
  appearance: textfield;
}
.slot-limit-input::-webkit-inner-spin-button,
.slot-limit-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.slot-limit-input:focus {
  border-color: #7a9783;
  box-shadow: 0 0 0 3px rgba(122, 151, 131, 0.14);
}

.slot-given {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.slot-given__value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f5a3f;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.slot-given__label {
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.4);
}

.slot-remove {
  background: rgba(185, 45, 34, 0.05);
  border: none;
  color: rgba(185, 45, 34, 0.45);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 999px;
  transition: color 0.2s, background 0.2s;
}
.slot-remove:hover {
  color: #b92d22;
  background: rgba(185, 45, 34, 0.08);
}

.slots-empty {
  font-size: 0.8rem;
  color: rgba(29, 43, 34, 0.52);
  padding: 0.95rem 1rem;
  border-radius: 0.85rem;
  background: rgba(255, 251, 243, 0.72);
  border: 1px dashed rgba(122, 151, 131, 0.2);
}

.add-slot-btn {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.82);
  border: 1px dashed rgba(122, 151, 131, 0.34);
  color: #1f5a3f;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.5rem 0.9rem;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.add-slot-btn:hover {
  background: rgba(122, 151, 131, 0.08);
  border-color: rgba(122, 151, 131, 0.55);
}

.err-fade-enter-active,
.err-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.err-fade-enter,
.err-fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 900px) {
  .slots-head {
    display: none;
  }

  .slot-row {
    grid-template-columns: 2.1rem minmax(0, 1fr) minmax(0, 1fr);
    row-gap: 0.7rem;
  }

  .slot-limit-field {
    grid-column: 2;
  }

  .slot-given {
    grid-column: 3;
  }

  .slot-remove {
    grid-column: 1;
    justify-self: center;
  }

  .slot-time-label--row {
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
    border: 0;
  }
}

@media (max-width: 640px) {
  .category-daily {
    width: 100%;
    justify-content: space-between;
  }

  .slot-row {
    grid-template-columns: 2.1rem 1fr;
  }

  .slot-time-field,
  .slot-limit-field,
  .slot-given {
    grid-column: 2;
  }
}
</style>
