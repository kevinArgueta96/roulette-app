<template>
  <div class="roulette-view">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />

    <transition name="slide-left">
      <img
        v-if="isPrizeHeroResult"
        class="prize-product prize-product--left"
        src="/parrano-assets/main-l.webp"
        alt="Parrano Robusto Wedge"
        loading="lazy"
        decoding="async"
      />
    </transition>

    <RouletteCompoment @showImg="onShowImg" />

    <transition name="slide-right">
      <img
        v-if="isPrizeHeroResult"
        class="prize-product prize-product--right"
        src="/parrano-assets/main-r.webp"
        alt="Parrano Robusto Powder"
        loading="lazy"
        decoding="async"
      />
    </transition>

    <transition name="fade-up">
      <div v-if="hasResult" class="result-label" :class="{ 'result-label--main': isPrizeHeroResult }">
        <template v-if="isPrizeHeroResult">
          <p class="result-label__main-title">{{ prizeHeroTitle }}</p>
        </template>
        <template v-else>
        <p class="result-label__eyebrow">{{ resultCopy.kicker }}</p>
        <p class="result-label__title">{{ resultCopy.title }}</p>
        </template>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
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
    ...mapGetters(["isMainPrizeActive"]),
    hasResult() {
      return Boolean(this.winType);
    },
    isMainPrizeResult() {
      return this.winType === "mainPrize";
    },
    isPrizeHeroResult() {
      return this.winType === "mainPrize" || this.winType === "surpriseWin" || this.winType === "noWin" || this.winType === "repeat";
    },
    prizeHeroTitle() {
      if (this.winType === "surpriseWin") return "Onnittelut!";
      if (this.winType === "noWin") return "Kiitos osallistumisesta!";
      if (this.winType === "repeat") return "Arki ansaitsee parempaa!";
      return "Olet voittanut!";
    },
    resultCopy() {
      return RESULT_CONFIG[this.winType] || {};
    }
  },
  beforeDestroy() {
    this.clearTimers();
    this.updateState({ mutationType: "setMainPrizeActive", payload: false });
    this.updateState({ mutationType: "setActiveHeroResultType", payload: "" });
  },
  methods: {
    ...mapActions(["updateState"]),
    onShowImg({ type }) {
      const result = RESULT_CONFIG[type];

      if (!result) {
        this.updateState({ mutationType: "setMainPrizeActive", payload: false });
        this.updateState({ mutationType: "setActiveHeroResultType", payload: "" });
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
        return;
      }

      this.clearTimers();
      this.winType = type;
      this.isVisibleConfetti = result.confetti;
      this.updateState({ mutationType: "setTimeToShowOptions", payload: result.duration });
      this.updateState({ mutationType: "setMainPrizeActive", payload: type === "mainPrize" || type === "surpriseWin" || type === "noWin" || type === "repeat" });
      this.updateState({ mutationType: "setActiveHeroResultType", payload: type });

      this.resultTimer = window.setTimeout(() => {
        this.resetResultState();
      }, result.duration);
    },
    resetResultState() {
      this.clearTimers();
      this.winType = "";
      this.isVisibleConfetti = false;
      this.updateState({ mutationType: "setMainPrizeActive", payload: false });
      this.updateState({ mutationType: "setActiveHeroResultType", payload: "" });
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

.result-label--main {
  top: 4.5rem;
  width: min(92%, 720px);
}

.result-label__main-title {
  margin: 0;
  font-family: "Lumios Marker", cursive;
  font-size: clamp(4rem, 9vw, 6.6rem);
  font-weight: 400;
  line-height: 0.88;
  letter-spacing: 0;
  color: #2e6a49;
  text-shadow: 0 4px 14px rgba(255, 255, 255, 0.55);
  animation: title-pop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change: transform, opacity;
}

@keyframes title-pop {
  from { opacity: 0; transform: scale(0.65) translateY(18px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
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
  bottom: 22%;
  z-index: 4;
  width: clamp(135px, 22%, 235px);
  height: auto;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22));
}

.prize-product--left {
  left: 0;
  transform-origin: center center;
  animation: float-left 3s ease-in-out 0.6s infinite;
  will-change: transform;
}

.prize-product--right {
  right: 0;
  width: clamp(190px, 31%, 360px);
  transform-origin: center center;
  animation: float-right 3s ease-in-out 0.9s infinite;
  will-change: transform;
}

@keyframes float-left {
  0%, 100% { transform: rotate(-8deg) translateY(0); }
  50%       { transform: rotate(-8deg) translateY(-10px); }
}

@keyframes float-right {
  0%, 100% { transform: rotate(8deg) translateY(0); }
  50%       { transform: rotate(8deg) translateY(-10px); }
}

/* slide-left — spring overshoot on enter, quick fade on leave */
.slide-left-enter-active {
  transition: opacity 0.48s ease, transform 0.52s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-left-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-left-enter {
  opacity: 0;
  transform: translateX(-72px) rotate(-13deg);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-55px) rotate(-13deg);
}

/* slide-right — spring overshoot on enter, quick fade on leave */
.slide-right-enter-active {
  transition: opacity 0.48s ease, transform 0.52s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-right-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-right-enter {
  opacity: 0;
  transform: translateX(72px) rotate(13deg);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(55px) rotate(13deg);
}

.fade-up-enter-active {
  transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (orientation: landscape) {
  .roulette-view {
    align-items: center;
    padding-top: 0.2rem;
    padding-bottom: 2.8rem;
  }

  .result-label--main {
    top: 2.2rem;
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

  .result-label--main {
    top: 3.4rem;
  }

  .result-label__main-title {
    font-size: clamp(2.8rem, 7.5vw, 5rem);
  }

  .prize-product {
    width: clamp(112px, 20%, 190px);
    bottom: 18%;
  }

  .prize-product--right {
    width: clamp(155px, 28%, 285px);
  }
}
</style>
