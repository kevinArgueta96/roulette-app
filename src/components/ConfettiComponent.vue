<template>
  <canvas id="confetti-container" class="confetti-layer"></canvas>
</template>

<script>
import ConfettiGenerator from "confetti-js";

export default {
  name: "ConfettiComponent",
  props: {
    isVisibleConfetti: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      confetti: null,
      confettiSettings: {
        target: "confetti-container",
        respawn: true,
        max: 80,
        size: 1.5,
        clock: 25,
        props: ["circle"],
        colors: [
          [255, 80, 20],
          [255, 237, 163],
          [201, 236, 255],
          [43, 53, 58]
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
