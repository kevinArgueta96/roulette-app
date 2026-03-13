<template>
  <div class="result-shell" :class="{ 'result-shell--visible': visible }">
    <img
      v-if="srcImg"
      :src="srcImg"
      class="result-image"
      :alt="imageAlt"
      :style="{ '--gift-size': `${sizeGift || 16}rem` }"
    />
    <p v-else class="result-placeholder">Esperando resultado</p>
  </div>
</template>

<script>
export default {
  name: "WinColumn",
  props: {
    srcImg: {
      type: String,
      default: ""
    },
    visible: {
      type: Boolean,
      default: false
    },
    winType: {
      type: String,
      default: ""
    },
    sizeGift: {
      type: Number,
      default: 0
    }
  },
  computed: {
    imageAlt() {
      return this.winType ? `Premio ${this.winType}` : "Premio";
    }
  }
};
</script>

<style scoped>
.result-shell {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 240ms ease, transform 240ms ease;
}

.result-shell--visible {
  opacity: 1;
}

.result-image {
  width: min(100%, var(--gift-size));
  max-height: min(40vh, 22rem);
  object-fit: contain;
  animation: fadeIn 320ms ease;
}

.result-placeholder {
  margin: 0;
  color: rgba(43, 53, 58, 0.45);
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
