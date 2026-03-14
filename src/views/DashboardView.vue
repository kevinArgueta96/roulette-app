<template>
  <div class="db-shell">

    <!-- SIDEBAR -->
    <nav class="db-sidebar">
      <div class="db-sidebar__brand">
        <span class="db-sidebar__dot"></span>
        <span class="db-sidebar__title">Control</span>
      </div>

      <ul class="db-nav">
        <li
          v-for="section in sections"
          :key="section.id"
          class="db-nav__item"
          :class="{ 'db-nav__item--active': activeSection === section.id }"
          @click="activeSection = section.id"
        >
          <span class="db-nav__icon">{{ section.icon }}</span>
          <span class="db-nav__label">{{ section.label }}</span>
        </li>
      </ul>

      <div class="db-sidebar__footer">
        <button class="db-back-btn" @click="$router.push('/')">
          <span>←</span> Ruleta
        </button>
      </div>
    </nav>

    <!-- MAIN -->
    <main class="db-main">

      <!-- TOP BAR -->
      <header class="db-topbar">
        <div class="db-topbar__left">
          <h1 class="db-topbar__title">{{ currentSection.label }}</h1>
          <span class="db-topbar__sub">Evento en curso</span>
        </div>
        <div class="db-topbar__right">
          <button class="db-btn db-btn--ghost" :disabled="isRefreshing" @click="refresh">
            <span :class="{ 'spin-icon': isRefreshing }">↺</span>
            {{ isRefreshing ? "Actualizando..." : "Refrescar" }}
          </button>
          <button class="db-btn db-btn--primary" :disabled="isSaving" @click="save">
            {{ isSaving ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>
      </header>

      <!-- CONTENT -->
      <div class="db-content">

        <!-- ═══ OVERVIEW ═══ -->
        <div v-show="activeSection === 'overview'">
          <div class="stat-grid">
            <div class="stat-card stat-card--spin">
              <span class="stat-card__label">Total Spins</span>
              <input
                class="stat-card__value"
                type="number"
                v-model.number="selectedTotalSpin"
                min="0"
              />
              <span class="stat-card__icon">◎</span>
            </div>
            <div class="stat-card stat-card--replay">
              <span class="stat-card__label">Replay</span>
              <input
                class="stat-card__value"
                type="number"
                v-model.number="selectedTotalReplay"
                min="0"
              />
              <span class="stat-card__icon">↩</span>
            </div>
            <div class="stat-card stat-card--special">
              <span class="stat-card__label">Special Price</span>
              <input
                class="stat-card__value"
                type="number"
                v-model.number="selectedTotalSpecialPrice"
                min="0"
              />
              <span class="stat-card__icon">★</span>
            </div>
            <div class="stat-card stat-card--surprise">
              <span class="stat-card__label">Surprise</span>
              <input
                class="stat-card__value"
                type="number"
                v-model.number="selectedTotalSpecialSurprise"
                min="0"
              />
              <span class="stat-card__icon">✦</span>
            </div>
            <div class="stat-card stat-card--top">
              <span class="stat-card__label">Top Price</span>
              <input
                class="stat-card__value"
                type="number"
                v-model.number="selectedTotalTopPrice"
                min="0"
              />
              <span class="stat-card__icon">◆</span>
            </div>
            <div class="stat-card stat-card--gift">
              <span class="stat-card__label">Gift Card</span>
              <input
                class="stat-card__value"
                type="number"
                v-model.number="selectedTotalGiftCard"
                min="0"
              />
              <span class="stat-card__icon">▣</span>
            </div>
          </div>

          <div class="danger-zone">
            <div class="danger-zone__info">
              <p class="danger-zone__title">Zona de reset</p>
              <p class="danger-zone__desc">Resetea todos los contadores a cero. Úsalo al inicio de cada día de evento.</p>
            </div>
            <button class="db-btn db-btn--danger" @click="resetTotals">
              Resetear totales a 0
            </button>
          </div>
        </div>

        <!-- ═══ GIFT CARDS ═══ -->
        <div v-show="activeSection === 'giftCards'">
          <div class="prize-section-head">
            <p class="prize-section-desc">
              Cada gift card se entrega automáticamente cuando la ruleta gira dentro del rango horario configurado.
            </p>
          </div>
          <div class="prize-list">
            <PrizeRowComponent
              v-for="(item, index) in giftCards"
              :key="`card-${index}`"
              :prizeProperties="item"
              :index="index"
              :position="index + 1"
              collection="giftCards"
            />
            <div v-if="!giftCards.length" class="empty-state">
              <span class="empty-state__icon">▣</span>
              <p>No hay gift cards configuradas</p>
            </div>
          </div>
        </div>

        <!-- ═══ TOP PRICES ═══ -->
        <div v-show="activeSection === 'topPrices'">
          <div class="prize-section-head">
            <p class="prize-section-desc">
              Los premios principales se fuerzan en la ruleta cuando el horario configurado está activo.
            </p>
          </div>
          <div class="prize-list">
            <PrizeRowComponent
              v-for="(item, index) in topPrices"
              :key="`top-${index}`"
              :prizeProperties="item"
              :index="index"
              :position="index + 1"
              collection="topPrices"
            />
            <div v-if="!topPrices.length" class="empty-state">
              <span class="empty-state__icon">◆</span>
              <p>No hay top prices configurados</p>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="statusMsg" class="db-toast" :class="`db-toast--${statusMsgType}`">
        <span class="db-toast__dot"></span>
        {{ statusMsg }}
      </div>
    </transition>

  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import PrizeRowComponent from "@/components/PrizeRowComponent.vue";
import service from "@/services/totals.service";

export default {
  name: "DashboardView",
  components: { PrizeRowComponent },
  data() {
    return {
      activeSection: "overview",
      isSaving: false,
      isRefreshing: false,
      statusMsg: "",
      statusMsgType: "success",
      sections: [
        { id: "overview",   label: "Resumen",     icon: "◎" },
        { id: "giftCards",  label: "Gift Cards",  icon: "▣" },
        { id: "topPrices",  label: "Top Prices",  icon: "◆" }
      ]
    };
  },
  computed: {
    ...mapGetters([
      "totalReplay", "totalSpecialPrice", "totalSpecialSurprise",
      "totalTopPrice", "totalGiftCard", "totalSpin",
      "giftCards", "topPrices"
    ]),
    currentSection() {
      return this.sections.find(s => s.id === this.activeSection) || this.sections[0];
    },
    selectedTotalReplay: {
      get() { return this.totalReplay; },
      set(v) { this.setTotalReplay(Math.max(0, v)); }
    },
    selectedTotalSpecialPrice: {
      get() { return this.totalSpecialPrice; },
      set(v) { this.setTotalSpecialPrice(Math.max(0, v)); }
    },
    selectedTotalSpecialSurprise: {
      get() { return this.totalSpecialSurprise; },
      set(v) { this.setTotalSpecialSurprise(Math.max(0, v)); }
    },
    selectedTotalTopPrice: {
      get() { return this.totalTopPrice; },
      set(v) { this.setTotalTopPrice(Math.max(0, v)); }
    },
    selectedTotalGiftCard: {
      get() { return this.totalGiftCard; },
      set(v) { this.setTotalGiftCard(Math.max(0, v)); }
    },
    selectedTotalSpin: {
      get() { return this.totalSpin; },
      set(v) { this.setTotalSpin(Math.max(0, v)); }
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    ...mapMutations([
      "setTotalReplay", "setTotalSpecialPrice", "setTotalSpecialSurprise",
      "setTotalTopPrice", "setTotalGiftCard", "setTotalSpin",
      "setGiftCards", "setTopPrices", "setTotals"
    ]),
    async refresh() {
      this.isRefreshing = true;
      try {
        const data = await service.getBootstrapData();
        if (data.totals)    this.setTotals(data.totals);
        if (data.giftCards) this.setGiftCards(data.giftCards);
        if (data.topPrices) this.setTopPrices(data.topPrices);
        this.showStatus("Datos actualizados", "success");
      } catch {
        this.showStatus("Error al refrescar", "error");
      } finally {
        this.isRefreshing = false;
      }
    },
    async save() {
      this.isSaving = true;
      try {
        const totals = {
          totalReplay: this.totalReplay,
          totalSpecialPrice: this.totalSpecialPrice,
          totalSpecialSurprise: this.totalSpecialSurprise,
          totalTopPrice: this.totalTopPrice,
          totalGiftCard: this.totalGiftCard,
          totalSpin: this.totalSpin
        };
        await Promise.all([
          service.saveTotals(totals),
          service.setGiftCards(this.giftCards),
          service.setTopPrices(this.topPrices)
        ]);
        this.showStatus("Cambios guardados correctamente", "success");
      } catch {
        this.showStatus("Error al guardar. Verifica la conexión.", "error");
      } finally {
        this.isSaving = false;
      }
    },
    async resetTotals() {
      if (!window.confirm("¿Resetear todos los totales a 0?")) return;
      const zeros = {
        totalReplay: 0, totalSpecialPrice: 0, totalSpecialSurprise: 0,
        totalTopPrice: 0, totalGiftCard: 0, totalSpin: 0
      };
      this.setTotals(zeros);
      await service.saveTotals(zeros);
      this.showStatus("Totales reseteados a 0", "success");
    },
    showStatus(msg, type) {
      this.statusMsg = msg;
      this.statusMsgType = type;
      setTimeout(() => { this.statusMsg = ""; }, 3000);
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
/* ── Shell ── */
.db-shell {
  display: flex;
  min-height: 100vh;
  background: #f0ede8;
  font-family: 'DM Sans', Helvetica, sans-serif;
  color: #1c2428;
}

/* ── Sidebar ── */
.db-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #1c2428;
  display: flex;
  flex-direction: column;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.db-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.75rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.db-sidebar__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff501c;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(255,80,28,0.6);
}

.db-sidebar__title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.9);
}

.db-nav {
  list-style: none;
  margin: 0;
  padding: 1rem 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.db-nav__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 150ms, color 150ms;
  color: rgba(255,255,255,0.45);
  font-size: 0.9rem;
  font-weight: 500;
}

.db-nav__item:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
}

.db-nav__item--active {
  background: rgba(255, 80, 28, 0.15);
  color: #ff6b3d;
}

.db-nav__item--active .db-nav__icon {
  color: #ff501c;
}

.db-nav__icon {
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.db-nav__label {
  font-size: 0.875rem;
}

.db-sidebar__footer {
  padding: 1.25rem 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.db-back-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.45);
  font-size: 0.85rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 150ms;
}

.db-back-btn:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  border-color: rgba(255,255,255,0.2);
}

/* ── Main area ── */
.db-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── Top bar ── */
.db-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem;
  background: #f0ede8;
  border-bottom: 1px solid rgba(28, 36, 40, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.db-topbar__left {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.db-topbar__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1c2428;
  line-height: 1;
}

.db-topbar__sub {
  font-size: 0.78rem;
  color: rgba(28,36,40,0.45);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.db-topbar__right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* ── Buttons ── */
.db-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  border: none;
  transition: all 150ms;
  white-space: nowrap;
}

.db-btn--primary {
  background: #1c2428;
  color: #fff;
}

.db-btn--primary:hover:not(:disabled) {
  background: #2b353a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(28,36,40,0.25);
}

.db-btn--ghost {
  background: rgba(28,36,40,0.07);
  color: #1c2428;
  border: 1px solid rgba(28,36,40,0.12);
}

.db-btn--ghost:hover:not(:disabled) {
  background: rgba(28,36,40,0.12);
}

.db-btn--danger {
  background: rgba(220,38,38,0.08);
  color: #dc2626;
  border: 1px solid rgba(220,38,38,0.18);
}

.db-btn--danger:hover {
  background: rgba(220,38,38,0.14);
}

.db-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.spin-icon {
  display: inline-block;
  animation: spin-anim 0.8s linear infinite;
}

@keyframes spin-anim {
  to { transform: rotate(360deg); }
}

/* ── Content ── */
.db-content {
  padding: 2rem 2.5rem;
  flex: 1;
}

/* ── Stat cards ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 1.25rem 1.25rem 1rem;
  box-shadow: 0 1px 3px rgba(28,36,40,0.06), 0 4px 16px rgba(28,36,40,0.04);
  overflow: hidden;
  transition: transform 150ms, box-shadow 150ms;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(28,36,40,0.1);
}

.stat-card__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(28,36,40,0.45);
  margin-bottom: 0.5rem;
}

.stat-card__value {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(28,36,40,0.1);
  font-family: 'DM Mono', monospace;
  font-size: 2.2rem;
  font-weight: 500;
  color: #1c2428;
  padding: 0 0 0.25rem;
  line-height: 1;
  transition: border-color 200ms;
  outline: none;
}

.stat-card__value:focus {
  border-bottom-color: #ff501c;
}

.stat-card__icon {
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  font-size: 1.8rem;
  opacity: 0.06;
  pointer-events: none;
  line-height: 1;
}

/* Accent top borders per card */
.stat-card--spin::before,
.stat-card--replay::before,
.stat-card--special::before,
.stat-card--surprise::before,
.stat-card--top::before,
.stat-card--gift::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}

.stat-card--spin::before    { background: #ff501c; }
.stat-card--replay::before  { background: #94a3b8; }
.stat-card--special::before { background: #f59e0b; }
.stat-card--surprise::before{ background: #8b5cf6; }
.stat-card--top::before     { background: #2b353a; }
.stat-card--gift::before    { background: #10b981; }

/* ── Danger zone ── */
.danger-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: rgba(220,38,38,0.04);
  border: 1px solid rgba(220,38,38,0.12);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.danger-zone__title {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #dc2626;
}

.danger-zone__desc {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(28,36,40,0.55);
  max-width: 420px;
}

/* ── Prize section ── */
.prize-section-head {
  margin-bottom: 1.25rem;
}

.prize-section-desc {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(28,36,40,0.5);
  line-height: 1.5;
}

.prize-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  background: #fff;
  border-radius: 16px;
  text-align: center;
  color: rgba(28,36,40,0.3);
}

.empty-state__icon {
  font-size: 2rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* ── Toast ── */
.db-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(28,36,40,0.15);
}

.db-toast--success {
  background: #fff;
  color: #15803d;
  border: 1px solid rgba(34,197,94,0.25);
}

.db-toast--error {
  background: #fff;
  color: #dc2626;
  border: 1px solid rgba(220,38,38,0.25);
}

.db-toast__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.db-toast--success .db-toast__dot { background: #22c55e; }
.db-toast--error   .db-toast__dot { background: #dc2626; }

.toast-enter-active, .toast-leave-active {
  transition: opacity 250ms, transform 250ms;
}
.toast-enter, .toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>