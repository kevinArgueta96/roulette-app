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

      <div class="logic-summary" aria-label="Prize logic summary">
        <div class="logic-summary__item logic-summary__item--amount">
          <span class="logic-summary__label">Amount per time</span>
          <strong>{{ amountOutcomeLabel }}</strong>
          <p>Use time windows and available win amounts. These prizes can only appear while their window is active and still has wins left.</p>
        </div>
        <div class="logic-summary__item logic-summary__item--probability">
          <span class="logic-summary__label">Probability</span>
          <strong>{{ percentageOutcomeLabel }}</strong>
          <p>Use percentage shares. These outcomes stay configurable by probability and must add up to 100%.</p>
        </div>
      </div>

      <!-- Outcome accordion -->
      <ul class="win-row-list">
        <li
          v-for="outcome in outcomes"
          :key="outcome.key"
          class="win-row"
          :class="{ 'win-row--expanded': expandedOutcome === outcome.key }"
        >
          <button
            type="button"
            class="win-row__head"
            :style="{ borderLeftColor: outcome.color }"
            @click="toggleOutcome(outcome.key)"
            :aria-expanded="expandedOutcome === outcome.key ? 'true' : 'false'"
          >
            <span class="win-row__swatch" :style="{ background: outcome.color }" aria-hidden="true"></span>
            <span class="win-row__label">{{ outcome.label }}</span>
            <div class="win-row__badges">
              <span class="win-row__badge">{{ localConfig[outcome.key].sectorCount }} sectors</span>
              <span class="win-row__badge win-row__badge--type">{{ outcome.isAmountPerTime ? 'Amount' : 'Probability' }}</span>
              <span v-if="outcome.hasDailyLimit" class="win-row__badge">Limit: {{ localConfig[outcome.key].dailyLimit }}</span>
              <span v-if="outcome.hasSlots" class="win-row__badge">{{ localConfig[outcome.key].slots.length }} window{{ localConfig[outcome.key].slots.length !== 1 ? 's' : '' }}</span>
            </div>
            <span class="win-row__chevron" aria-hidden="true">{{ expandedOutcome === outcome.key ? '▼' : '▶' }}</span>
          </button>

          <div v-if="expandedOutcome === outcome.key" class="win-row__body">
            <p v-if="errors[outcome.key]" class="config-error">{{ errors[outcome.key] }}</p>

            <div class="win-row__fields">
              <div class="field-group field-group--readonly">
                <span class="field-label">Sector count</span>
                <strong class="field-readonly">{{ localConfig[outcome.key].sectorCount }}</strong>
              </div>

              <div class="field-group field-group--readonly">
                <span class="field-label">Win logic</span>
                <strong class="field-readonly">{{ outcome.isAmountPerTime ? 'Amount per time slot' : 'Probability %' }}</strong>
              </div>

              <div v-if="!outcome.hasSlots" class="field-group">
                <label class="field-label" :for="`${outcome.key}-weight`">Probability share (%)</label>
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
                  <template v-if="effectiveFallbackRanges[outcome.key]">
                    <span v-if="effectiveFallbackRanges[outcome.key].min === effectiveFallbackRanges[outcome.key].max">
                      Effective: {{ effectiveFallbackRanges[outcome.key].max }}%
                    </span>
                    <span v-else>
                      Effective: {{ effectiveFallbackRanges[outcome.key].min }}% – {{ effectiveFallbackRanges[outcome.key].max }}%
                    </span>
                  </template>
                </p>
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

              <div v-if="outcome.hasDailyLimit" class="field-group field-group--given">
                <span class="field-label">Given today</span>
                <div class="given-today">
                  <span class="given-today__count">{{ localConfig[outcome.key].givenToday }} <span class="given-today__limit">/ {{ localConfig[outcome.key].dailyLimit }}</span></span>
                  <div class="given-bar">
                    <div
                      class="given-bar__fill"
                      :style="{ width: getGivenPercent(outcome.key) + '%' }"
                      :class="{ 'given-bar__fill--full': getGivenPercent(outcome.key) >= 100 }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="outcome.hasSlots" class="win-row__slots">
              <div class="win-row__slots-head">
                <p class="win-row__slots-label">Time windows</p>
                <button type="button" class="edit-slots-btn" @click.stop="openSlotModal(outcome.key)">
                  Edit time slots
                </button>
              </div>

              <div v-if="!localConfig[outcome.key].slots.length" class="empty-slots">
                No time windows configured — this outcome never appears.
              </div>

              <ul v-else class="win-row__slot-list">
                <li
                  v-for="(slot, si) in localConfig[outcome.key].slots"
                  :key="slot._editorId"
                  class="win-row__slot-item"
                  :class="{ 'win-row__slot-item--active': si === activeSlotMap[outcome.key] }"
                >
                  <span class="win-row__slot-time">{{ slot.startTime }}–{{ slot.endTime }}</span>
                  <span class="win-row__slot-progress">
                    {{ slot.given }}<span class="win-row__slot-sep">/</span>{{ slot.limit }}
                    <template v-if="!outcome.isAmountPerTime"> · {{ slot.weight }}%</template>
                  </span>
                  <span v-if="si === activeSlotMap[outcome.key]" class="slot-active-badge">ACTIVE</span>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>

      <div class="fallback-split" :class="{ 'fallback-split--error': fallbackSplitTotal !== 100 }">
        <div class="fallback-split__header">
          <div>
            <p class="block-eyebrow">Probability logic</p>
            <h4 class="block-title">{{ percentageOutcomeLabel }}</h4>
          </div>
          <div class="fallback-split__total">
            <span class="fallback-split__total-label">Total</span>
            <strong :class="{ 'fallback-split__total-value--ok': fallbackSplitTotal === 100, 'fallback-split__total-value--error': fallbackSplitTotal !== 100 }">{{ formatPercentInput(fallbackSplitTotal) }}</strong>
          </div>
        </div>
        <p class="fallback-split__copy">
          {{ fallbackCopy }}
        </p>
        <p v-if="errors.timelineBudget" class="config-error">{{ errors.timelineBudget }}</p>
      </div>

      <div class="timeline-section">
        <div class="timeline-section__header">
          <div>
            <p class="block-eyebrow">Live preview</p>
            <h4 class="block-title">Probability by time of day</h4>
          </div>
        </div>

        <p class="probability-summary__copy">
          Hour-by-hour preview of the actual per-spin probability for each outcome.
        </p>

        <div class="probability-timeline">
          <div class="timeline-header" :style="timelineGridStyle">
            <span>Time window</span>
            <span v-for="outcome in outcomes" :key="outcome.key">{{ outcome.label }}</span>
          </div>
          <div
            v-for="(row, i) in probabilityTimeline"
            :key="i"
            class="timeline-row"
            :class="{ 'timeline-row--active': row.isActive }"
            :style="timelineGridStyle"
          >
            <span class="timeline-label">
              {{ row.label }}
              <span v-if="row.isActive" class="timeline-now-badge">NOW</span>
            </span>
            <span
              v-for="outcome in outcomes"
              :key="outcome.key"
              :class="Number(row[outcome.key]) > 0 ? 'timeline-val--win' : 'timeline-val--zero'"
            >{{ row[outcome.key] }}%</span>
          </div>
        </div>
      </div>
    </section>

    <SlotModal
      v-if="activeSlotOutcome && slotModalOutcome"
      :open="true"
      :outcome="slotModalOutcome"
      :slots="localConfig[activeSlotOutcome].slots || []"
      @close="closeSlotModal"
      @save="onSlotModalSave"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { OUTCOME_THEME } from "@/themes";
import { DEFAULT_WIN_DISTRIBUTION, OUTCOME_LOGIC, OUTCOME_KEYS, normalizeWinDistribution, buildOutcomeWeights, findActiveSlotIndex, formatTime24h } from "@/utils";
import SlotModal from "@/components/SlotModal.vue";

const CATEGORY_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default {
  name: "DashboardWinConfig",
  components: { SlotModal },
  data() {
    return {
      localConfig: DEFAULT_WIN_DISTRIBUTION(),
      nextSlotId: 0,
      errors: {
        totalSectors: "",
        sectorCounts: "",
        timelineBudget: "",
        ...OUTCOME_KEYS.reduce((acc, key) => ({ ...acc, [key]: "" }), {})
      },
      editingValues: {},
      currentTime: formatTime24h(new Date()),
      expandedOutcome: null,
      activeSlotOutcome: null
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
    activeOutcomeKeys() {
      return OUTCOME_KEYS.filter((key) => (Number(this.localConfig?.[key]?.sectorCount) || 0) > 0);
    },
    outcomes() {
      return this.activeOutcomeKeys.map((key, index) => this.createOutcomeDescriptor(key, index));
    },
    fallbackKeys() {
      return this.outcomes.filter((outcome) => !outcome.hasSlots).map((outcome) => outcome.key);
    },
    slotKeys() {
      return this.outcomes.filter((outcome) => outcome.hasSlots).map((outcome) => outcome.key);
    },
    fallbackLabel() {
      return this.fallbackKeys.map((key) => OUTCOME_THEME[key]?.label || key).join(" & ");
    },
    amountOutcomeLabel() {
      const labels = this.outcomes
        .filter((outcome) => outcome.isAmountPerTime)
        .map((outcome) => outcome.label)
        .join(" & ");

      return labels || "No amount-per-time prizes";
    },
    percentageOutcomeLabel() {
      return this.fallbackLabel || "No probability outcomes";
    },
    fallbackCopy() {
      if (!this.fallbackKeys.length) {
        return "No active outcomes are currently using probability logic.";
      }

      return `Configure the probability split for ${this.percentageOutcomeLabel}. These percentages must total 100%. Amount-per-time prizes can interrupt this split only while an active time window still has available wins.`;
    },
    timelineGridStyle() {
      return {
        gridTemplateColumns: `minmax(0, 1.8fr) repeat(${this.outcomes.length}, minmax(0, 1fr))`
      };
    },
    fallbackSplitTotal() {
      return this.fallbackKeys.reduce(
        (sum, key) => sum + this.clampPercent(this.localConfig[key]?.baseWeight),
        0
      );
    },
    maxWinProbability() {
      const allSlotWeights = this.slotKeys.flatMap(
        (key) => this.isAmountPerTime(key) ? [] : (this.localConfig[key]?.slots || []).map((s) => Number(s.weight) || 0)
      );
      if (!allSlotWeights.length) return 0;
      const perKeyMax = this.slotKeys.map(
        (key) => this.isAmountPerTime(key) ? 0 : Math.max(0, ...(this.localConfig[key]?.slots || []).map((s) => Number(s.weight) || 0))
      );
      return Math.min(100, perKeyMax.reduce((sum, v) => sum + v, 0));
    },
    fallbackRemainingAtPeak() {
      return Math.max(0, 100 - this.maxWinProbability);
    },
    persistedConfigSnapshot() {
      return this.toPersistedConfig(this.localConfig);
    },
    activeSlotMap() {
      const cfg = this.persistedConfigSnapshot;
      return this.slotKeys.reduce((acc, key) => {
        acc[key] = findActiveSlotIndex(cfg[key]?.slots || [], this.currentTime);
        return acc;
      }, {});
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

      const slotRanges = this.slotKeys
        .flatMap((key) => (cfg[key]?.slots || []))
        .filter((s) => s.startTime && s.endTime && toMin(s.startTime) < toMin(s.endTime))
        .map((s) => ({ start: toMin(s.startTime), end: toMin(s.endTime) }));

      const buildRow = (sampleTime, label, isActive) => {
        const w = buildOutcomeWeights(cfg, sampleTime);
        const row = { label, isActive };
        this.activeOutcomeKeys.forEach((key) => {
          row[key] = ((w[key] || 0) * 100).toFixed(1);
        });
        return row;
      };

      if (!slotRanges.length) {
        return [buildRow(this.currentTime, "All day", true)];
      }

      const boundaries = [...new Set(slotRanges.flatMap((r) => [r.start, r.end]))].sort((a, b) => a - b);
      const intervals = [];

      if (boundaries[0] > 0) intervals.push({ start: 0, end: boundaries[0] });
      for (let i = 0; i < boundaries.length - 1; i++) {
        intervals.push({ start: boundaries[i], end: boundaries[i + 1] });
      }
      if (boundaries[boundaries.length - 1] < 23 * 60 + 59) {
        intervals.push({ start: boundaries[boundaries.length - 1], end: 23 * 60 + 59 });
      }

      const currentMin = toMin(this.currentTime);

      return intervals.map(({ start, end }) => {
        const sampleTime = toLabel(Math.floor((start + end) / 2));
        return buildRow(sampleTime, `${toLabel(start)} – ${toLabel(end)}`, currentMin >= start && currentMin < end);
      });
    },
    effectiveFallbackRanges() {
      const ranges = {};
      this.fallbackKeys.forEach((key) => {
        const ratio = this.clampPercent(this.localConfig[key]?.baseWeight);
        const max = ratio;
        const min = (ratio / 100) * this.fallbackRemainingAtPeak;
        ranges[key] = { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
      });
      return ranges;
    },
    effectiveRepeatRange() {
      return this.effectiveFallbackRanges.repeat || { min: 0, max: 0 };
    },
    effectiveNoWinRange() {
      return this.effectiveFallbackRanges.noWin || { min: 0, max: 0 };
    },
    slotModalOutcome() {
      if (!this.activeSlotOutcome) return null;
      const idx = this.activeOutcomeKeys.indexOf(this.activeSlotOutcome);
      return idx >= 0 ? this.createOutcomeDescriptor(this.activeSlotOutcome, idx) : null;
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
    createOutcomeDescriptor(key, index) {
      const label = OUTCOME_THEME[key]?.label || key;
      const isAmountPerTime = this.isAmountPerTime(key);
      return {
        key,
        eyebrow: `Category ${CATEGORY_LETTERS[index]}`,
        label,
        description: isAmountPerTime
          ? `${label} sectors with time windows and delivery amounts.`
          : `${label} sectors with configurable probability percentage.`,
        color: OUTCOME_THEME[key]?.color || "#888",
        hasDailyLimit: OUTCOME_LOGIC[key].hasDailyLimit,
        hasSlots: OUTCOME_LOGIC[key].hasSlots,
        isAmountPerTime
      };
    },
    isAmountPerTime(outcomeKey) {
      return OUTCOME_LOGIC[outcomeKey]?.selectionMode === "amountPerTime";
    },
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
      const config = { totalSectors: normalized.totalSectors, lastResetDate: normalized.lastResetDate };

      OUTCOME_KEYS.forEach((key) => {
        const meta = OUTCOME_LOGIC[key];
        const src = normalized[key] || {};
        config[key] = {
          ...src,
          baseWeight: this.clampPercent((Number(src.baseWeight) || 0) * 100)
        };
        if (meta.hasSlots) {
          config[key].slots = (src.slots || []).map((slot) => this.createEditorSlot(slot));
        }
      });

      return config;
    },
    toPersistedConfig(value) {
      const source = value && typeof value === "object" ? value : DEFAULT_WIN_DISTRIBUTION();
      const payload = { totalSectors: source.totalSectors, lastResetDate: source.lastResetDate || "" };

      OUTCOME_KEYS.forEach((key) => {
        const meta = OUTCOME_LOGIC[key];
        const src = source[key] || {};
        payload[key] = {
          ...src,
          baseWeight: this.clampPercent(src.baseWeight) / 100
        };
        if (meta.hasSlots) {
          payload[key].slots = (src.slots || []).map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            limit: Math.max(0, Number(slot.limit) || 0),
            given: Math.max(0, Number(slot.given) || 0),
            weight: this.clampPercent(slot.weight) / 100
          }));
        }
      });

      return normalizeWinDistribution(payload);
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
    toggleOutcome(key) {
      this.expandedOutcome = this.expandedOutcome === key ? null : key;
    },
    openSlotModal(outcomeKey) {
      this.activeSlotOutcome = outcomeKey;
    },
    closeSlotModal() {
      this.activeSlotOutcome = null;
    },
    onSlotModalSave(slots) {
      const key = this.activeSlotOutcome;
      if (!key) return;

      const currentOutcome = this.localConfig[key];
      const oldSlotGivenTotal = (currentOutcome.slots || []).reduce((sum, s) => sum + (Number(s.given) || 0), 0);
      const newSlotGivenTotal = slots.reduce((sum, s) => sum + (Number(s.given) || 0), 0);
      const givenDiff = newSlotGivenTotal - oldSlotGivenTotal;

      this.replaceOutcomeConfig(key, {
        givenToday: Math.max(0, (Number(currentOutcome.givenToday) || 0) + givenDiff),
        slots
      });

      this.activeSlotOutcome = null;

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
      const assigned = this.activeOutcomeKeys.reduce((sum, key) => sum + (Number(this.localConfig[key].sectorCount) || 0), 0);

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

      if (!outcome || !this.activeOutcomeKeys.includes(outcomeKey)) {
        this.errors[outcomeKey] = "";
        return true;
      }

      if (Number(outcome.baseWeight) < 0 || Number(outcome.baseWeight) > 100) {
        this.errors[outcomeKey] = `${OUTCOME_LOGIC[outcomeKey].hasSlots ? "Slot" : "Global"} probability must stay between 0% and 100%.`;
        return false;
      }

      if (OUTCOME_LOGIC[outcomeKey].hasDailyLimit && Number(outcome.dailyLimit) < 0) {
        this.errors[outcomeKey] = "Daily limit cannot be negative.";
        return false;
      }

      if (OUTCOME_LOGIC[outcomeKey].hasDailyLimit && Number(outcome.givenToday) > Number(outcome.dailyLimit)) {
        this.errors[outcomeKey] = "Given today cannot be greater than the daily limit.";
        return false;
      }

      if (OUTCOME_LOGIC[outcomeKey].hasSlots) {
        const invalidSlot = outcome.slots.find((slot) => {
          const start = this.timeToMinutes(slot.startTime);
          const end = this.timeToMinutes(slot.endTime);
          return !slot.startTime || !slot.endTime || start >= end || (!this.isAmountPerTime(outcomeKey) && Number(slot.weight) > 100);
        });

        if (invalidSlot) {
          this.errors[outcomeKey] = this.isAmountPerTime(outcomeKey)
            ? "Each time range needs a valid start/end."
            : "Each time range needs a valid start/end and probability between 0% and 100%.";
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
      const percentageSlotKeys = this.slotKeys.filter((key) => !this.isAmountPerTime(key));
      const ranges = percentageSlotKeys.flatMap((key) =>
        (this.localConfig[key]?.slots || []).map((slot) => ({
          start: this.timeToMinutes(slot.startTime),
          end: this.timeToMinutes(slot.endTime),
          weight: Number(slot.weight) || 0,
          key
        }))
      );

      if (Math.abs(this.fallbackSplitTotal - 100) > 0.01) {
        const fallbackLabel = this.fallbackKeys.map((k) => OUTCOME_THEME[k]?.label || k).join(" + ");
        return `${fallbackLabel} must total exactly 100% (current: ${this.fallbackSplitTotal.toFixed(2)}%).`;
      }

      if (!ranges.length) {
        return "";
      }

      const boundaries = [...new Set(ranges.flatMap((range) => [range.start, range.end]))].sort((a, b) => a - b);

      for (let index = 0; index < boundaries.length - 1; index += 1) {
        const sample = boundaries[index] + ((boundaries[index + 1] - boundaries[index]) / 2);
        const total = percentageSlotKeys.reduce((sum, key) => sum + this.findSlotWeightAt(key, sample), 0);

        if (total > 100.001) {
          return `Slot probabilities exceed 100% combined (${total.toFixed(2)}%) in the same time range. Reduce one of them.`;
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
      const outcomesOk = this.activeOutcomeKeys.every((key) => this.validateOutcome(key));
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
    getGivenPercent(outcomeKey) {
      const given = Number(this.localConfig[outcomeKey]?.givenToday) || 0;
      const limit = Number(this.localConfig[outcomeKey]?.dailyLimit) || 1;
      return Math.min(100, (given / limit) * 100);
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
  color: var(--color-primary);
}

.block-title {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-text);
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
  color: rgba(var(--rgb-muted), 0.6);
}

.number-input,
.slot-input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(var(--rgb-border), 0.18);
  border-radius: 0.75rem;
  background: rgba(var(--rgb-panel), 0.94);
  padding: 0.7rem 0.8rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  outline: none;
}

.total-field {
  min-width: 8rem;
}

.total-field--error .number-input {
  border-color: var(--color-accent-dark);
}

.config-error {
  margin: 0;
  color: var(--color-accent-dark);
  font-size: 0.78rem;
  font-weight: 600;
}

.logic-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.logic-summary__item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.9rem 1rem;
  border-radius: 0.95rem;
  border: 1px solid rgba(var(--rgb-border), 0.14);
  background: rgba(var(--rgb-card), 0.86);
}

.logic-summary__item--amount {
  border-color: rgba(var(--rgb-gold-line), 0.24);
}

.logic-summary__item--probability {
  border-color: rgba(var(--rgb-primary), 0.18);
}

.logic-summary__label {
  color: rgba(var(--rgb-muted), 0.62);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.logic-summary__item strong {
  color: var(--color-primary);
  font-size: 0.96rem;
  line-height: 1.25;
}

.logic-summary__item p {
  margin: 0;
  color: rgba(var(--rgb-text), 0.64);
  font-size: 0.8rem;
  line-height: 1.45;
}

.field-group--readonly {
  justify-content: flex-end;
}

.field-readonly {
  display: block;
  padding: 0.7rem 0.8rem;
  border-radius: 0.75rem;
  background: rgba(var(--rgb-card), 0.92);
  color: var(--color-primary);
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

.field-group--given {
  justify-content: flex-end;
}

.given-today {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.65rem 0.8rem;
  border-radius: 0.75rem;
  background: rgba(var(--rgb-card), 0.92);
}

.given-today__count {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.given-today__limit {
  font-size: 0.8em;
  font-weight: 400;
  color: rgba(var(--rgb-text), 0.45);
}

.given-bar {
  height: 4px;
  border-radius: 999px;
  background: rgba(var(--rgb-primary), 0.12);
  overflow: hidden;
}

.given-bar__fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-primary);
  transition: width 0.35s ease;
}

.given-bar__fill--full {
  background: var(--color-accent-dark);
}

.fallback-split {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: rgba(var(--rgb-card), 0.92);
  border: 1px solid rgba(var(--rgb-gold-line), 0.24);
}

.fallback-split--error {
  border-color: rgba(var(--rgb-danger), 0.32);
  background: rgba(var(--rgb-card), 0.96);
}

.fallback-split__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.fallback-split__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.fallback-split__total-label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
  font-size: 0.58rem;
  color: rgba(var(--rgb-muted), 0.6);
}

.fallback-split__total-value--ok {
  color: var(--color-primary);
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}

.fallback-split__total-value--error {
  color: var(--color-accent-dark);
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}

.fallback-split__copy {
  margin: 0;
  color: rgba(var(--rgb-text), 0.7);
  font-size: 0.82rem;
  line-height: 1.45;
}

.timeline-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(var(--rgb-border), 0.12);
}

.timeline-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.probability-summary__sub {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(var(--rgb-text), 0.55);
}

.probability-summary__copy {
  margin: 0;
  color: rgba(var(--rgb-text), 0.66);
  font-size: 0.82rem;
  line-height: 1.45;
}

/* Probability timeline table */
.probability-timeline {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(var(--rgb-border), 0.16);
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
  background: rgba(var(--rgb-primary), 0.07);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 800;
  font-size: 0.58rem;
  color: rgba(var(--rgb-muted), 0.65);
}

.timeline-row {
  background: rgba(var(--rgb-panel), 0.72);
  border-top: 1px solid rgba(var(--rgb-border), 0.1);
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.timeline-row--active {
  background: rgba(var(--rgb-primary), 0.06);
  border-left: 3px solid var(--color-primary);
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
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  vertical-align: middle;
}

.timeline-val--win {
  color: var(--color-primary);
  font-weight: 700;
}

.timeline-val--zero {
  color: rgba(var(--rgb-text), 0.35);
}

/* Slot active badge */
.slot-active-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(var(--rgb-primary), 0.12);
  color: var(--color-primary);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Effective probability range */
.effective-range {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: rgba(var(--rgb-text), 0.58);
  font-variant-numeric: tabular-nums;
}

.empty-slots {
  padding: 0.85rem 0.95rem;
  border-radius: 0.85rem;
  background: rgba(var(--rgb-card), 0.8);
  border: 1px dashed rgba(var(--rgb-border), 0.2);
  color: rgba(var(--rgb-text), 0.58);
  font-size: 0.82rem;
}

/* ── Accordion win-row-list ── */
.win-row-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.win-row {
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(var(--rgb-border), 0.16);
  background: linear-gradient(180deg, rgba(var(--rgb-panel), 0.82) 0%, rgba(var(--rgb-panel-soft), 0.94) 100%);
}

.win-row--expanded {
  border-color: rgba(var(--rgb-gold-line), 0.3);
}

.win-row__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  background: transparent;
  border: 0;
  border-left: 3px solid transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 1rem;
  transition: background 0.15s ease;
}

.win-row__head:hover {
  background: rgba(var(--rgb-card), 0.5);
}

.win-row--expanded .win-row__head {
  background: rgba(var(--rgb-card), 0.6);
  border-bottom: 1px solid rgba(var(--rgb-border), 0.12);
}

.win-row__swatch {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.win-row__label {
  flex: 1;
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.96rem;
  min-width: 0;
}

.win-row__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
}

.win-row__badge {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  background: rgba(var(--rgb-primary), 0.08);
  color: rgba(var(--rgb-primary), 0.85);
  border: 1px solid rgba(var(--rgb-primary), 0.12);
}

.win-row__badge--type {
  background: rgba(var(--rgb-gold-line), 0.12);
  color: rgba(var(--rgb-text-strong), 0.72);
  border-color: rgba(var(--rgb-gold-line), 0.2);
}

.win-row__chevron {
  font-size: 0.7rem;
  color: rgba(var(--rgb-text-strong), 0.5);
  flex-shrink: 0;
  margin-left: 0.25rem;
}

.win-row__body {
  padding: 1rem 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.win-row__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

/* ── Slots summary inside accordion ── */
.win-row__slots {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(var(--rgb-border), 0.12);
}

.win-row__slots-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.win-row__slots-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
  font-size: 0.64rem;
  color: var(--color-primary);
}

.edit-slots-btn {
  padding: 0.45rem 0.75rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(var(--rgb-primary), 0.18);
  background: rgba(var(--rgb-card), 0.92);
  color: var(--color-primary);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.win-row__slot-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.win-row__slot-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.8rem;
  border-radius: 0.65rem;
  background: rgba(var(--rgb-panel), 0.8);
  border: 1px solid rgba(var(--rgb-border), 0.12);
  font-size: 0.88rem;
}

.win-row__slot-item--active {
  border-color: rgba(var(--rgb-primary), 0.28);
  background: rgba(var(--rgb-primary), 0.04);
}

.win-row__slot-time {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  min-width: 9rem;
}

.win-row__slot-progress {
  color: rgba(var(--rgb-text-strong), 0.65);
  font-variant-numeric: tabular-nums;
  font-size: 0.84rem;
}

.win-row__slot-sep {
  color: rgba(var(--rgb-text-strong), 0.35);
  margin: 0 0.1rem;
}

@media (max-width: 760px) {
  .logic-summary {
    grid-template-columns: 1fr;
  }

  .win-row__fields {
    grid-template-columns: 1fr;
  }

  .win-row__badges {
    display: none;
  }
}
</style>
