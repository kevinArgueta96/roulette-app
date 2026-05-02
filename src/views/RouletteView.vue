<template>
  <div class="roulette-view" :class="{ 'roulette-view--storytel': isStorytel }">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" :variant="confettiVariant" :origin="confettiOrigin" />

    <!-- Storytel: structured two-column hero layout -->
    <div v-if="isStorytel" class="storytel-stage" :class="{ 'storytel-stage--hero': hasResult }">
      <div class="storytel-stage__left">
        <RouletteCompoment ref="storytelRoulette" @showImg="onShowImg" />
      </div>
      <transition name="win-reveal">
        <div v-if="hasResult" class="storytel-stage__right">
          <WinRowComponent :win-type="winType" :visible="hasResult" />
        </div>
      </transition>
    </div>

    <!-- Parrano: original layout -->
    <template v-if="!isStorytel">
      <RouletteCompoment @showImg="onShowImg" />

      <transition name="write-reveal">
        <div v-if="hasResult" class="result-label" :class="{ 'result-label--main': isPrizeHeroResult }">
          <template v-if="isPrizeHeroResult">
            <p class="result-label__main-title" :class="heroTitleSizeClass">{{ prizeHeroTitle }}</p>
          </template>
          <template v-else>
            <p class="result-label__eyebrow">{{ resultCopy.kicker }}</p>
            <p class="result-label__title">{{ resultCopy.title }}</p>
          </template>
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import RouletteCompoment from "@/components/RouletteCompoment.vue";
import ConfettiComponent from "@/components/ConfettiComponent.vue";
import WinRowComponent from "@/components/WinRowComponent.vue";

const RESULT_CONFIG = {
  repeat: {
    duration: 6000,
    confetti: false,
    kicker: "Repeat",
    title: "Arki ansaitsee parempaa!",
    description: "Saat uuden mahdollisuuden."
  },
  mainPrize: {
    duration: 12000,
    confetti: true,
    kicker: "Main prize",
    title: "Olet voittanut!",
    description: "Pääpalkinto osui kohdalleen."
  },
  surpriseWin: {
    duration: 11000,
    confetti: false,
    kicker: "Surprise win",
    title: "Onnittelut!",
    description: "Voitit yllätyspalkinnon."
  },
  giftCard3m: {
    duration: 11000,
    confetti: false,
    kicker: "Gift card 3 months",
    title: "Onnittelut!",
    description: "Voitit 3kk lahjakortin."
  },
  giftCard1m: {
    duration: 11000,
    confetti: true,
    kicker: "Gift card 1 month",
    title: "Onnittelut!",
    description: "Voitit 1kk lahjakortin."
  },
  noWin: {
    duration: 7000,
    confetti: false,
    kicker: "No win",
    title: "Kiitos osallistumisesta!",
    description: "Tämä sektori ei anna palkintoa."
  }
};

export default {
  name: "RouletteView",
  components: { RouletteCompoment, ConfettiComponent, WinRowComponent },
  data() {
    return {
      winType: "",
      confettiVariant: "",
      confettiOrigin: null,
      isVisibleConfetti: false,
      resultTimer: null,
      heroDelayTimer: null,
      confettiDelayTimer: null
    };
  },
  computed: {
    ...mapGetters(["isMainPrizeActive"]),
    isStorytel() {
      return process.env.VUE_APP_THEME === "storytel";
    },
    hasResult() {
      return Boolean(this.winType);
    },
    isMainPrizeResult() {
      return this.winType === "mainPrize";
    },
    isPrizeHeroResult() {
      return Boolean(RESULT_CONFIG[this.winType]);
    },
    prizeHeroTitle() {
      return RESULT_CONFIG[this.winType]?.title || "Olet voittanut!";
    },
    heroTitleSizeClass() {
      const len = (this.prizeHeroTitle || "").length;
      if (len <= 12) return "result-label__main-title--xl";
      if (len <= 16) return "result-label__main-title--lg";
      return "result-label__main-title--md";
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
    captureWheelCenter() {
      const root = this.$refs.storytelRoulette?.$el || this.$el;
      const stage = root.querySelector(".wheel-stage");
      const rect = stage?.getBoundingClientRect();

      if (!rect) {
        return {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
      }

      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    },
    onShowImg({ type }) {
      const result = RESULT_CONFIG[type];

      if (!result) {
        this.updateState({ mutationType: "setMainPrizeActive", payload: false });
        this.updateState({ mutationType: "setActiveHeroResultType", payload: "" });
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
        return;
      }

      this.clearTimers();

      if (this.isStorytel && type === "mainPrize") {
        this.updateState({ mutationType: "setTimeToShowOptions", payload: result.duration });
        this.confettiDelayTimer = window.setTimeout(() => {
          this.confettiOrigin = this.captureWheelCenter();
          this.confettiVariant = type;
          this.isVisibleConfetti = result.confetti;

          this.heroDelayTimer = window.setTimeout(() => {
            this.showResult(type, result);
          }, 1200);
        }, 280);
        return;
      }

      this.confettiVariant = type;
      this.isVisibleConfetti = result.confetti;
      this.updateState({ mutationType: "setTimeToShowOptions", payload: result.duration });

      this.showResult(type, result);
    },
    showResult(type, result) {
      this.winType = type;
      this.updateState({ mutationType: "setMainPrizeActive", payload: Boolean(RESULT_CONFIG[type]) });
      this.updateState({ mutationType: "setActiveHeroResultType", payload: type });

      this.resultTimer = window.setTimeout(() => {
        this.resetResultState();
      }, result.duration);
    },
    resetResultState() {
      this.clearTimers();
      this.winType = "";
      this.confettiVariant = "";
      this.confettiOrigin = null;
      this.isVisibleConfetti = false;
      this.$nextTick(() => {
        this.$refs.storytelRoulette?.handleResize?.();
      });
      this.updateState({ mutationType: "setMainPrizeActive", payload: false });
      this.updateState({ mutationType: "setActiveHeroResultType", payload: "" });
      window.setTimeout(() => {
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
      }, 700);
    },
    clearTimers() {
      if (this.resultTimer) {
        window.clearTimeout(this.resultTimer);
        this.resultTimer = null;
      }
      if (this.heroDelayTimer) {
        window.clearTimeout(this.heroDelayTimer);
        this.heroDelayTimer = null;
      }
      if (this.confettiDelayTimer) {
        window.clearTimeout(this.confettiDelayTimer);
        this.confettiDelayTimer = null;
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

.roulette-view--storytel {
  align-items: center;
  padding: 0 0 clamp(2.4rem, 8vh, 4rem);
}

/* Storytel two-column hero stage */
.storytel-stage {
  position: relative;
  align-self: stretch;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  align-items: center;
  min-height: 0;
}

.storytel-stage--hero {
  grid-template-columns: 1fr 1fr;
}

.storytel-stage--hero .storytel-stage__left {
  padding: clamp(2rem, 8vh, 5.7rem) clamp(0.4rem, 1.2vw, 1rem) 0 clamp(2rem, 9vw, 6.5rem);
}

.storytel-stage--hero .storytel-stage__right {
  padding: clamp(1.2rem, 5vh, 3.4rem) clamp(2rem, 6vw, 4.5rem) 0 clamp(0.4rem, 1.2vw, 1rem);
}

.storytel-stage__left {
  grid-column: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 0;
  padding: 0 clamp(0.5rem, 1.5vw, 1.5rem) 0 clamp(0.75rem, 2.5vw, 2.5rem);
  transform: translateX(0);
  transition:
    padding 0.86s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.86s cubic-bezier(0.22, 1, 0.36, 1);
}

.storytel-stage__right {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 0;
  padding: 0 clamp(0.75rem, 2.5vw, 2.5rem) 0 clamp(0.5rem, 1.5vw, 1.5rem);
}

.win-reveal-enter-active,
.win-reveal-leave-active {
  transition:
    opacity 0.62s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
}

.win-reveal-leave-active {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
}

.win-reveal-enter,
.win-reveal-leave-to {
  opacity: 0;
  transform: translateX(18px) scale(0.985);
}

.result-label {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  text-align: center;
  pointer-events: none;
}

.result-label--main {
  top: 4.5rem;
  width: min(92%, 720px);
}

.result-label__main-title {
  margin: 0;
  display: inline-block;
  font-family: "Lumios Marker", cursive;
  font-size: clamp(4rem, 9vw, 6.6rem);
  font-weight: 400;
  line-height: 0.88;
  letter-spacing: 0;
  color: var(--color-primary-soft);
  text-shadow: 0 4px 14px rgba(var(--rgb-panel), 0.55);
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  animation: handwriting-reveal 0.92s cubic-bezier(0.2, 0.84, 0.22, 1) 0.84s forwards;
  will-change: clip-path, opacity;
}

@keyframes handwriting-reveal {
  0% {
    opacity: 0.38;
    clip-path: inset(0 100% 0 0);
  }

  12% {
    opacity: 1;
  }

  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

.result-label__eyebrow {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: var(--color-primary);
  font-weight: 800;
}

.result-label__title {
  margin: 0.15rem 0 0;
  color: var(--color-text);
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(var(--rgb-panel), 0.7);
}


.write-reveal-enter-active {
  transition: opacity 0.24s ease 0.76s;
}

.write-reveal-leave-active {
  transition: opacity 0.18s ease;
  animation: none !important;
  clip-path: inset(0 0 0 0);
}

.write-reveal-enter,
.write-reveal-leave-to {
  opacity: 0;
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

  .roulette-view--storytel {
    padding-bottom: clamp(2.6rem, 8vh, 4rem);
  }
}

@media (max-height: 560px) and (orientation: landscape) {
  .roulette-view {
    padding-top: 0;
    padding-bottom: 2.4rem;
  }

  .roulette-view--storytel {
    padding-bottom: clamp(2.2rem, 7vh, 3.2rem);
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

  .roulette-view--storytel {
    padding-top: 0;
    padding-bottom: clamp(3rem, 9vh, 5rem);
  }
}

@media (orientation: portrait) and (min-height: 900px) {
  .roulette-view {
    padding-top: 1.5rem;
  }

  .result-label--main {
    top: clamp(8rem, 12%, 14rem);
  }
}

@media (min-width: 768px) and (orientation: portrait) and (min-height: 900px) {
  .roulette-view {
    align-items: center;
    padding-top: 0;
    padding-bottom: 2rem;
  }

  .result-label {
    top: clamp(8rem, 16%, 14rem);
  }

  .result-label--main {
    top: 5rem;
  }

  .result-label__main-title--xl {
    font-size: clamp(4.3rem, 8.55vw, 6.4rem);
  }

  .result-label__main-title--lg {
    font-size: clamp(3.9rem, 7.65vw, 6rem);
  }

  .result-label__main-title--md {
    font-size: clamp(3.25rem, 6.85vw, 5.15rem);
  }

  .result-label__eyebrow {
    font-size: 0.9rem;
  }

  .result-label__title {
    font-size: 2rem;
    white-space: normal;
  }
}

@media (min-width: 1000px) and (orientation: portrait) and (min-height: 1300px) {
  .result-label--main {
    top: 7rem;
  }

  .result-label__main-title--xl {
    font-size: clamp(5.2rem, 8.6vw, 7.35rem);
  }

  .result-label__main-title--lg {
    font-size: clamp(4.85rem, 8.05vw, 6.85rem);
  }

  .result-label__main-title--md {
    font-size: clamp(4.5rem, 7.7vw, 6.35rem);
  }
}
</style>
