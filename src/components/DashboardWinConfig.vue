<template>
  <div class="win-config">
    <div class="win-config__category" v-for="cat in categories" :key="cat.key">
      <div class="category-header">
        <div class="category-header__title">
          <span class="category-dot" :class="`category-dot--${cat.key}`" aria-hidden="true"></span>
          <div>
            <p class="category-eyebrow">{{ cat.eyebrow }}</p>
            <h4 class="category-name">{{ cat.label }}</h4>
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
        <div
          v-for="(slot, idx) in localConfig[cat.key].slots"
          :key="idx"
          class="slot-row"
        >
          <span class="slot-idx">{{ String(idx + 1).padStart(2, "0") }}</span>

          <div class="slot-times">
            <div class="slot-time-field">
              <label :for="`${cat.key}-start-${idx}`" class="slot-time-label">Start</label>
              <input
                :id="`${cat.key}-start-${idx}`"
                type="time"
                class="slot-time-input"
                :value="slot.startTime"
                @change="onSlotChange(cat.key, idx, 'startTime', $event.target.value)"
              />
            </div>
            <span class="slot-sep" aria-hidden="true">—</span>
            <div class="slot-time-field">
              <label :for="`${cat.key}-end-${idx}`" class="slot-time-label">End</label>
              <input
                :id="`${cat.key}-end-${idx}`"
                type="time"
                class="slot-time-input"
                :value="slot.endTime"
                @change="onSlotChange(cat.key, idx, 'endTime', $event.target.value)"
              />
            </div>
          </div>

          <div class="slot-limit-field">
            <label :for="`${cat.key}-limit-${idx}`" class="slot-time-label">Limit</label>
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
  { key: "mainWin", label: "LAHJAKASSI", eyebrow: "Main Win" },
  { key: "smallWin", label: "YLLÄTYSPALKINTO", eyebrow: "Small Win" }
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
      this.localConfig[catKey] = { ...this.localConfig[catKey], dailyLimit: val };
      this.validateCategory(catKey);
    },
    onSlotChange(catKey, slotIdx, field, value) {
      const slots = this.localConfig[catKey].slots.map((slot, i) =>
        i === slotIdx ? { ...slot, [field]: value } : slot
      );
      this.localConfig[catKey] = { ...this.localConfig[catKey], slots };
      this.validateCategory(catKey);
    },
    addSlot(catKey) {
      const slots = [
        ...this.localConfig[catKey].slots,
        { startTime: "09:00", endTime: "18:00", limit: 1, given: 0 }
      ];
      this.localConfig[catKey] = { ...this.localConfig[catKey], slots };
    },
    removeSlot(catKey, idx) {
      const slots = this.localConfig[catKey].slots.filter((_, i) => i !== idx);
      this.localConfig[catKey] = { ...this.localConfig[catKey], slots };
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
  gap: 0.85rem;
}

.win-config__category + .win-config__category {
  padding-top: 2rem;
  border-top: 1px solid rgba(205, 174, 104, 0.18);
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
  font-size: 1rem;
  font-weight: 700;
  color: #1d2b22;
  letter-spacing: 0.04em;
}

.category-daily {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.daily-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
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
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(205, 174, 104, 0.35);
  padding: 0.3rem 0;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1d2b22;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
  transition: border-color 0.2s;
}

.daily-input:focus { border-bottom-color: #cdae68; }
.daily-input::-webkit-inner-spin-button,
.daily-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.daily-field--error .daily-input { border-bottom-color: #b92d22; color: #b92d22; }

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
  height: 4px;
  border-radius: 999px;
  background: rgba(205, 174, 104, 0.15);
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
  gap: 0.55rem;
}

.slot-row {
  display: grid;
  grid-template-columns: 1.8rem 1fr auto auto 1.6rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.8rem;
  background: rgba(255, 251, 243, 0.85);
  border: 1px solid rgba(205, 174, 104, 0.18);
}

.slot-idx {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(205, 174, 104, 0.7);
}

.slot-times {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
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

.slot-time-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(205, 174, 104, 0.3);
  padding: 0.2rem 0;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1d2b22;
  outline: none;
  width: 6.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.slot-time-input:focus { border-bottom-color: #cdae68; }

.slot-sep {
  color: rgba(205, 174, 104, 0.45);
  font-size: 0.8rem;
  margin-top: 1rem;
  flex-shrink: 0;
}

.slot-limit-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.slot-limit-input {
  width: 3.5rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(205, 174, 104, 0.3);
  padding: 0.2rem 0;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1d2b22;
  outline: none;
  text-align: center;
  -moz-appearance: textfield;
  appearance: textfield;
}
.slot-limit-input::-webkit-inner-spin-button,
.slot-limit-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.slot-limit-input:focus { border-bottom-color: #cdae68; }

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
}

.slot-given__label {
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.4);
}

.slot-remove {
  background: transparent;
  border: none;
  color: rgba(185, 45, 34, 0.45);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.15rem 0.25rem;
  border-radius: 0.3rem;
  transition: color 0.2s, background 0.2s;
}
.slot-remove:hover {
  color: #b92d22;
  background: rgba(185, 45, 34, 0.08);
}

.slots-empty {
  font-size: 0.78rem;
  color: rgba(29, 43, 34, 0.45);
  padding: 0.6rem 0;
  font-style: italic;
}

.add-slot-btn {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed rgba(205, 174, 104, 0.45);
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
  background: rgba(205, 174, 104, 0.07);
  border-color: rgba(205, 174, 104, 0.65);
}

.err-fade-enter-active,
.err-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.err-fade-enter,
.err-fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 600px) {
  .slot-row {
    grid-template-columns: 1.8rem 1fr auto 1.6rem;
    row-gap: 0.5rem;
  }
  .slot-given { grid-column: 3; }
  .slot-times { grid-column: 2 / -1; flex-wrap: wrap; }
  .slot-limit-field { grid-column: 2; }
}
</style>
