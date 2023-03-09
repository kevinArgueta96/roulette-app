<template>
  <div id="app">
    <ConfettiComponent :isVisibleConfetti="isVisibleConfetti"  />
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
  methods: {
    showImg(value) {

      if (value.type === "loose") {
        this.isVisbleLooseImg = true;
      } else if(value.type === "win"){
        this.isVisbleWinImg = true;
      }else {
        this.isVisibleConfetti = !this.isVisibleConfetti;
      }
    },
  },
  watch: {
    isVisbleWinImg(value) {
      if (value) {
        setTimeout(() => {
          this.isVisbleWinImg = !this.isVisbleWinImg;
        }, 3000);
      }
    },
    isVisbleLooseImg(value) {
      if (value) {
        setTimeout(() => {
          this.isVisbleLooseImg = !this.isVisbleLooseImg;
        }, 3000);
      }
    },
    isVisibleConfetti(value) {
      if (value) {
        setTimeout(() => {
          this.isVisibleConfetti = !this.isVisibleConfetti;
        }, 3000);
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