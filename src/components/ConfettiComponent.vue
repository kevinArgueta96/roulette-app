<template>
  <canvas id="confetti-container" style="background-color: #fdf1f0; z-index: -1;"></canvas>
</template>

<script>
import ConfettiGenerator from "confetti-js";
import { mapGetters } from "vuex";

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
        [255, 80, 20],
        [255, 237, 163],
        [201, 236, 255],
        [43, 53, 58],
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
    ...mapGetters(['timeToShowOptions']),
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
        }, this.timeToShowOptions);
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
