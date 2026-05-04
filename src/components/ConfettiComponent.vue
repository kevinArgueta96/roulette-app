<template>
  <div class="confetti-root">
    <canvas id="confetti-container" ref="confettiCanvas" class="confetti-layer"></canvas>
  </div>
</template>

<script>
import ConfettiGenerator from "confetti-js";
import { mapGetters } from "vuex";

const isMobile = () => window.matchMedia("(max-width: 768px)").matches
  || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const DEFAULT_CONFETTI_COLORS = [
  [216, 187, 113], [245, 215, 138], [246, 237, 209],
  [255, 80, 20], [255, 255, 255], [46, 94, 57]
];

const DESKTOP_PARTICLE_COUNT = 1200;
const MOBILE_PARTICLE_COUNT = 450;

const SHAPE_CIRCLE = 0;
const SHAPE_SQUARE = 1;

const TWO_PI = Math.PI * 2;
const PI_5_8 = 5.8 * Math.PI;

export default {
  name: "ConfettiComponent",
  props: {
    isVisibleConfetti: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: ""
    },
    origin: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapGetters(["themeMeta"])
  },
  data() {
    const mobile = isMobile();
    return {
      confetti: null,
      confettiSettings: {
        target: "confetti-container",
        respawn: true,
        max: mobile ? 60 : 220,
        size: mobile ? 1.2 : 1.8,
        clock: mobile ? 22 : 16,
        rotate: !mobile,
        props: ["circle"],
        colors: DEFAULT_CONFETTI_COLORS
      }
    };
  },
  watch: {
    isVisibleConfetti: {
      immediate: true,
      handler(isVisible) {
        if (isVisible) {
          this.startConfetti();
          return;
        }

        this.clearConfetti();
      }
    }
  },
  created() {
    this._burst = null;
    this._burstRaf = null;
    this._burstRender = null;
    this._burstStartedAt = 0;
    this._burstPauseElapsed = 0;
    this._visibilityHandler = null;
  },
  mounted() {
    const colors = this.themeMeta?.confettiColors || DEFAULT_CONFETTI_COLORS;
    this.confettiSettings = { ...this.confettiSettings, colors };
    this.confetti = new ConfettiGenerator(this.confettiSettings);

    this._visibilityHandler = () => this.handleVisibilityChange();
    document.addEventListener("visibilitychange", this._visibilityHandler);

    if (this.isVisibleConfetti) {
      this.startConfetti();
    }
  },
  beforeDestroy() {
    if (this._visibilityHandler) {
      document.removeEventListener("visibilitychange", this._visibilityHandler);
      this._visibilityHandler = null;
    }
    this.stopBurst();
    if (this.confetti) {
      this.confetti.clear();
      this.confetti = null;
    }
  },
  methods: {
    startConfetti() {
      if (this.variant === "mainPrize") {
        this.playWheelExplosion();
        return;
      }

      if (this.confetti) {
        this.confetti.render();
      }
    },
    clearConfetti() {
      this.stopBurst();

      if (this.confetti) {
        this.confetti.clear();
        this.confetti = new ConfettiGenerator(this.confettiSettings);
      }
    },
    stopBurst() {
      if (this._burstRaf) {
        window.cancelAnimationFrame(this._burstRaf);
        this._burstRaf = null;
      }
      this._burst = null;
      this._burstRender = null;
      this._burstStartedAt = 0;
      this._burstPauseElapsed = 0;

      this.clearCanvas();
    },
    prepareCanvas() {
      const canvas = this.$refs.confettiCanvas;
      if (!canvas) return null;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return ctx;
    },
    clearCanvas() {
      const canvas = this.$refs.confettiCanvas;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    },
    getWheelOrigin() {
      const wheel = document.querySelector(".wheel-stage");
      const bounds = wheel?.getBoundingClientRect();

      if (!bounds) {
        return {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
      }

      return {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2
      };
    },
    handleVisibilityChange() {
      if (!this._burst) return;

      if (document.hidden) {
        if (this._burstRaf) {
          window.cancelAnimationFrame(this._burstRaf);
          this._burstRaf = null;
          this._burstPauseElapsed = performance.now() - this._burstStartedAt;
        }
        return;
      }

      if (this._burstPauseElapsed > 0 && this._burstRender) {
        this._burstStartedAt = performance.now() - this._burstPauseElapsed;
        this._burstPauseElapsed = 0;
        this._burstRaf = window.requestAnimationFrame(this._burstRender);
      }
    },
    buildBurstData(particleCount, origin, viewportWidth, viewportHeight, mobile, colors) {
      const xs = new Float32Array(particleCount);
      const ys = new Float32Array(particleCount);
      const targetXs = new Float32Array(particleCount);
      const targetYs = new Float32Array(particleCount);
      const sizes = new Float32Array(particleCount);
      const delays = new Float32Array(particleCount);
      const invDurations = new Float32Array(particleCount);
      const wobbles = new Float32Array(particleCount);
      const wobbleSpeeds = new Float32Array(particleCount);
      const airLifts = new Float32Array(particleCount);
      const airDrifts = new Float32Array(particleCount);
      const fanDelays = new Float32Array(particleCount);
      const invFanRanges = new Float32Array(particleCount);
      const rotations = new Float32Array(particleCount);
      const spins = new Float32Array(particleCount);
      const colorIdx = new Uint8Array(particleCount);
      const shapes = new Uint8Array(particleCount);

      const spreadPadding = Math.max(viewportWidth, viewportHeight) * 0.18;
      const maxDuration = mobile ? 4300 : 4600;
      const colorCount = colors.length;
      const startRadiusMax = mobile ? 34 : 58;
      const sizeBase = mobile ? 1.8 : 1.6;
      const sizeRange = mobile ? 3.4 : 4.2;
      const airLiftBase = mobile ? 90 : 150;
      const airLiftRange = mobile ? 190 : 330;
      const airDriftRange = mobile ? 120 : 260;

      // Round-robin color assignment, then sort indices by color so the
      // serialized arrays are color-grouped (enables fillStyle batching).
      const indices = new Uint32Array(particleCount);
      const tmpColorIdx = new Uint8Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        indices[i] = i;
        tmpColorIdx[i] = i % colorCount;
      }
      indices.sort((a, b) => tmpColorIdx[a] - tmpColorIdx[b]);

      for (let dst = 0; dst < particleCount; dst++) {
        const src = indices[dst];
        const angle = Math.random() * TWO_PI;
        const startRadius = Math.random() * startRadiusMax;
        const duration = 3650 + Math.random() * (maxDuration - 3650);
        const fanDelay = 0.52 + Math.random() * 0.14;

        xs[dst] = origin.x + Math.cos(angle) * startRadius;
        ys[dst] = origin.y + Math.sin(angle) * startRadius;
        targetXs[dst] = (Math.random() * (viewportWidth + spreadPadding * 2)) - spreadPadding;
        targetYs[dst] = (Math.random() * (viewportHeight + spreadPadding * 1.4)) - spreadPadding * 0.7;
        sizes[dst] = sizeBase + Math.random() * sizeRange;
        delays[dst] = Math.random() * 240;
        invDurations[dst] = 1 / duration;
        wobbles[dst] = 12 + Math.random() * 34;
        wobbleSpeeds[dst] = 5 + Math.random() * 9;
        airLifts[dst] = airLiftBase + Math.random() * airLiftRange;
        airDrifts[dst] = (Math.random() - 0.5) * airDriftRange;
        fanDelays[dst] = fanDelay;
        invFanRanges[dst] = 1 / (1 - fanDelay);
        rotations[dst] = Math.random() * Math.PI;
        spins[dst] = (Math.random() - 0.5) * 9;
        colorIdx[dst] = tmpColorIdx[src];
        shapes[dst] = Math.random() > 0.62 ? SHAPE_SQUARE : SHAPE_CIRCLE;
      }

      return {
        count: particleCount,
        xs, ys, targetXs, targetYs, sizes, delays, invDurations,
        wobbles, wobbleSpeeds, airLifts, airDrifts, fanDelays, invFanRanges,
        rotations, spins, colorIdx, shapes,
        colorStrings: colors,
        viewportWidth, viewportHeight
      };
    },
    playWheelExplosion() {
      this.stopBurst();
      const ctx = this.prepareCanvas();
      if (!ctx) return;

      const origin = this.origin || this.getWheelOrigin();
      const colors = (this.themeMeta?.confettiColors || DEFAULT_CONFETTI_COLORS)
        .map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);
      const mobile = isMobile();
      const particleCount = mobile ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      this._burst = this.buildBurstData(
        particleCount, origin, viewportWidth, viewportHeight, mobile, colors
      );
      this._burstStartedAt = performance.now();
      this._burstPauseElapsed = 0;

      const cullMinX = -50;
      const cullMaxX = viewportWidth + 50;
      const cullMinY = -50;
      const cullMaxY = viewportHeight + 50;

      const render = (now) => {
        const burst = this._burst;
        if (!burst) return;

        ctx.clearRect(0, 0, viewportWidth, viewportHeight);

        const xs = burst.xs;
        const ys = burst.ys;
        const targetXs = burst.targetXs;
        const targetYs = burst.targetYs;
        const sizes = burst.sizes;
        const delays = burst.delays;
        const invDurations = burst.invDurations;
        const wobbles = burst.wobbles;
        const wobbleSpeeds = burst.wobbleSpeeds;
        const airLifts = burst.airLifts;
        const airDrifts = burst.airDrifts;
        const fanDelays = burst.fanDelays;
        const invFanRanges = burst.invFanRanges;
        const rotations = burst.rotations;
        const spins = burst.spins;
        const colorIdx = burst.colorIdx;
        const shapes = burst.shapes;
        const colorStrings = burst.colorStrings;
        const count = burst.count;

        const elapsedBase = now - this._burstStartedAt;
        let active = false;
        let currentColor = -1;

        for (let i = 0; i < count; i++) {
          const elapsed = elapsedBase - delays[i];
          if (elapsed < 0) {
            active = true;
            continue;
          }

          let progress = elapsed * invDurations[i];
          if (progress >= 1) {
            progress = 1;
          } else {
            active = true;
          }

          const oneMinusP = 1 - progress;
          const eased = 1 - oneMinusP * oneMinusP * oneMinusP;

          const fanRaw = (progress - fanDelays[i]) * invFanRanges[i];
          const fanClamped = fanRaw < 0 ? 0 : (fanRaw > 1 ? 1 : fanRaw);
          const fan = fanClamped * fanClamped * (3 - 2 * fanClamped);

          const fall = 34 * progress * progress * (1 - fan * 0.75);
          const rotation = rotations[i];
          const wobbleAmp = wobbles[i];
          const wobble = Math.sin(progress * wobbleSpeeds[i] * Math.PI + rotation) * wobbleAmp;
          const fanWave = Math.sin(progress * PI_5_8 + rotation) * wobbleAmp * 1.45;

          const x = xs[i] +
            (targetXs[i] - xs[i]) * eased +
            wobble * (1 - progress * 0.45) +
            (airDrifts[i] + fanWave) * fan;
          const y = ys[i] +
            (targetYs[i] - ys[i]) * eased +
            fall -
            (airLifts[i] * fan);

          if (x < cullMinX || x > cullMaxX || y < cullMinY || y > cullMaxY) continue;

          const fadeIn = progress < 0.08 ? progress * 12.5 : 1;
          const fadeOut = progress > 0.86 ? (1 - ((progress - 0.86) * 7.142857)) : 1;
          const opacity = fadeIn * fadeOut;
          if (opacity <= 0) continue;

          const ci = colorIdx[i];
          if (ci !== currentColor) {
            ctx.fillStyle = colorStrings[ci];
            currentColor = ci;
          }
          ctx.globalAlpha = opacity;

          const size = sizes[i];

          if (shapes[i] === SHAPE_CIRCLE) {
            const r = size * 0.5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, TWO_PI);
            ctx.fill();
          } else {
            const half = size * 0.5;
            const rot = rotation + spins[i] * progress;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillRect(-half, -half, size, size);
            ctx.restore();
          }
        }

        ctx.globalAlpha = 1;

        if (active) {
          this._burstRaf = window.requestAnimationFrame(render);
          return;
        }

        this.clearCanvas();
        this._burst = null;
        this._burstRender = null;
        this._burstRaf = null;
      };

      this._burstRender = render;
      this._burstRaf = window.requestAnimationFrame(render);
    }
  }
};
</script>

<style scoped>
.confetti-root {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti-layer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 35;
  display: block;
}
</style>
