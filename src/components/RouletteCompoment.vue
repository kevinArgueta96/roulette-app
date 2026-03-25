<template>
  <div class="roulette-shell">
    <div
      ref="containerCircule"
      class="wheel-stage"
      role="button"
      tabindex="0"
      aria-label="Girar ruleta"
      @click="handleWheelInteraction"
      @keyup.enter.prevent="spin"
      @keyup.space.prevent="spin"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <canvas ref="myCanvas" class="wheel-canvas"></canvas>

      <img
        src="/img/storytel-flecha.png"
        class="wheel-pointer"
        :class="{ vibratingImage: showAnimation }"
        alt=""
      />

      <div class="wheel-center">
        <img src="/img/logo.png" class="wheel-logo" alt="Logo" />
      </div>
    </div>

    <button class="spin-button" type="button" :disabled="!canSpin" @click="spin">
      {{ isSpinning ? "Girando..." : "Girar ruleta" }}
    </button>

    <p class="interaction-hint">
      Puedes girarla con el botón o tocando / deslizando la ruleta.
    </p>
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
      showAnimation: false,
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
      return this.canvasSize * 0.33;
    },
    borderWidth() {
      return Math.max(6, this.canvasSize * 0.018);
    },
    defaultFontSize() {
      return Math.max(14, this.canvasSize * 0.038);
    },
    teslaFontSize() {
      return Math.max(16, this.canvasSize * 0.044);
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
      const nextSize = Math.max(260, Math.floor(Math.min(bounds.width, window.innerHeight * 0.68)));
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
      if (!this.canvas || !this.ctx) {
        return;
      }

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

      if (!touch) {
        return;
      }

      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    },
    handleTouchEnd(event) {
      const touch = event.changedTouches?.[0];

      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;

      if (Math.abs(deltaX) >= SWIPE_THRESHOLD || Math.abs(deltaY) >= SWIPE_THRESHOLD) {
        this.spin();
      }
    },
    drawRouletteWheel() {
      if (!this.ctx) {
        return;
      }

      this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

      sectorsRoulette.forEach((sector, index) => {
        const angle = this.startAngle + index * this.arc;
        const halfArc = angle + this.arc / 2;
        const lines = this.getSectorLines(sector);
        const isTesla = index === 7;
        const fontSize = isTesla ? this.teslaFontSize : this.defaultFontSize;
        const lineHeight = fontSize * 1.1;
        const textOffset = ((lines.length - 1) * lineHeight) / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(this.center, this.center);
        this.ctx.arc(this.center, this.center, this.outerRadius, angle, angle + this.arc, false);
        this.ctx.arc(this.center, this.center, this.innerRadius, angle + this.arc, angle, true);
        this.ctx.closePath();
        this.ctx.fillStyle = colorsSectorRoulette[index];
        this.ctx.fill();
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.strokeStyle = "#fdf1f0";
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
        this.ctx.font = `${isTesla ? textTeslaRouletteStyle.fontWeight : textDefaultRouletteStyle.fontWeight} ${fontSize}px ${isTesla ? textTeslaRouletteStyle.fontFamily : textDefaultRouletteStyle.fontFamily}`;

        lines.forEach((line, lineIndex) => {
          this.ctx.fillText(line, 0, lineIndex * lineHeight - textOffset);
        });

        this.ctx.restore();
      });

      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(255, 250, 248, 0.92)";
      this.ctx.arc(this.center, this.center, this.innerRadius * 1.4, 0, Math.PI * 2);
      this.ctx.fill();
    },
    getSectorLines(sector) {
      if (typeof sector === "string") {
        return sector.split("\\n");
      }

      return Object.values(sector);
    },
    getTextColor(index) {
      if (index === 3) {
        return "#FFFFFF";
      }

      if (index === 1 || index === 5) {
        return "#FFFFFF";
      }

      return "#111111";
    },
    spin(spinConfig = {}) {
      if (!this.canSpin) {
        return;
      }

      const winnerIndex = typeof spinConfig.winnerIndex === "number"
        ? spinConfig.winnerIndex
        : this.generateNumberToShow();

      if (typeof winnerIndex !== "number") {
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
        if (typeof spinConfig.onComplete === "function") {
          spinConfig.onComplete(false);
        }
        return;
      }

      const currentAngle = this.normalizeRadians(this.startAngle);
      const targetAngle = this.calculateTargetAngle(winnerIndex, currentAngle);
      const startTime = performance.now();
      const duration = Math.max(200, Number(spinConfig.duration) || SPIN_DURATION);

      this.isSpinning = true;
      this.showAnimation = true;
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

      if (typeof spinConfig.onComplete === "function") {
        spinConfig.onComplete(true);
      }
    },
    stopAnimation() {
      if (this.animationFrame) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      this.showAnimation = false;
      this.isSpinning = false;
    },
    async runCanvasStressTest(iterations = 300, duration = STRESS_TEST_DURATION) {
      if (this.stressTest.active || this.isSpinning) {
        return false;
      }

      const totalIterations = Math.max(1, Number(iterations) || 300);
      const spinDuration = Math.max(200, Number(duration) || STRESS_TEST_DURATION);

      this.stressTest = {
        active: true,
        total: totalIterations,
        completed: 0,
        duration: spinDuration
      };

      for (let step = 0; step < totalIterations; step += 1) {
        if (!this.stressTest.active) {
          break;
        }

        const randomIndex = Math.floor(Math.random() * sectorsRoulette.length);

        await new Promise((resolve) => {
          this.spin({
            winnerIndex: randomIndex,
            duration: spinDuration,
            skipPersist: true,
            skipResult: true,
            onComplete: resolve
          });
        });

        this.stressTest.completed = step + 1;
      }

      const wasCompleted = this.stressTest.completed === this.stressTest.total;

      this.stressTest = {
        active: false,
        total: 0,
        completed: 0,
        duration: spinDuration
      };

      return wasCompleted;
    },
    stopCanvasStressTest() {
      this.stressTest = {
        active: false,
        total: 0,
        completed: 0,
        duration: STRESS_TEST_DURATION
      };
    },
    registerDebugApi() {
      if (typeof window === "undefined") {
        return;
      }

      window.__rouletteDebug = {
        spinTo: (index) => this.spin({ winnerIndex: Number(index) }),
        runCanvasStressTest: (iterations = 300, duration = STRESS_TEST_DURATION) => (
          this.runCanvasStressTest(iterations, duration)
        ),
        stopCanvasStressTest: () => this.stopCanvasStressTest(),
        getState: () => ({
          isSpinning: this.isSpinning,
          canvasSize: this.canvasSize,
          pendingResize: this.pendingResize,
          stressTest: { ...this.stressTest }
        })
      };
    },
    unregisterDebugApi() {
      if (typeof window === "undefined") {
        return;
      }

      if (window.__rouletteDebug) {
        delete window.__rouletteDebug;
      }
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
          const nextGiftCards = this.giftCards.map((item) => (
            item.position === positionWinner ? { ...item, given: true } : item
          ));
          this.updateState({ mutationType: "setGiftCards", payload: nextGiftCards });
          await service.setGiftCards(nextGiftCards);
          return;
        }

        case "topPrice": {
          const nextTopPrices = this.topPrices.map((item) => (
            item.position === positionWinner ? { ...item, given: true } : item
          ));
          this.updateState({ mutationType: "setTopPrices", payload: nextTopPrices });
          await service.setTopPrices(nextTopPrices);
          return;
        }

        case "teslaWin": {
          const nextTeslaPrices = this.teslaPrices.map((item) => (
            item.position === positionWinner ? { ...item, given: true } : item
          ));
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

      const scheduledWinner = scheduledPrizes.find((item) => (
        item &&
        item.given === false &&
        isTimeWithinRange(currentTime, item.rangeDown, item.rangeTop)
      ));

      if (!scheduledWinner) {
        return null;
      }

      this.updateWinnerChoice({
        typeWinner: scheduledWinner.type,
        positionWinner: scheduledWinner.position
      }).catch(() => null);

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

.wheel-stage {
  position: relative;
  width: min(100%, 720px);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.wheel-stage:focus-visible {
  outline: 3px solid rgba(255, 80, 28, 0.35);
  outline-offset: 8px;
  border-radius: 999px;
}

.wheel-canvas {
  display: block;
  width: 100%;
  max-width: 100%;
  filter: drop-shadow(0 25px 45px rgba(43, 53, 58, 0.14));
}

.wheel-pointer {
  position: absolute;
  top: 6%;
  left: 50%;
  width: clamp(34px, 6vw, 56px);
  transform: translateX(-50%);
  z-index: 2;
}

.wheel-center {
  position: absolute;
  inset: 50% auto auto 50%;
  width: clamp(92px, 16vw, 150px);
  height: clamp(92px, 16vw, 150px);
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: rgba(255, 250, 248, 0.95);
  box-shadow: 0 16px 30px rgba(43, 53, 58, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.wheel-logo {
  width: 74%;
  height: 74%;
  object-fit: contain;
}

.spin-button {
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff501c 0%, #ff824f 100%);
  color: #fff;
  padding: 0.95rem 1.8rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 16px 32px rgba(255, 80, 28, 0.24);
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.spin-button:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(255, 80, 28, 0.3);
}

.spin-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.interaction-hint {
  margin: 0;
  color: rgba(43, 53, 58, 0.68);
  font-size: 0.95rem;
  text-align: center;
}

.vibratingImage {
  animation: shake 0.48s linear infinite;
}

@keyframes shake {
  0% {
    transform: translateX(-50%);
  }

  25% {
    transform: translateX(calc(-50% - 4px)) rotate(-3deg);
  }

  50% {
    transform: translateX(-50%) rotate(2deg);
  }

  75% {
    transform: translateX(calc(-50% + 4px)) rotate(-3deg);
  }

  100% {
    transform: translateX(-50%);
  }
}

@font-face {
  font-family: "TeslaRegular";
  src: url("../assets/fonts/tesla-webfont.woff2") format("woff2"),
    url("../assets/fonts/tesla-webfont.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

@media (max-width: 640px) {
  .wheel-stage {
    width: 100%;
  }

  .spin-button {
    width: 100%;
  }
}
</style>
