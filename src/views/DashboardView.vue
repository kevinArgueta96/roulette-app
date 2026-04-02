<template>
  <div class="dashboard-view">

    <!-- Hero + stats -->
    <div class="dash-hero">
      <div class="dash-hero__inner">
        <p class="dash-hero__eyebrow">Overview</p>
        <h2 class="dash-hero__title">Dashboard</h2>
        <p class="dash-hero__copy">Estado actual de la ruleta y configuración de premios.</p>
      </div>
      <div class="dash-hero__deco" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="40,4 76,20 76,60 40,76 4,60 4,20" stroke="#cdae68" stroke-width="1.5" fill="none" opacity="0.4"/>
          <polygon points="40,14 66,26 66,54 40,66 14,54 14,26" stroke="#cdae68" stroke-width="0.8" fill="none" opacity="0.25"/>
          <circle cx="40" cy="40" r="5" stroke="#cdae68" stroke-width="1" fill="none" opacity="0.5"/>
        </svg>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <p class="stat-card__eyebrow">Spins</p>
        <strong class="stat-card__value">{{ totalSpin }}</strong>
      </article>
      <article class="stat-card">
        <p class="stat-card__eyebrow">Replay</p>
        <strong class="stat-card__value">{{ totalReplay }}</strong>
      </article>
      <article class="stat-card">
        <p class="stat-card__eyebrow">Special Prize</p>
        <strong class="stat-card__value">{{ totalSpecialPrice }}</strong>
      </article>
      <article class="stat-card">
        <p class="stat-card__eyebrow">Surprise</p>
        <strong class="stat-card__value">{{ totalSpecialSurprise }}</strong>
      </article>
      <article class="stat-card">
        <p class="stat-card__eyebrow">Top Prize</p>
        <strong class="stat-card__value">{{ totalTopPrice }}</strong>
      </article>
      <article class="stat-card">
        <p class="stat-card__eyebrow">Gift Cards</p>
        <strong class="stat-card__value">{{ totalGiftCard }}</strong>
      </article>
    </div>

    <div class="meta-grid">
      <article class="stat-card stat-card--dim">
        <p class="stat-card__eyebrow">Sectores</p>
        <strong class="stat-card__value">{{ options.length }}</strong>
      </article>
      <article class="stat-card stat-card--dim" :class="{ 'stat-card--alert': pendingGiftCards > 0 }">
        <p class="stat-card__eyebrow">Gift cards pendientes</p>
        <strong class="stat-card__value">{{ pendingGiftCards }}</strong>
      </article>
      <article class="stat-card stat-card--dim" :class="{ 'stat-card--alert': pendingTopPrices > 0 }">
        <p class="stat-card__eyebrow">Top prizes pendientes</p>
        <strong class="stat-card__value">{{ pendingTopPrices }}</strong>
      </article>
      <article class="stat-card stat-card--dim" :class="{ 'stat-card--alert': pendingTeslaPrices > 0 }">
        <p class="stat-card__eyebrow">Tesla pendientes</p>
        <strong class="stat-card__value">{{ pendingTeslaPrices }}</strong>
      </article>
    </div>

    <!-- Parameter editors -->
    <div class="editors-shell">
      <DashboardTotalsEditor ref="totalsEditor" />

      <div class="editors-schedule">
        <DashboardScheduleEditor title="Gift Cards" type="card" />
        <DashboardScheduleEditor title="Top Prizes" type="top" />
      </div>
    </div>

    <!-- Action bar -->
    <div class="action-bar">
      <button
        class="btn-save"
        type="button"
        :disabled="isSaving || isRefreshing"
        @click="onSave"
      >
        <transition name="fade-label" mode="out-in">
          <span v-if="isSaving" key="saving">Guardando…</span>
          <span v-else key="save">Guardar cambios</span>
        </transition>
      </button>

      <button
        class="btn-refresh"
        type="button"
        :disabled="isSaving || isRefreshing"
        @click="onRefresh"
      >
        <transition name="fade-label" mode="out-in">
          <span v-if="isRefreshing" key="refreshing">Actualizando…</span>
          <span v-else key="refresh">Actualizar datos</span>
        </transition>
      </button>
    </div>

    <!-- Toast feedback -->
    <transition name="toast-in">
      <div v-if="toast.visible" class="feedback-toast" :class="`feedback-toast--${toast.type}`">
        <span class="feedback-toast__icon" aria-hidden="true">{{ toast.type === 'success' ? '◆' : '◇' }}</span>
        <p class="feedback-toast__msg">{{ toast.message }}</p>
      </div>
    </transition>

  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";
import DashboardTotalsEditor from "@/components/DashboardTotalsEditor.vue";
import DashboardScheduleEditor from "@/components/DashboardScheduleEditor.vue";

const FIREBASE_FIELD_MAP = {
  totalReplay: "totalReplay",
  totalSpecialPrice: "totalSpecialPrice",
  totalSpecialSurprise: "totalSpecialSurprice", // typo preserved for Firebase
  totalTopPrice: "totalTopPrice",
  totalGiftCard: "totalGitfCard", // typo preserved for Firebase
  totalSpin: "totalSpin"
};

export default {
  name: "DashboardView",
  components: {
    DashboardTotalsEditor,
    DashboardScheduleEditor
  },
  data() {
    return {
      isSaving: false,
      isRefreshing: false,
      toast: { visible: false, type: "success", message: "" }
    };
  },
  computed: {
    ...mapGetters([
      "options",
      "giftCards",
      "topPrices",
      "teslaPrices",
      "totalReplay",
      "totalSpecialPrice",
      "totalSpecialSurprise",
      "totalTopPrice",
      "totalGiftCard",
      "totalSpin"
    ]),
    pendingGiftCards() {
      return this.giftCards.filter((item) => item && item.given === false).length;
    },
    pendingTopPrices() {
      return this.topPrices.filter((item) => item && item.given === false).length;
    },
    pendingTeslaPrices() {
      return this.teslaPrices.filter((item) => item && item.given === false).length;
    }
  },
  methods: {
    ...mapActions(["hydrateBootstrapData"]),
    buildFirebaseTotalsPayload() {
      const state = {
        totalReplay: this.totalReplay,
        totalSpecialPrice: this.totalSpecialPrice,
        totalSpecialSurprise: this.totalSpecialSurprise,
        totalTopPrice: this.totalTopPrice,
        totalGiftCard: this.totalGiftCard,
        totalSpin: this.totalSpin
      };

      return Object.keys(FIREBASE_FIELD_MAP).reduce((acc, key) => {
        acc[FIREBASE_FIELD_MAP[key]] = state[key];
        return acc;
      }, {});
    },
    showToast(type, message) {
      if (this._toastTimer) {
        clearTimeout(this._toastTimer);
      }

      this.toast = { visible: true, type, message };
      this._toastTimer = setTimeout(() => {
        this.toast = { ...this.toast, visible: false };
      }, 3200);
    },
    async onSave() {
      if (!this.$refs.totalsEditor.validate()) {
        this.showToast("error", "Corrige los valores antes de guardar.");
        return;
      }

      this.isSaving = true;

      try {
        const [totalsOk, giftOk, topOk] = await Promise.all([
          service.saveTotals(this.buildFirebaseTotalsPayload()),
          service.setGiftCards(this.giftCards),
          service.setTopPrices(this.topPrices)
        ]);

        if (totalsOk && giftOk && topOk) {
          this.showToast("success", "Todos los cambios guardados correctamente.");
        } else {
          this.showToast("error", "Algunos datos no se guardaron. Intenta nuevamente.");
        }
      } catch {
        this.showToast("error", "Error de conexión al guardar.");
      } finally {
        this.isSaving = false;
      }
    },
    async onRefresh() {
      this.isRefreshing = true;

      try {
        const bootstrapData = await service.getBootstrapData();
        this.hydrateBootstrapData(bootstrapData);
        this.showToast("success", "Datos actualizados desde Firebase.");
      } catch {
        this.showToast("error", "Error al actualizar los datos.");
      } finally {
        this.isRefreshing = false;
      }
    }
  },
  beforeDestroy() {
    if (this._toastTimer) {
      clearTimeout(this._toastTimer);
    }
  }
};
</script>

<style scoped>
.dashboard-view {
  width: min(100%, 980px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  padding: 1.6rem 0.5rem 2rem;
}

/* Hero */
.dash-hero {
  position: relative;
  border-radius: 1.25rem;
  padding: 1.4rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 250, 237, 0.97) 0%, rgba(246, 238, 215, 0.97) 100%);
  border: 1px solid rgba(205, 174, 104, 0.3);
  box-shadow: 0 10px 22px rgba(45, 53, 40, 0.07);
  overflow: hidden;
}

.dash-hero__inner {
  position: relative;
  z-index: 1;
}

.dash-hero__eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.68rem;
  font-weight: 700;
  color: #1f5a3f;
}

.dash-hero__title {
  margin: 0 0 0.3rem;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  font-weight: 700;
  color: #1d2b22;
  line-height: 1.1;
}

.dash-hero__copy {
  margin: 0;
  color: rgba(29, 43, 34, 0.6);
  font-size: 0.88rem;
}

.dash-hero__deco {
  position: absolute;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 80px;
  height: 80px;
  opacity: 0.7;
}

/* Stats grids */
.stats-grid,
.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.meta-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 251, 243, 0.92);
  border: 1px solid rgba(205, 174, 104, 0.22);
  box-shadow: 0 8px 18px rgba(45, 53, 40, 0.07);
}

.stat-card--dim {
  background: rgba(255, 251, 243, 0.72);
  box-shadow: none;
  border-color: rgba(205, 174, 104, 0.14);
}

.stat-card--alert {
  border-color: rgba(205, 174, 104, 0.5);
  background: rgba(255, 248, 225, 0.92);
}

.stat-card__eyebrow {
  margin: 0 0 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.64rem;
  font-weight: 700;
  color: rgba(31, 90, 63, 0.7);
}

.stat-card__value {
  display: block;
  font-size: clamp(1.4rem, 2.2vw, 2rem);
  font-weight: 700;
  line-height: 1;
  color: #1d2b22;
}

/* Editors */
.editors-shell {
  border-radius: 1.25rem;
  padding: 1.6rem 1.5rem;
  background: rgba(255, 251, 243, 0.95);
  border: 1px solid rgba(205, 174, 104, 0.26);
  box-shadow: 0 10px 22px rgba(45, 53, 40, 0.07);
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
}

.editors-schedule {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}

/* Action bar */
.action-bar {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
}

.btn-save,
.btn-refresh {
  padding: 0.7rem 1.6rem;
  border-radius: 0.7rem;
  border: none;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-save:disabled,
.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save:not(:disabled):active,
.btn-refresh:not(:disabled):active {
  transform: scale(0.97);
}

.btn-save {
  background: linear-gradient(135deg, #cdae68 0%, #e8d5a3 100%);
  color: #1d2b22;
  box-shadow: 0 4px 12px rgba(205, 174, 104, 0.35);
}

.btn-save:not(:disabled):hover {
  background: linear-gradient(135deg, #b99a52 0%, #d4c180 100%);
}

.btn-refresh {
  background: transparent;
  color: #1f5a3f;
  border: 1.5px solid rgba(31, 90, 63, 0.35);
}

.btn-refresh:not(:disabled):hover {
  background: rgba(31, 90, 63, 0.06);
  border-color: rgba(31, 90, 63, 0.5);
}

/* Toast */
.feedback-toast {
  position: fixed;
  bottom: 1.6rem;
  right: 1.6rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 0.8rem;
  padding: 0.8rem 1.1rem;
  min-width: 220px;
  max-width: 340px;
  box-shadow: 0 12px 24px rgba(45, 53, 40, 0.16);
  border: 1px solid transparent;
}

.feedback-toast--success {
  background: rgba(246, 243, 233, 0.98);
  border-color: rgba(205, 174, 104, 0.5);
}

.feedback-toast--error {
  background: rgba(255, 244, 242, 0.98);
  border-color: rgba(185, 45, 34, 0.3);
}

.feedback-toast__icon {
  font-size: 0.9rem;
  color: #cdae68;
  flex-shrink: 0;
}

.feedback-toast--error .feedback-toast__icon {
  color: #b92d22;
}

.feedback-toast__msg {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1d2b22;
  line-height: 1.35;
}

/* Transitions */
.toast-in-enter-active,
.toast-in-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.toast-in-enter,
.toast-in-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.fade-label-enter-active,
.fade-label-leave-active {
  transition: opacity 0.15s;
}

.fade-label-enter,
.fade-label-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .editors-schedule {
    grid-template-columns: 1fr;
    gap: 1.6rem;
  }
}

@media (max-width: 600px) {
  .editors-shell {
    padding: 1.2rem 1rem;
  }

  .action-bar {
    flex-direction: column;
  }

  .btn-save,
  .btn-refresh {
    width: 100%;
    text-align: center;
  }
}
</style>
