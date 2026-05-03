<template>
  <div class="confetti-root">
    <canvas id="confetti-container" ref="confettiCanvas" class="confetti-layer"></canvas>
    <div class="burst-layer" aria-hidden="true">
      <span
        v-for="particle in burstParticles"
        :key="particle.id"
        class="burst-particle"
        :style="particle.style"
      ></span>
    </div>
  </div>
</template>

<script>
import ConfettiGenerator from "confetti-js";

const isMobile = () => window.matchMedia("(max-width: 768px)").matches
  || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const CONFETTI_COLORS = {
  parrano: [
    [216, 187, 113],
    [245, 215, 138],
    [246, 237, 209],
    [255, 80, 20],
    [255, 255, 255],
    [46, 94, 57],
    [203, 48, 39],
    [154, 115, 37]
  ],
  storytel: [
    [255, 80, 28],
    [43, 53, 58],
    [255, 196, 0],
    [50, 110, 220],
    [220, 40, 100],
    [0, 166, 118]
  ]
};

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
  data() {
    const mobile = isMobile();
    const theme = process.env.VUE_APP_THEME || "parrano";
    return {
      confetti: null,
      burstParticles: [],
      burstTimers: [],
      burstRaf: null,
      confettiSettings: {
        target: "confetti-container",
        respawn: true,
        max: mobile ? 60 : 220,
        size: mobile ? 1.2 : 1.8,
        clock: mobile ? 22 : 16,
        rotate: !mobile,
        props: ["circle"],
        colors: CONFETTI_COLORS[theme] || CONFETTI_COLORS.parrano
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
  mounted() {
    this.confetti = new ConfettiGenerator(this.confettiSettings);

    if (this.isVisibleConfetti) {
      this.startConfetti();
    }
  },
  beforeDestroy() {
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
      this.burstTimers.forEach((timer) => window.clearTimeout(timer));
      this.burstTimers = [];
      this.burstParticles = [];

      if (this.burstRaf) {
        window.cancelAnimationFrame(this.burstRaf);
        this.burstRaf = null;
      }

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
    easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    },
    smoothStep(value) {
      const clamped = Math.max(0, Math.min(1, value));
      return clamped * clamped * (3 - (2 * clamped));
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
    playWheelExplosion() {
      this.stopBurst();
      const ctx = this.prepareCanvas();
      if (!ctx) return;

      const origin = this.origin || this.getWheelOrigin();
      const colors = (CONFETTI_COLORS.storytel || CONFETTI_COLORS.parrano)
        .map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);
      const mobile = isMobile();
      const particleCount = mobile ? 1500 : 4200;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spreadPadding = Math.max(viewportWidth, viewportHeight) * 0.18;
      const maxDuration = mobile ? 2300 : 2600;

      this.burstParticles = Array.from({ length: particleCount }, (_, index) => {
        const angle = Math.random() * Math.PI * 2;
        const startRadius = Math.random() * (mobile ? 34 : 58);
        const targetX = (Math.random() * (viewportWidth + spreadPadding * 2)) - spreadPadding;
        const targetY = (Math.random() * (viewportHeight + spreadPadding * 1.4)) - spreadPadding * 0.7;
        const size = mobile ? 1.8 + Math.random() * 3.4 : 1.6 + Math.random() * 4.2;

        return {
          x: origin.x + Math.cos(angle) * startRadius,
          y: origin.y + Math.sin(angle) * startRadius,
          targetX,
          targetY,
          size,
          color: colors[index % colors.length],
          delay: Math.random() * 240,
          duration: 1650 + Math.random() * (maxDuration - 1650),
          wobble: 12 + Math.random() * 34,
          wobbleSpeed: 5 + Math.random() * 9,
          airLift: (mobile ? 90 : 150) + Math.random() * (mobile ? 190 : 330),
          airDrift: (Math.random() - 0.5) * (mobile ? 120 : 260),
          fanDelay: 0.52 + Math.random() * 0.14,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 9,
          shape: Math.random() > 0.62 ? "square" : "circle"
        };
      });

      const startedAt = performance.now();
      const render = (now) => {
        ctx.clearRect(0, 0, viewportWidth, viewportHeight);

        let active = false;
        this.burstParticles.forEach((particle) => {
          const elapsed = now - startedAt - particle.delay;
          if (elapsed < 0) {
            active = true;
            return;
          }

          const progress = Math.min(1, elapsed / particle.duration);
          if (progress < 1) active = true;

          const eased = this.easeOutCubic(progress);
          const fan = this.smoothStep((progress - particle.fanDelay) / (1 - particle.fanDelay));
          const fall = 34 * progress * progress * (1 - fan * 0.75);
          const wobble = Math.sin((progress * particle.wobbleSpeed * Math.PI) + particle.rotation) * particle.wobble;
          const fanWave = Math.sin((progress * 5.8 * Math.PI) + particle.rotation) * particle.wobble * 1.45;
          const x = particle.x +
            (particle.targetX - particle.x) * eased +
            wobble * (1 - progress * 0.45) +
            (particle.airDrift + fanWave) * fan;
          const y = particle.y +
            (particle.targetY - particle.y) * eased +
            fall -
            (particle.airLift * fan);
          const fadeIn = Math.min(1, progress / 0.08);
          const fadeOut = progress > 0.86 ? Math.max(0, 1 - ((progress - 0.86) / 0.14)) : 1;
          const opacity = fadeIn * fadeOut;

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = particle.color;
          ctx.translate(x, y);
          ctx.rotate(particle.rotation + particle.spin * progress);

          if (particle.shape === "square") {
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });

        if (active) {
          this.burstRaf = window.requestAnimationFrame(render);
          return;
        }

        this.clearCanvas();
        this.burstParticles = [];
        this.burstRaf = null;
      };

      this.burstRaf = window.requestAnimationFrame(render);
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
}

.confetti-layer {
  display: block;
}

.burst-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}

.burst-particle {
  position: absolute;
  display: block;
  border-radius: 999px;
  transform: translate(-50%, -50%) scale(0.5);
  opacity: 0;
  will-change: transform, opacity;
  animation: wheel-confetti-burst cubic-bezier(0.16, 0.84, 0.28, 1) forwards;
}

@keyframes wheel-confetti-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }

  8% {
    opacity: 1;
  }

  55% {
    opacity: 1;
    transform: translate(
      calc(-50% + var(--burst-x) * 0.85),
      calc(-50% + var(--burst-y) * 0.85)
    ) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(
      calc(-50% + var(--burst-x)),
      calc(-50% + var(--burst-y) + 40px)
    ) scale(0.85);
  }
}
</style>
