<template>
  <div class="roulette-shell">
    <div class="pointer-wrap">
      <div class="wheel-pointer"></div>
    </div>

    <div
      ref="containerCircule"
      class="wheel-stage"
      role="button"
      tabindex="0"
      aria-label="Spin roulette"
      @click="handleWheelInteraction"
      @keyup.enter.prevent="spin"
      @keyup.space.prevent="spin"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <canvas ref="myCanvas" class="wheel-canvas"></canvas>

      <div class="wheel-center" :style="wheelCenterStyle">
        <div class="wheel-center__ring">
          <div class="wheel-center__logo">Parrano</div>
        </div>
      </div>
    </div>

    <button class="spin-button" type="button" :disabled="!canSpin" @click="spin">
      {{ isSpinning ? "PYÖRII..." : "PYÖRÄHDYS" }}
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";
import {
  formatTime24h,
  isTimeWithinRange,
  pickWeightedIndex,
  RESULT_BY_INDEX,
  FALLBACK_INDEX,
  buildForcedOptions,
  buildNextTotals,
  getTargetDegreesForIndex
} from "@/utils";
import {
  sectorsRoulette,
  colorsSectorRoulette,
  textDefaultRouletteStyle,
  textTeslaRouletteStyle
} from "@/config/config-roulette.js";

const FULL_SPINS = 6;
const SPIN_DURATION = 4600;
const STRESS_TEST_DURATION = 650;
const SWIPE_THRESHOLD = 36;

export default {
  name: "RouletteCompoment",
  data() {
    return {
      startAngle: 0,
      canvasSize: 320,
      canvas: null,
      ctx: null,
      resizeObserver: null,
      resizeRaf: null,
      resizeTimeout: null,
      animationFrame: null,
      isSpinning: false,
      pendingResize: false,
      touchStartX: 0,
      touchStartY: 0,
      stressTest: {
        active: false,
        total: 0,
        completed: 0,
        duration: STRESS_TEST_DURATION
      }
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
      "totalSpin",
      "initialAngle",
      "spinRoullete"
    ]),
    arc() {
      return (Math.PI * 2) / sectorsRoulette.length;
    },
    center() {
      return this.canvasSize / 2;
    },
    outerRadius() {
      return this.canvasSize * 0.468;
    },
    innerRadius() {
      return 0;
    },
    textRadius() {
      return this.canvasSize * 0.31;
    },
    borderWidth() {
      return Math.max(7, this.canvasSize * 0.014);
    },
    defaultFontSize() {
      return Math.max(12, this.canvasSize * 0.026);
    },
    teslaFontSize() {
      return Math.max(15, this.canvasSize * 0.034);
    },
    canSpin() {
      return this.spinRoullete && !this.isSpinning;
    },
    wheelCenterStyle() {
      return {
        transform: `translate(-50%, -50%) rotate(${this.startAngle}rad)`
      };
    },
    currentTotals() {
      return {
        totalReplay: this.totalReplay,
        totalSpecialPrice: this.totalSpecialPrice,
        totalSpecialSurprise: this.totalSpecialSurprise,
        totalTopPrice: this.totalTopPrice,
        totalGiftCard: this.totalGiftCard,
        totalSpin: this.totalSpin
      };
    }
  },
  mounted() {
    this.startAngle = this.normalizeRadians(this.initialAngle || 0);
    this.initializeCanvas();
    this.observeResize();
    this.registerDebugApi();
    document.addEventListener("keyup", this.spinRoulleteByEnter);
    window.addEventListener("orientationchange", this.handleOrientationChange, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.handleResize, { passive: true });
    }
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.spinRoulleteByEnter);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("orientationchange", this.handleOrientationChange);
    this.unregisterDebugApi();
    this.stopAnimation();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.resizeRaf) {
      window.cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = null;
    }

    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", this.handleResize);
    }
  },
  methods: {
    ...mapActions(["updateState"]),
    initializeCanvas() {
      this.canvas = this.$refs.myCanvas;
      this.ctx = this.canvas.getContext("2d");
      this.updateCanvasSize();
    },
    observeResize() {
      if (!window.ResizeObserver) {
        window.addEventListener("resize", this.handleResize);
        return;
      }

      this.resizeObserver = new window.ResizeObserver(() => {
        this.handleResize();
      });

      this.resizeObserver.observe(this.$refs.containerCircule);
    },
    handleResize() {
      if (this.isSpinning) {
        this.pendingResize = true;
        return;
      }

      if (this.resizeRaf) {
        window.cancelAnimationFrame(this.resizeRaf);
      }

      this.resizeRaf = window.requestAnimationFrame(() => {
        this.updateCanvasSize();
      });
    },
    handleOrientationChange() {
      this.handleResize();

      if (this.resizeTimeout) {
        window.clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = window.setTimeout(() => {
        this.handleResize();
      }, 250);
    },
    updateCanvasSize() {
      if (!this.canvas || !this.ctx) {
        return;
      }

      const container = this.$refs.containerCircule;
      if (!container) {
        return;
      }

      const bounds = container.getBoundingClientRect();
      const availableWidth = Math.max(0, bounds.width);
      const availableHeight = Math.max(0, bounds.height);
      const proportionalSize = Math.min(availableWidth, availableHeight) * 0.98;
      const nextSize = Math.max(220, Math.floor(proportionalSize));
      const devicePixelRatio = window.devicePixelRatio || 1;

      if (!nextSize) {
        return;
      }

      this.canvasSize = nextSize;
      this.canvas.width = nextSize * devicePixelRatio;
      this.canvas.height = nextSize * devicePixelRatio;
      this.canvas.style.width = `${nextSize}px`;
      this.canvas.style.height = `${nextSize}px`;
      this.resetCanvasState(devicePixelRatio);
      this.drawRouletteWheel();
    },
    resetCanvasState(devicePixelRatio = window.devicePixelRatio || 1) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    },
    spinRoulleteByEnter(event) {
      const isSpace = event.key === " " || event.code === "Space";
      if (event.key !== "Enter" && !isSpace) {
        return;
      }
      event.preventDefault();
      this.spin();
    },
    handleWheelInteraction() {
      this.spin();
    },
    handleTouchStart(event) {
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    },
    handleTouchEnd(event) {
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD || Math.abs(deltaY) >= SWIPE_THRESHOLD) {
        this.spin();
      }
    },
    drawRouletteWheel() {
      if (!this.ctx) return;

      this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

      this.ctx.beginPath();
      this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 2.1, 0, Math.PI * 2);
      this.ctx.fillStyle = "#d9bf74";
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 1.3, 0, Math.PI * 2);
      this.ctx.fillStyle = "#c9a353";
      this.ctx.fill();

      sectorsRoulette.forEach((sector, index) => {
        const angle = this.startAngle + index * this.arc;
        const halfArc = angle + this.arc / 2;
        const lines = this.getSectorLines(sector);
        const isMainPrize = index === 7;
        const fontSize = isMainPrize ? this.teslaFontSize : this.defaultFontSize;
        const lineHeight = fontSize * 1.02;
        const textOffset = ((lines.length - 1) * lineHeight) / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(this.center, this.center);
        this.ctx.arc(this.center, this.center, this.outerRadius, angle, angle + this.arc, false);
        this.ctx.closePath();
        this.ctx.fillStyle = colorsSectorRoulette[index];
        this.ctx.fill();
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.strokeStyle = colorsSectorRoulette[index];
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.translate(
          this.center + Math.cos(halfArc) * this.textRadius,
          this.center + Math.sin(halfArc) * this.textRadius
        );
        this.ctx.rotate(halfArc);
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = this.getTextColor(index);
        this.ctx.font = `${isMainPrize ? textTeslaRouletteStyle.fontWeight : textDefaultRouletteStyle.fontWeight} ${fontSize}px ${isMainPrize ? textTeslaRouletteStyle.fontFamily : textDefaultRouletteStyle.fontFamily}`;

        lines.forEach((line, lineIndex) => {
          this.ctx.fillText(line, 0, lineIndex * lineHeight - textOffset);
        });

        this.ctx.restore();
      });

      
    },
    getSectorLines(sector) {
      if (typeof sector === "string") {
        const compact = sector.replace("KOKEILE UUDESTAAN", "KOKEILE\nUUDESTAAN");
        return compact.split("\n");
      }
      return Object.values(sector);
    },
    getTextColor(index) {
      return [0, 1, 3, 5, 7, 9, 11].includes(index)
        ? "#f6edd1"
        : "#2d5b38";
    },
    spin(spinConfig = {}) {
      if (!this.canSpin) return;

      const winnerIndex = typeof spinConfig.winnerIndex === "number"
        ? spinConfig.winnerIndex
        : this.generateNumberToShow();

      if (typeof winnerIndex !== "number") {
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
        if (typeof spinConfig.onComplete === "function") spinConfig.onComplete(false);
        return;
      }

      const currentAngle = this.normalizeRadians(this.startAngle);
      const targetAngle = this.calculateTargetAngle(winnerIndex, currentAngle);
      const startTime = performance.now();
      const duration = Math.max(200, Number(spinConfig.duration) || SPIN_DURATION);

      this.isSpinning = true;
      this.updateState({ mutationType: "setSpinRoullete", payload: false });

      const animate = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.startAngle = currentAngle + (targetAngle - currentAngle) * eased;
        this.drawRouletteWheel();

        if (progress < 1) {
          this.animationFrame = window.requestAnimationFrame(animate);
          return;
        }

        this.finishSpin(winnerIndex, spinConfig);
      };

      this.animationFrame = window.requestAnimationFrame(animate);
    },
    finishSpin(winnerIndex, spinConfig = {}) {
      this.stopAnimation();
      this.startAngle = this.normalizeRadians(this.startAngle);
      this.drawRouletteWheel();
      this.updateState({ mutationType: "setInitialAngle", payload: this.startAngle });

      if (this.pendingResize) {
        this.pendingResize = false;
        this.updateCanvasSize();
      }

      if (!spinConfig.skipPersist) {
        this.persistSpinResult(winnerIndex).catch(() => null);
      }

      if (spinConfig.skipResult) {
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
      } else {
        this.$emit("showImg", { type: RESULT_BY_INDEX[winnerIndex] || RESULT_BY_INDEX[FALLBACK_INDEX] });
      }

      if (typeof spinConfig.onComplete === "function") spinConfig.onComplete(true);
    },
    stopAnimation() {
      if (this.animationFrame) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      this.isSpinning = false;
    },
    async runCanvasStressTest(iterations = 300, duration = STRESS_TEST_DURATION) {
      if (this.stressTest.active || this.isSpinning) return false;
      const totalIterations = Math.max(1, Number(iterations) || 300);
      const spinDuration = Math.max(200, Number(duration) || STRESS_TEST_DURATION);
      this.stressTest = { active: true, total: totalIterations, completed: 0, duration: spinDuration };

      for (let step = 0; step < totalIterations; step += 1) {
        if (!this.stressTest.active) break;
        const randomIndex = Math.floor(Math.random() * sectorsRoulette.length);
        await new Promise((resolve) => {
          this.spin({ winnerIndex: randomIndex, duration: spinDuration, skipPersist: true, skipResult: true, onComplete: resolve });
        });
        this.stressTest.completed = step + 1;
      }

      const wasCompleted = this.stressTest.completed === this.stressTest.total;
      this.stressTest = { active: false, total: 0, completed: 0, duration: spinDuration };
      return wasCompleted;
    },
    stopCanvasStressTest() {
      this.stressTest = { active: false, total: 0, completed: 0, duration: STRESS_TEST_DURATION };
    },
    registerDebugApi() {
      if (typeof window === "undefined") return;
      window.__rouletteDebug = {
        spinTo: (index) => this.spin({ winnerIndex: Number(index) }),
        runCanvasStressTest: (iterations = 300, duration = STRESS_TEST_DURATION) => this.runCanvasStressTest(iterations, duration),
        stopCanvasStressTest: () => this.stopCanvasStressTest(),
        getState: () => ({ isSpinning: this.isSpinning, canvasSize: this.canvasSize, pendingResize: this.pendingResize, stressTest: { ...this.stressTest } })
      };
    },
    unregisterDebugApi() {
      if (typeof window === "undefined") return;
      if (window.__rouletteDebug) delete window.__rouletteDebug;
    },
    calculateTargetAngle(winnerIndex, currentAngle) {
      const currentDegrees = this.toDegrees(this.normalizeRadians(currentAngle));
      const targetDegrees = getTargetDegreesForIndex(winnerIndex, this.arc);
      const delta = this.normalizeDegrees(targetDegrees - currentDegrees) + FULL_SPINS * 360;
      return currentAngle + this.toRadians(delta);
    },
    generateNumberToShow() {
      const forcedConfiguration = this.generateProbabilityPriceByScheduler();
      const probabilities = Array.isArray(forcedConfiguration) ? forcedConfiguration : this.options;
      return pickWeightedIndex(probabilities, FALLBACK_INDEX);
    },
    async updateWinnerChoice({ typeWinner, positionWinner }) {
      switch (typeWinner) {
        case "card": {
          const nextGiftCards = this.giftCards.map((item) => item.position === positionWinner ? { ...item, given: true } : item);
          this.updateState({ mutationType: "setGiftCards", payload: nextGiftCards });
          await service.setGiftCards(nextGiftCards);
          return;
        }
        case "topPrice": {
          const nextTopPrices = this.topPrices.map((item) => item.position === positionWinner ? { ...item, given: true } : item);
          this.updateState({ mutationType: "setTopPrices", payload: nextTopPrices });
          await service.setTopPrices(nextTopPrices);
          return;
        }
        case "teslaWin": {
          const nextTeslaPrices = this.teslaPrices.map((item) => item.position === positionWinner ? { ...item, given: true } : item);
          this.updateState({ mutationType: "setTeslaPrices", payload: nextTeslaPrices });
          await service.setTeslaWinService(nextTeslaPrices);
          return;
        }
        default:
          return;
      }
    },
    generateProbabilityPriceByScheduler() {
      const scheduledPrizes = [...this.giftCards, ...this.topPrices, ...this.teslaPrices];
      const currentTime = formatTime24h();
      const scheduledWinner = scheduledPrizes.find((item) => item && item.given === false && isTimeWithinRange(currentTime, item.rangeDown, item.rangeTop));
      if (!scheduledWinner) return null;
      this.updateWinnerChoice({ typeWinner: scheduledWinner.type, positionWinner: scheduledWinner.position }).catch(() => null);
      return buildForcedOptions(scheduledWinner.type);
    },
    async persistSpinResult(winnerIndex) {
      const totals = buildNextTotals(this.currentTotals, winnerIndex);
      const mutationMap = {
        totalReplay: "setTotalReplay",
        totalSpecialPrice: "setTotalSpecialPrice",
        totalSpecialSurprise: "setTotalSpecialSurprise",
        totalTopPrice: "setTotalTopPrice",
        totalGiftCard: "setTotalGiftCard",
        totalSpin: "setTotalSpin"
      };
      Object.keys(mutationMap).forEach((key) => {
        this.updateState({ mutationType: mutationMap[key], payload: totals[key] });
      });
      await service.saveTotals(totals);
    },
    normalizeRadians(angle) {
      const fullTurn = Math.PI * 2;
      const normalized = angle % fullTurn;
      return normalized < 0 ? normalized + fullTurn : normalized;
    },
    normalizeDegrees(angle) {
      const normalized = angle % 360;
      return normalized < 0 ? normalized + 360 : normalized;
    },
    toDegrees(angle) {
      return (angle * 180) / Math.PI;
    },
    toRadians(angle) {
      return (angle * Math.PI) / 180;
    }
  }
};
</script>

<style scoped>
.roulette-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.55rem;
  padding-top: 4rem;
}

.pointer-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: -2.7rem;
  position: relative;
  z-index: 4;
}

.wheel-pointer {
  width: 0;
  height: 0;
  border-left: 17px solid transparent;
  border-right: 17px solid transparent;
  border-top: 48px solid #cb3027;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.18));
}

.wheel-stage {
  position: relative;
  flex: 0 1 auto;
  width: min(100%, 640px);
  max-width: min(100%, calc(100vh - 12rem));
  max-height: min(100%, calc(var(--app-height, 100vh) - 12rem));
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.wheel-stage:focus-visible {
  outline: none;
}

.wheel-canvas {
  display: block;
  width: 100%;
  max-width: 100%;
}

.wheel-center {
  position: absolute;
  inset: 50% auto auto 50%;
  transform-origin: center;
}

.wheel-center__ring {
  width: clamp(104px, 11.5vw, 126px);
  height: clamp(104px, 11.5vw, 126px);
  border-radius: 999px;
  background: #4a7446;
  border: 7px solid #d8bb71;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-center__logo {
  color: #f7f0dd;
  font-style: italic;
  font-size: clamp(0.78rem, 1vw, 0.92rem);
  line-height: 1;
}

.spin-button {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  border: 0;
  border-radius: 0.22rem;
  background: linear-gradient(180deg, #cf3b2d 0%, #b92d22 100%);
  color: #fff6e7;
  padding: 0.58rem 1.5rem;
  min-width: 110px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(110, 20, 16, 0.28);
  margin-top: 1.1rem;
}

.spin-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .wheel-stage {
    width: min(100%, 500px);
    max-width: min(100%, calc(var(--app-height, 100vh) - 8rem));
    max-height: min(100%, calc(var(--app-height, 100vh) - 8rem));
  }
}

@media (orientation: landscape) {
  .roulette-shell {
    justify-content: center;
    gap: 0.25rem;
    padding-top: 0;
  }

  .pointer-wrap {
    margin-bottom: -1rem;
  }

  .wheel-pointer {
    border-left-width: 14px;
    border-right-width: 14px;
    border-top-width: 38px;
  }

  .wheel-stage {
    width: min(100%, 470px);
    max-width: min(100%, calc(var(--app-height, 100vh) - 10.5rem));
    max-height: min(100%, calc(var(--app-height, 100vh) - 10.5rem));
  }

  .spin-button {
    margin-top: 0.1rem;
  }
}

@media (max-height: 560px) and (orientation: landscape) {
  .roulette-shell {
    justify-content: center;
    gap: 0.1rem;
    padding-top: 0;
  }

  .pointer-wrap {
    margin-bottom: -0.8rem;
  }

  .wheel-pointer {
    border-left-width: 13px;
    border-right-width: 13px;
    border-top-width: 34px;
  }

  .wheel-stage {
    width: min(100%, 420px);
    max-width: min(100%, calc(var(--app-height, 100vh) - 9.5rem));
    max-height: min(100%, calc(var(--app-height, 100vh) - 9.5rem));
  }

  .wheel-center__ring {
    width: clamp(82px, 12vh, 98px);
    height: clamp(82px, 12vh, 98px);
    border-width: 5px;
  }

  .spin-button {
    margin-top: 0;
    padding: 0.5rem 1.2rem;
    min-width: 96px;
    font-size: 0.76rem;
  }
}
</style>
