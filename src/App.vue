<template>
  <div id="app">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />
    <div class="container text-center" id="container-objects">
      <div class="col-sm-12">
        <!-- <div class="row" id="null-column">
          <WinRowComponent :srcImg="srcImg" :visible="isVisbleLooseImg" />
        </div>-->
      </div>
      <div class="row" style="height: 100%;">
        <div class="col-sm-1 win-colmun" :style="{right:leftImg + 'px'}">
          <div class="row" id="null-column-top"></div>
          <div class="row" id="null-column">
            <WinRowComponent :srcImg="srcImg" :visible="isVisbleWinImg" :winType="winType" v-if="showRoulette" :sizeGift="sizeGift"/>
          </div>
          <div class="row" id="null-column"></div>
        </div>
        <div class="col-sm-10 win-central" style="overflow: visible;" v-if="showRoulette">
          <RouletteCompoment @showImg="showImg" />
        </div>
        <div class="col-sm-1 win-colmun" :style="{right:rightImg + 'px'}">
          <div class="row" id="null-column-top"></div>
          <div class="row" id="null-column-right">
            <WinRowComponent :srcImg="srcImg" :visible="isVisbleLooseImg" :winType="winType" v-if="showRoulette" :sizeGift="sizeGift"/>
          </div>
          <div class="row" id="null-column"></div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="col-auto text-center p-5 footer-img">
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
import service from "@/services/totals.service";

export default {
  name: "App",
  components: {
    RouletteCompoment,
    WinRowComponent,
    ConfettiComponent
  },
  data: () => {
    return {
      isVisbleWinImg: false,
      isVisbleLooseImg: false,
      isVisibleConfetti: false,
      screenWidth: 0,
      screenHeight: 0,
      srcImg: "",
      winType: "",

      showRoulette: true,

      rightImg: 0,
      leftImg: 0,

      sizeGift: 0
    };
  },
  computed: {
    ...mapGetters(["timeToShowOptions"])
  },
  mounted() {
    this.controlGift();
    this.getOptions();
    this.getTotals();
    this.getGiftCards();
    this.getTopPrices();
  },
  created() {
    this.initializeRandomAngle();
    window.addEventListener("resize", this.handleResize);
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    ...mapActions([
      "setOptions",
      "setTotalReplay",
      "setTotalSpecialPrice",
      "setTotalSpecialSurprise",
      "setTotalTopPrice",
      "setTotalGiftCard",
      "setTotalSpin",

      "setGiftCardScheduleRangeH",

      "setGiftCards",
      "setTopPrices",

      "setSpinRoullete",

      "setTimeToShowOptions",

      "initializeRandomAngle"
    ]),
    spinRoulleteByEnter(event) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        this.spin();
      }
    },
    controlGift() {
      if (window.innerWidth <= 1366) {
        this.rightImg = 100;
        this.leftImg = 100;
      } else if (window.innerWidth <= 1444) {
        this.rightImg = 100;
        this.leftImg = 50;
      } else if (window.innerWidth <= 1980) {
        this.rightImg = 50;
        this.leftImg = 100;
      } else {
        this.rightImg = 10;
        this.leftImg = 100;
      }
    },
    handleResize() {
      this.controlGift();
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    },
    showImg(value) {
      const { type } = value;
      switch (type) {
        case "replay":
          this.srcImg = "gift/replay.gif";
          this.isVisbleWinImg = false;
          this.isVisbleLooseImg = true;
          this.winType = "replay";
          this.setTimeToShowOptions(2500);
          this.sizeGift = 30;
          break;
        case "individualBox":
          this.srcImg = "gift/gifts_storytel_individual.gif";
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg = false;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          this.setTimeToShowOptions(7000);
          this.winType = "individualBox";
          this.sizeGift = 30;
          break;
        case "giftCard":
          this.srcImg = "gift/gift_card.gif";
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg = false;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          this.setTimeToShowOptions(7000);
          this.winType = "giftCard";
          this.sizeGift = 30;
          break;
        case "differentBoxes":
          this.srcImg = "gift/gifts_storytel_boxes.gif";
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg = false;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          this.setTimeToShowOptions(7000);
          this.winType = "differentBoxes";
          this.sizeGift = 30;
          break;
        case "topPrice":
          this.srcImg = "gift/gifts_storytel_boxes.gif";
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg = true;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          this.setTimeToShowOptions(7000);
          this.winType = "topPrice";
          this.sizeGift = 25;
          break;
      }

      this.showRoulette = false;
    },
    async getOptions() {
      const options = await service.getOptions();
      if (options !== "error") {
        this.setOptions(options.sectors);
      }
    },
    async getGiftCards() {
      const response = await service.getGiftCards();
      if (response !== "error") {
        this.setGiftCards(Object.values(response));
      }
    },

    async getTopPrices() {
      const response = await service.getTopPrices();
      if (response !== "error") {
        this.setTopPrices(Object.values(response));
      }
    },

    async getTotals() {
      const totals = await service.getTotals();
      if (totals !== "error") {
        this.setTotalReplay(totals.totalReplay);
        this.setTotalSpecialPrice(totals.totalSpecialPrice);
        this.setTotalSpecialSurprise(totals.totalSpecialSurprice);
        this.setTotalTopPrice(totals.totalTopPrice);
        this.setTotalGiftCard(totals.totalGitfCard);
        this.setTotalSpin(totals.totalSpin);
      }
      //this.setTotalTopPrice(setTotalTopPrice)
    },

  },
  watch: {
    isVisbleWinImg(value) {
      if (value) {
        setTimeout(() => {
          this.isVisbleWinImg = !this.isVisbleWinImg;
          this.setSpinRoullete(true);
          this.srcImg = "";
          this.winType = "";
        }, this.timeToShowOptions);
      }
    },
    isVisbleLooseImg(value) {
      if (value) {
        setTimeout(() => {
          this.isVisbleLooseImg = !this.isVisbleLooseImg;
          this.setSpinRoullete(true);
          this.srcImg = "";
        }, this.timeToShowOptions);
      }
    },
    isVisibleConfetti(value) {
      if (value) {
        setTimeout(() => {
          this.isVisibleConfetti = !this.isVisibleConfetti;
          this.setSpinRoullete(true);
        }, this.timeToShowOptions);
      }
    },
    showRoulette(value) {
      if (!value) {
        setTimeout(() => {
          this.showRoulette = true;
        }, 10);
      }
    }
  }
};
</script>

<style>
#app {
  height: 85%;
  margin-top: 20px;
}
</style>