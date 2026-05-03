<template>
  <div class="result-shell" :class="[`result-shell--${winType || 'idle'}`, { 'result-shell--visible': visible }]">
    <template v-if="resultCopy">
      <div class="result-stage">
        <img
          class="result-card"
          :key="resultImageKey"
          :src="resultImageSrc"
          :alt="resultCopy.alt"
          fetchpriority="high"
          decoding="async"
        />
      </div>
    </template>
    <p v-else class="result-placeholder">Esperando resultado</p>
  </div>
</template>

<script>
const RESULT_COPY = Object.freeze({
  mainPrize: {
    alt: "Paapalkinto",
    src: "/storytel-assets/animations-wins/big-prize.svg"
  },
  surpriseWin: {
    alt: "Yllatyspalkinto",
    src: "/storytel-assets/animations-wins/small-prize.svg"
  },
  giftCard3m: {
    alt: "3kk lahjakortti",
    src: "/storytel-assets/animations-wins/3-months-free.svg"
  },
  giftCard1m: {
    alt: "1kk lahjakortti",
    src: "/storytel-assets/animations-wins/3-months-free.svg"
  },
  repeat: {
    alt: "Kokeile uudestaan",
    src: "/storytel-assets/animations-wins/try-again.svg"
  }
});

let animationSequence = 0;

export default {
  name: "WinColumn",
  data() {
    return {
      animationRunId: ""
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    winType: {
      type: String,
      default: ""
    }
  },
  computed: {
    resultCopy() {
      return RESULT_COPY[this.winType] || null;
    },
    resultImageKey() {
      return `${this.winType}-${this.animationRunId}`;
    },
    resultImageSrc() {
      if (!this.resultCopy) return "";
      return `${this.resultCopy.src}?run=${this.animationRunId}`;
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(isVisible) {
        if (isVisible && this.resultCopy) {
          this.animationRunId = `${Date.now()}-${animationSequence += 1}`;
        }
      }
    },
    winType(nextType, previousType) {
      if (this.visible && nextType && nextType !== previousType) {
        this.animationRunId = `${Date.now()}-${animationSequence += 1}`;
      }
    }
  }
};
</script>

<style scoped>
.result-shell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.58s cubic-bezier(0.22, 1, 0.36, 1) 0.08s;
}

.result-shell--visible {
  opacity: 1;
}

.result-stage {
  position: relative;
  display: inline-block;
  width: min(100%, calc((var(--app-height, 100vh) - var(--storytel-wheel-top-offset, 9rem) - 2rem) * 1), 48vw, min(86vh, 980px));
  animation: result-float 3.8s ease-in-out 1s infinite;
}

.result-card {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.18));
  animation: card-pop 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes card-pop-main {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-4deg);
  }
  65% {
    opacity: 1;
    transform: scale(1.08) rotate(1deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes result-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-13px);
  }
}

.result-shell--mainPrize .result-card {
  animation: card-pop-main 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@media (orientation: landscape) {
  .result-stage {
    width: min(100%, calc((var(--app-height, 100vh) - var(--storytel-wheel-top-offset, 9rem) - 2rem) * 1), 48vw, min(86vh, 980px));
  }
}
</style>
