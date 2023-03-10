<template>
  <div id="app">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />
    <div class="container text-center" id="container-objects">
      <div class="col-sm-12">
        <div class="row" id="null-column">
          <WinRowComponent srcImg="/img/loose-image.png" :visible="isVisbleLooseImg" />
        </div>
      </div>
      <div class="row" style="height: 100%;">
        <div class="col-sm-1 win-colmun">
          <div class="row" id="null-column-top"></div>
          <div class="row" id="null-column">
            <WinRowComponent srcImg="/img/win-image.png" :visible="isVisbleWinImg" />
          </div>
          <div class="row" id="null-column"></div>
        </div>
        <div class="col-sm-10 win-central">
          <RouletteCompoment @showImg="showImg" />
        </div>
        <div class="col-sm-1 win-colmun">
          <div class="row" id="null-column-top"></div>
          <div class="row" id="null-column-rigth">
            <WinRowComponent srcImg="/img/win-image.png" :visible="isVisbleWinImg" />
          </div>
          <div class="row" id="null-column"></div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="col-auto text-center p-5">
        <img src="/img/logo-img.png" class="img-fluid" alt="Responsive image" />
      </div>
    </div>
  </div>
</template>

<script>
import RouletteCompoment from "./components/RouletteCompoment.vue";
import WinRowComponent from "./components/WinRowComponent.vue";
import ConfettiComponent from "./components/ConfettiComponent.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "App",
  components: {
    RouletteCompoment,
    WinRowComponent,
    ConfettiComponent,
  },
  data: () => {
    return {
      isVisbleWinImg: false,
      isVisbleLooseImg: false,
      isVisibleConfetti: false,
    };
  },
  computed: {
    ...mapGetters(["timeToShowOptions"]),
  },
  mounted() {
    this.getOptions();
    this.getTotalReplay();
    this.getTotalSpecialPrice();
    this.getTotalSurpriseWin();
    this.getTopPrice();
  },
  methods: {
    ...mapActions(["setOptions","setTotalReplay","setTotalSpecialPrice","setTotalSpecialSurprise","setTotalTopPrice"]),
    showImg(value) {
      if (value.type === "loose") {
        this.isVisbleLooseImg = true;
      } else if (value.type === "win") {
        this.isVisbleWinImg = true;
      } else {
        this.isVisibleConfetti = !this.isVisibleConfetti;
      }
    },
    getOptions() {
      fetch(
        "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/roulette.json",{}
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          for (const id in data) {
            this.setOptions(data[id]);
          }
        });
    },
    getTotalReplay() {
      fetch(
        "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/replay.json",{}
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          for (const id in data) {
            const payload = {
              id: id,
              totalReplay: data[id].totalReplay
            }
            this.setTotalReplay(payload)
          }
        });
    },
    getTotalSpecialPrice() {
      fetch(
        "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/special-price.json",{}
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          for (const id in data) {
            const payload = {
              id: id,
              totalSpecialPrice: data[id].totalSpecialPrice
            }
            this.setTotalSpecialPrice(payload)
          }
        });
    },
    getTotalSurpriseWin() {
      fetch(
        "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/surprise-win.json",{}
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          for (const id in data) {
            const payload = {
              id: id,
              totalSpecialSurprise: data[id].totalSpecialSurprise
            }
            this.setTotalSpecialSurprise(payload)
          }
        });
    },
    getTopPrice() {
      fetch(
        "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/top-price.json",{}
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          for (const id in data) {
            const payload = {
              id: id,
              totalTopPrice: data[id].totalTopPrice
            }
            this.setTotalTopPrice(payload)
          }
        });
    },
  },
  watch: {
    isVisbleWinImg(value) {
      if (value) {
        setTimeout(() => {
          this.isVisbleWinImg = !this.isVisbleWinImg;
        }, this.timeToShowOptions);
      }
    },
    isVisbleLooseImg(value) {
      if (value) {
        setTimeout(() => {
          this.isVisbleLooseImg = !this.isVisbleLooseImg;
        }, this.timeToShowOptions);
      }
    },
    isVisibleConfetti(value) {
      if (value) {
        setTimeout(() => {
          this.isVisibleConfetti = !this.isVisibleConfetti;
        }, this.timeToShowOptions);
      }
    },
  },
};
</script>

<style>
#app {
  height: 85%;
  margin-top: 20px;
}
</style>