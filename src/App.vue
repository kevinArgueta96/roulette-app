<template>
  <div id="app">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti" />
    <div class="container text-center" id="container-objects">
      <div class="col-sm-12">
        <!-- <div class="row" id="null-column">
          <WinRowComponent :srcImg="srcImg" :visible="isVisbleLooseImg" />
        </div> -->
      </div>
      <div class="row" style="height: 100%;">
        <div class="col-sm-1 win-colmun-left">
          <div class="row" id="null-column-top"></div>
          <div class="row" id="null-column">
            <WinRowComponent :srcImg="srcImg" :visible="isVisbleWinImg" />
          </div>
          <div class="row" id="null-column"></div>
        </div>
        <div class="col-sm-10 win-central" style="overflow: visible;">
          <RouletteCompoment @showImg="showImg" />
        </div>
        <div class="col-sm-1 win-colmun">
          <div class="row" id="null-column-top"></div>
          <div class="row" id="null-column-rigth"
           :style="{right:rigthImg + '%'}">
            <WinRowComponent :srcImg="srcImg" :visible="isVisbleLooseImg" />
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
    ConfettiComponent,
  },
  data: () => {
    return {
      isVisbleWinImg: false,
      isVisbleLooseImg: true,
      isVisibleConfetti: false,
      screenWidth: 0,
      screenHeight:0,
      rigthImg:0,
      srcImg:''
    };
  },
  computed: {
    ...mapGetters(["timeToShowOptions"]),
  },
  mounted() {
    this.getScheduleRange();
    
    if(this.screenWidth > 2000 ){
      this.rigthImg= 0;
    }
    this.getOptions();
    this.getTotals();
  },
  created() {
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

      "setGiftCardScheduleRangeA",
      "setGiftCardScheduleRangeB",
      "setGiftCardScheduleRangeC",
      "setGiftCardScheduleRangeD",
      "setGiftCardScheduleRangeE",

      "setTopPriceScheduleRangeA",
      "setTopPriceScheduleRangeB",
    ]),
    spinRoulleteByEnter(event) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        this.spin();
      }
    },
    handleResize() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  },
    showImg(value) {
      //console.log(value)
      const { type } = value; 
      //const type = "topPrice";
      switch(type){
        case ("replay"):
          this.srcImg = "gift/replay.gif"
          this.isVisbleWinImg = false;
          this.isVisbleLooseImg  = true;
          
          break;
          case ("individualBox"):
          this.srcImg = "gift/gifts_storytel_individual.gif"
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg  = false;
          this.isVisibleConfetti = !this.isVisibleConfetti;

          break;
          case ("giftCard"):
          this.srcImg = "gift/gift_card.gif"
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg  = false;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          break;
          case ("differentBoxes"):
          this.srcImg = "gift/gifts_storytel_boxes.gif"
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg  = false;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          break;
          case ("topPrice"):
          this.srcImg = "gift/gifts_storytel_boxes.gif"
          this.isVisbleWinImg = true;
          this.isVisbleLooseImg  = true;
          this.isVisibleConfetti = !this.isVisibleConfetti;
          break;
      }      
    },
    async getOptions() {
      const options = await service.getOptions();
      this.setOptions(options.sectors);
    },
    async getTotals() {
      const totals = await service.getTotals();
      if (totals) {
        this.setTotalReplay(totals.totalReplay);
        this.setTotalSpecialPrice(totals.totalSpecialPrice);
        this.setTotalSpecialSurprise(totals.totalSpecialSurprice);
        this.setTotalTopPrice(totals.totalTopPrice);
        this.setTotalGiftCard(totals.totalGitfCard);
        this.setTotalSpin(totals.totalSpin);
      }
      //this.setTotalTopPrice(setTotalTopPrice)
    },

    async getScheduleRange() {
      const response = await service.getHour();
      this.setGiftCardScheduleRangeA(response.giftCardScheduleRangeA);
      this.setGiftCardScheduleRangeB(response.giftCardScheduleRangeB);
      this.setGiftCardScheduleRangeC(response.giftCardScheduleRangeC);
      this.setGiftCardScheduleRangeD(response.giftCardScheduleRangeD);
      this.setGiftCardScheduleRangeE(response.giftCardScheduleRangeE);

      this.setTopPriceScheduleRangeA(response.topPriceScheduleRangeA);
      this.setTopPriceScheduleRangeB(response.topPriceScheduleRangeB);
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