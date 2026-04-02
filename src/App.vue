<template>
  <div id="app" class="app-shell">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />

    <main class="tablet-stage">
      <section class="tablet-canvas">
        <header class="screen-header">
          <img class="brand-logo" src="@/assets/brand/new-logo.png" alt="Parrano" />
          <button class="menu-button" type="button" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </header>

        <section class="wheel-region">
          <RouletteCompoment @showImg="showImg" />
        </section>

        <transition name="fade-up">
          <section v-if="hasResult" class="result-toast" :class="`result-toast--${winType}`">
            <p class="result-toast__eyebrow">{{ resultCopy.kicker }}</p>
            <h2>{{ resultCopy.title }}</h2>
            <p>{{ resultCopy.description }}</p>
          </section>
        </transition>

        <div v-if="loadWarning" class="status-banner">
          {{ loadWarning }}
        </div>

        <div v-if="isLoading" class="loading-overlay">
          <span class="status-spinner"></span>
          <p>Cargando configuracion…</p>
        </div>

        <svg class="bottom-wave" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 112 C120 150 320 170 500 170 C680 170 880 150 1000 112 L1000 260 L0 260 Z" fill="#2f6039" />
        </svg>
      </section>
    </main>
  </div>
</template>

<script>
import RouletteCompoment from "./components/RouletteCompoment.vue";
import ConfettiComponent from "./components/ConfettiComponent.vue";
import { mapActions } from "vuex";
import service from "@/services/totals.service";

const RESULT_CONFIG = {
  repeat: {
    duration: 2500,
    confetti: false,
    kicker: "Repeat",
    title: "Kokeile uudestaan",
    description: "Saat uuden mahdollisuuden."
  },
  mainPrize: {
    duration: 7000,
    confetti: true,
    kicker: "Main prize",
    title: "LAHJAKASSI",
    description: "Pääpalkinto osui kohdalleen."
  },
  surpriseWin: {
    duration: 6000,
    confetti: true,
    kicker: "Surprise win",
    title: "Yllätyspalkinto",
    description: "Voitit yllätyspalkinnon."
  },
  noWin: {
    duration: 3200,
    confetti: false,
    kicker: "No win",
    title: "Ei voittoa",
    description: "Tämä sektori ei anna palkintoa."
  }
};

export default {
  name: "App",
  components: {
    RouletteCompoment,
    ConfettiComponent
  },
  data() {
    return {
      winType: "",
      isVisibleConfetti: false,
      resultTimer: null,
      isLoading: true,
      loadWarning: ""
    };
  },
  computed: {
    hasResult() {
      return Boolean(this.winType);
    },
    resultCopy() {
      return RESULT_CONFIG[this.winType] || {};
    }
  },
  mounted() {
    this.syncViewportHeight();
    window.addEventListener("resize", this.syncViewportHeight, { passive: true });
    window.addEventListener("orientationchange", this.handleOrientationChange, { passive: true });
    this.loadInitialData();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.syncViewportHeight);
    window.removeEventListener("orientationchange", this.handleOrientationChange);
    this.clearTimers();
  },
  methods: {
    ...mapActions(["initializeRandomAngle", "hydrateBootstrapData", "updateState"]),
    syncViewportHeight() {
      if (typeof document === "undefined") {
        return;
      }

      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    },
    handleOrientationChange() {
      this.syncViewportHeight();
      window.setTimeout(() => {
        this.syncViewportHeight();
      }, 250);
    },
    async loadInitialData() {
      this.isLoading = true;
      this.loadWarning = "";
      this.initializeRandomAngle();

      const bootstrapData = await service.getBootstrapData();
      this.hydrateBootstrapData(bootstrapData);

      if (bootstrapData.errors.length) {
        this.loadWarning = "Some remote data did not respond. Fallback values are being used.";
      }

      this.isLoading = false;
    },
    showImg({ type }) {
      const result = RESULT_CONFIG[type];

      if (!result) {
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
        return;
      }

      this.clearTimers();
      this.winType = type;
      this.isVisibleConfetti = result.confetti;
      this.updateState({ mutationType: "setTimeToShowOptions", payload: result.duration });

      this.resultTimer = window.setTimeout(() => {
        this.resetResultState();
      }, result.duration);
    },
    resetResultState() {
      this.clearTimers();
      this.winType = "";
      this.isVisibleConfetti = false;
      this.updateState({ mutationType: "setSpinRoullete", payload: true });
    },
    clearTimers() {
      if (this.resultTimer) {
        window.clearTimeout(this.resultTimer);
        this.resultTimer = null;
      }
    }
  }
};
</script>

<style scoped>
.app-shell {
  min-height: var(--app-height, 100vh);
  background: #f5efdd;
}

.tablet-stage {
  width: 100vw;
  height: var(--app-height, 100vh);
}

.tablet-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5efdd;
  padding: 0 1.05rem 0;
}

.screen-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  margin-top: 0.6rem;
}

.brand-logo {
  display: block;
  width: clamp(110px, 14vw, 168px);
  max-height: 2.15rem;
  height: auto;
  object-fit: contain;
}

.menu-button {
  background: transparent;
  border: 0;
  width: 2.15rem;
  height: 2.15rem;
  padding: 0;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.menu-button span {
  width: 18px;
  height: 2px;
  background: #1f5a3f;
  display: block;
  border-radius: 999px;
}

.wheel-region {
  position: relative;
  z-index: 3;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5.8rem;
}

.result-toast {
  position: absolute;
  top: 6.2rem;
  right: 2rem;
  z-index: 5;
  width: min(280px, 28vw);
  border-radius: 1rem;
  padding: 0.95rem 1rem;
  background: rgba(255, 251, 243, 0.97);
  border: 2px solid rgba(205, 174, 104, 0.62);
  box-shadow: 0 16px 28px rgba(45, 53, 40, 0.1);
}

.result-toast--mainPrize { background: #fff2bf; }
.result-toast--surpriseWin { background: #fff0e4; }
.result-toast--repeat { background: #eceae3; }
.result-toast--noWin { background: #edf6eb; }

.result-toast__eyebrow {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  color: #1f5a3f;
  font-weight: 800;
}

.result-toast h2 {
  margin: 0;
  color: #1d2b22;
  font-size: 1.5rem;
  line-height: 1;
}

.result-toast p:last-child {
  margin: 0.55rem 0 0;
  color: rgba(29, 43, 34, 0.82);
}

.status-banner {
  position: absolute;
  left: 2rem;
  right: 2rem;
  bottom: 1.2rem;
  z-index: 5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 80, 28, 0.08);
  border: 1px solid rgba(255, 80, 28, 0.18);
  color: #8d3a1a;
  font-size: 0.92rem;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: grid;
  place-items: center;
  gap: 0.6rem;
  background: rgba(245, 239, 221, 0.92);
  text-align: center;
}

.status-spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 4px solid rgba(255, 80, 28, 0.18);
  border-top-color: #d3382d;
  animation: spin 0.8s linear infinite;
}

.bottom-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 28%;
  display: block;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .tablet-canvas {
    padding: 1rem 0.8rem 0;
  }

  .screen-header {
    min-height: 2.6rem;
    margin-top: 0.35rem;
  }

  .wheel-region {
    padding-top: 4.6rem;
  }

  .result-toast {
    right: 1rem;
    top: 4.4rem;
    width: min(260px, calc(100% - 2rem));
  }

  .brand-logo {
    width: clamp(100px, 30vw, 138px);
    max-height: 1.9rem;
  }
}

@media (orientation: landscape) {
  .tablet-canvas {
    padding: 0.6rem 0.9rem 0;
  }

  .screen-header {
    min-height: 2.4rem;
    margin-top: 0.4rem;
  }

  .wheel-region {
    align-items: center;
    padding-top: 0.2rem;
    padding-bottom: 2.8rem;
  }

  .bottom-wave {
    height: 12%;
  }
}

@media (max-height: 560px) and (orientation: landscape) {
  .tablet-canvas {
    padding: 0.5rem 0.75rem 0;
  }

  .screen-header {
    margin-top: 0.2rem;
  }

  .screen-header {
    min-height: 2.25rem;
  }

  .wheel-region {
    align-items: center;
    padding-top: 0;
    padding-bottom: 2.4rem;
  }

  .result-toast {
    top: 3.2rem;
    right: 0.75rem;
    width: min(240px, calc(100% - 1.5rem));
  }

  .status-banner {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .bottom-wave {
    height: 10%;
  }
}
</style>
