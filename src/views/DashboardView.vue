<template>
  <div class="dashboard-view">
    <input
      ref="localFileInput"
      type="file"
      accept="application/json"
      class="sr-only"
      @change="onImportFile"
    />

    <section class="dashboard-toolbar panel">
      <div class="toolbar-copy">
        <p class="toolbar-eyebrow">Control panel</p>
        <h2>Dashboard</h2>
        <p>Manage prize quantities, schedules, and the active data source for the roulette.</p>
      </div>

      <div class="toolbar-actions">
        <div class="source-switch" role="tablist" aria-label="Data source">
          <button
            class="source-switch__item"
            :class="{ 'source-switch__item--active': dataSource === 'remote' }"
            type="button"
            @click="switchSource('remote')"
          >
            Online
          </button>
          <button
            class="source-switch__item"
            :class="{ 'source-switch__item--active': dataSource === 'local' }"
            type="button"
            @click="switchSource('local')"
          >
            Local
          </button>
        </div>

        <div class="toolbar-buttons">
          <button class="ghost-btn" type="button" @click="triggerImport">
            Import JSON
          </button>
          <button class="ghost-btn" type="button" :disabled="!hasLocalSnapshot" @click="exportLocalJson">
            Export JSON
          </button>
          <button class="ghost-btn" type="button" :disabled="isRefreshing" @click="onRefresh">
            {{ isRefreshing ? "Refreshing..." : "Refresh" }}
          </button>
          <button class="primary-btn" type="button" :disabled="isSaving || isRefreshing" @click="onSave">
            {{ isSaving ? "Saving..." : dataSource === "local" ? "Save local" : "Save online" }}
          </button>
        </div>
      </div>
    </section>

    <section class="dashboard-layout">
      <div class="dashboard-main">
        <section class="panel summary-panel panel--overview">
          <div class="summary-panel__header">
            <div>
              <p class="panel-eyebrow">Overview</p>
              <h3>Current status</h3>
            </div>
            <span class="source-badge" :class="`source-badge--${dataSource}`">
              {{ dataSource === "local" ? "Local JSON" : "Firebase" }}
            </span>
          </div>

          <div class="stats-grid">
            <article class="stat-card">
              <p class="stat-card__label">Spins</p>
              <strong>{{ totalSpin }}</strong>
            </article>
            <article class="stat-card">
              <p class="stat-card__label">Replay</p>
              <strong>{{ totalReplay }}</strong>
            </article>
            <article class="stat-card">
              <p class="stat-card__label">Special prize</p>
              <strong>{{ totalSpecialPrice }}</strong>
            </article>
            <article class="stat-card">
              <p class="stat-card__label">Surprise</p>
              <strong>{{ totalSpecialSurprise }}</strong>
            </article>
            <article class="stat-card">
              <p class="stat-card__label">Top prize</p>
              <strong>{{ totalTopPrice }}</strong>
            </article>
            <article class="stat-card">
              <p class="stat-card__label">Gift cards</p>
              <strong>{{ totalGiftCard }}</strong>
            </article>
          </div>
        </section>

        <section class="panel totals-panel panel--totals">
          <DashboardTotalsEditor ref="totalsEditor" />
        </section>

      </div>

      <aside class="dashboard-side">
        <section class="panel side-panel panel--status">
          <div class="panel-heading">
            <div>
              <p class="panel-eyebrow">Status</p>
              <h3>Source and pending items</h3>
            </div>
          </div>

          <div class="status-list">
            <div class="status-item">
              <span>Current mode</span>
              <strong>{{ dataSource === "local" ? "Local" : "Online" }}</strong>
            </div>
            <div class="status-item">
              <span>Configured sectors</span>
              <strong>{{ options.length }}</strong>
            </div>
            <div class="status-item">
              <span>Pending gift cards</span>
              <strong>{{ pendingGiftCards }}</strong>
            </div>
            <div class="status-item">
              <span>Pending top prizes</span>
              <strong>{{ pendingTopPrices }}</strong>
            </div>
            <div class="status-item">
              <span>Pending Tesla prizes</span>
              <strong>{{ pendingTeslaPrices }}</strong>
            </div>
          </div>
        </section>

        <section class="panel side-panel side-panel--soft panel--workflow">
          <div class="panel-heading">
            <div>
              <p class="panel-eyebrow">Workflow</p>
              <h3>Local mode</h3>
            </div>
          </div>

          <p class="mode-help">
            Switch to local mode to work without a backend. You can import a manual JSON file, edit it here, and export it again.
          </p>
          <ul class="mode-list">
            <li>Online: reads and writes directly to Firebase.</li>
            <li>Local: uses a JSON snapshot stored in the browser.</li>
            <li>If no local snapshot exists, one is created from the current state.</li>
          </ul>
        </section>
      </aside>
    </section>

    <section class="panel editors-panel editors-panel--full panel--schedules">
      <div class="panel-heading">
        <div>
          <p class="panel-eyebrow">Schedules</p>
          <h3>Scheduled prizes</h3>
        </div>
        <p class="panel-copy">Edit time slots and delivery state for each prize group.</p>
      </div>

      <div class="schedule-grid">
        <div class="schedule-grid__item">
          <DashboardScheduleEditor title="Gift Cards" type="card" />
        </div>
        <div class="schedule-grid__item">
          <DashboardScheduleEditor title="Top Prizes" type="top" />
        </div>
        <div class="schedule-grid__item schedule-grid__item--full">
          <DashboardScheduleEditor title="Tesla" type="tesla" />
        </div>
      </div>
    </section>

    <transition name="toast-in">
      <div v-if="toast.visible" class="feedback-toast" :class="`feedback-toast--${toast.type}`">
        <span class="feedback-toast__icon" aria-hidden="true">{{ toast.type === "success" ? "◆" : "◇" }}</span>
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
  totalSpecialSurprise: "totalSpecialSurprice",
  totalTopPrice: "totalTopPrice",
  totalGiftCard: "totalGitfCard",
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
      dataSource: "remote",
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
    },
    hasLocalSnapshot() {
      return service.hasLocalSnapshot();
    }
  },
  mounted() {
    this.dataSource = service.getDataSourceMode();
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
    buildBootstrapSnapshot() {
      return {
        options: this.options,
        totals: {
          totalReplay: this.totalReplay,
          totalSpecialPrice: this.totalSpecialPrice,
          totalSpecialSurprise: this.totalSpecialSurprise,
          totalTopPrice: this.totalTopPrice,
          totalGiftCard: this.totalGiftCard,
          totalSpin: this.totalSpin
        },
        giftCards: this.giftCards,
        topPrices: this.topPrices,
        teslaPrices: this.teslaPrices
      };
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
    async switchSource(mode) {
      if (mode === this.dataSource) {
        return;
      }

      if (mode === "local" && !service.hasLocalSnapshot()) {
        service.importLocalSnapshot(this.buildBootstrapSnapshot());
      }

      this.dataSource = service.setDataSourceMode(mode);
      await this.refreshFromCurrentSource();
      this.showToast("success", mode === "local" ? "Local mode enabled." : "Online mode enabled.");
    },
    async refreshFromCurrentSource() {
      const bootstrapData = await service.getBootstrapData();
      this.hydrateBootstrapData(bootstrapData);
    },
    async onSave() {
      if (!this.$refs.totalsEditor.validate()) {
        this.showToast("error", "Fix the values before saving.");
        return;
      }

      this.isSaving = true;

      try {
        const [totalsOk, giftOk, topOk, teslaOk] = await Promise.all([
          service.saveTotals(this.buildFirebaseTotalsPayload()),
          service.setGiftCards(this.giftCards),
          service.setTopPrices(this.topPrices),
          service.setTeslaWinService(this.teslaPrices)
        ]);

        if (totalsOk && giftOk && topOk && teslaOk) {
          this.showToast("success", this.dataSource === "local" ? "Changes saved to local JSON." : "All changes were saved successfully.");
        } else {
          this.showToast("error", "Some data could not be saved. Try again.");
        }
      } catch {
        this.showToast("error", "Connection error while saving.");
      } finally {
        this.isSaving = false;
      }
    },
    async onRefresh() {
      this.isRefreshing = true;

      try {
        await this.refreshFromCurrentSource();
        this.showToast("success", this.dataSource === "local" ? "Data reloaded from the local snapshot." : "Data refreshed from Firebase.");
      } catch {
        this.showToast("error", "Unable to refresh data.");
      } finally {
        this.isRefreshing = false;
      }
    },
    triggerImport() {
      this.$refs.localFileInput?.click();
    },
    async onImportFile(event) {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const text = await file.text();
        const snapshot = service.importLocalSnapshot(JSON.parse(text));
        service.setDataSourceMode("local");
        this.dataSource = "local";
        this.hydrateBootstrapData({ ...snapshot, errors: [] });
        this.showToast("success", "Local JSON imported successfully.");
      } catch {
        this.showToast("error", "Unable to import the JSON file.");
      } finally {
        event.target.value = "";
      }
    },
    exportLocalJson() {
      const snapshot = service.exportLocalSnapshot() || this.buildBootstrapSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "roulette-local-config.json";
      link.click();
      window.URL.revokeObjectURL(url);
      this.showToast("success", "Local snapshot exported.");
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
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dashboard-view {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.2rem 0.65rem 1.6rem;
}

.panel {
  border-radius: 1.25rem;
  background: rgba(255, 250, 240, 0.96);
  border: 1px solid rgba(205, 174, 104, 0.22);
  box-shadow: 0 16px 34px rgba(37, 46, 34, 0.08);
}

.panel--overview {
  background: linear-gradient(180deg, rgba(255, 251, 244, 0.98) 0%, rgba(250, 243, 230, 0.96) 100%);
}

.panel--totals {
  background: linear-gradient(180deg, rgba(252, 253, 250, 0.98) 0%, rgba(245, 248, 242, 0.96) 100%);
}

.panel--status {
  background: linear-gradient(180deg, rgba(250, 252, 248, 0.98) 0%, rgba(241, 247, 239, 0.96) 100%);
}

.panel--workflow {
  background: linear-gradient(180deg, rgba(251, 246, 233, 0.98) 0%, rgba(245, 236, 214, 0.96) 100%);
}

.panel--schedules {
  background: linear-gradient(180deg, rgba(249, 252, 248, 0.98) 0%, rgba(238, 246, 241, 0.96) 100%);
}

.dashboard-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
}

.toolbar-copy h2,
.panel-heading h3,
.summary-panel__header h3 {
  margin: 0;
  font-size: clamp(1.25rem, 2vw, 1.8rem);
  color: #1f2b22;
}

.toolbar-copy p:last-child,
.panel-copy,
.mode-help {
  margin: 0.35rem 0 0;
  color: rgba(31, 43, 34, 0.68);
  line-height: 1.45;
}

.toolbar-eyebrow,
.panel-eyebrow {
  margin: 0 0 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.68rem;
  font-weight: 800;
  color: #1f5a3f;
}

.toolbar-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.source-switch {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(31, 90, 63, 0.08);
  padding: 0.2rem;
}

.source-switch__item {
  border: 0;
  background: transparent;
  min-width: 92px;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  font-weight: 700;
  color: rgba(31, 43, 34, 0.7);
}

.source-switch__item--active {
  background: #1f5a3f;
  color: #fff7e8;
}

.toolbar-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.ghost-btn,
.primary-btn {
  border-radius: 0.8rem;
  padding: 0.72rem 1rem;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

.ghost-btn {
  background: rgba(255, 251, 243, 0.9);
  color: #1f5a3f;
  border-color: rgba(31, 90, 63, 0.16);
}

.primary-btn {
  background: linear-gradient(180deg, #cf3b2d 0%, #b92d22 100%);
  color: #fff8ec;
  box-shadow: 0 10px 18px rgba(185, 45, 34, 0.2);
}

.dashboard-layout {
  display: flex;
  align-items: stretch;
  gap: 1rem;
}

.dashboard-main,
.dashboard-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-main {
  flex: 1 1 auto;
  min-width: 0;
}

.dashboard-side {
  flex: 0 0 32%;
  min-width: 280px;
  max-width: 380px;
}

.summary-panel {
  padding: 1rem 1.1rem;
}

.totals-panel {
  flex: 1 1 auto;
  display: flex;
}

.summary-panel__header,
.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}

.source-badge {
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.source-badge--remote {
  background: rgba(47, 96, 57, 0.1);
  color: #1f5a3f;
}

.source-badge--local {
  background: rgba(185, 45, 34, 0.1);
  color: #b92d22;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.stat-card {
  border-radius: 1rem;
  padding: 0.95rem 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(253, 248, 238, 0.96) 100%);
  border: 1px solid rgba(214, 189, 132, 0.18);
}

.stat-card__label {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.66rem;
  font-weight: 800;
  color: rgba(31, 90, 63, 0.76);
}

.stat-card strong {
  display: block;
  font-size: clamp(1.45rem, 2.3vw, 2rem);
  line-height: 1;
  color: #1d2b22;
}

.editors-panel,
.side-panel {
  padding: 1rem 1.1rem;
}

.editors-panel--full {
  width: 100%;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.schedule-grid__item {
  min-width: 0;
}

.schedule-grid__item--full {
  grid-column: 1 / -1;
}

.dashboard-side {
  position: relative;
  top: auto;
  align-self: start;
}

.side-panel--soft {
  background: linear-gradient(180deg, rgba(251, 246, 233, 0.98) 0%, rgba(245, 236, 214, 0.96) 100%);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(205, 174, 104, 0.18);
}

.status-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.status-item span {
  color: rgba(31, 43, 34, 0.62);
}

.status-item strong {
  color: #1d2b22;
}

.mode-list {
  margin: 0.75rem 0 0;
  padding-left: 1.05rem;
  color: rgba(31, 43, 34, 0.76);
  line-height: 1.5;
}

.feedback-toast {
  position: fixed;
  right: 1.4rem;
  bottom: 1.4rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 240px;
  max-width: 340px;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  box-shadow: 0 16px 28px rgba(37, 46, 34, 0.18);
}

.feedback-toast--success {
  background: rgba(255, 251, 243, 0.98);
  border: 1px solid rgba(205, 174, 104, 0.42);
}

.feedback-toast--error {
  background: rgba(255, 243, 241, 0.98);
  border: 1px solid rgba(185, 45, 34, 0.24);
}

.feedback-toast__msg {
  margin: 0;
  color: #1d2b22;
  font-weight: 600;
}

.toast-in-enter-active,
.toast-in-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-in-enter,
.toast-in-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 1080px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .dashboard-side {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
    position: relative;
    top: auto;
  }
}

@media (max-width: 900px) {
  .dashboard-toolbar,
  .summary-panel,
  .editors-panel,
  .side-panel {
    padding: 0.95rem;
  }

  .toolbar-actions {
    width: 100%;
    align-items: stretch;
  }

  .toolbar-buttons {
    justify-content: stretch;
  }

  .ghost-btn,
  .primary-btn {
    flex: 1 1 180px;
  }

  .stats-grid,
  .schedule-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 901px) {
  .schedule-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media (max-width: 640px) {
  .dashboard-view {
    padding-inline: 0.25rem;
  }

  .dashboard-toolbar {
    flex-direction: column;
  }

  .summary-panel__header,
  .panel-heading {
    flex-direction: column;
  }

  .source-switch {
    width: 100%;
  }

  .source-switch__item {
    flex: 1 1 0;
  }

  .toolbar-buttons {
    width: 100%;
  }

  .ghost-btn,
  .primary-btn {
    width: 100%;
  }

  .feedback-toast {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    min-width: 0;
    max-width: none;
  }
}
</style>
