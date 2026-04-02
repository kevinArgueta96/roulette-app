<template>
  <div class="win-config">
    <section class="config-block">
      <div class="block-header">
        <div>
          <p class="block-eyebrow">Wheel composition</p>
          <h4 class="block-title">Sector counts and outcome weights</h4>
        </div>
        <div class="total-field" :class="{ 'total-field--error': errors.totalSectors || errors.sectorCounts }">
          <label class="field-label" for="total-sectors">Total sectors</label>
          <input
            id="total-sectors"
            class="number-input"
            type="number"
            min="1"
            :value="localConfig.totalSectors"
            @input="onTotalSectorsChange($event.target.value)"
            @blur="validateSectorCounts"
          />
        </div>
      </div>

      <p v-if="errors.totalSectors || errors.sectorCounts" class="config-error">
        {{ errors.totalSectors || errors.sectorCounts }}
      </p>

      <div class="outcome-grid">
        <article v-for="outcome in outcomes" :key="outcome.key" class="outcome-card">
          <div class="outcome-card__header">
            <div class="outcome-card__title">
              <span class="outcome-dot" :style="{ background: outcome.color }" aria-hidden="true"></span>
              <div>
                <p class="outcome-eyebrow">{{ outcome.eyebrow }}</p>
                <h5 class="outcome-name">{{ outcome.label }}</h5>
              </div>
            </div>
            <span class="outcome-preview">{{ localConfig[outcome.key].sectorCount }} sectors</span>
          </div>

          <p class="outcome-description">{{ outcome.description }}</p>

          <div class="outcome-fields">
            <div class="field-group">
              <label class="field-label" :for="`${outcome.key}-sectors`">Sector count</label>
              <input
                :id="`${outcome.key}-sectors`"
                class="number-input"
                type="number"
                min="0"
                :value="localConfig[outcome.key].sectorCount"
                @input="onOutcomeChange(outcome.key, 'sectorCount', $event.target.value)"
                @blur="validateSectorCounts"
              />
            </div>

            <div class="field-group">
              <label class="field-label" :for="`${outcome.key}-weight`">Base weight</label>
              <input
                :id="`${outcome.key}-weight`"
                class="number-input"
                type="number"
                min="0"
                step="0.01"
                :value="localConfig[outcome.key].baseWeight"
                @input="onOutcomeChange(outcome.key, 'baseWeight', $event.target.value, true)"
                @blur="validateOutcome(outcome.key)"
              />
            </div>

            <div v-if="outcome.hasDailyLimit" class="field-group">
              <label class="field-label" :for="`${outcome.key}-daily`">Daily limit</label>
              <input
                :id="`${outcome.key}-daily`"
                class="number-input"
                type="number"
                min="0"
                :value="localConfig[outcome.key].dailyLimit"
                @input="onOutcomeChange(outcome.key, 'dailyLimit', $event.target.value)"
                @blur="validateOutcome(outcome.key)"
              />
            </div>

            <div v-if="outcome.hasDailyLimit" class="field-group field-group--readonly">
              <span class="field-label">Given today</span>
              <strong class="field-readonly">{{ localConfig[outcome.key].givenToday }}</strong>
            </div>
          </div>

          <p v-if="errors[outcome.key]" class="config-error">{{ errors[outcome.key] }}</p>

          <div v-if="outcome.hasSlots" class="slots-block">
            <div class="slots-header" v-if="localConfig[outcome.key].slots.length">
              <span>Start</span>
              <span>End</span>
              <span>Weight</span>
              <span>Limit</span>
              <span>Given</span>
              <span>Actions</span>
            </div>

            <div
              v-for="(slot, slotIndex) in localConfig[outcome.key].slots"
              :key="`${outcome.key}-${slotIndex}`"
              class="slot-row"
            >
              <div class="slot-field">
                <label class="slot-label" :for="`${outcome.key}-start-${slotIndex}`">Start</label>
                <input
                  :id="`${outcome.key}-start-${slotIndex}`"
                  class="slot-input"
                  type="time"
                  :value="slot.startTime"
                  @input="onSlotChange(outcome.key, slotIndex, 'startTime', $event.target.value)"
                />
              </div>
              <div class="slot-field">
                <label class="slot-label" :for="`${outcome.key}-end-${slotIndex}`">End</label>
                <input
                  :id="`${outcome.key}-end-${slotIndex}`"
                  class="slot-input"
                  type="time"
                  :value="slot.endTime"
                  @input="onSlotChange(outcome.key, slotIndex, 'endTime', $event.target.value)"
                />
              </div>
              <div class="slot-field">
                <label class="slot-label" :for="`${outcome.key}-weight-${slotIndex}`">Weight</label>
                <input
                  :id="`${outcome.key}-weight-${slotIndex}`"
                  class="slot-input"
                  type="number"
                  min="0"
                  step="0.01"
                  :value="slot.weight"
                  @input="onSlotChange(outcome.key, slotIndex, 'weight', $event.target.value, true)"
                />
              </div>
              <div class="slot-field">
                <label class="slot-label" :for="`${outcome.key}-limit-${slotIndex}`">Limit</label>
                <input
                  :id="`${outcome.key}-limit-${slotIndex}`"
                  class="slot-input"
                  type="number"
                  min="0"
                  :value="slot.limit"
                  @input="onSlotChange(outcome.key, slotIndex, 'limit', $event.target.value)"
                />
              </div>
              <div class="slot-given">
                <span class="slot-label slot-label--mobile">Given</span>
                <strong>{{ slot.given }}</strong>
              </div>
              <button class="slot-remove" type="button" @click="removeSlot(outcome.key, slotIndex)">×</button>
            </div>

            <div v-if="!localConfig[outcome.key].slots.length" class="empty-slots">
              No time ranges configured yet.
            </div>

            <button class="add-slot-btn" type="button" @click="addSlot(outcome.key)">
              + Add time range
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { DEFAULT_WIN_DISTRIBUTION, OUTCOME_META, OUTCOME_KEYS, createDefaultSlot, normalizeWinDistribution } from "@/utils";

const OUTCOMES = [
  {
    key: "mainWin",
    eyebrow: "Category A",
    label: "Main win",
    description: "Lahjakassi sectors, daily limit, and time-based probability.",
    color: OUTCOME_META.mainWin.color,
    hasDailyLimit: true,
    hasSlots: true
  },
  {
    key: "smallWin",
    eyebrow: "Category B",
    label: "Small win",
    description: "Yllatyspalkinto sectors, daily limit, and time-based probability.",
    color: OUTCOME_META.smallWin.color,
    hasDailyLimit: true,
    hasSlots: true
  },
  {
    key: "repeat",
    eyebrow: "Category C",
    label: "Repeat",
    description: "Kokeile uudestaan sectors with configurable base probability.",
    color: OUTCOME_META.repeat.color,
    hasDailyLimit: false,
    hasSlots: false
  },
  {
    key: "noWin",
    eyebrow: "Category D",
    label: "No win",
    description: "Blank green sectors that absorb the remaining non-winning outcomes.",
    color: OUTCOME_META.noWin.color,
    hasDailyLimit: false,
    hasSlots: false
  }
];

export default {
  name: "DashboardWinConfig",
  data() {
    return {
      outcomes: OUTCOMES,
      localConfig: DEFAULT_WIN_DISTRIBUTION(),
      errors: {
        totalSectors: "",
        sectorCounts: "",
        mainWin: "",
        smallWin: "",
        repeat: "",
        noWin: ""
      }
    };
  },
  computed: {
    ...mapGetters(["winDistribution"])
  },
  watch: {
    winDistribution: {
      immediate: true,
      handler(value) {
        this.localConfig = normalizeWinDistribution(value);
      }
    }
  },
  methods: {
    onTotalSectorsChange(rawValue) {
      this.localConfig = {
        ...this.localConfig,
        totalSectors: Math.max(1, parseInt(rawValue, 10) || 1)
      };
      this.validateSectorCounts();
    },
    onOutcomeChange(outcomeKey, field, rawValue, isFloat = false) {
      const nextValue = isFloat
        ? Math.max(0, Number(rawValue) || 0)
        : Math.max(0, parseInt(rawValue, 10) || 0);

      this.$set(this.localConfig, outcomeKey, {
        ...this.localConfig[outcomeKey],
        [field]: nextValue
      });

      if (field === "sectorCount") {
        this.validateSectorCounts();
      } else {
        this.validateOutcome(outcomeKey);
      }
    },
    onSlotChange(outcomeKey, slotIndex, field, rawValue, isFloat = false) {
      const nextValue = field.includes("Time")
        ? rawValue
        : isFloat
          ? Math.max(0, Number(rawValue) || 0)
          : Math.max(0, parseInt(rawValue, 10) || 0);

      const slots = this.localConfig[outcomeKey].slots.map((slot, index) =>
        index === slotIndex ? { ...slot, [field]: nextValue } : slot
      );

      this.$set(this.localConfig, outcomeKey, {
        ...this.localConfig[outcomeKey],
        slots
      });

      this.validateOutcome(outcomeKey);
    },
    addSlot(outcomeKey) {
      const slots = [...this.localConfig[outcomeKey].slots, createDefaultSlot()];
      this.$set(this.localConfig, outcomeKey, {
        ...this.localConfig[outcomeKey],
        slots
      });
    },
    removeSlot(outcomeKey, slotIndex) {
      const slots = this.localConfig[outcomeKey].slots.filter((_, index) => index !== slotIndex);
      this.$set(this.localConfig, outcomeKey, {
        ...this.localConfig[outcomeKey],
        slots
      });
      this.validateOutcome(outcomeKey);
    },
    validateSectorCounts() {
      if (this.localConfig.totalSectors < 1) {
        this.errors.totalSectors = "Total sectors must be at least 1.";
        return false;
      }

      this.errors.totalSectors = "";
      const assigned = OUTCOME_KEYS.reduce((sum, key) => sum + (Number(this.localConfig[key].sectorCount) || 0), 0);

      if (assigned !== this.localConfig.totalSectors) {
        this.errors.sectorCounts = `Sector counts must add up to ${this.localConfig.totalSectors}. Current total: ${assigned}.`;
        return false;
      }

      this.errors.sectorCounts = "";
      return true;
    },
    validateOutcome(outcomeKey) {
      const outcome = this.localConfig[outcomeKey];
      if (Number(outcome.baseWeight) < 0) {
        this.errors[outcomeKey] = "Base weight cannot be negative.";
        return false;
      }

      if (OUTCOME_META[outcomeKey].hasDailyLimit && Number(outcome.dailyLimit) < 0) {
        this.errors[outcomeKey] = "Daily limit cannot be negative.";
        return false;
      }

      if (OUTCOME_META[outcomeKey].hasSlots) {
        const slotLimitTotal = outcome.slots.reduce((sum, slot) => sum + (Number(slot.limit) || 0), 0);
        if (slotLimitTotal > outcome.dailyLimit) {
          this.errors[outcomeKey] = `Slot limits total (${slotLimitTotal}) exceeds daily limit (${outcome.dailyLimit}).`;
          return false;
        }
      }

      this.errors[outcomeKey] = "";
      return true;
    },
    validate() {
      const sectorsOk = this.validateSectorCounts();
      const outcomesOk = OUTCOME_KEYS.every((key) => this.validateOutcome(key));
      return sectorsOk && outcomesOk;
    },
    getConfig() {
      return normalizeWinDistribution(this.localConfig);
    }
  }
};
</script>

<style scoped>
.win-config {
  width: 100%;
}

.config-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.block-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.block-eyebrow,
.outcome-eyebrow,
.field-label,
.slot-label,
.slots-header {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
}

.block-eyebrow,
.outcome-eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.66rem;
  color: #1f5a3f;
}

.block-title {
  margin: 0;
  font-size: 1.15rem;
  color: #1d2b22;
}

.total-field,
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label,
.slot-label {
  font-size: 0.58rem;
  color: rgba(49, 88, 70, 0.6);
}

.number-input,
.slot-input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(122, 151, 131, 0.18);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 0.7rem 0.8rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1d2b22;
  font-variant-numeric: tabular-nums;
  outline: none;
}

.total-field {
  min-width: 8rem;
}

.total-field--error .number-input {
  border-color: #b92d22;
}

.config-error {
  margin: 0;
  color: #b92d22;
  font-size: 0.78rem;
  font-weight: 600;
}

.outcome-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.outcome-card {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  padding: 1rem;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(247, 250, 245, 0.94) 100%);
  border: 1px solid rgba(122, 151, 131, 0.14);
  min-width: 0;
}

.outcome-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.outcome-card__title {
  display: flex;
  gap: 0.7rem;
  min-width: 0;
}

.outcome-dot {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  margin-top: 0.45rem;
  flex-shrink: 0;
}

.outcome-name {
  margin: 0;
  font-size: 1rem;
  color: #1d2b22;
}

.outcome-preview {
  white-space: nowrap;
  font-size: 0.76rem;
  font-weight: 700;
  color: #1f5a3f;
}

.outcome-description {
  margin: 0;
  color: rgba(29, 43, 34, 0.62);
  line-height: 1.45;
  font-size: 0.84rem;
}

.outcome-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.field-group--readonly {
  justify-content: flex-end;
}

.field-readonly {
  display: block;
  padding: 0.7rem 0.8rem;
  border-radius: 0.75rem;
  background: rgba(255, 251, 243, 0.92);
  color: #1f5a3f;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

.slots-block {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.slots-header,
.slot-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6.2rem 6.2rem 4rem 2.2rem;
  gap: 0.7rem;
  align-items: end;
}

.slots-header {
  padding: 0 0.25rem;
  color: rgba(49, 88, 70, 0.58);
  font-size: 0.58rem;
}

.slot-row {
  padding: 0.85rem;
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(122, 151, 131, 0.14);
}

.slot-field {
  min-width: 0;
}

.slot-given {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding-bottom: 0.4rem;
}

.slot-given strong {
  color: #1f5a3f;
  font-variant-numeric: tabular-nums;
}

.slot-remove {
  align-self: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: rgba(185, 45, 34, 0.08);
  color: #b92d22;
  font-size: 1.15rem;
  cursor: pointer;
}

.slot-label--mobile {
  display: none;
}

.empty-slots {
  padding: 0.85rem 0.95rem;
  border-radius: 0.85rem;
  background: rgba(255, 251, 243, 0.8);
  border: 1px dashed rgba(122, 151, 131, 0.2);
  color: rgba(29, 43, 34, 0.58);
  font-size: 0.82rem;
}

.add-slot-btn {
  align-self: flex-start;
  border: 1px dashed rgba(122, 151, 131, 0.35);
  background: rgba(255, 255, 255, 0.92);
  color: #1f5a3f;
  border-radius: 0.7rem;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .outcome-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .outcome-fields {
    grid-template-columns: 1fr;
  }

  .slots-header {
    display: none;
  }

  .slot-row {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .slot-label--mobile {
    display: inline;
  }

  .slot-given,
  .slot-remove {
    align-self: start;
    justify-self: start;
  }
}
</style>
