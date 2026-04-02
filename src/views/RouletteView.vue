<template>
  <div class="roulette-view">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />

    <RouletteCompoment @showImg="onShowImg" />

    <transition name="fade-up">
      <section v-if="hasResult" class="result-toast" :class="`result-toast--${winType}`">
        <p class="result-toast__eyebrow">{{ resultCopy.kicker }}</p>
        <h2>{{ resultCopy.title }}</h2>
        <p>{{ resultCopy.description }}</p>
      </section>
    </transition>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import RouletteCompoment from "@/components/RouletteCompoment.vue";
import ConfettiComponent from "@/components/ConfettiComponent.vue";

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
  name: "RouletteView",
  components: { RouletteCompoment, ConfettiComponent },
  data() {
    return {
      winType: "",
      isVisibleConfetti: false,
      resultTimer: null
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
  beforeDestroy() {
    this.clearTimers();
  },
  methods: {
    ...mapActions(["updateState"]),
    onShowImg({ type }) {
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
.roulette-view {
  position: relative;
  width: 100%;
  height: 100%;
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

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (orientation: landscape) {
  .roulette-view {
    align-items: center;
    padding-top: 0.2rem;
    padding-bottom: 2.8rem;
  }
}

@media (max-height: 560px) and (orientation: landscape) {
  .roulette-view {
    padding-top: 0;
    padding-bottom: 2.4rem;
  }

  .result-toast {
    top: 3.2rem;
    right: 0.75rem;
    width: min(240px, calc(100% - 1.5rem));
  }
}

@media (max-width: 900px) {
  .roulette-view {
    padding-top: 4.6rem;
  }

  .result-toast {
    right: 1rem;
    top: 4.4rem;
    width: min(260px, calc(100% - 2rem));
  }
}
</style>
