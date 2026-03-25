<template>
  <div class="result-shell" :class="[`result-shell--${winType || 'idle'}`, { 'result-shell--visible': visible }]">
    <template v-if="resultCopy">
      <div class="result-card">
        <p class="result-kicker">{{ resultCopy.kicker }}</p>
        <h2>{{ resultCopy.title }}</h2>
        <p class="result-description">{{ resultCopy.description }}</p>
      </div>
    </template>
    <p v-else class="result-placeholder">Esperando resultado</p>
  </div>
</template>

<script>
const RESULT_COPY = {
  mainPrize: {
    kicker: "Main prize",
    title: "LAHJAKASSI",
    description: "Premio principal desbloqueado."
  },
  surpriseWin: {
    kicker: "Surprise win",
    title: "Yllätyspalkinto",
    description: "Ganaste un premio sorpresa."
  },
  repeat: {
    kicker: "Repeat",
    title: "Kokeile uudestaan",
    description: "Tienes otra oportunidad."
  },
  noWin: {
    kicker: "No win",
    title: "Esta vez no hubo premio",
    description: "Las secciones verdes no otorgan premio."
  }
};

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
    resultCopy() {
      return RESULT_COPY[this.winType] || null;
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

.result-card {
  width: min(100%, 22rem);
  border-radius: 24px;
  padding: 1.5rem;
  color: #fff;
  box-shadow: 0 20px 40px rgba(43, 53, 58, 0.16);
  animation: fadeIn 320ms ease;
}

.result-shell--mainPrize .result-card {
  background: linear-gradient(135deg, #ffcc4d 0%, #ff8a3d 100%);
  color: #2b353a;
}

.result-shell--surpriseWin .result-card {
  background: linear-gradient(135deg, #ff8a3d 0%, #ff501c 100%);
}

.result-shell--repeat .result-card {
  background: linear-gradient(135deg, #4b5563 0%, #111827 100%);
}

.result-shell--noWin .result-card {
  background: linear-gradient(135deg, #72bf78 0%, #4d9f57 100%);
}

.result-kicker {
  margin: 0 0 0.5rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  opacity: 0.8;
  font-weight: 700;
}

h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  line-height: 1;
}

.result-description {
  margin: 0.85rem 0 0;
  font-size: 1rem;
  line-height: 1.45;
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
