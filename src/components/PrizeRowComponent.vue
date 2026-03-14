<template>
  <div class="prize-card" :class="{ 'prize-card--given': given, 'prize-card--expanded': isExpanded }">
    <div class="prize-card__main" @click="isExpanded = !isExpanded">

      <span class="prize-card__pos">#{{ position }}</span>

      <div class="prize-card__times">
        <span class="prize-card__time-badge">
          {{ prizeProperties.rangeDown || '--:--' }}
        </span>
        <span class="prize-card__arrow">→</span>
        <span class="prize-card__time-badge">
          {{ prizeProperties.rangeTop || '--:--' }}
        </span>
      </div>

      <div class="prize-card__toggle" @click.stop="given = !given">
        <span class="prize-card__toggle-track" :class="{ 'prize-card__toggle-track--on': given }">
          <span class="prize-card__toggle-thumb"></span>
        </span>
        <span class="prize-card__toggle-label">{{ given ? 'Entregado' : 'Pendiente' }}</span>
      </div>

      <span class="prize-card__chevron" :class="{ 'prize-card__chevron--open': isExpanded }">›</span>
    </div>

    <div class="prize-card__editor" v-show="isExpanded">
      <div class="prize-card__editor-inner">
        <div class="prize-field">
          <label class="prize-field__label">Inicio</label>
          <input class="prize-field__input" type="time" v-model="rangeDown" @click.stop />
        </div>
        <div class="prize-field">
          <label class="prize-field__label">Fin</label>
          <input class="prize-field__input" type="time" v-model="rangeTop" @click.stop />
        </div>
        <div class="prize-field prize-field--status">
          <label class="prize-field__label">Estado</label>
          <span class="prize-field__status" :class="given ? 'prize-field__status--given' : 'prize-field__status--pending'">
            {{ given ? '✓ Entregado' : '○ Pendiente' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "PrizeRowComponent",
  props: {
    prizeProperties: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    },
    position: {
      type: Number,
      default: 1
    },
    collection: {
      type: String,
      default: "giftCards"
    }
  },
  data() {
    return {
      isExpanded: false
    };
  },
  computed: {
    ...mapGetters(["giftCards", "topPrices"]),
    items() {
      return this.collection === "topPrices" ? this.topPrices : this.giftCards;
    },
    mutation() {
      return this.collection === "topPrices" ? "setTopPrices" : "setGiftCards";
    },
    rangeDown: {
      get() { return this.prizeProperties.rangeDown; },
      set(value) {
        const updated = this.items.map((item, i) =>
          i === this.index ? { ...item, rangeDown: value } : item
        );
        this[this.mutation](updated);
      }
    },
    rangeTop: {
      get() { return this.prizeProperties.rangeTop; },
      set(value) {
        const updated = this.items.map((item, i) =>
          i === this.index ? { ...item, rangeTop: value } : item
        );
        this[this.mutation](updated);
      }
    },
    given: {
      get() { return Boolean(this.prizeProperties.given); },
      set(value) {
        const updated = this.items.map((item, i) =>
          i === this.index ? { ...item, given: Boolean(value) } : item
        );
        this[this.mutation](updated);
      }
    }
  },
  methods: {
    ...mapMutations(["setGiftCards", "setTopPrices"])
  }
};
</script>

<style scoped>
.prize-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(28,36,40,0.08);
  box-shadow: 0 1px 4px rgba(28,36,40,0.04);
  transition: border-color 200ms, box-shadow 200ms;
}

.prize-card:hover {
  border-color: rgba(28,36,40,0.16);
  box-shadow: 0 2px 12px rgba(28,36,40,0.07);
}

.prize-card--given {
  border-color: rgba(34,197,94,0.25);
  background: rgba(34,197,94,0.02);
}

.prize-card__main {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
}

.prize-card__pos {
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  font-weight: 500;
  color: rgba(28,36,40,0.3);
  min-width: 28px;
  flex-shrink: 0;
}

.prize-card__times {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.prize-card__time-badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(28,36,40,0.06);
  color: #1c2428;
  padding: 0.3rem 0.7rem;
  border-radius: 7px;
  letter-spacing: 0.03em;
}

.prize-card__arrow {
  color: rgba(28,36,40,0.3);
  font-size: 0.85rem;
}

/* Toggle switch */
.prize-card__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0;
  flex-shrink: 0;
}

.prize-card__toggle-track {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: rgba(28,36,40,0.15);
  transition: background 200ms;
  flex-shrink: 0;
}

.prize-card__toggle-track--on {
  background: #22c55e;
}

.prize-card__toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform 200ms;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.prize-card__toggle-track--on .prize-card__toggle-thumb {
  transform: translateX(16px);
}

.prize-card__toggle-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(28,36,40,0.5);
  min-width: 72px;
}

.prize-card--given .prize-card__toggle-label {
  color: #15803d;
}

/* Chevron */
.prize-card__chevron {
  font-size: 1.2rem;
  color: rgba(28,36,40,0.3);
  transition: transform 200ms;
  flex-shrink: 0;
  line-height: 1;
}

.prize-card__chevron--open {
  transform: rotate(90deg);
}

/* Editor panel */
.prize-card__editor {
  border-top: 1px solid rgba(28,36,40,0.06);
  overflow: hidden;
}

.prize-card__editor-inner {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
  background: rgba(28,36,40,0.02);
}

.prize-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prize-field__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(28,36,40,0.4);
}

.prize-field__input {
  font-family: 'DM Mono', monospace;
  font-size: 0.9rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(28,36,40,0.15);
  border-radius: 8px;
  color: #1c2428;
  background: #fff;
  transition: border-color 150ms;
  outline: none;
}

.prize-field__input:focus {
  border-color: #ff501c;
}

.prize-field--status {
  justify-content: flex-end;
}

.prize-field__status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
}

.prize-field__status--given {
  background: rgba(34,197,94,0.1);
  color: #15803d;
}

.prize-field__status--pending {
  background: rgba(28,36,40,0.06);
  color: rgba(28,36,40,0.5);
}
</style>