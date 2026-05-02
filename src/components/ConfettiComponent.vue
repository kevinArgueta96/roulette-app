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
      const origin = this.origin || this.getWheelOrigin();
      const colors = (CONFETTI_COLORS.storytel || CONFETTI_COLORS.parrano)
        .map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);
      const mobile = isMobile();
      const particleCount = mobile ? 260 : 720;
      const spreadPadding = Math.max(window.innerWidth, window.innerHeight) * 0.16;

      this.burstParticles = Array.from({ length: particleCount }, (_, index) => {
        const targetX = Math.random() * (window.innerWidth + spreadPadding * 2) - spreadPadding;
        const targetY = Math.random() * (window.innerHeight + spreadPadding * 2) - spreadPadding;
        const size = mobile ? 3.5 + Math.random() * 5.5 : 3 + Math.random() * 6;
        const duration = 1500 + Math.random() * 400;
        const delay = Math.random() * 80;

        return {
          id: `${Date.now()}-${index}`,
          style: {
            left: `${origin.x}px`,
            top: `${origin.y}px`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: colors[index % colors.length],
            "--burst-x": `${targetX - origin.x}px`,
            "--burst-y": `${targetY - origin.y}px`,
            animationDuration: `${duration}ms`,
            animationDelay: `${delay}ms`
          }
        };
      });

      this.burstTimers.push(window.setTimeout(() => {
        this.burstParticles = [];
      }, 2100));
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
