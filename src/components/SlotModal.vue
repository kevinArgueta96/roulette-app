<template>
  <transition name="modal-fade">
    <div v-if="open" class="slot-modal__overlay" @click.self="$emit('close')">
      <div class="slot-modal__card" role="dialog" aria-modal="true">
        <header class="slot-modal__head">
          <div class="slot-modal__title">
            <span class="slot-modal__swatch" :style="{ background: outcome.color }"></span>
            <h3>{{ outcome.label }} — Time windows</h3>
          </div>
          <button class="slot-modal__close" type="button" @click="$emit('close')" aria-label="Close">×</button>
        </header>

        <div class="slot-modal__body">
          <p class="slot-modal__help">
            <template v-if="outcome.isAmountPerTime">Configure when this prize is available and how many wins can be delivered per window.</template>
            <template v-else>Configure the probability percentage during each time window.</template>
          </p>

          <div v-if="!localSlots.length" class="slot-modal__empty">
            No time windows configured. Add one below.
          </div>

          <div
            v-for="(slot, idx) in localSlots"
            :key="slot._editorId"
            class="slot-modal__row"
          >
            <div class="slot-modal__fields">
              <label class="slot-modal__field">
                <span class="slot-modal__field-label">Start</span>
                <input type="time" class="slot-modal__input" v-model="slot.startTime" />
              </label>
              <label class="slot-modal__field">
                <span class="slot-modal__field-label">End</span>
                <input type="time" class="slot-modal__input" v-model="slot.endTime" />
              </label>
              <label v-if="outcome.isAmountPerTime" class="slot-modal__field">
                <span class="slot-modal__field-label">Limit</span>
                <input type="number" class="slot-modal__input" min="0" v-model.number="slot.limit" />
              </label>
              <label v-else class="slot-modal__field">
                <span class="slot-modal__field-label">Probability (%)</span>
                <input type="number" class="slot-modal__input" min="0" max="100" step="0.01" v-model.number="slot.weight" />
              </label>
              <div class="slot-modal__given-field">
                <span class="slot-modal__field-label">Given</span>
                <span class="slot-modal__given-value">{{ slot.given }}</span>
              </div>
            </div>
            <div class="slot-modal__row-actions">
              <button
                v-if="Number(slot.given) > 0"
                type="button"
                class="slot-modal__reset-btn"
                @click="resetGiven(idx)"
              >Reset given</button>
              <button
                type="button"
                class="slot-modal__remove-btn"
                @click="removeSlot(idx)"
                aria-label="Remove window"
              >×</button>
            </div>
          </div>

          <button type="button" class="slot-modal__add-btn" @click="addSlot">+ Add window</button>
        </div>

        <footer class="slot-modal__foot">
          <button type="button" class="slot-modal__cancel-btn" @click="$emit('close')">Cancel</button>
          <button type="button" class="slot-modal__save-btn" @click="save">Save windows</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "SlotModal",
  props: {
    open: { type: Boolean, default: false },
    outcome: { type: Object, required: true },
    slots: { type: Array, default: () => [] }
  },
  data() {
    return { localSlots: [] };
  },
  mounted() {
    this.localSlots = this.slots.map((s) => ({ ...s }));
  },
  watch: {
    open(val) {
      if (val) {
        this.localSlots = this.slots.map((s) => ({ ...s }));
      }
    }
  },
  methods: {
    resetGiven(i) {
      this.$set(this.localSlots, i, { ...this.localSlots[i], given: 0 });
    },
    removeSlot(i) {
      this.localSlots.splice(i, 1);
    },
    addSlot() {
      const last = this.localSlots[this.localSlots.length - 1];
      this.localSlots.push({
        _editorId: `slot-modal-${Date.now()}`,
        startTime: last?.endTime || "09:00",
        endTime: "12:00",
        limit: 1,
        given: 0,
        weight: last?.weight ?? 10
      });
    },
    save() {
      this.$emit("save", this.localSlots.map((s) => ({ ...s })));
    }
  }
};
</script>

<style scoped>
.slot-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(var(--rgb-black), 0.52);
  backdrop-filter: blur(6px);
}

.slot-modal__card {
  width: min(100%, 600px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  background: rgba(var(--rgb-card-alt), 0.98);
  border: 1px solid rgba(var(--rgb-gold-line), 0.24);
  box-shadow: 0 22px 42px rgba(var(--rgb-shadow), 0.2);
  overflow: hidden;
}

.slot-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.35rem;
  border-bottom: 1px solid rgba(var(--rgb-gold-line), 0.18);
}

.slot-modal__title {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.slot-modal__swatch {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.slot-modal__head h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-text-strong);
  font-weight: 700;
}

.slot-modal__close {
  border: 0;
  background: transparent;
  font-size: 1.45rem;
  color: rgba(var(--rgb-text-strong), 0.5);
  cursor: pointer;
  line-height: 1;
  padding: 0.15rem 0.4rem;
  border-radius: 0.5rem;
}

.slot-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.slot-modal__help {
  margin: 0;
  color: rgba(var(--rgb-text-strong), 0.65);
  font-size: 0.84rem;
  line-height: 1.45;
}

.slot-modal__empty {
  padding: 0.85rem 0.95rem;
  border-radius: 0.85rem;
  background: rgba(var(--rgb-card), 0.8);
  border: 1px dashed rgba(var(--rgb-border), 0.2);
  color: rgba(var(--rgb-text), 0.58);
  font-size: 0.82rem;
}

.slot-modal__row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.9rem;
  border-radius: 0.95rem;
  background: rgba(var(--rgb-panel), 0.92);
  border: 1px solid rgba(var(--rgb-border), 0.14);
}

.slot-modal__fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 0.65rem;
}

.slot-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.slot-modal__field-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 800;
  font-size: 0.56rem;
  color: rgba(var(--rgb-muted), 0.6);
}

.slot-modal__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(var(--rgb-border), 0.18);
  border-radius: 0.65rem;
  background: rgba(var(--rgb-card), 0.9);
  padding: 0.55rem 0.65rem;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  outline: none;
}

.slot-modal__given-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.slot-modal__given-value {
  display: block;
  padding: 0.55rem 0.65rem;
  border-radius: 0.65rem;
  background: rgba(var(--rgb-card), 0.7);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.slot-modal__row-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
}

.slot-modal__reset-btn {
  border: 1px solid rgba(var(--rgb-primary), 0.2);
  border-radius: 0.65rem;
  background: rgba(var(--rgb-primary), 0.06);
  color: var(--color-primary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  white-space: nowrap;
}

.slot-modal__remove-btn {
  border: 1px solid rgba(var(--rgb-danger), 0.16);
  border-radius: 0.65rem;
  background: rgba(var(--rgb-danger), 0.06);
  color: var(--color-accent-dark);
  font-size: 1.15rem;
  font-weight: 700;
  width: 2.1rem;
  height: 2.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.slot-modal__add-btn {
  align-self: flex-start;
  border: 1px dashed rgba(var(--rgb-border), 0.35);
  background: rgba(var(--rgb-panel), 0.92);
  color: var(--color-primary);
  border-radius: 0.7rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.slot-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.35rem;
  border-top: 1px solid rgba(var(--rgb-gold-line), 0.18);
}

.slot-modal__cancel-btn {
  border-radius: 0.8rem;
  padding: 0.72rem 1.1rem;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  border: 1px solid rgba(var(--rgb-primary), 0.16);
  background: rgba(var(--rgb-card), 0.9);
  color: var(--color-primary);
  cursor: pointer;
}

.slot-modal__save-btn {
  border-radius: 0.8rem;
  padding: 0.72rem 1.1rem;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  border: 1px solid transparent;
  background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  color: var(--color-button-fg-soft);
  box-shadow: 0 10px 18px rgba(var(--rgb-danger), 0.2);
  cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .slot-modal__row {
    flex-direction: column;
    align-items: stretch;
  }

  .slot-modal__row-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
