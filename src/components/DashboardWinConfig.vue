<template>
  <div class="win-config">
    <section class="config-block">
      <div class="block-header">
        <div>
          <p class="block-eyebrow">Wheel composition</p>
          <h4 class="block-title">Sector counts and outcome weights</h4>
        </div>
        <div class="total-field" :class="{ 'total-field--error': errors.totalSectors || errors.sectorCounts }">
          <span class="field-label">Total sectors</span>
          <strong class="field-readonly">{{ localConfig.totalSectors }}</strong>
        </div>
      </div>

      <p v-if="errors.totalSectors || errors.sectorCounts" class="config-error">
        {{ errors.totalSectors || errors.sectorCounts }}
      </p>

      <div class="probability-summary" :class="{ 'probability-summary--error': fallbackSplitTotal !== 100 }">
        <div>
          <p class="probability-summary__eyebrow">Repeat + No win split (must equal 100%)</p>
          <h5>Category C + Category D</h5>
        </div>
        <strong :class="{ 'probability-summary__total--ok': fallbackSplitTotal === 100 }">{{ formatPercentInput(fallbackSplitTotal) }}</strong>
      </div>

      <p class="probability-summary__copy">
        These are <strong>relative ratios</strong>, not absolute spin probabilities. When a win slot is active at e.g. 30%, the remaining 70% is split between Repeat and No win using this ratio. They must always total exactly 100%.
        <template v-if="maxWinProbability > 0">
          At peak win probability ({{ formatPercentInput(maxWinProbability) }}), Repeat + No win share the remaining <strong>{{ formatPercentInput(fallbackRemainingAtPeak) }}</strong>.
        </template>
      </p>

      <div class="probability-timeline">
        <div class="timeline-header">
          <span>Time range</span>
          <span>Main win</span>
          <span>Small win</span>
          <span>Repeat</span>
          <span>No win</span>
        </div>
        <div
          v-for="(row, i) in probabilityTimeline"
          :key="i"
          class="timeline-row"
          :class="{ 'timeline-row--active': row.isActive }"
        >
          <span class="timeline-label">
            {{ row.label }}
            <span v-if="row.isActive" class="timeline-now-badge">NOW</span>
          </span>
          <span :class="Number(row.mainWin) > 0 ? 'timeline-val--win' : 'timeline-val--zero'">{{ row.mainWin }}%</span>
          <span :class="Number(row.smallWin) > 0 ? 'timeline-val--win' : 'timeline-val--zero'">{{ row.smallWin }}%</span>
          <span>{{ row.repeat }}%</span>
          <span>{{ row.noWin }}%</span>
        </div>
      </div>

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
            <div class="field-group field-group--readonly">
              <span class="field-label">Sector count</span>
              <strong class="field-readonly">{{ localConfig[outcome.key].sectorCount }}</strong>
            </div>

            <div v-if="!outcome.hasSlots" class="field-group">
              <label class="field-label" :for="`${outcome.key}-weight`">Fallback split (%)</label>
              <input
                :id="`${outcome.key}-weight`"
                class="number-input"
                type="text"
                inputmode="decimal"
                :value="percentDisplayValue(`${outcome.key}-baseWeight`, localConfig[outcome.key].baseWeight)"
                @focus="startEditing(`${outcome.key}-baseWeight`, localConfig[outcome.key].baseWeight)"
                @input="updateEditing(`${outcome.key}-baseWeight`, $event.target.value)"
                @blur="commitOutcomeEditing(`${outcome.key}-baseWeight`, outcome.key, 'baseWeight')"
              />
              <p class="effective-range">
                <template v-if="outcome.key === 'repeat'">
                  <span v-if="effectiveRepeatRange.min === effectiveRepeatRange.max">Effective: {{ effectiveRepeatRange.max }}%</span>
                  <span v-else>Effective: {{ effectiveRepeatRange.min }}% – {{ effectiveRepeatRange.max }}%</span>
                </template>
                <template v-else-if="outcome.key === 'noWin'">
                  <span v-if="effectiveNoWinRange.min === effectiveNoWinRange.max">Effective: {{ effectiveNoWinRange.max }}%</span>
                  <span v-else>Effective: {{ effectiveNoWinRange.min }}% – {{ effectiveNoWinRange.max }}%</span>
                </template>
              </p>
            </div>

            <div v-else class="field-group field-group--readonly">
              <span class="field-label">Probability source</span>
              <strong class="field-readonly">Final hourly probability</strong>
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
                @blur="applyConfigChange"
              />
            </div>

            <div v-if="outcome.hasDailyLimit" class="field-group field-group--readonly">
              <span class="field-label">Given today</span>
              <strong class="field-readonly">{{ localConfig[outcome.key].givenToday }}</strong>
            </div>
          </div>

          <p v-if="errors[outcome.key]" class="config-error">{{ errors[outcome.key] }}</p>

          <div v-if="outcome.hasSlots" class="slots-block">
            <div class="slots-budget" :class="{ 'slots-budget--error': errors.timelineBudget }">
              <span>Repeat + No win split</span>
              <strong :class="{ 'slots-budget__total--ok': fallbackSplitTotal === 100, 'slots-budget__total--error': fallbackSplitTotal !== 100 }">{{ formatPercentInput(fallbackSplitTotal) }}</strong>
            </div>
            <p class="slots-help">
              Slot probability is an <strong>absolute</strong> chance per spin (e.g. 30% = 3 in 10 spins land here). Only <strong>one range is active at a time</strong> — outside all ranges this outcome has 0% probability.
              <template v-if="fallbackRemainingAtPeak === 0">
                <br/><span class="slots-help--warn">Warning: win slots currently consume 100% of probability. Repeat and No win will never trigger during active windows.</span>
              </template>
            </p>
            <p v-if="errors.timelineBudget" class="config-error">{{ errors.timelineBudget }}</p>

            <div class="slots-header" v-if="localConfig[outcome.key].slots.length">
              <span>Start</span>
              <span>End</span>
              <span>Probability</span>
              <span>Limit</span>
              <span>Progress</span>
              <span>Actions</span>
            </div>

            <div
              v-for="(slot, slotIndex) in localConfig[outcome.key].slots"
              :key="slot._editorId"
              class="slot-row"
              :class="{ 'slot-row--active': slotIndex === activeSlotMap[outcome.key] }"
            >
              <div class="slot-field">
                <label class="slot-label" :for="`${outcome.key}-start-${slotIndex}`">Start</label>
                <input
                  :id="`${outcome.key}-start-${slotIndex}`"
                  class="slot-input"
                  type="time"
                  :value="slot.startTime"
                  @input="onSlotChange(outcome.key, slotIndex, 'startTime', $event.target.value)"
                  @change="applyConfigChange"
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
                  @change="applyConfigChange"
                />
              </div>
              <div class="slot-field">
                <label class="slot-label" :for="`${outcome.key}-weight-${slotIndex}`">Probability (%)</label>
                <input
                  :id="`${outcome.key}-weight-${slotIndex}`"
                  class="slot-input"
                  type="text"
                  inputmode="decimal"
                  :value="percentDisplayValue(`${outcome.key}-slot-${slotIndex}-weight`, slot.weight)"
                  @focus="startEditing(`${outcome.key}-slot-${slotIndex}-weight`, slot.weight)"
                  @input="updateEditing(`${outcome.key}-slot-${slotIndex}-weight`, $event.target.value)"
                  @blur="commitSlotEditing(`${outcome.key}-slot-${slotIndex}-weight`, outcome.key, slotIndex, 'weight')"
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
                  @blur="applyConfigChange"
                />
              </div>
              <div class="slot-given">
                <span class="slot-label slot-label--mobile">Progress</span>
                <strong>{{ slot.given }} / {{ slot.limit }}</strong>
              </div>
              <div class="slot-actions">
                <span v-if="slotIndex === activeSlotMap[outcome.key]" class="slot-active-badge">ACTIVE</span>
                <button
                  class="slot-reset"
                  type="button"
                  :disabled="!slot.given"
                  @click="resetSlotGiven(outcome.key, slotIndex)"
                >
                  Reset
                </button>
                <button class="slot-remove" type="button" @click="removeSlot(outcome.key, slotIndex)">×</button>
              </div>
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
import { DEFAULT_WIN_DISTRIBUTION, OUTCOME_META, OUTCOME_KEYS, normalizeWinDistribution, buildOutcomeWeights, findActiveSlotIndex, formatTime24h } from "@/utils";

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
      nextSlotId: 0,
      errors: {
        totalSectors: "",
        sectorCounts: "",
        mainWin: "",
        smallWin: "",
        timelineBudget: "",
        repeat: "",
        noWin: ""
      },
      editingValues: {},
      currentTime: formatTime24h(new Date())
    };
  },
  mounted() {
    this.clockInterval = setInterval(() => {
      this.currentTime = formatTime24h(new Date());
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.clockInterval);
  },
  computed: {
    ...mapGetters(["winDistribution"]),
    fallbackSplitTotal() {
      return this.clampPercent(this.localConfig.repeat?.baseWeight) + this.clampPercent(this.localConfig.noWin?.baseWeight);
    },
    maxWinProbability() {
      const allSlots = [
        ...(this.localConfig.mainWin?.slots || []),
        ...(this.localConfig.smallWin?.slots || [])
      ];
      if (!allSlots.length) return 0;
      const maxMain = Math.max(0, ...(this.localConfig.mainWin?.slots || []).map((s) => Number(s.weight) || 0));
      const maxSmall = Math.max(0, ...(this.localConfig.smallWin?.slots || []).map((s) => Number(s.weight) || 0));
      return Math.min(100, maxMain + maxSmall);
    },
    fallbackRemainingAtPeak() {
      return Math.max(0, 100 - this.maxWinProbability);
    },
    persistedConfigSnapshot() {
      return this.toPersistedConfig(this.localConfig);
    },
    activeSlotMap() {
      const cfg = this.persistedConfigSnapshot;
      return {
        mainWin: findActiveSlotIndex(cfg.mainWin.slots, this.currentTime),
        smallWin: findActiveSlotIndex(cfg.smallWin.slots, this.currentTime)
      };
    },
    probabilityTimeline() {
      const cfg = this.persistedConfigSnapshot;
      const toMin = (t) => {
        if (!t || !t.includes(":")) return 0;
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const toLabel = (min) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      const slotRanges = [
        ...(cfg.mainWin.slots || []),
        ...(cfg.smallWin.slots || [])
      ]
        .filter((s) => s.startTime && s.endTime && toMin(s.startTime) < toMin(s.endTime))
        .map((s) => ({ start: toMin(s.startTime), end: toMin(s.endTime) }));

      if (!slotRanges.length) {
        const w = buildOutcomeWeights(cfg, this.currentTime);
        return [{
          label: "All day",
          mainWin: (w.mainWin * 100).toFixed(1),
          smallWin: (w.smallWin * 100).toFixed(1),
          repeat: (w.repeat * 100).toFixed(1),
          noWin: (w.noWin * 100).toFixed(1),
          isActive: true
        }];
      }

      const boundaries = [...new Set(slotRanges.flatMap((r) => [r.start, r.end]))].sort((a, b) => a - b);
      const intervals = [];

      if (boundaries[0] > 0) {
        intervals.push({ start: 0, end: boundaries[0] });
      }

      for (let i = 0; i < boundaries.length - 1; i++) {
        intervals.push({ start: boundaries[i], end: boundaries[i + 1] });
      }

      if (boundaries[boundaries.length - 1] < 23 * 60 + 59) {
        intervals.push({ start: boundaries[boundaries.length - 1], end: 23 * 60 + 59 });
      }

      const currentMin = toMin(this.currentTime);

      return intervals.map(({ start, end }) => {
        const mid = Math.floor((start + end) / 2);
        const sampleTime = toLabel(mid);
        const w = buildOutcomeWeights(cfg, sampleTime);
        const isActive = currentMin >= start && currentMin < end;
        return {
          label: `${toLabel(start)} – ${toLabel(end)}`,
          mainWin: (w.mainWin * 100).toFixed(1),
          smallWin: (w.smallWin * 100).toFixed(1),
          repeat: (w.repeat * 100).toFixed(1),
          noWin: (w.noWin * 100).toFixed(1),
          isActive
        };
      });
    },
    effectiveRepeatRange() {
      const ratio = this.clampPercent(this.localConfig.repeat?.baseWeight);
      const max = ratio;
      const min = (ratio / 100) * this.fallbackRemainingAtPeak;
      return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
    },
    effectiveNoWinRange() {
      const ratio = this.clampPercent(this.localConfig.noWin?.baseWeight);
      const max = ratio;
      const min = (ratio / 100) * this.fallbackRemainingAtPeak;
      return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
    }
  },
  watch: {
    winDistribution: {
      immediate: true,
      handler(value) {
        const normalized = normalizeWinDistribution(value);
        const current = this.toPersistedConfig(this.localConfig);

        if (JSON.stringify(normalized) === JSON.stringify(current)) {
          return;
        }

        this.localConfig = this.toEditorConfig(normalized);
      }
    }
  },
  methods: {
    replaceOutcomeConfig(outcomeKey, patch) {
      this.localConfig = {
        ...this.localConfig,
        [outcomeKey]: {
          ...this.localConfig[outcomeKey],
          ...patch
        }
      };
    },
    parsePercent(rawValue) {
      const cleaned = String(rawValue ?? "")
        .replace(",", ".")
        .replace(/[^0-9.]/g, "");
      const firstDot = cleaned.indexOf(".");
      const normalized = firstDot >= 0
        ? `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`
        : cleaned;

      return this.clampPercent(normalized);
    },
    formatPercentInput(value) {
      return `${this.clampPercent(value).toFixed(2)}%`;
    },
    clampPercent(rawValue) {
      return Math.min(100, Math.max(0, Number(rawValue) || 0));
    },
    timeToMinutes(value) {
      if (!value || typeof value !== "string" || !value.includes(":")) return 0;
      const [hours, minutes] = value.split(":").map((item) => Number(item) || 0);
      return (hours * 60) + minutes;
    },
    minutesToTime(value) {
      const safe = Math.max(0, Math.min((23 * 60) + 59, value));
      const hours = Math.floor(safe / 60);
      const minutes = safe % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    },
    createEditorSlot(slot) {
      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        limit: slot.limit,
        given: slot.given,
        weight: this.clampPercent((Number(slot.weight) || 0) * 100),
        _editorId: `slot-${this.nextSlotId++}`
      };
    },
    createNextSlot(outcomeKey) {
      const currentSlots = this.localConfig[outcomeKey].slots || [];
      const lastSlot = currentSlots[currentSlots.length - 1];
      const startMinutes = lastSlot
        ? this.timeToMinutes(lastSlot.endTime)
        : 9 * 60;
      const endMinutes = Math.min(startMinutes + 60, (23 * 60) + 59);

      return this.createEditorSlot({
        startTime: this.minutesToTime(startMinutes),
        endTime: this.minutesToTime(endMinutes > startMinutes ? endMinutes : Math.min(startMinutes + 30, (23 * 60) + 59)),
        limit: 1,
        given: 0,
        weight: 10
      });
    },
    toEditorConfig(value) {
      const normalized = normalizeWinDistribution(value);

      return {
        totalSectors: normalized.totalSectors,
        mainWin: {
          ...normalized.mainWin,
          baseWeight: this.clampPercent(normalized.mainWin.baseWeight * 100),
          slots: normalized.mainWin.slots.map((slot) => this.createEditorSlot(slot))
        },
        smallWin: {
          ...normalized.smallWin,
          baseWeight: this.clampPercent(normalized.smallWin.baseWeight * 100),
          slots: normalized.smallWin.slots.map((slot) => this.createEditorSlot(slot))
        },
        repeat: {
          ...normalized.repeat,
          baseWeight: this.clampPercent(normalized.repeat.baseWeight * 100)
        },
        noWin: {
          ...normalized.noWin,
          baseWeight: this.clampPercent(normalized.noWin.baseWeight * 100)
        },
        lastResetDate: normalized.lastResetDate
      };
    },
    toPersistedConfig(value) {
      const source = value && typeof value === "object" ? value : DEFAULT_WIN_DISTRIBUTION();
      return normalizeWinDistribution({
        totalSectors: source.totalSectors,
        mainWin: {
          ...source.mainWin,
          baseWeight: this.clampPercent(source.mainWin?.baseWeight) / 100,
          slots: (source.mainWin?.slots || []).map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            limit: Math.max(0, Number(slot.limit) || 0),
            given: Math.max(0, Number(slot.given) || 0),
            weight: this.clampPercent(slot.weight) / 100
          }))
        },
        smallWin: {
          ...source.smallWin,
          baseWeight: this.clampPercent(source.smallWin?.baseWeight) / 100,
          slots: (source.smallWin?.slots || []).map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            limit: Math.max(0, Number(slot.limit) || 0),
            given: Math.max(0, Number(slot.given) || 0),
            weight: this.clampPercent(slot.weight) / 100
          }))
        },
        repeat: {
          ...source.repeat,
          baseWeight: this.clampPercent(source.repeat?.baseWeight) / 100
        },
        noWin: {
          ...source.noWin,
          baseWeight: this.clampPercent(source.noWin?.baseWeight) / 100
        },
        lastResetDate: source.lastResetDate || ""
      });
    },
    applyConfigChange() {
      if (!this.validate()) {
        return;
      }

      this.$emit("config-change", this.toPersistedConfig(this.localConfig));
    },
    onTotalSectorsChange(rawValue) {
      this.localConfig = {
        ...this.localConfig,
        totalSectors: Math.max(1, parseInt(rawValue, 10) || 1)
      };
      this.validateSectorCounts();
    },
    onOutcomeChange(outcomeKey, field, rawValue, isFloat = false) {
      const nextValue = isFloat
        ? this.parsePercent(rawValue)
        : Math.max(0, parseInt(rawValue, 10) || 0);

      this.replaceOutcomeConfig(outcomeKey, {
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
          ? this.parsePercent(rawValue)
          : Math.max(0, parseInt(rawValue, 10) || 0);

      const slots = this.localConfig[outcomeKey].slots.map((slot, index) =>
        index === slotIndex ? { ...slot, [field]: nextValue } : slot
      );

      this.replaceOutcomeConfig(outcomeKey, {
        slots
      });

      this.validateOutcome(outcomeKey);
    },
    addSlot(outcomeKey) {
      const slots = [...this.localConfig[outcomeKey].slots, this.createNextSlot(outcomeKey)];
      this.replaceOutcomeConfig(outcomeKey, {
        slots
      });
      this.$nextTick(() => {
        this.applyConfigChange();
      });
    },
    removeSlot(outcomeKey, slotIndex) {
      const slots = this.localConfig[outcomeKey].slots.filter((_, index) => index !== slotIndex);
      this.replaceOutcomeConfig(outcomeKey, {
        slots
      });
      this.$nextTick(() => {
        this.applyConfigChange();
      });
    },
    resetSlotGiven(outcomeKey, slotIndex) {
      const currentOutcome = this.localConfig[outcomeKey];
      const slotToReset = currentOutcome.slots[slotIndex];
      const givenToReset = Math.max(0, Number(slotToReset?.given) || 0);

      if (!givenToReset) {
        return;
      }

      const slots = currentOutcome.slots.map((slot, index) =>
        index === slotIndex ? { ...slot, given: 0 } : slot
      );

      this.replaceOutcomeConfig(outcomeKey, {
        givenToday: Math.max(0, (Number(currentOutcome.givenToday) || 0) - givenToReset),
        slots
      });

      this.$nextTick(() => {
        this.applyConfigChange();
      });
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
      this.errors.timelineBudget = "";

      if (Number(outcome.baseWeight) < 0 || Number(outcome.baseWeight) > 100) {
        this.errors[outcomeKey] = `${OUTCOME_META[outcomeKey].hasSlots ? "Slot" : "Global"} probability must stay between 0% and 100%.`;
        return false;
      }

      if (OUTCOME_META[outcomeKey].hasDailyLimit && Number(outcome.dailyLimit) < 0) {
        this.errors[outcomeKey] = "Daily limit cannot be negative.";
        return false;
      }

      if (OUTCOME_META[outcomeKey].hasDailyLimit && Number(outcome.givenToday) > Number(outcome.dailyLimit)) {
        this.errors[outcomeKey] = "Given today cannot be greater than the daily limit.";
        return false;
      }

      if (OUTCOME_META[outcomeKey].hasSlots) {
        const invalidSlot = outcome.slots.find((slot) => {
          const start = this.timeToMinutes(slot.startTime);
          const end = this.timeToMinutes(slot.endTime);
          return !slot.startTime || !slot.endTime || start >= end || Number(slot.weight) > 100;
        });

        if (invalidSlot) {
          this.errors[outcomeKey] = "Each time range needs a valid start/end and probability between 0% and 100%.";
          return false;
        }

        const orderedSlots = outcome.slots
          .map((slot) => ({
            start: this.timeToMinutes(slot.startTime),
            end: this.timeToMinutes(slot.endTime)
          }))
          .sort((left, right) => left.start - right.start);

        for (let index = 1; index < orderedSlots.length; index += 1) {
          if (orderedSlots[index].start < orderedSlots[index - 1].end) {
            this.errors[outcomeKey] = "Time ranges cannot overlap inside the same outcome.";
            return false;
          }
        }

        const slotLimitTotal = outcome.slots.reduce((sum, slot) => sum + (Number(slot.limit) || 0), 0);
        if (slotLimitTotal > outcome.dailyLimit) {
          this.errors[outcomeKey] = `Slot limits total (${slotLimitTotal}) exceeds daily limit (${outcome.dailyLimit}).`;
          return false;
        }

        const slotBudgetError = this.validateTimelinePrizeCap();

        if (slotBudgetError) {
          this.errors.timelineBudget = slotBudgetError;
          return false;
        }
      }

      this.errors[outcomeKey] = "";
      return true;
    },
    validateTimelinePrizeCap() {
      const ranges = [
        ...this.localConfig.mainWin.slots.map((slot) => ({
          start: this.timeToMinutes(slot.startTime),
          end: this.timeToMinutes(slot.endTime),
          weight: Number(slot.weight) || 0,
          key: "mainWin"
        })),
        ...this.localConfig.smallWin.slots.map((slot) => ({
          start: this.timeToMinutes(slot.startTime),
          end: this.timeToMinutes(slot.endTime),
          weight: Number(slot.weight) || 0,
          key: "smallWin"
        }))
      ];

      if (!ranges.length) {
        if (this.fallbackSplitTotal !== 100) {
          return `Repeat + No win split must total exactly 100.00% (current: ${this.fallbackSplitTotal.toFixed(2)}%). Adjust Category C or Category D.`;
        }
        return "";
      }

      if (this.fallbackSplitTotal !== 100) {
        return `Repeat + No win split must total exactly 100.00% (current: ${this.fallbackSplitTotal.toFixed(2)}%). These are relative ratios — they do not affect how much probability wins consume, only how the remainder is divided.`;
      }

      const boundaries = [...new Set(ranges.flatMap((range) => [range.start, range.end]))].sort((a, b) => a - b);

      for (let index = 0; index < boundaries.length - 1; index += 1) {
        const sample = boundaries[index] + ((boundaries[index + 1] - boundaries[index]) / 2);
        const mainWeight = this.findSlotWeightAt("mainWin", sample);
        const smallWeight = this.findSlotWeightAt("smallWin", sample);
        const total = mainWeight + smallWeight;

        if (total > 100.001) {
          return `Main win + Small win cannot exceed 100.00% in the same time range. Current total: ${total.toFixed(2)}%.`;
        }
      }

      return "";
    },
    findSlotWeightAt(outcomeKey, minutes) {
      const match = this.localConfig[outcomeKey].slots.find((slot) => {
        const start = this.timeToMinutes(slot.startTime);
        const end = this.timeToMinutes(slot.endTime);
        return minutes >= start && minutes < end;
      });

      return match ? (Number(match.weight) || 0) : 0;
    },
    validate() {
      const sectorsOk = this.validateSectorCounts();
      const outcomesOk = OUTCOME_KEYS.every((key) => this.validateOutcome(key));
      return sectorsOk && outcomesOk;
    },
    getConfig() {
      return this.toPersistedConfig(this.localConfig);
    },
    startEditing(fieldKey, currentValue) {
      const raw = this.clampPercent(currentValue);
      this.$set(this.editingValues, fieldKey, raw % 1 === 0 ? String(raw) : String(raw));
    },
    updateEditing(fieldKey, rawValue) {
      this.$set(this.editingValues, fieldKey, rawValue);
    },
    commitOutcomeEditing(fieldKey, outcomeKey, field) {
      const raw = this.editingValues[fieldKey];
      this.$delete(this.editingValues, fieldKey);
      this.onOutcomeChange(outcomeKey, field, raw ?? "", true);
      this.applyConfigChange();
    },
    commitSlotEditing(fieldKey, outcomeKey, slotIndex, field) {
      const raw = this.editingValues[fieldKey];
      this.$delete(this.editingValues, fieldKey);
      this.onSlotChange(outcomeKey, slotIndex, field, raw ?? "", true);
      this.applyConfigChange();
    },
    percentDisplayValue(fieldKey, rawValue) {
      if (Object.prototype.hasOwnProperty.call(this.editingValues, fieldKey)) {
        return this.editingValues[fieldKey];
      }
      return this.formatPercentInput(rawValue);
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

.slot-label {
  display: none;
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

.probability-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 251, 243, 0.92);
  border: 1px solid rgba(205, 174, 104, 0.24);
}

.probability-summary--error {
  border-color: rgba(185, 45, 34, 0.28);
  background: rgba(255, 243, 241, 0.96);
}

.probability-summary__eyebrow {
  margin: 0 0 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
  font-size: 0.62rem;
  color: #1f5a3f;
}

.probability-summary h5 {
  margin: 0;
  font-size: 0.95rem;
  color: #1d2b22;
}

.probability-summary strong {
  font-size: 1.1rem;
  color: #b92d22;
  font-variant-numeric: tabular-nums;
}

.probability-summary__total--ok {
  color: #1f5a3f;
}

.probability-summary__copy {
  margin: -0.35rem 0 0;
  color: rgba(29, 43, 34, 0.66);
  font-size: 0.82rem;
  line-height: 1.45;
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

/* Probability timeline table */
.probability-timeline {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(122, 151, 131, 0.16);
}

.timeline-header,
.timeline-row {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  align-items: center;
}

.timeline-header {
  background: rgba(31, 90, 63, 0.07);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 800;
  font-size: 0.58rem;
  color: rgba(49, 88, 70, 0.65);
}

.timeline-row {
  background: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(122, 151, 131, 0.1);
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #1d2b22;
}

.timeline-row--active {
  background: rgba(31, 90, 63, 0.06);
  border-left: 3px solid #1f5a3f;
}

.timeline-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
}

.timeline-now-badge {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: #1f5a3f;
  color: #fff;
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  vertical-align: middle;
}

.timeline-val--win {
  color: #1f5a3f;
  font-weight: 700;
}

.timeline-val--zero {
  color: rgba(29, 43, 34, 0.35);
}

/* Slot active badge and row highlight */
.slot-row--active {
  border-color: rgba(31, 90, 63, 0.35);
  background: rgba(31, 90, 63, 0.04);
}

.slot-active-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(31, 90, 63, 0.12);
  color: #1f5a3f;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Effective probability range */
.effective-range {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: rgba(29, 43, 34, 0.58);
  font-variant-numeric: tabular-nums;
}

.slots-block {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.slots-help {
  margin: -0.2rem 0 0;
  color: rgba(29, 43, 34, 0.62);
  font-size: 0.8rem;
  line-height: 1.45;
}

.slots-help--warn {
  color: #b92d22;
  font-weight: 600;
}

.slots-budget__total--ok {
  color: #1f5a3f;
}

.slots-budget__total--error {
  color: #b92d22;
}

.slots-header,
.slot-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(7.5rem, 0.85fr) minmax(6.5rem, 0.75fr) minmax(5.5rem, 0.85fr) minmax(7.25rem, 0.9fr);
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
  display: flex;
  flex-direction: column;
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

.slot-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
}

.slot-reset,
.slot-remove {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.slot-reset {
  min-height: 2rem;
  padding: 0.45rem 0.8rem;
  background: rgba(31, 90, 63, 0.08);
  color: #1f5a3f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.slot-reset:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.slot-remove {
  align-self: center;
  width: 2rem;
  height: 2rem;
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

  .slot-label {
    display: inline;
  }

  .slot-row {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .slot-label--mobile {
    display: inline;
  }

  .slot-given,
  .slot-actions {
    align-self: start;
    justify-self: start;
  }
}
</style>
