<template>
  <div class="schedule-editor">
    <div class="section-heading">
      <span class="section-heading__deco" aria-hidden="true"></span>
      <h3 class="section-heading__text">{{ title }}</h3>
      <span class="section-heading__deco" aria-hidden="true"></span>
    </div>

    <div v-if="!items.length" class="empty-state">
      <span class="empty-state__icon" aria-hidden="true">◇</span>
      <p>Sin entradas configuradas</p>
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
            <label :for="`${type}-start-${index}`" class="time-label">Inicio</label>
            <input
              :id="`${type}-start-${index}`"
              type="time"
              class="time-input"
              :value="item.rangeDown"
              @change="updateItem(index, 'rangeDown', $event.target.value)"
            />
          </div>

          <span class="time-sep" aria-hidden="true">—</span>

          <div class="time-field">
            <label :for="`${type}-end-${index}`" class="time-label">Fin</label>
            <input
              :id="`${type}-end-${index}`"
              type="time"
              class="time-input"
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
          <span class="given-toggle__label">Entregado</span>
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
      validator: (v) => ["card", "top"].includes(v)
    }
  },
  computed: {
    ...mapGetters(["giftCards", "topPrices"]),
    items() {
      return this.type === "card" ? this.giftCards : this.topPrices;
    }
  },
  methods: {
    updateItem(index, field, value) {
      const updated = this.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : { ...item }
      );
      const mutation = this.type === "card" ? "setGiftCards" : "setTopPrices";
      this.$store.commit(mutation, updated);
    }
  }
};
</script>

<style scoped>
.schedule-editor {
  width: 100%;
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
  gap: 0;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(205, 174, 104, 0.18);
  transition: background 0.2s;
}

.schedule-row:first-child {
  border-top: 1px solid rgba(205, 174, 104, 0.18);
}

.schedule-row--given {
  opacity: 0.55;
}

.row-index {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(205, 174, 104, 0.7);
  min-width: 1.6rem;
  flex-shrink: 0;
}

.row-fields {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.time-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.45);
}

.time-input {
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(205, 174, 104, 0.3);
  padding: 0.25rem 0;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1d2b22;
  outline: none;
  width: 6.8rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.time-input:focus {
  border-bottom-color: #cdae68;
}

.time-sep {
  color: rgba(205, 174, 104, 0.5);
  font-size: 0.85rem;
  margin-top: 1rem;
  flex-shrink: 0;
}

/* Toggle switch */
.given-toggle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  flex-shrink: 0;
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
  background: rgba(205, 174, 104, 0.2);
  border: 1.5px solid rgba(205, 174, 104, 0.4);
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
  background: rgba(205, 174, 104, 0.5);
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
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(29, 43, 34, 0.5);
  transition: color 0.2s;
}

.schedule-row:has(.given-toggle__input:checked) .given-toggle__label {
  color: #1f5a3f;
}

@media (max-width: 600px) {
  .schedule-row {
    flex-wrap: wrap;
    gap: 0.7rem;
  }

  .row-fields {
    flex: 1 1 auto;
  }
}
</style>
