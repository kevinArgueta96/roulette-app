<template>
  <canvas id="confetti-container"></canvas>
</template>

<script>
import ConfettiGenerator from "confetti-js";

export default {
  data: () => {
    return {
      confetti: null,
      confettiSettings : {
      target: "confetti-container",
      respawn: true,
      max: 80,
      size: 1.5,
      clock: 25,
      props: ["circle"],
      colors: [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
      ],
    }
    };
  },
  props: {
    isVisibleConfetti: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    showConfetti() {
      this.confetti.render();
    },
  },
  computed: {
    confettiVisible() {
      return this.isVisibleConfetti;
    },
  },
  mounted() {
    this.confetti = new ConfettiGenerator(this.confettiSettings);
  },

  watch: {
    confettiVisible(val) {
      if (val) {
        this.confetti.render();
        setTimeout(() => {
          this.confetti.clear();
          this.confetti = null;
          this.confetti = new ConfettiGenerator(this.confettiSettings);
        }, 4000);
      }
    },
  },
};
</script>

<style scoped>
#confetti-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
