<template>
  <div class="container text-center padre" ref="testRef" style="width: 100%; overflow: visible;">
    <div>
      <canvas id="canvas" ref="myCanvas" style :width="widthCircule" :height="heightCircule"></canvas>
    </div>
    <!-- <img
      src="/img/logo.png"
      class="central-img"
      :style="{top:topCentralLogo+'%',width: widthCentralLogo+'px'}"
      alt="Responsive image"
    />-->
    <img
      src="/img/storytel-flecha.png"
      style="position: absolute;"
      :style="{top: topArrowLogo + 'px' , right: rightArrowLogo + 'px', width: widthArrowLogo + '%' }"
      class="central-img"
      :class="{vibratingImage: showAnimation}"
      alt="Responsive image"
    />
  </div>
</template>
<!-- width: 300px;
top: 38%; -->
<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";
import { obtenerHoraActual } from "@/utils";

export default {
  data: () => {
    return {
      auxState: "",
      winner: null,
      showAnimation: false,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      topCentralLogo: 0,
      rightCentralLogo: 0,
      widthCentralLogo: 0,
      topArrowLogo: 0,
      rightArrowLogo: 0,
      widthArrowLogo: 0,
      result: [],
      counter: 0,
      name: "",
      sectors: [
        { 0: "TUOTE", 1: "PALKINTO" }, // 1 vez x dia
        "UUDESTAAN", //15-20%
        { 0: "YLLÄTYS", 1: "PALKINTO" }, // based on probability (surpise win)
        "LAHJAKORTTI",
        { 0: "TUOTE", 1: "PALKINTO" }, // based on probability (surpise win) //10 % special prize
        { 0: "YLLÄTYS", 1: "PALKINTO" }, // based on probability (surpise win)
        "UUDESTAAN", //15-20%
        "PÄÄPALKINTO" // 0% dependiendo la hrora
      ],
      colors: [
        "#FFF2F1",
        "#C9ECFF",
        "#FF501C",
        "#2B353A",
        "#FFF2F1",
        "#FF501C",
        "#C9ECFF",
        "#FFEDA3"
      ],

      heightCircule: 0,
      widthCircule: 0,
      startAngle: 0,
      spinTimeout: null,
      drawRouletteTime: null,
      spinArcStart: 15, // para decir cuanto girara el arco
      spinTime: 0,
      spinTimeTotal: 0,
      ctx: null,
      circuleLogoCenter: null,
      canvas: null,

      outsideRadius: 0, // radio del circulo, que tan grande sera
      textRadius: 0, // radio del tecto
      insideRadius: 0,
      letterSize: 0,
      speedRoulette: 10
    };
  },
  created() {
    window.addEventListener("resize", this.handleResize);
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  mounted() {
    this.startAngle = this.initialStartAngle;
    setTimeout(() => {
      document.addEventListener("keyup", this.spinRoulleteByEnter);
    }, 1000);
    this.widthCircule = this.$refs.testRef.offsetWidth;
    this.heightCircule = this.$refs.testRef.offsetHeight;
    this.validateSizeOfImg();
    //this.drawRouletteWheel();
    requestAnimationFrame(this.drawRouletteWheel);
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.spinRoulleteByEnter);
  },
  methods: {
    ...mapActions([
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

      "setInitialAngle",
      "setSpinRoullete"
    ]),

    spinRoulleteByEnter(event) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        this.spin();
      }
    },
    validateSizeOfImg() {
      this.topArrowLogo = 5;
      this.rightArrowLogo = 46;
      this.widthArrowLogo = 10;

      this.outsideRadius = 500; // radio del circulo, que tan grande sera
      this.textRadius = 400; // radio del tecto
      this.insideRadius = 5;
      this.letterSize = 2;
    },

    handleResize() {
      (this.canvas = null),
        (this.ctx = null),
        (this.screenWidth = window.innerWidth);
      this.screenHeight = window.innerHeight;
      this.widthCircule = this.$refs.testRef.offsetWidth;
      this.heightCircule = this.$refs.testRef.offsetHeight;
    },
    drawCircule(angle) {
      const img = new Image();
      img.src = "/img/logo.png";
      const buffer = this.$refs.myCanvas;
      const bufferCtx = buffer.getContext("2d");
      const widthCircle = this.widthCircule / 2;
      const heightCirlce = this.heightCircule / 2;
      //const x = widthCircle + this.textRadius * Math.cos(angle );
      //const y = heightCirlce  + this.textRadius * Math.sin(angle );

      img.onload = () => {
        requestAnimationFrame(draw);
      };
      const draw = () => {
        bufferCtx.clearRect(-img.width, -img.height, 200, 200);
        bufferCtx.save();
        bufferCtx.translate(widthCircle, heightCirlce);
        bufferCtx.rotate(angle);
        bufferCtx.drawImage(img, -img.width / 5, -img.height / 5, 200, 200);
        bufferCtx.restore();

        bufferCtx.drawImage(buffer, 0, 0);

        bufferCtx.restore();
      };
    },

    drawPhone(angle, arc) {
      const img = new Image();
      img.src = "/img/winner.png";
      const buffer = this.$refs.myCanvas;
      const bufferCtx = buffer.getContext("2d");
      const widthCircle = this.widthCircule / 2;
      const heightCirlce = this.heightCircule / 2;

      img.onload = () => {
        requestAnimationFrame(draw);
      };

      const draw = () => {
        bufferCtx.clearRect(-img.width, -img.height, 400, 400);
        bufferCtx.save();
        bufferCtx.translate(
          widthCircle + Math.cos(angle + this.arc / 2) * this.textRadius,
          heightCirlce + Math.sin(angle + this.arc / 2) * this.textRadius
        );
        bufferCtx.rotate(angle + arc / 2 + Math.PI / 2);
        bufferCtx.drawImage(img, -img.width / 2.3, -img.height / 9, 400, 400);

        bufferCtx.restore();
      };
    },

    drawEachSector(ctx, widthCircle, heightCirlce) {
      for (let i = 0; i < this.sectors.length; i++) {
        let angle = this.startAngle + i * this.arc;
        if (i === 0) {
          this.drawCircule(angle - 5.1);
        }

        ctx.strokeStyle = "transparent";
        ctx.fillStyle = this.colors[i];
        ctx.beginPath();
        ctx.arc(
          widthCircle,
          heightCirlce,
          this.outsideRadius - 20,
          angle,
          angle + this.arc,
          false
        );

        ctx.fill();
        ctx.save();

        ctx.arc(
          widthCircle,
          heightCirlce,
          this.insideRadius,
          angle + this.arc,
          angle,
          true
        );

        ctx.stroke();
        ctx.fill();
        ctx.save();

        ctx.beginPath();

        ctx.strokeStyle = "black";
        ctx.lineWidth = 25;
        ctx.arc(
          widthCircle,
          heightCirlce,
          this.outsideRadius + 20,
          angle,
          angle + this.arc,
          false
        );

        ctx.stroke();

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        if (i === 7) {
          this.drawPhone(angle, this.arc);
        }

        if (i === 2 || i === 3 || i === 5) {
          ctx.shadowColor = "white";
          ctx.fillStyle = "white";
        }

        if (i === 0 || i === 1 || i === 4 || i === 6 || i === 7) {
          ctx.shadowColor = "black";
          ctx.fillStyle = "black";
        }
        if (i === 2 || i == 5) {
          ctx.translate(
            this.widthCircule / 2 +
              Math.cos(angle + this.arc / 2) * this.textRadius,
            this.heightCircule / 2 +
              Math.sin(angle + this.arc / 2) * this.textRadius
          );
          ctx.rotate(angle + this.arc / 2 + Math.PI / 2);

          const text = this.sectors[i][0];
          const textPart2 = this.sectors[i][1];

          ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
          ctx.fillText(textPart2, -ctx.measureText(text).width / 2.0, 40);
        } else if (i === 0 || i === 4) {
          ctx.translate(
            this.widthCircule / 2 +
              Math.cos(angle + this.arc / 2) * this.textRadius,
            this.heightCircule / 2 +
              Math.sin(angle + this.arc / 2) * this.textRadius
          );
          ctx.rotate(angle + this.arc / 2 + Math.PI / 2);

          const text = this.sectors[i][0];
          const textPart2 = this.sectors[i][1];

          ctx.fillText(text, -this.ctx.measureText(text).width / 4, 0);
          ctx.fillText(textPart2, -ctx.measureText(text).width / 2.0, 40);
        } else {
          ctx.translate(
            this.widthCircule / 2 +
              Math.cos(angle + this.arc / 2) * this.textRadius,
            this.heightCircule / 2 +
              Math.sin(angle + this.arc / 2) * this.textRadius
          );
          ctx.rotate(angle + this.arc / 2 + Math.PI / 2);

          const text = this.sectors[i];
          ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        }
        ctx.restore();
        ctx.save();
      }
    },

    drawRouletteWheel() {
      this.canvas = this.$refs.myCanvas;
      this.ctx = this.canvas.getContext("2d");
      const widthCircle = this.widthCircule / 2;
      const heightCirlce = this.heightCircule / 2;

      this.ctx.clearRect(
        this.widthCircule,
        widthCircle,
        this.heightCircule,
        heightCirlce
      ); // Borra todo el contenido del canvas

      // determina el color de la line externa
      this.ctx.clearRect(0, 0, widthCircle, heightCirlce); // elimina una porcion enviando psicion y tamaño del rectangulo
      this.ctx.beginPath();

      this.ctx.font = `700 ${this.letterSize}rem Helvetica, Arial`;

      this.drawEachSector(this.ctx, widthCircle, heightCirlce);
    },

    spin() {
      if (this.spinRoullete) {
        this.setSpinRoullete(false);
        this.speedRoulette = false;
        this.showAnimation = true;
        const numberWinner = this.generateNumberToShow();
        this.winner = this.generateAnglesToWin(numberWinner);
        this.updateOptionRoulette(numberWinner);
        this.spinTimeTotal = 100;

        this.spinTime = 0;
        this.spinTimeout = 0;

        this.rotateWheel();
      }
    },

    rotateWheel() {
      const winner = this.winner;
      if (this.startAngle >= 6.28) {
        this.startAngle = 0;
      }

      if (
        this.actualPosition <= winner.topAngle &&
        this.actualPosition >= winner.downAngle
      ) {
        this.spinTime += 3;
        if (this.spinTime >= this.spinTimeTotal) {
          this.stopRotateWheel();
          return;
        }
      }
      this.obtainSpinAngle();
      this.spinTimeout = requestAnimationFrame(this.rotateWheel);
      this.drawRouletteTime = requestAnimationFrame(this.drawRouletteWheel);
    },
    obtainSpinAngle() {
      const spinAngle =
        this.spinArcStart -
        this.easeOut(this.spinTime, 0, this.spinArcStart, this.spinTimeTotal);

      this.startAngle += (spinAngle * 2 * Math.PI) / 180;
    },

    easeOut(spinTime, b, spinArcStart, spinTimeTotal) {
      const ts = (spinTime /= spinTimeTotal) * spinTime;
      const tc = ts * spinTime;
      return b + spinArcStart * (tc + -2 * ts + 2 * spinTime);
    },

    stopRotateWheel() {
      this.setInitialAngle(this.startAngle);
      cancelAnimationFrame(this.drawRouletteTime);
      cancelAnimationFrame(this.spinTimeout);
      this.drawRouletteTime = null;
      this.drawRouletteTime = null;
      this.showAnimation = false;
      var degrees = (this.startAngle * 180) / Math.PI + 90;
      var arcd = (this.arc * 180) / Math.PI;
      var index = Math.floor((360 - (degrees % 360)) / arcd);
      this.ctx.save();
      this.ctx.font = "bold 30px Helvetica, Arial";

      if (index === 1 || index === 6) {
        this.$emit("showImg", { type: "replay" });
      } else if (index === 2 || index === 5) {
        this.$emit("showImg", { type: "differentBoxes" });
      } else if (index === 3) {
        this.$emit("showImg", { type: "giftCard" });
      } else if (index === 0 || index === 4) {
        this.$emit("showImg", { type: "individualBox" });
      } else if (index === 7) {
        this.$emit("showImg", { type: "topPrice" });
      }
      /*setTimeout(() => {
        this.setSpinRoullete(true);
      }, this.timeToShowOptions);*/
      this.ctx.restore();
    },
    nameToUpdate(update) {
      this.setTotalSpin(this.totalSpin + 1);
      switch (update) {
        case 3:
          this.setTotalGiftCard(this.totalGiftCard + 1);
          break;
        case 1:
        case 6:
          this.setTotalReplay(this.totalReplay + 1);
          break;
        case 2:
        case 5:
          this.setTotalSpecialSurprise(this.totalSpecialSurprise + 1);
          break;
        case 0:
        case 4:
          this.setTotalSpecialPrice(this.totalSpecialPrice + 1);

          break;
        case 7:
          this.setTotalTopPrice(this.totalTopPrice + 1);
          break;
      }
    },

    generateAnglesToWin(positionIndex) {
      switch (positionIndex) {
        case 0:
          return {
            topAngle: 45,
            downAngle: 0
          };
        case 1:
          return {
            topAngle: 90,
            downAngle: 46
          };

        case 2:
          return {
            topAngle: 135,
            downAngle: 91
          };

        case 3:
          return {
            topAngle: 180,
            downAngle: 136
          };

        case 4:
          return {
            topAngle: 225,
            downAngle: 181
          };

        case 5:
          return {
            topAngle: 270,
            downAngle: 226
          };

        case 6:
          return {
            topAngle: 315,
            downAngle: 271
          };

        case 7:
          return {
            topAngle: 360,
            downAngle: 316
          };
      }
      return positionIndex;
    },
    async updateOptionRoulette(index) {
      this.nameToUpdate(index);

      const data = {
        totalReplay: this.selectedTotalReplay,
        totalSpecialSurprice: this.selectedTotalSpecialSuprise,
        totalSpecialPrice: this.selectedTotalSpecialPrice,
        totalTopPrice: this.selectedTotalTopPrice,
        totalGitfCard: this.selectedTotalGiftCard,
        totalSpin: this.totalSpin
      };
      const response = await service.setNewTotal(data);
      response === 0;
    },
    generateNumberToShow() {
      const newProbabilitie = this.generateProbabilityPriceByScheduler();
      const probabilities =
        newProbabilitie === null ? this.options : newProbabilitie;

      const numeroAleatorio = Math.random();
      let sumaProbabilidades = 0;
      for (let i = 0; i < probabilities.length; i++) {
        const sector = probabilities[i];
        sumaProbabilidades += sector.probability;

        if (sumaProbabilidades >= numeroAleatorio) {
          return i;
        }
      }
    },
    changeStateOfSchedulerWin(range) {
      switch (range) {
        case "cardA":
          this.auxState = this.giftCardScheduleRangeA;
          this.auxState.given = true;
          this.setGiftCardScheduleRangeA(this.auxState);
          this.auxState = "";
          break;

        case "cardB":
          this.auxState = this.giftCardScheduleRangeB;
          this.auxState.given = true;
          this.setGiftCardScheduleRangeB(this.auxState);
          this.auxState = "";

          break;
        case "cardC":
          this.auxState = this.giftCardScheduleRangeC;
          this.auxState.given = true;
          this.setGiftCardScheduleRangeC(this.auxState);
          this.auxState = "";

          break;
        case "cardD":
          this.auxState = this.giftCardScheduleRangeD;
          this.auxState.given = true;
          this.setGiftCardScheduleRangeD(this.auxState);
          this.auxState = "";
          break;
        case "cardE":
          this.auxState = this.giftCardScheduleRangeE;
          this.auxState.given = true;
          this.setGiftCardScheduleRangeE(this.auxState);
          this.auxState = "";

          break;

        case "topPriceA":
          this.auxState = this.topPriceScheduleRangeA;
          this.auxState.given = true;
          this.setTopPriceScheduleRangeA(this.auxState);
          this.auxState = "";

          break;
        case "topPriceB":
          this.auxState = this.topPriceScheduleRangeB;
          this.auxState.given = true;
          this.setTopPriceScheduleRangeB(this.auxState);
          this.auxState = "";
          break;
      }
      const data = {
        giftCardScheduleRangeA: this.giftCardScheduleRangeA,
        giftCardScheduleRangeB: this.giftCardScheduleRangeB,
        giftCardScheduleRangeC: this.giftCardScheduleRangeC,
        giftCardScheduleRangeD: this.giftCardScheduleRangeD,
        giftCardScheduleRangeE: this.giftCardScheduleRangeE,

        topPriceScheduleRangeA: this.topPriceScheduleRangeA,
        topPriceScheduleRangeB: this.topPriceScheduleRangeB
      };
      service.setHour(data);
    },
    generateProbabilityPriceByScheduler() {
      const time = obtenerHoraActual();
      const down = [
        this.giftCardScheduleRangeA.rangeDown,
        this.giftCardScheduleRangeB.rangeDown,
        this.giftCardScheduleRangeC.rangeDown,
        this.giftCardScheduleRangeD.rangeDown,
        this.giftCardScheduleRangeE.rangeDown,
        this.topPriceScheduleRangeA.rangeDown,
        this.topPriceScheduleRangeB.rangeDown
      ];

      const top = [
        this.giftCardScheduleRangeA.rangeTop,
        this.giftCardScheduleRangeB.rangeTop,
        this.giftCardScheduleRangeC.rangeTop,
        this.giftCardScheduleRangeD.rangeTop,
        this.giftCardScheduleRangeE.rangeTop,
        this.topPriceScheduleRangeA.rangeTop,
        this.topPriceScheduleRangeB.rangeTop
      ];

      const card = [
        "cardA",
        "cardB",
        "cardC",
        "cardD",
        "cardE",
        "topPriceA",
        "topPriceB"
      ];

      const givenS = [
        this.giftCardScheduleRangeA.given,
        this.giftCardScheduleRangeB.given,
        this.giftCardScheduleRangeC.given,
        this.giftCardScheduleRangeD.given,
        this.giftCardScheduleRangeE.given,
        this.topPriceScheduleRangeA.given,
        this.topPriceScheduleRangeB.given
      ];
      for (let position = 0; position < 7; position++) {
        if (
          time >= down[position] &&
          time <= top[position] &&
          givenS[position] === false
        ) {
          this.changeStateOfSchedulerWin(card[position]);
          if (position >= 0 && position <= 4) {
            const options = [
              { option: "LAHJAKORTTI", probability: 0 }, // 1 vez x dia
              { option: "UUDESTAAN", probability: 0 }, //15-20%
              { option: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
              { option: "LAHJAKORTTI", probability: 1 }, // based on probability (surpise win)
              { option: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
              { option: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
              { option: "UUDESTAAN", probability: 0 }, //15-20%
              { option: "PÄÄPALKINTO", probability: 0 } // 0% dependiendo la hrora
            ];
            return options;
          } else if (position > 4 && position <= 6) {
            const options = [
              { option: "LAHJAKORTTI", probability: 0 }, // 1 vez x dia
              { option: "UUDESTAAN", probability: 0 }, //15-20%
              { option: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
              { option: "LAHJAKORTTI", probability: 0 }, // based on probability (surpise win)
              { option: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
              { option: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
              { option: "UUDESTAAN", probability: 0 }, //15-20%
              { option: "PÄÄPALKINTO", probability: 1 } // 0% dependiendo la hrora
            ];
            return options;
          }
        }
      }

      return null;
    }
  },
  computed: {
    ...mapGetters([
      "timeToShowOptions",
      "options",
      "totalReplay",
      "totalSpecialPrice",
      "totalSpecialSurprise",
      "totalTopPrice",
      "totalGiftCard",
      "totalSpin",

      "giftCardScheduleRangeA",
      "giftCardScheduleRangeB",
      "giftCardScheduleRangeC",
      "giftCardScheduleRangeD",
      "giftCardScheduleRangeE",

      "topPriceScheduleRangeA",
      "topPriceScheduleRangeB",

      "actualTime",
      "initialAngle",
      "spinRoullete"
    ]),
    selectedTotalReplay: {
      get() {
        return this.totalReplay;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalReplay(val);
      }
    },

    selectedTotalSpecialPrice: {
      get() {
        return this.totalSpecialPrice;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalSpecialPrice(val);
      }
    },
    selectedTotalSpecialSuprise: {
      get() {
        return this.totalSpecialSurprise;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalSpecialSurprise(val);
      }
    },

    selectedTotalTopPrice: {
      get() {
        return this.totalTopPrice;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalTopPrice(val);
      }
    },

    initialStartAngle: {
      get() {
        return this.initialAngle;
      }
    },

    selectedTotalGiftCard: {
      get() {
        return this.totalGiftCard;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalGiftCard(val);
      }
    },

    arc() {
      return Math.PI / (this.sectors.length / 2); // valor de cada arco
    },
    actualPosition() {
      var degrees = (this.startAngle * 180) / Math.PI + 90;
      return Math.floor(360 - (degrees % 360));
    }
  },
  watch: {
    widthCircule() {
      this.validateSizeOfImg();
      requestAnimationFrame(this.drawRouletteWheel);
    },
    heightCircule() {
      this.validateSizeOfImg();
      requestAnimationFrame(this.drawRouletteWheel);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vibratingImage {
  animation: shake 0.5s linear infinite;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px) rotate(-1deg);
  }
  50% {
    transform: translateX(0) rotate(1deg);
  }
  75% {
    transform: translateX(5px) rotate(-1deg);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
