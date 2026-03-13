<template>
  <div id="app" class="app-shell">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />

    <main class="app-layout">
      <aside class="result-panel" :class="{ 'result-panel--visible': hasResult }">
        <WinRowComponent
          :srcImg="srcImg"
          :visible="hasResult"
          :winType="winType"
          :sizeGift="sizeGift"
        />
      </aside>

      <section class="roulette-panel">
        <div class="roulette-card">
          <div class="roulette-copy">
            <p class="roulette-copy__eyebrow">Roulette App</p>
            <h1>Ruleta de premios</h1>
            <p>
              Gira con el boton o usando <code>Enter</code> y <code>Espacio</code>.
            </p>
          </div>

          <RouletteCompoment @showImg="showImg" />
        </div>
      </section>

      <aside class="result-panel result-panel--secondary" :class="{ 'result-panel--visible': hasResult }">
        <WinRowComponent
          :srcImg="srcImg"
          :visible="hasResult"
          :winType="winType"
          :sizeGift="sizeGift"
        />
      </aside>
    </main>

    <footer class="app-footer">
      <img src="/img/logo-img.png" class="app-footer__logo" alt="Storytel" />
    </footer>
  </div>
</template>

<script>
import RouletteCompoment from "./components/RouletteCompoment.vue";
import WinRowComponent from "./components/WinRowComponent.vue";
import ConfettiComponent from "./components/ConfettiComponent.vue";
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";

const RESULT_CONFIG = {
  replay: {
    srcImg: "gift/replay.gif",
    duration: 2500,
    sizeGift: 18,
    confetti: false
  },
  individualBox: {
    srcImg: "gift/gifts_storytel_individual.gif",
    duration: 7000,
    sizeGift: 18,
    confetti: true
  },
  giftCard: {
    srcImg: "gift/gift_card.gif",
    duration: 7000,
    sizeGift: 18,
    confetti: true
  },
  differentBoxes: {
    srcImg: "gift/gifts_storytel_boxes.gif",
    duration: 7000,
    sizeGift: 18,
    confetti: true
  },
  topPrice: {
    srcImg: "gift/gifts_storytel_boxes.gif",
    duration: 7000,
    sizeGift: 16,
    confetti: true
  },
  tesla: {
    srcImg: "gift/tesla_win.gif",
    duration: 7000,
    sizeGift: 16,
    confetti: true
  }
};

export default {
  name: "App",
  components: {
    RouletteCompoment,
    WinRowComponent,
    ConfettiComponent
  },
  data() {
    return {
      srcImg: "",
      winType: "",
      sizeGift: 0,
      isVisibleConfetti: false,
      resultTimer: null
    };
  },
  computed: {
    ...mapGetters(["timeToShowOptions"]),
    hasResult() {
      return Boolean(this.srcImg);
    }
  },
  mounted() {
    this.loadInitialData();
  },
  beforeDestroy() {
    this.clearTimers();
  },
  methods: {
    ...mapActions(["initializeRandomAngle", "updateState"]),
    async loadInitialData() {
      this.initializeRandomAngle();

      const [options, totals, giftCards, topPrices, teslaPrices] = await Promise.all([
        service.getOptions(),
        service.getTotals(),
        service.getGiftCards(),
        service.getTopPrices(),
        service.getTeslaWin()
      ]);

      if (options && options !== "error") {
        this.defineState("setOptions", options.sectors || options);
      }

      if (totals && totals !== "error") {
        const mutationMap = {
          totalReplay: "setTotalReplay",
          totalSpecialPrice: "setTotalSpecialPrice",
          totalSpecialSurprise: "setTotalSpecialSurprise",
          totalTopPrice: "setTotalTopPrice",
          totalGiftCard: "setTotalGiftCard",
          totalSpin: "setTotalSpin"
        };

        Object.keys(mutationMap).forEach((key) => {
          if (typeof totals[key] !== "undefined") {
            this.defineState(mutationMap[key], totals[key]);
          }
        });
      }

      if (giftCards && giftCards !== "error") {
        this.defineState("setGiftCards", Object.values(giftCards));
      }

      if (topPrices && topPrices !== "error") {
        this.defineState("setTopPrices", Object.values(topPrices));
      }

      if (teslaPrices && teslaPrices !== "error") {
        this.defineState("setTeslaPrices", Object.values(teslaPrices));
      }
    },
    showImg({ type }) {
      const result = RESULT_CONFIG[type];

      if (!result) {
        this.defineState("setSpinRoullete", true);
        return;
      }

      this.clearTimers();
      this.srcImg = result.srcImg;
      this.winType = type;
      this.sizeGift = result.sizeGift;
      this.isVisibleConfetti = result.confetti;
      this.defineState("setTimeToShowOptions", result.duration);

      this.resultTimer = window.setTimeout(() => {
        this.resetResultState();
      }, result.duration);
    },
    resetResultState() {
      this.clearTimers();
      this.srcImg = "";
      this.winType = "";
      this.sizeGift = 0;
      this.isVisibleConfetti = false;
      this.defineState("setSpinRoullete", true);
    },
    clearTimers() {
      if (this.resultTimer) {
        window.clearTimeout(this.resultTimer);
        this.resultTimer = null;
      }
    },
    defineState(mutationType, payload) {
      this.updateState({
        mutationType,
        payload
      });
    }
  }
};
</script>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-layout {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(180px, 0.9fr) minmax(320px, 1.8fr) minmax(180px, 0.9fr);
  gap: clamp(1rem, 2vw, 1.5rem);
  align-items: stretch;
}

.roulette-panel,
.result-panel {
  min-height: 0;
}

.roulette-card,
.result-panel {
  border: 1px solid rgba(43, 53, 58, 0.12);
  background: rgba(255, 250, 248, 0.88);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 70px rgba(43, 53, 58, 0.1);
  border-radius: 28px;
}

.roulette-card {
  height: 100%;
  padding: clamp(1.25rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.roulette-copy {
  text-align: center;
}

.roulette-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  line-height: 1;
  color: #2b353a;
}

.roulette-copy p {
  margin: 0.65rem 0 0;
  color: rgba(43, 53, 58, 0.72);
  font-size: clamp(0.95rem, 1.6vw, 1.1rem);
}

.roulette-copy code {
  font-family: inherit;
  font-weight: 700;
  color: #2b353a;
}

.roulette-copy__eyebrow {
  margin: 0 0 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.74rem;
  color: #ff501c;
  font-weight: 700;
}

.result-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  min-height: 220px;
  opacity: 0.45;
  transition: opacity 220ms ease, transform 220ms ease;
}

.result-panel--visible {
  opacity: 1;
  transform: translateY(0);
}

.app-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 0.5rem;
}

.app-footer__logo {
  width: min(240px, 42vw);
  max-width: 100%;
  object-fit: contain;
}

@media (max-width: 1100px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .result-panel--secondary {
    display: none;
  }

  .result-panel {
    min-height: 180px;
  }
}

@media (max-width: 640px) {
  .app-shell {
    padding: 0.85rem;
  }

  .roulette-card,
  .result-panel {
    border-radius: 22px;
  }

  .result-panel {
    min-height: 150px;
  }
}
</style>
