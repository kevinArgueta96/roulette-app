<template>
  <div class="roulette-shell">
    <div ref="containerCircule" class="wheel-stage">
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";
import { obtenerHoraActual, calculateIndex } from "@/utils";
import {
  sectorsRoulette,
  colorsSectorRoulette,
  textDefaultRouletteStyle,
  textTeslaRouletteStyle
} from "@/config/config-roulette.js";

const FULL_SPINS = 6;
const SPIN_DURATION = 4600;
const FALLBACK_INDEX = 6;
const RESULT_BY_INDEX = {
  0: "giftCard",
  1: "tesla",
  2: "differentBoxes",
  3: "giftCard",
  4: "individualBox",
  5: "differentBoxes",
  6: "replay",
  7: "topPrice"
};

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
      isSpinning: false
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
    }
  },
  mounted() {
    this.startAngle = this.normalizeRadians(this.initialAngle || 0);
    this.initializeCanvas();
    this.observeResize();
    document.addEventListener("keyup", this.spinRoulleteByEnter);
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.spinRoulleteByEnter);
    window.removeEventListener("resize", this.handleResize);
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
      this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      this.drawRouletteWheel();
    },
    spinRoulleteByEnter(event) {
      const isSpace = event.key === " " || event.code === "Space";

      if (event.key !== "Enter" && !isSpace) {
        return;
      }

      event.preventDefault();
      this.spin();
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
        const isTesla = index === 1;
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
      return typeof sector === "string" ? [sector] : Object.values(sector);
    },
    getTextColor(index) {
      if (index === 1) {
        return "#C9CBCC";
      }

      if (index === 2 || index === 5 || index === 6) {
        return "#FFFFFF";
      }

      return "#111111";
    },
    spin() {
      if (!this.canSpin) {
        return;
      }

      const winnerIndex = this.generateNumberToShow();

      if (typeof winnerIndex !== "number") {
        this.updateState({ mutationType: "setSpinRoullete", payload: true });
        return;
      }

      const currentAngle = this.normalizeRadians(this.startAngle);
      const targetAngle = this.calculateTargetAngle(winnerIndex, currentAngle);
      const startTime = performance.now();

      this.isSpinning = true;
      this.showAnimation = true;
      this.updateState({ mutationType: "setSpinRoullete", payload: false });

      const animate = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / SPIN_DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        this.startAngle = currentAngle + (targetAngle - currentAngle) * eased;
        this.drawRouletteWheel();

        if (progress < 1) {
          this.animationFrame = window.requestAnimationFrame(animate);
          return;
        }

        this.finishSpin(winnerIndex);
      };

      this.animationFrame = window.requestAnimationFrame(animate);
    },
    finishSpin(winnerIndex) {
      this.stopAnimation();

      this.startAngle = this.normalizeRadians(this.startAngle);
      this.drawRouletteWheel();
      this.updateState({ mutationType: "setInitialAngle", payload: this.startAngle });

      this.persistSpinResult(winnerIndex).catch(() => null);
      this.$emit("showImg", { type: RESULT_BY_INDEX[winnerIndex] || RESULT_BY_INDEX[FALLBACK_INDEX] });
    },
    stopAnimation() {
      if (this.animationFrame) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      this.showAnimation = false;
      this.isSpinning = false;
    },
    calculateTargetAngle(winnerIndex, currentAngle) {
      const currentDegrees = this.toDegrees(this.normalizeRadians(currentAngle));
      const targetDegrees = this.getTargetDegreesForIndex(winnerIndex);
      const delta = this.normalizeDegrees(targetDegrees - currentDegrees) + FULL_SPINS * 360;

      return currentAngle + this.toRadians(delta);
    },
    getTargetDegreesForIndex(winnerIndex) {
      const matches = [];

      for (let degree = 0; degree < 360; degree += 0.5) {
        const index = calculateIndex({
          startAngle: this.toRadians(degree),
          arc: this.arc
        });

        if (index === winnerIndex) {
          matches.push(degree);
        }
      }

      if (!matches.length) {
        return 0;
      }

      return matches[Math.floor(matches.length / 2)];
    },
    generateNumberToShow() {
      const forcedConfiguration = this.generateProbabilityPriceByScheduler();
      const probabilities = Array.isArray(forcedConfiguration) ? forcedConfiguration : this.options;

      return this.getWeightedWinner(probabilities);
    },
    getWeightedWinner(probabilities) {
      if (!Array.isArray(probabilities) || !probabilities.length) {
        return FALLBACK_INDEX;
      }

      const weights = probabilities.map((item) => Math.max(0, Number(item.probability) || 0));
      const totalWeight = weights.reduce((accumulator, value) => accumulator + value, 0);

      if (totalWeight <= 0) {
        return FALLBACK_INDEX;
      }

      const threshold = Math.random() * totalWeight;
      let cumulative = 0;

      for (let index = 0; index < weights.length; index += 1) {
        cumulative += weights[index];

        if (threshold <= cumulative) {
          return index;
        }
      }

      return weights.length - 1;
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
      const currentTime = obtenerHoraActual();

      const scheduledWinner = scheduledPrizes.find((item) => (
        item &&
        currentTime >= item.rangeDown &&
        currentTime <= item.rangeTop &&
        item.given === false
      ));

      if (!scheduledWinner) {
        return null;
      }

      this.updateWinnerChoice({
        typeWinner: scheduledWinner.type,
        positionWinner: scheduledWinner.position
      }).catch(() => null);

      return this.obtainConfigurationSectorWin(scheduledWinner.type);
    },
    obtainConfigurationSectorWin(typeWinner) {
      switch (typeWinner) {
        case "card": {
          const { firstOption, secondOption } = this.generateRandomNumbers();

          return [
            { option: "LAHJAKORTTI", probability: firstOption },
            { option: "TESLA", probability: 0 },
            { option: "YLLÄTYSPALKINTO", probability: 0 },
            { option: "LAHJAKORTTI", probability: secondOption },
            { option: "TUOTEPALKINTO", probability: 0 },
            { option: "YLLÄTYSPALKINTO", probability: 0 },
            { option: "UUDESTAAN", probability: 0 },
            { option: "PÄÄPALKINTO", probability: 0 }
          ];
        }

        case "topPrice":
          return [
            { option: "LAHJAKORTTI", probability: 0 },
            { option: "TESLA", probability: 0 },
            { option: "YLLÄTYSPALKINTO", probability: 0 },
            { option: "LAHJAKORTTI", probability: 0 },
            { option: "TUOTEPALKINTO", probability: 0 },
            { option: "YLLÄTYSPALKINTO", probability: 0 },
            { option: "UUDESTAAN", probability: 0 },
            { option: "PÄÄPALKINTO", probability: 1 }
          ];

        case "teslaWin":
          return [
            { option: "LAHJAKORTTI", probability: 0 },
            { option: "TESLA", probability: 1 },
            { option: "YLLÄTYSPALKINTO", probability: 0 },
            { option: "LAHJAKORTTI", probability: 0 },
            { option: "TUOTEPALKINTO", probability: 0 },
            { option: "YLLÄTYSPALKINTO", probability: 0 },
            { option: "UUDESTAAN", probability: 0 },
            { option: "PÄÄPALKINTO", probability: 0 }
          ];

        default:
          return null;
      }
    },
    generateRandomNumbers() {
      return Math.round(Math.random()) === 0
        ? { firstOption: 0, secondOption: 1 }
        : { firstOption: 1, secondOption: 0 };
    },
    async persistSpinResult(winnerIndex) {
      const totals = this.buildNextTotals(winnerIndex);
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

      await service.setNewTotal({
        ...totals,
        totalSpecialSurprice: totals.totalSpecialSurprise,
        totalGitfCard: totals.totalGiftCard
      });
    },
    buildNextTotals(winnerIndex) {
      const totals = {
        totalReplay: this.totalReplay,
        totalSpecialPrice: this.totalSpecialPrice,
        totalSpecialSurprise: this.totalSpecialSurprise,
        totalTopPrice: this.totalTopPrice,
        totalGiftCard: this.totalGiftCard,
        totalSpin: this.totalSpin + 1
      };

      switch (winnerIndex) {
        case 0:
        case 3:
          totals.totalGiftCard += 1;
          break;

        case 2:
        case 5:
          totals.totalSpecialSurprise += 1;
          break;

        case 4:
          totals.totalSpecialPrice += 1;
          break;

        case 6:
          totals.totalReplay += 1;
          break;

        case 1:
        case 7:
          totals.totalTopPrice += 1;
          break;

        default:
          break;
      }

      return totals;
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
