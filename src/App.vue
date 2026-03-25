<template>
  <div id="app" class="app-shell">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />

    <div class="screen-title">ROULETTE LAHJAKASSI</div>

    <main class="device-shell">
      <div class="device-frame">
        <section class="device-screen">
          <header class="screen-header">
            <div class="brand">Parrano</div>
            <button class="menu-button" type="button" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </header>

          <section class="roulette-stage">
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

          <div class="bottom-wave"></div>
        </section>
      </div>
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
    this.loadInitialData();
  },
  beforeDestroy() {
    this.clearTimers();
  },
  methods: {
    ...mapActions(["initializeRandomAngle", "hydrateBootstrapData", "updateState"]),
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
  min-height: 100vh;
  background: #f7f1df;
  padding: 1rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen-title {
  width: 100%;
  max-width: 520px;
  color: #1f5a3f;
  font-size: clamp(2rem, 4.5vw, 3.3rem);
  font-weight: 900;
  letter-spacing: 0.02em;
  text-align: center;
  margin-bottom: 0.8rem;
}

.device-shell {
  width: 100%;
  display: flex;
  justify-content: center;
}

.device-frame {
  width: min(100%, 430px);
  background: #0f0f0f;
  border-radius: 2rem;
  padding: 0.9rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
}

.device-screen {
  position: relative;
  min-height: 760px;
  overflow: hidden;
  border-radius: 1.5rem;
  background: #f7f1df;
  padding: 1.5rem 1.4rem 2.2rem;
}

.screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  color: #1f5a3f;
  font-size: 1.9rem;
  font-weight: 700;
  font-style: italic;
}

.menu-button {
  background: transparent;
  border: 0;
  padding: 0.3rem;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.menu-button span {
  width: 18px;
  height: 2px;
  background: #1f5a3f;
  display: block;
  border-radius: 999px;
}

.roulette-stage {
  position: relative;
  z-index: 2;
  margin-top: 1.2rem;
}

.result-toast {
  position: relative;
  z-index: 3;
  margin: 1rem auto 0;
  width: min(100%, 280px);
  border-radius: 1rem;
  padding: 0.95rem 1rem;
  text-align: center;
  background: rgba(255, 251, 243, 0.96);
  border: 2px solid rgba(205, 174, 104, 0.62);
  box-shadow: 0 16px 28px rgba(45, 53, 40, 0.1);
}

.result-toast--mainPrize {
  background: #fff2bf;
}

.result-toast--surpriseWin {
  background: #fff0e4;
}

.result-toast--repeat {
  background: #eceae3;
}

.result-toast--noWin {
  background: #edf6eb;
}

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
  font-size: 1.6rem;
  line-height: 1;
}

.result-toast p:last-child {
  margin: 0.55rem 0 0;
  color: rgba(29, 43, 34, 0.82);
}

.status-banner {
  position: relative;
  z-index: 3;
  margin-top: 0.8rem;
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
  z-index: 5;
  display: grid;
  place-items: center;
  gap: 0.6rem;
  background: rgba(247, 241, 223, 0.92);
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
  left: -6%;
  right: -6%;
  bottom: -120px;
  height: 250px;
  background: #2e5e39;
  border-radius: 50% 50% 0 0;
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
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .device-screen {
    min-height: 680px;
    padding-inline: 1rem;
  }

  .brand {
    font-size: 1.55rem;
  }
}
</style>
