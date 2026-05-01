<template>
  <div class="result-shell" :class="[`result-shell--${winType || 'idle'}`, { 'result-shell--visible': visible }]">
    <template v-if="resultCopy">
      <div class="result-stage">
        <img
          class="result-card"
          :src="resultCopy.src"
          :alt="resultCopy.alt"
          fetchpriority="high"
          decoding="async"
        />
        <p class="result-typewriter" :key="winType + (visible ? 'on' : 'off')">
          <span
            v-for="(word, wi) in titleWords"
            :key="wi"
            class="result-typewriter__word"
          >
            <span
              v-for="(char, ci) in word.chars"
              :key="ci"
              class="result-typewriter__char"
              :style="{ animationDelay: `${0.55 + word.offset * 0.045 + ci * 0.045}s` }"
            >{{ char }}</span>
          </span>
        </p>
      </div>
    </template>
    <p v-else class="result-placeholder">Esperando resultado</p>
  </div>
</template>

<script>
const RESULT_COPY = Object.freeze({
  mainPrize: {
    title: "Olet voittanut!",
    alt: "Main prize",
    src: "/storytel-assets/win-cards/mainPrize.svg"
  },
  surpriseWin: {
    title: "Voitit yllätyspalkinnon!",
    alt: "Surprise prize",
    src: "/storytel-assets/win-cards/surpriseWin.svg"
  },
  giftCard3m: {
    title: "Voitit 3kk lahjakortin!",
    alt: "3 month gift card",
    src: "/storytel-assets/win-cards/giftCard3m.svg"
  },
  giftCard1m: {
    title: "Voitit 1kk lahjakortin!",
    alt: "1 month gift card",
    src: "/storytel-assets/win-cards/giftCard1m.svg"
  },
  repeat: {
    title: "Yritä uudelleen!",
    alt: "Try again",
    src: "/storytel-assets/win-cards/repeat.svg"
  }
});

export default {
  name: "WinColumn",
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
    titleChars() {
      return Array.from(this.resultCopy?.title || "");
    },
    titleWords() {
      let offset = 0;
      return (this.resultCopy?.title || "").split(" ").map((word) => {
        const entry = { chars: Array.from(word), offset };
        offset += word.length + 1;
        return entry;
      });
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
  transform: translateX(6vw);
  transition: opacity 0.5s ease 0.15s, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}

.result-shell--visible {
  opacity: 1;
  transform: translateX(0);
}

.result-stage {
  position: relative;
  display: inline-block;
}

.result-card {
  display: block;
  width: min(88%, 44vw, 460px);
  height: auto;
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.18));
  animation: card-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.result-typewriter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -48%);
  width: 66%;
  margin: 0;
  text-align: center;
  font-family: 'Storytel Euclid', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(1.4rem, 3.4vw, 2.6rem);
  line-height: 1.1;
  color: #2b353a;
}

.result-shell--surpriseWin .result-typewriter,
.result-shell--giftCard3m .result-typewriter,
.result-shell--giftCard1m .result-typewriter {
  color: #fdf1f0;
}

.result-typewriter__word {
  display: inline-block;
  white-space: nowrap;
}

.result-typewriter__word:not(:last-child)::after {
  content: '\00a0';
}

.result-typewriter__char {
  display: inline-block;
  opacity: 0;
  transform: translateY(6px);
  animation: typewriter-char 0.18s ease forwards;
}

@keyframes typewriter-char {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (orientation: landscape) {
  .result-card {
    width: min(88%, 40vw, 420px);
  }

  .result-typewriter {
    font-size: clamp(1.2rem, 2.8vw, 2.2rem);
  }
}
</style>
