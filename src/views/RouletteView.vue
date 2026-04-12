<template>
  <div class="roulette-view">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />

    <transition name="slide-left">
      <img
        v-if="winType === 'mainPrize' || winType === 'surpriseWin'"
        class="prize-product prize-product--left"
        :src="winType === 'mainPrize' ? '/parrano-assets/main-l.png' : '/parrano-assets/wedge.png'"
        alt="Parrano Robusto Wedge"
      />
    </transition>

    <RouletteCompoment @showImg="onShowImg" />

    <transition name="slide-right">
      <img
        v-if="winType === 'mainPrize' || winType === 'surpriseWin'"
        class="prize-product prize-product--right"
        :src="winType === 'mainPrize' ? '/parrano-assets/main-r.png' : '/parrano-assets/powder.png'"
        alt="Parrano Robusto Powder"
      />
    </transition>

    <transition name="fade-up">
      <div v-if="hasResult" class="result-label">
        <p class="result-label__eyebrow">{{ resultCopy.kicker }}</p>
        <p class="result-label__title">{{ resultCopy.title }}</p>
      </div>
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

.result-label {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  text-align: center;
  pointer-events: none;
}

.result-label__eyebrow {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: #1f5a3f;
  font-weight: 800;
}

.result-label__title {
  margin: 0.15rem 0 0;
  color: #1d2b22;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.7);
}

.prize-product {
  position: absolute;
  bottom: 12%;
  z-index: 4;
  width: clamp(110px, 18%, 200px);
  height: auto;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22));
}

.prize-product--left {
  left: 0;
}

.prize-product--right {
  right: 0;
  width: clamp(170px, 28%, 320px);
}

/* slide-left transition */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.slide-left-enter,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}

/* slide-right transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.slide-right-enter,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(60px);
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

  .prize-product {
    width: clamp(80px, 14%, 140px);
    bottom: 8%;
  }

  .prize-product--right {
    width: clamp(130px, 22%, 220px);
  }
}

@media (max-width: 900px) {
  .roulette-view {
    padding-top: 4.6rem;
  }

  .prize-product {
    width: clamp(90px, 16%, 160px);
  }

  .prize-product--right {
    width: clamp(130px, 24%, 240px);
  }
}
</style>
