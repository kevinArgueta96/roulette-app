<template>
  <canvas id="confetti-container" class="confetti-layer"></canvas>
</template>

<script>
import ConfettiGenerator from "confetti-js";

const isMobile = () => window.matchMedia("(max-width: 768px)").matches
  || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default {
  name: "ConfettiComponent",
  props: {
    isVisibleConfetti: {
      type: Boolean,
      default: false
    }
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
        colors: [
          [216, 187, 113],
          [245, 215, 138],
          [246, 237, 209],
          [255, 80, 20],
          [255, 255, 255],
          [46, 94, 57],
          [203, 48, 39],
          [154, 115, 37]
        ]
      }
    };
  },
  watch: {
    isVisibleConfetti: {
      immediate: true,
      handler(isVisible) {
        if (!this.confetti) {
          return;
        }

        if (isVisible) {
          this.confetti.render();
          return;
        }

        this.confetti.clear();
        this.confetti = new ConfettiGenerator(this.confettiSettings);
      }
    }
  },
  mounted() {
    this.confetti = new ConfettiGenerator(this.confettiSettings);

    if (this.isVisibleConfetti) {
      this.confetti.render();
    }
  },
  beforeDestroy() {
    if (this.confetti) {
      this.confetti.clear();
      this.confetti = null;
    }
  }
};
</script>

<style scoped>
.confetti-layer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
