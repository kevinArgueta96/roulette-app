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

      <div class="wheel-center">
        <div class="wheel-center__ring">
          <div class="wheel-center__core"></div>
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
      return this.canvasSize * 0.47;
    },
    innerRadius() {
      return this.canvasSize * 0.11;
    },
    textRadius() {
      return this.canvasSize * 0.35;
    },
    borderWidth() {
      return Math.max(6, this.canvasSize * 0.012);
    },
    defaultFontSize() {
      return Math.max(12, this.canvasSize * 0.03);
    },
    teslaFontSize() {
      return Math.max(15, this.canvasSize * 0.038);
    },
    canSpin() {
      return this.spinRoullete && !this.isSpinning;
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
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.spinRoulleteByEnter);
    window.removeEventListener("resize", this.handleResize);
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
    updateCanvasSize() {
      if (!this.canvas || !this.ctx) {
        return;
      }

      const container = this.$refs.containerCircule;
      if (!container) {
        return;
      }

      const bounds = container.getBoundingClientRect();
      const nextSize = Math.max(260, Math.floor(Math.min(bounds.width, 362)));
      const devicePixelRatio = window.devicePixelRatio || 1;

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

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 1.6, 0, Math.PI * 2);
      this.ctx.fillStyle = "#caa85d";
      this.ctx.fill();
      this.ctx.restore();

      sectorsRoulette.forEach((sector, index) => {
        const angle = this.startAngle + index * this.arc;
        const halfArc = angle + this.arc / 2;
        const lines = this.getSectorLines(sector);
        const isMainPrize = index === 7;
        const fontSize = isMainPrize ? this.teslaFontSize : this.defaultFontSize;
        const lineHeight = fontSize * 1.05;
        const textOffset = ((lines.length - 1) * lineHeight) / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(this.center, this.center);
        this.ctx.arc(this.center, this.center, this.outerRadius, angle, angle + this.arc, false);
        this.ctx.arc(this.center, this.center, this.innerRadius, angle + this.arc, angle, true);
        this.ctx.closePath();
        this.ctx.fillStyle = colorsSectorRoulette[index];
        this.ctx.fill();
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.strokeStyle = "#caa85d";
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.translate(
          this.center + Math.cos(halfArc) * this.textRadius,
          this.center + Math.sin(halfArc) * this.textRadius
        );
        this.ctx.rotate(halfArc + Math.PI / 2);
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = this.getTextColor(index);
        this.ctx.font = `${isMainPrize ? textTeslaRouletteStyle.fontWeight : textDefaultRouletteStyle.fontWeight} ${fontSize}px ${isMainPrize ? textTeslaRouletteStyle.fontFamily : textDefaultRouletteStyle.fontFamily}`;

        lines.forEach((line, lineIndex) => {
          this.ctx.fillText(line, 0, lineIndex * lineHeight - textOffset);
        });

        this.ctx.restore();
      });

      this.ctx.beginPath();
      this.ctx.fillStyle = "#456a40";
      this.ctx.arc(this.center, this.center, this.innerRadius * 1.3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      this.ctx.arc(this.center, this.center, this.innerRadius * 0.62, 0, Math.PI * 2);
      this.ctx.fill();
    },
    getSectorLines(sector) {
      if (typeof sector === "string") {
        return sector.split(" ");
      }
      return Object.values(sector);
    },
    getTextColor(index) {
      return index === 0 || index === 2 || index === 4 || index === 6 || index === 7
        ? "#f8f0d8"
        : "#244230";
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pointer-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: -0.85rem;
  position: relative;
  z-index: 4;
}

.wheel-pointer {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 34px solid #cb3027;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.18));
}

.wheel-stage {
  position: relative;
  width: min(100%, 362px);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.wheel-stage:focus-visible {
  outline: 3px solid rgba(203, 48, 39, 0.35);
  outline-offset: 8px;
  border-radius: 999px;
}

.wheel-canvas {
  display: block;
  width: 100%;
  max-width: 100%;
}

.wheel-center {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}

.wheel-center__ring {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: rgba(26, 49, 31, 0.9);
  box-shadow: inset 0 0 0 8px rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
}

.wheel-center__core {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
}

.spin-button {
  margin-top: 0.45rem;
  border: 0;
  border-radius: 0.35rem;
  background: linear-gradient(180deg, #da3b2f 0%, #c92b22 100%);
  color: #fff6e7;
  padding: 0.78rem 1.6rem;
  min-width: 124px;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 10px 18px rgba(201, 43, 34, 0.2);
}

.spin-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
