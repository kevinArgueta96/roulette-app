<template>
  <div class="roulette-shell" :class="[{ 'roulette-shell--hero': isMainPrizeActive }, `roulette-shell--${theme}`]">
    <div class="pointer-wrap" :class="{ 'pointer-wrap--hidden': isMainPrizeActive }">
      <img
        v-if="theme === 'storytel'"
        class="wheel-pointer-img"
        src="/storytel-assets/arrow-icon.svg"
        alt=""
        aria-hidden="true"
      />
      <div v-else class="wheel-pointer"></div>
    </div>

    <div
      ref="containerCircule"
      class="wheel-stage"
      :class="{ 'wheel-stage--hero': isMainPrizeActive }"
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

      <svg
        v-if="showMainPrizeBurst"
        class="wheel-burst-rays"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- hide everything inside the wheel circle; worms only visible outside -->
          <mask id="worm-mask">
            <rect width="200" height="200" fill="white"/>
            <circle cx="100" cy="100" r="38" fill="black"/>
          </mask>
        </defs>
        <g mask="url(#worm-mask)">
          <path class="burst-ray" pathLength="100" d="M 100,100 L 100,0"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 200,0"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 200,100"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 200,200"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 100,200"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 0,200"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 0,100"/>
          <path class="burst-ray" pathLength="100" d="M 100,100 L 0,0"/>
        </g>
      </svg>

      <!-- small prize: single worm sweep from right → left along wheel border, plays once -->
      <svg
        v-if="showSmallPrizeSweep"
        class="wheel-sweep-worm"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- semi-circle arc: from 3 o'clock (right) clockwise to 9 o'clock (left) under the bottom, offset from wheel -->
        <path class="sweep-worm" pathLength="339" d="M 208,100 A 108,108 0 0 1 -8,100"/>
      </svg>

      <div v-if="theme !== 'storytel'" class="wheel-center" :style="wheelCenterStyle">
        <div class="wheel-center__ring">
          <img
            class="wheel-center__logo"
            src="@/assets/brand/image_center.webp"
            alt="Parrano"
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </div>
    </div>

    <div class="wheel-action-slot">
      <transition name="write-reveal">
        <p v-if="showMainPrizeCopy" class="main-prize-copy">Arki ansaitsee<br>parempaa!</p>
      </transition>

      <button
        v-if="theme !== 'storytel' && (showHeroRepeatButton || !isMainPrizeActive)"
        class="spin-button"
        :class="{ 'spin-button--hero-repeat': showHeroRepeatButton }"
        type="button"
        :disabled="showHeroRepeatButton ? false : !canSpin"
        :aria-disabled="showHeroRepeatButton ? 'true' : (!canSpin ? 'true' : 'false')"
        @click="handlePrimaryButtonClick"
      >
        {{ showHeroRepeatButton ? "YRITÄ UUDELLEEN" : isSpinning ? "PYÖRII..." : "PYÖRÄYTÄ" }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";
import {
  formatTime24h,
  pickWeightedIndex,
  buildNextTotals,
  getTargetDegreesForIndex,
  buildDynamicProbabilities,
  buildSectorsFromDistribution,
  findActiveSlotIndex,
  getFallbackIndexForDistribution,
  getSectorResultType,
  shouldResetDaily,
  OUTCOME_KEYS,
  OUTCOME_LOGIC
} from "@/utils";
import {
  textDefaultRouletteStyle,
  textTeslaRouletteStyle
} from "@/config/config-roulette.js";

const FULL_SPINS = 6;
const SPIN_DURATION = 4600;
const STRESS_TEST_DURATION = 650;
const SWIPE_THRESHOLD = 36;
const STORYTEL_CENTER_LOGO_SRC = "/storytel-assets/new-logo-center.png";

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
      "winDistribution",
      "totalReplay",
      "totalSpecialPrice",
      "totalSpecialSurprise",
      "totalTopPrice",
      "totalGiftCard",
      "totalGiftCard3m",
      "totalGiftCard1m",
      "totalSpin",
      "initialAngle",
      "spinRoullete",
      "isMainPrizeActive",
      "activeHeroResultType"
    ]),
    sectors() {
      return buildSectorsFromDistribution(this.winDistribution);
    },
    arc() {
      return (Math.PI * 2) / Math.max(1, this.sectors.length);
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
      const scale = this.theme === "storytel" ? 0.029 : 0.038;
      const min   = this.theme === "storytel" ? 25    : 33;
      return Math.max(min, this.canvasSize * scale);
    },
    teslaFontSize() {
      const scale = this.theme === "storytel" ? 0.033 : 0.044;
      const min   = this.theme === "storytel" ? 29    : 44;
      return Math.max(min, this.canvasSize * scale);
    },
    canSpin() {
      return this.spinRoullete && !this.isSpinning;
    },
    theme() {
      return process.env.VUE_APP_THEME || "parrano";
    },
    showHeroRepeatButton() {
      return this.isMainPrizeActive && this.activeHeroResultType === "repeat";
    },
    showMainPrizeCopy() {
      return this.theme !== "storytel" && this.isMainPrizeActive && this.activeHeroResultType !== "repeat";
    },
    showMainPrizeBurst() {
      return this.theme !== "storytel" && this.isMainPrizeActive && this.activeHeroResultType === "mainPrize";
    },
    showSmallPrizeSweep() {
      return this.theme !== "storytel" && this.isMainPrizeActive && this.activeHeroResultType === "surpriseWin";
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
        totalGiftCard3m: this.totalGiftCard3m,
        totalGiftCard1m: this.totalGiftCard1m,
        totalSpin: this.totalSpin
      };
    }
  },
  watch: {
    isMainPrizeActive() {
      this.$nextTick(() => {
        this.handleResize();
        window.setTimeout(() => this.handleResize(), 120);
        window.setTimeout(() => this.handleResize(), 320);
      });
    }
  },
  mounted() {
    this.startAngle = this.normalizeRadians(this.initialAngle || 0);
    if (this.theme === "storytel") {
      const img = new Image();
      img.src = STORYTEL_CENTER_LOGO_SRC;
      img.onload = () => { this.drawRouletteWheel(); };
      this._centerLogoImg = img;

      if (document.fonts?.load) {
        document.fonts.load('800 24px "Storytel Euclid"').then(() => {
          this.drawRouletteWheel();
        });
      }
    }
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
    handlePrimaryButtonClick() {
      if (this.showHeroRepeatButton) return;
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

      if (this.theme === "storytel") {
        // Storytel: black outer ring + white inner ring
        this.ctx.beginPath();
        this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 2.1, 0, Math.PI * 2);
        this.ctx.fillStyle = "#000000";
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fill();
      } else {
        // Parrano: gold double ring
        this.ctx.beginPath();
        this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 2.1, 0, Math.PI * 2);
        this.ctx.fillStyle = this.cssVar("--color-gold", "#d9bf74");
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.center, this.center, this.outerRadius + this.borderWidth * 1.3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.cssVar("--color-gold-dark", "#c9a353");
        this.ctx.fill();
      }

      this.sectors.forEach((sector, index) => {
        const angle = this.startAngle + index * this.arc;
        const halfArc = angle + this.arc / 2;
        const lines = this.getSectorLines(sector);
        const isTopOutcome = sector.outcomeKey === "mainWin" || sector.outcomeKey === "mainPrize";
        const fontSize = isTopOutcome ? this.teslaFontSize : this.defaultFontSize;
        const lineHeight = fontSize * 1.08;
        const textOffset = ((lines.length - 1) * lineHeight) / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(this.center, this.center);
        this.ctx.arc(this.center, this.center, this.outerRadius, angle, angle + this.arc, false);
        this.ctx.closePath();
        this.ctx.fillStyle = sector.color;
        this.ctx.fill();
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.strokeStyle = this.theme === "storytel" ? "#ffffff" : sector.color;
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.translate(
          this.center + Math.cos(halfArc) * this.textRadius,
          this.center + Math.sin(halfArc) * this.textRadius
        );
        this.ctx.rotate(halfArc);
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = sector.textColor;
        const fontFamily = this.theme === "storytel"
          ? '"Storytel Euclid", system-ui'
          : (isTopOutcome ? textTeslaRouletteStyle.fontFamily : textDefaultRouletteStyle.fontFamily);
        this.ctx.font = `${isTopOutcome ? textTeslaRouletteStyle.fontWeight : textDefaultRouletteStyle.fontWeight} ${fontSize}px ${fontFamily}`;
        const isStorytel = this.theme === "storytel";
        const textX = isStorytel
          ? -Math.max(...lines.map((line) => this.ctx.measureText(line).width)) / 2
          : 0;
        this.ctx.textAlign = isStorytel ? "left" : "center";

        lines.forEach((line, lineIndex) => {
          this.ctx.fillText(line, textX, lineIndex * lineHeight - textOffset);
        });

        this.ctx.restore();
      });

      if (this.theme === "storytel") {
        this.drawStorytelCenter();
      }
    },
    drawStorytelCenter() {
      const centerRadius = this.canvasSize * 0.155;

      if (this._centerLogoImg && this._centerLogoImg.complete) {
        const logoSize = centerRadius * 2.02;
        this.ctx.save();
        this.ctx.translate(this.center, this.center);
        this.ctx.rotate(this.startAngle);
        this.ctx.drawImage(
          this._centerLogoImg,
          -logoSize / 2,
          -logoSize / 2,
          logoSize,
          logoSize
        );
        this.ctx.restore();
        return;
      }

      this.ctx.beginPath();
      this.ctx.arc(this.center, this.center, centerRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = "#000000";
      this.ctx.fill();
      this.ctx.lineWidth = Math.max(2, this.canvasSize * 0.006);
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.stroke();
    },
    getSectorLines(sector) {
      const storytelLines = {
        mainPrize: ["Pääpalkinto"],
        surpriseWin: ["Yllätyspalkinto"],
        repeat: ["Kokeile", "uudestaan"],
        giftCard3m: ["3kk", "lahjakortti"],
        giftCard1m: ["1kk", "lahjakortti"]
      };

      if (this.theme === "storytel" && storytelLines[sector?.outcomeKey]) {
        return storytelLines[sector.outcomeKey];
      }

      const label = sector?.label ?? sector;
      if (typeof label === "string") {
        return label.trim().split(/\s+/).filter(Boolean);
      }
      return Object.values(label);
    },
    cssVar(name, fallback) {
      if (typeof window === "undefined") return fallback;
      return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
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
        const winnerSector = this.sectors[winnerIndex] || this.sectors[getFallbackIndexForDistribution(this.winDistribution)];
        this.$emit("showImg", { type: getSectorResultType(winnerSector) });
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
        const randomIndex = Math.floor(Math.random() * Math.max(1, this.sectors.length));
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
      const currentTime = formatTime24h();

      if (shouldResetDaily(this.winDistribution?.lastResetDate)) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        this.updateState({ mutationType: "resetDailyCounters", payload: dateStr });
        service.saveWinDistribution({ ...this.winDistribution, lastResetDate: dateStr }).catch(() => null);
      }

      const probabilities = buildDynamicProbabilities(this.winDistribution, currentTime);
      return pickWeightedIndex(probabilities, getFallbackIndexForDistribution(this.winDistribution));
    },
    async persistSpinResult(winnerIndex) {
      const winnerSector = this.sectors[winnerIndex] || null;
      const fallbackKey = OUTCOME_KEYS.find((key) => !OUTCOME_LOGIC[key].hasDailyLimit) || OUTCOME_KEYS[0];
      const outcomeKey = winnerSector?.outcomeKey || fallbackKey;
      const totals = buildNextTotals(this.currentTotals, outcomeKey);
      const mutationMap = {
        totalReplay: "setTotalReplay",
        totalSpecialPrice: "setTotalSpecialPrice",
        totalSpecialSurprise: "setTotalSpecialSurprise",
        totalTopPrice: "setTotalTopPrice",
        totalGiftCard: "setTotalGiftCard",
        totalGiftCard3m: "setTotalGiftCard3m",
        totalGiftCard1m: "setTotalGiftCard1m",
        totalSpin: "setTotalSpin"
      };
      Object.keys(mutationMap).forEach((key) => {
        this.updateState({ mutationType: mutationMap[key], payload: totals[key] });
      });

      const currentTime = formatTime24h();
      const meta = OUTCOME_LOGIC[outcomeKey];

      if (meta?.hasSlots) {
        const slots = this.winDistribution?.[outcomeKey]?.slots || [];
        const activeSlotIdx = findActiveSlotIndex(slots, currentTime);
        this.updateState({
          mutationType: "incrementSlotGiven",
          payload: { outcomeKey, slotIndex: activeSlotIdx }
        });
        await service.saveWinDistribution(this.winDistribution).catch(() => null);
      }

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
  z-index: 4;
  --base-scale: 1;
  --hero-factor: 1;
  --wheel-scale: calc(var(--base-scale) * var(--hero-factor));
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

.roulette-shell--hero {
  --hero-factor: 0.82;
}

.pointer-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: -2.7rem;
  position: relative;
  z-index: 12;
}

.pointer-wrap--hidden {
  opacity: 0;
  pointer-events: none;
}

.wheel-pointer {
  width: 0;
  height: 0;
  border-left: 17px solid transparent;
  border-right: 17px solid transparent;
  border-top: 48px solid var(--color-accent);
  filter: drop-shadow(0 4px 6px rgba(var(--rgb-black), 0.18));
}

.wheel-pointer-img {
  display: block;
  width: clamp(44px, 6vw, 74px);
  height: auto;
  filter: drop-shadow(0 5px 9px rgba(var(--rgb-black), 0.16));
}

.roulette-shell--storytel {
  justify-content: center;
  padding-top: 0;
  gap: 0.25rem;
  transform: translateY(clamp(1.65rem, 4.6vh, 2rem));
  transition: transform 1.08s cubic-bezier(0.19, 1, 0.22, 1);
}

.roulette-shell--storytel.roulette-shell--hero {
  --hero-factor: 1;
  transform: none;
}

.roulette-shell--storytel .pointer-wrap {
  margin-bottom: clamp(-2.1rem, -3.2vw, -1.5rem);
}

.roulette-shell--storytel .wheel-stage {
  width: min(100%, calc((var(--app-height, 100vh) - 3.2rem) * var(--wheel-scale)), 760px);
  max-width: min(100%, calc((var(--app-height, 100vh) - 3.2rem) * var(--wheel-scale)), 760px);
  max-height: min(100%, calc((var(--app-height, 100vh) - 3.2rem) * var(--wheel-scale)), 760px);
}

.roulette-shell--storytel.roulette-shell--hero .wheel-stage {
  width: min(100%, calc((var(--app-height, 100vh) - 5rem) * var(--wheel-scale)), 42vw, 720px);
  max-width: min(100%, calc((var(--app-height, 100vh) - 5rem) * var(--wheel-scale)), 42vw, 720px);
  max-height: min(100%, calc((var(--app-height, 100vh) - 5rem) * var(--wheel-scale)), 42vw, 720px);
}

.roulette-shell--storytel .spin-button {
  display: none;
}

.roulette-shell--storytel .wheel-pointer-img {
  width: clamp(30px, 3.2vw, 36px);
  filter: none;
}

.wheel-stage {
  position: relative;
  z-index: 5;
  flex: 0 1 auto;
  width: min(100%, calc(700px * var(--wheel-scale)));
  max-width: min(100%, calc((var(--app-height, 100vh) - 10.5rem) * var(--wheel-scale)));
  max-height: min(100%, calc((var(--app-height, 100vh) - 10.5rem) * var(--wheel-scale)));
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: width 0.72s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.72s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.72s cubic-bezier(0.16, 1, 0.3, 1);
}

.wheel-stage:focus-visible {
  outline: none;
}

.wheel-stage--hero {
  transition-duration: 0.8s;
}

/* Burst rays — SVG centered on wheel, extends to screen edges */
.wheel-burst-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 290%;
  height: 290%;
  z-index: 1;
  pointer-events: none;
  overflow: visible;
  animation: burst-svg-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change: transform, opacity;
}

@keyframes burst-svg-enter {
  from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  to   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
}

.burst-ray {
  fill: none;
  stroke: var(--color-gold);
  stroke-width: 4.5;
  stroke-linecap: round;
  stroke-dasharray: 22 1000;
  stroke-dashoffset: -16;
  animation: worm-escape 3.5s linear infinite;
  will-change: opacity;
}

@keyframes worm-escape {
  /* 0–8%:  emerge from mask with fade-in   (fast launch, ~0.28s) */
  0%   { stroke-dashoffset: -16;  opacity: 0; }
  8%   { stroke-dashoffset: -38;  opacity: 1; }
  /* 8–85%: comfortable travel to screen edge (~2.7s visible) */
  85%  { stroke-dashoffset: -95;  opacity: 1; }
  /* 85–100%: fade out past edge; loop resets to inside mask invisibly */
  100% { stroke-dashoffset: -100; opacity: 0; }
}

/* Small prize — single worm sweep along wheel border, right → left, plays once */
.wheel-sweep-worm {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  overflow: visible;
}

.sweep-worm {
  fill: none;
  stroke: var(--color-gold);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 50 500;
  animation: sweep-right-to-left 2.4s ease-in-out forwards;
  will-change: opacity;
}

@keyframes sweep-right-to-left {
  /* worm emerges from right side, goes clockwise under the wheel to left, then fades */
  0%   { stroke-dashoffset:  52;  opacity: 0; }
  7%   { stroke-dashoffset:  35;  opacity: 1; }
  90%  { stroke-dashoffset: -289; opacity: 1; }
  100% { stroke-dashoffset: -310; opacity: 0; }
}

/* GPU layer for the canvas wheel itself */
.wheel-canvas {
  display: block;
  width: 100%;
  max-width: 100%;
  will-change: transform;
}

.wheel-center {
  position: absolute;
  inset: 50% auto auto 50%;
  transform-origin: center;
  z-index: 2;
}

.wheel-center__ring {
  width: clamp(118px, 13.6vw, 148px);
  height: clamp(118px, 13.6vw, 148px);
  border-radius: 999px;
  background: var(--color-green);
  border: 4px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-center__logo {
  display: block;
  width: 140%;
  height: auto;
  object-fit: contain;
}

.spin-button {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  border: 0;
  border-radius: 0.22rem;
  background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  color: var(--color-button-fg);
  padding: 0.81rem 2.09rem;
  min-width: 165px;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  box-shadow: 0 3px 8px rgba(var(--rgb-black), 0.18);
  border: 1px solid rgba(var(--rgb-danger), 0.28);
  margin-top: 1.1rem;
  cursor: pointer;
  transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
}

.spin-button:not(:disabled):hover {
  transform: translateY(-2px) scale(1.025);
  box-shadow: 0 7px 20px rgba(var(--rgb-black), 0.28);
  background: linear-gradient(180deg, var(--color-accent-hot) 0%, var(--color-accent-hover) 100%);
}

.spin-button:not(:disabled):active {
  transform: translateY(1px) scale(0.975);
  box-shadow: 0 1px 4px rgba(var(--rgb-black), 0.14);
  transition-duration: 0.07s;
}

/* Pulse ring via pseudo-element — uses only transform+opacity (GPU composited, zero paint cost) */
.spin-button:not(:disabled)::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  border: 2px solid rgba(var(--rgb-accent), 0.55);
  opacity: 0;
  transform: scale(1);
  animation: btn-pulse-ring 2.4s ease-out infinite;
  pointer-events: none;
  will-change: transform, opacity;
}

@keyframes btn-pulse-ring {
  0%   { transform: scale(1);    opacity: 0.7; }
  100% { transform: scale(1.45); opacity: 0;   }
}

.wheel-action-slot {
  position: relative;
  z-index: 10;
  min-height: 2.8rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

.main-prize-copy {
  position: absolute;
  top: 0.35rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  margin: 0;
  display: inline-block;
  color: var(--color-primary-soft);
  font-family: "Lumios Marker", cursive;
  font-size: clamp(4rem, 9vw, 6.6rem);
  font-weight: 400;
  line-height: 0.88;
  letter-spacing: 0;
  text-align: center;
  width: min(86%, 620px);
  white-space: normal;
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  animation: handwriting-reveal 1.04s cubic-bezier(0.2, 0.84, 0.22, 1) 1s forwards;
  will-change: clip-path, opacity;
}

.spin-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  animation: none;
}

.write-reveal-enter-active {
  transition: opacity 0.24s ease 0.92s;
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

.spin-button--hero-repeat {
  margin-top: 0.6rem;
  background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  color: var(--color-button-fg);
  opacity: 1;
  pointer-events: none;
  cursor: default;
}

@media (max-width: 900px) {
  .wheel-stage {
    width: min(100%, calc(560px * var(--wheel-scale)));
    max-width: min(100%, calc((var(--app-height, 100vh) - 7rem) * var(--wheel-scale)));
    max-height: min(100%, calc((var(--app-height, 100vh) - 7rem) * var(--wheel-scale)));
  }
}

@media (orientation: portrait) and (min-height: 900px) {
  .roulette-shell {
    --base-scale: 0.8;
    padding-top: 0;
    justify-content: center;
    gap: 0.85rem;
  }

  .wheel-stage {
    width: min(96vw, calc((var(--app-height, 100vh) - 6.8rem) * var(--wheel-scale)), calc(740px * var(--wheel-scale)));
    max-width: min(96vw, calc((var(--app-height, 100vh) - 6.8rem) * var(--wheel-scale)), calc(740px * var(--wheel-scale)));
    max-height: min(96vw, calc((var(--app-height, 100vh) - 6.8rem) * var(--wheel-scale)), calc(740px * var(--wheel-scale)));
  }
}

@media (min-width: 768px) and (orientation: portrait) and (min-height: 900px) {
  .roulette-shell {
    --base-scale: 0.75;
    padding-top: 0;
    justify-content: center;
    gap: 0.2rem;
  }

  .wheel-stage {
    width: min(92vw, calc((var(--app-height, 100vh) - 9rem) * var(--wheel-scale)), calc(1000px * var(--wheel-scale)));
    max-width: min(92vw, calc((var(--app-height, 100vh) - 9rem) * var(--wheel-scale)), calc(1000px * var(--wheel-scale)));
    max-height: min(92vw, calc((var(--app-height, 100vh) - 9rem) * var(--wheel-scale)), calc(1000px * var(--wheel-scale)));
  }

  .roulette-shell--hero .wheel-stage {
    transform: translateY(-3rem);
  }

  .wheel-center__ring {
    width: clamp(130px, 15vw, 163px);
    height: clamp(130px, 15vw, 163px);
  }

  .spin-button {
    font-size: 2.4rem;
    padding: 1.1rem 3rem;
  }

  .main-prize-copy {
    font-size: clamp(6rem, 12vw, 10rem);
  }
}

@media (min-width: 1000px) and (orientation: portrait) and (min-height: 1300px) {
  .roulette-shell--hero .wheel-stage {
    transform: translateY(-4.5rem);
  }

  .wheel-action-slot {
    min-height: 3.4rem;
  }

  .main-prize-copy {
    top: -0.45rem;
    width: min(80%, 760px);
    font-size: clamp(6.8rem, 10.4vw, 8rem);
    line-height: 0.9;
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
    width: min(100%, calc(470px * var(--wheel-scale)));
    max-width: min(100%, calc((var(--app-height, 100vh) - 10.5rem) * var(--wheel-scale)));
    max-height: min(100%, calc((var(--app-height, 100vh) - 10.5rem) * var(--wheel-scale)));
  }

  .spin-button {
    margin-top: 0.1rem;
  }

  .wheel-action-slot {
    min-height: 2rem;
  }

  .main-prize-copy {
    top: 0.2rem;
    font-size: clamp(3rem, 7.2vw, 5.1rem);
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
    width: min(100%, calc(420px * var(--wheel-scale)));
    max-width: min(100%, calc((var(--app-height, 100vh) - 9.5rem) * var(--wheel-scale)));
    max-height: min(100%, calc((var(--app-height, 100vh) - 9.5rem) * var(--wheel-scale)));
  }

  .wheel-center__ring {
    width: clamp(92px, 12.6vh, 112px);
    height: clamp(92px, 12.6vh, 112px);
    border-width: 3px;
  }

  .spin-button {
    margin-top: 0;
    padding: 0.64rem 1.49rem;
    min-width: 130px;
    font-size: 0.97rem;
  }

  .wheel-action-slot {
    min-height: 1.6rem;
  }

  .main-prize-copy {
    top: 0.1rem;
    font-size: clamp(2.45rem, 7.4vw, 4rem);
  }
}
</style>
