<template>
  <div class="schedule-editor">
    <div class="section-heading">
      <span class="section-heading__deco" aria-hidden="true"></span>
      <h3 class="section-heading__text">{{ title }}</h3>
      <span class="section-heading__deco" aria-hidden="true"></span>
    </div>

    <div v-if="!items.length" class="empty-state">
      <span class="empty-state__icon" aria-hidden="true">◇</span>
      <p>No scheduled entries</p>
    </div>

    <div v-else class="schedule-rows">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="schedule-row"
        :class="{ 'schedule-row--given': item.given }"
      >
        <span class="row-index" aria-hidden="true">{{ String(index + 1).padStart(2, "0") }}</span>

        <div class="row-fields">
          <div class="time-field">
            <label :for="`${type}-start-${index}`" class="time-label">Start</label>
            <input
              :id="`${type}-start-${index}`"
              :name="`${type}-start-${index}`"
              type="time"
              class="time-input"
              autocomplete="off"
              :value="item.rangeDown"
              @change="updateItem(index, 'rangeDown', $event.target.value)"
            />
          </div>

          <span class="time-sep" aria-hidden="true">—</span>

          <div class="time-field">
            <label :for="`${type}-end-${index}`" class="time-label">End</label>
            <input
              :id="`${type}-end-${index}`"
              :name="`${type}-end-${index}`"
              type="time"
              class="time-input"
              autocomplete="off"
              :value="item.rangeTop"
              @change="updateItem(index, 'rangeTop', $event.target.value)"
            />
          </div>
        </div>

        <label class="given-toggle" :for="`${type}-given-${index}`">
          <input
            :id="`${type}-given-${index}`"
            type="checkbox"
            class="given-toggle__input"
            :checked="item.given"
            @change="updateItem(index, 'given', $event.target.checked)"
          />
          <span class="given-toggle__track" aria-hidden="true">
            <span class="given-toggle__thumb"></span>
          </span>
          <span class="given-toggle__label">Delivered</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "DashboardScheduleEditor",
  props: {
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: (v) => ["card", "top", "tesla"].includes(v)
    }
  },
  computed: {
    ...mapGetters(["giftCards", "topPrices", "teslaPrices"]),
    items() {
      if (this.type === "card") return this.giftCards;
      if (this.type === "top") return this.topPrices;
      return this.teslaPrices;
    }
  },
  methods: {
    updateItem(index, field, value) {
      const updated = this.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : { ...item }
      );
      const mutationMap = {
        card: "setGiftCards",
        top: "setTopPrices",
        tesla: "setTeslaPrices"
      };
      const mutation = mutationMap[this.type];
      this.$store.commit(mutation, updated);
    }
  }
};
</script>

<style scoped>
.schedule-editor {
  width: 100%;
  min-width: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.2rem;
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

.empty-state {
  text-align: center;
  padding: 1.4rem;
  color: rgba(29, 43, 34, 0.4);
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.empty-state__icon {
  font-size: 1.4rem;
  color: rgba(205, 174, 104, 0.5);
}

.schedule-rows {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.schedule-row {
  display: grid;
  grid-template-columns: 2.35rem minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 1rem;
  row-gap: 0.75rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(123, 153, 132, 0.16);
  border-radius: 0.95rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(244, 249, 246, 0.96) 100%);
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.schedule-row--given {
  background: linear-gradient(180deg, rgba(246, 251, 247, 0.96) 0%, rgba(236, 246, 239, 0.98) 100%);
  border-color: rgba(64, 117, 83, 0.18);
}

.row-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #6f7f71;
  background: rgba(122, 151, 131, 0.12);
  flex-shrink: 0;
}

.row-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  min-width: 0;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.time-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(49, 88, 70, 0.56);
}

.time-input {
  width: 100%;
  min-width: 0;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(123, 153, 132, 0.2);
  border-radius: 0.7rem;
  padding: 0.64rem 0.78rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1d2b22;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.time-input:focus {
  border-color: #7a9783;
  box-shadow: 0 0 0 3px rgba(122, 151, 131, 0.16);
}

.time-sep {
  color: rgba(122, 151, 131, 0.45);
  font-size: 0.82rem;
  margin-top: 1.2rem;
  flex-shrink: 0;
}

/* Toggle switch */
.given-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 8.5rem;
}

.given-toggle__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.given-toggle__track {
  position: relative;
  width: 2.2rem;
  height: 1.15rem;
  border-radius: 999px;
  background: rgba(122, 151, 131, 0.18);
  border: 1.5px solid rgba(122, 151, 131, 0.32);
  transition: background 0.22s, border-color 0.22s;
  flex-shrink: 0;
}

.given-toggle__thumb {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: rgba(122, 151, 131, 0.52);
  transition: transform 0.22s ease, background 0.22s;
}

.given-toggle__input:checked ~ .given-toggle__track {
  background: #1f5a3f;
  border-color: #1f5a3f;
}

.given-toggle__input:checked ~ .given-toggle__track .given-toggle__thumb {
  transform: translateY(-50%) translateX(1.05rem);
  background: #cdae68;
}

.given-toggle__label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(49, 88, 70, 0.74);
  transition: color 0.2s;
  white-space: nowrap;
}

.given-toggle__input:checked ~ .given-toggle__label {
  color: #1f5a3f;
}

@media (max-width: 860px) {
  .schedule-row {
    grid-template-columns: 2.35rem minmax(0, 1fr);
    gap: 0.7rem;
  }

  .given-toggle {
    grid-column: 2;
    justify-content: flex-start;
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .row-fields {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .time-field {
    width: 100%;
  }

  .time-sep {
    display: none;
  }
}
</style>
