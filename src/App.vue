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
import service from '@/services/totals.service'

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
    this.getTotals();
  },
  methods: {
    ...mapActions(["setOptions","setTotalReplay","setTotalSpecialPrice","setTotalSpecialSurprise","setTotalTopPrice","setTotalGiftCard","setTotalSpin"]),
    showImg(value) {
      if (value.type === "loose") {
        this.isVisbleLooseImg = true;
      } else if (value.type === "win") {
        this.isVisbleWinImg = true;
      } else {
        this.isVisibleConfetti = !this.isVisibleConfetti;
      }
    },
    async getOptions() {
      const options = await service.getOptions();
      this.setOptions(options.sectors)
    },
    async getTotals() {
      const totals = await service.getTotals();
      if(totals){
        this.setTotalReplay(totals.totalReplay)
        this.setTotalSpecialPrice(totals.totalSpecialPrice) ;
        this.setTotalSpecialSurprise(totals.totalSpecialSurprice) ;
        this.setTotalTopPrice(totals.totalTopPrice) ;
        this.setTotalGiftCard(totals.totalGitfCard) ;
        this.setTotalSpin(totals.totalSpin)
      }
      //this.setTotalTopPrice(setTotalTopPrice)
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