<template>
  <div
    class="container text-center padre"
    ref="containerCircule"
    style="width: 100%; overflow: visible;"
  >
    <div style="position: relative;">
      <canvas id="canvas" ref="myCanvas" style :width="widthCircule" :height="heightCircule"></canvas>
      <img
        src="/img/storytel-flecha.png"
        style="position: absolute; "
        :style="{top: topArrowLogo + '%' , right: rightArrowLogo + 'px', width: widthArrowLogo + '%' }"
        class="central-img"
        :class="{vibratingImage: showAnimation}"
        alt="Responsive image"
      />
    </div>
    <!-- <img
      src="/img/logo.png"
      class="central-img"
      :style="{top:topCentralLogo+'%',width: widthCentralLogo+'px'}"
      alt="Responsive image"
    />-->
  </div>
</template>
<!-- width: 300px;
top: 38%; -->
<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";
import { obtenerHoraActual, calculateEaseOut, calculateIndex } from "@/utils";

export default {
  data: () => {
    return {
      auxState: "",
      winner: null,
      showAnimation: false,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,

      // position roulette
      topArrowLogo: 0,
      rightArrowLogo: 0,
      widthArrowLogo: 0,
      restOutsideRadius: 0,
      sizePhone: 0,
      positionPhone: [],
      sizeMiddleCircle: 0,
      positionMiddleCircle: [],

      lineWidth: 0,

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
      speedRoulette: 10,

      globalWidthCircle: 0,
      globalHeightCircle: 0,

      halfPi: 0
    };
  },
  created() {
    window.addEventListener("resize", this.handleResize);
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },

  mounted() {
    this.globalWidthCircle = this.$refs.containerCircule.offsetWidth / 2;
    this.globalHeightCircle = this.$refs.containerCircule.offsetHeight / 2;
    this.halfPi = Math.PI / 2;

    this.startAngle = this.initialStartAngle;
    setTimeout(() => {
      document.addEventListener("keyup", this.spinRoulleteByEnter);
    }, 1000);
    this.widthCircule = this.$refs.containerCircule.offsetWidth;
    this.heightCircule = this.$refs.containerCircule.offsetHeight;
    this.validateSizeOfImg();
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

      "setGiftCards",
      "setTopPrices",

      "setInitialAngle",
      "setSpinRoullete"
    ]),

    spinRoulleteByEnter(event) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        this.spin();
      }
    },
    validateSizeOfImg() {
      if (this.screenWidth <= 1366) {
        this.topArrowLogo = 4;
        this.rightArrowLogo = 46;
        this.widthArrowLogo = 6.6;

        this.outsideRadius = this.heightCircule * 0.43; // radio del circulo, que tan grande sera
        this.textRadius = this.heightCircule * 0.33; // radio del tecto
        this.insideRadius = 1;
        this.letterSize = 1;
        this.restOutsideRadius = 10;

        this.sizePhone = 220;
        const widthPhone = 4;
        const heightPhone = 35;
        this.positionPhone["x"] = widthPhone;
        this.positionPhone["y"] = heightPhone;

        this.sizeMiddleCircle = 150;
        const widthCircule = 7;
        const heightCircule = 6;
        this.positionMiddleCircle["x"] = widthCircule;
        this.positionMiddleCircle["y"] = heightCircule;
        this.lineWidth = 15;
      } else if (this.screenWidth <= 1444) {
        this.topArrowLogo = -2;
        this.rightArrowLogo = 30;
        this.widthArrowLogo = 7.5;

        this.outsideRadius = this.heightCircule * 0.43; // radio del circulo, que tan grande sera
        this.textRadius = this.heightCircule * 0.33; // radio del los textos
        this.insideRadius = 1;
        this.letterSize = 1;
        this.restOutsideRadius = 10;

        this.sizePhone = 220;
        const widthPhone = 4;
        const heightPhone = 35;
        this.positionPhone["x"] = widthPhone;
        this.positionPhone["y"] = heightPhone;

        this.sizeMiddleCircle = 150;
        const widthCircule = 7;
        const heightCircule = 6;
        this.positionMiddleCircle["x"] = widthCircule;
        this.positionMiddleCircle["y"] = heightCircule;

        this.lineWidth = 21;
      } else if (this.screenWidth <= 1980) {
        this.topArrowLogo = 2;
        this.rightArrowLogo = 30;
        this.widthArrowLogo = 8;

        this.outsideRadius = this.heightCircule * 0.46; // radio del circulo, que tan grande sera
        this.textRadius = this.heightCircule * 0.35; // radio del tecto
        this.insideRadius = 1;
        this.letterSize = 1;
        this.restOutsideRadius = 10;

        this.sizePhone = 300;
        const xPhone = 2.9;
        const yPhone = 35;
        this.positionPhone["x"] = xPhone;
        this.positionPhone["y"] = yPhone;

        this.sizeMiddleCircle = 200;
        const xCircule = 5.5;
        const yCircule = 5;
        this.positionMiddleCircle["x"] = xCircule;
        this.positionMiddleCircle["y"] = yCircule;
        this.lineWidth = 20;
      } else {
        this.topArrowLogo = 1;
        this.rightArrowLogo = 30;
        this.widthArrowLogo = 8;

        this.outsideRadius = this.heightCircule * 0.43; // radio del circulo, que tan grande sera
        this.textRadius = this.heightCircule * 0.35; // radio del tecto
        this.insideRadius = 1;
        this.letterSize = 1;
        this.restOutsideRadius = 10;

        this.sizePhone = 350;
        const xPhone = 2.5;
        const yPhone = 100;
        this.positionPhone["x"] = xPhone;
        this.positionPhone["y"] = yPhone;

        this.sizeMiddleCircle = 220;
        const xCircule = 5;
        const yCircule = 5;
        this.positionMiddleCircle["x"] = xCircule;
        this.positionMiddleCircle["y"] = yCircule;
        this.lineWidth = 20;
      }
    },

    handleResize() {
      (this.canvas = null),
        (this.ctx = null),
        (this.screenWidth = window.innerWidth);
      this.screenHeight = window.innerHeight;
      this.widthCircule = this.$refs.containerCircule.offsetWidth;
      this.heightCircule = this.$refs.containerCircule.offsetHeight;
    },

    drawCircule(angle) {
      const img = new Image();
      img.src = "/img/logo.png";
      const buffer = this.$refs.myCanvas;
      const bufferCtx = buffer.getContext("2d");

      img.onload = () => {
        requestAnimationFrame(draw);
      };

      const draw = () => {
        bufferCtx.clearRect(
          -img.width,
          -img.height,
          this.sizeMiddleCircle,
          this.sizeMiddleCircle
        );
        bufferCtx.save();
        bufferCtx.translate(this.globalWidthCircle, this.globalHeightCircle);
        bufferCtx.rotate(angle);
        bufferCtx.drawImage(
          img,
          -img.width / this.positionMiddleCircle.x,
          -img.height / this.positionMiddleCircle.y,
          this.sizeMiddleCircle,
          this.sizeMiddleCircle
        );
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
      const halfArc = arc / 2;

      img.onload = () => {
        requestAnimationFrame(draw);
      };

      const draw = () => {
        bufferCtx.clearRect(
          -img.width,
          -img.height,
          this.sizePhone,
          this.sizePhone
        );
        bufferCtx.save();
        bufferCtx.translate(
          this.globalWidthCircle + Math.cos(angle + halfArc) * this.textRadius,
          this.globalHeightCircle + Math.sin(angle + halfArc) * this.textRadius
        );
        bufferCtx.rotate(angle + halfArc + this.halfPi);
        bufferCtx.drawImage(
          img,
          -img.width / this.positionPhone.x,
          -img.height / this.positionPhone.y,
          this.sizePhone,
          this.sizePhone
        );

        bufferCtx.restore();
      };
    },

    drawEachSector(ctx, widthCircle, heightCircule) {
      const halfArc = this.arc / 2;

      for (let i = 0; i < this.sectors.length; i++) {
        const text = this.sectors[i][0];
        const textPart2 = this.sectors[i][1];
        const halfMeasureTextWidth = -ctx.measureText(text).width / 2;

        let angle = this.startAngle + i * this.arc;
        if (i === 0) {
          this.drawCircule(angle - 5.1);
        }

        ctx.strokeStyle = "transparent";
        ctx.fillStyle = this.colors[i];
        ctx.beginPath();
        ctx.arc(
          widthCircle,
          heightCircule,
          this.outsideRadius - this.restOutsideRadius,
          angle,
          angle + this.arc,
          false
        );

        ctx.fill();
        ctx.save();

        ctx.arc(
          widthCircle,
          heightCircule,
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
        ctx.lineWidth = this.lineWidth;
        ctx.arc(
          widthCircle,
          heightCircule,
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
            this.globalWidthCircle +
              Math.cos(angle + halfArc) * this.textRadius,
            this.globalHeightCircle +
              Math.sin(angle + halfArc) * this.textRadius
          );
          ctx.rotate(angle + halfArc + this.halfPi);

          ctx.fillText(text, halfMeasureTextWidth, 0);
          ctx.fillText(textPart2, halfMeasureTextWidth, 40);
        } else if (i === 0 || i === 4) {
          ctx.translate(
            this.globalWidthCircle +
              Math.cos(angle + halfArc) * this.textRadius,
            this.globalHeightCircle +
              Math.sin(angle + halfArc) * this.textRadius
          );
          ctx.rotate(angle + halfArc + this.halfPi);

          ctx.fillText(text, -this.ctx.measureText(text).width / 4, 0);
          ctx.fillText(textPart2, halfMeasureTextWidth, 40);
        } else {
          ctx.translate(
            this.globalWidthCircle +
              Math.cos(angle + halfArc) * this.textRadius,
            this.globalHeightCircle +
              Math.sin(angle + halfArc) * this.textRadius
          );
          ctx.rotate(angle + halfArc + this.halfPi);

          const textAux = this.sectors[i];
          ctx.fillText(textAux, -ctx.measureText(textAux).width / 2, 0);
        }
        ctx.restore();
        ctx.save();
      }
    },

    drawRouletteWheel() {
      this.canvas = this.$refs.myCanvas;
      this.ctx = this.canvas.getContext("2d");

      this.ctx.clearRect(
        this.widthCircule,
        this.globalWidthCircle,
        this.heightCircule,
        this.globalHeightCircle
      ); // Borra todo el contenido del canvas

      // determina el color de la line externa
      this.ctx.clearRect(0, 0, this.globalWidthCircle, this.globalHeightCircle); // elimina una porcion enviando psicion y tamaño del rectangulo
      this.ctx.beginPath();

      this.ctx.font = `700 ${this.letterSize}rem Helvetica, Arial`;

      this.drawEachSector(
        this.ctx,
        this.globalWidthCircle,
        this.globalHeightCircle
      );
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
      const dataRoulette = {
        spinTime: this.spinTime,
        b: 0,
        spinArcStart: this.spinArcStart,
        spinTimeTotal: this.spinTimeTotal
      };

      const spinAngle = this.spinArcStart - calculateEaseOut(dataRoulette);

      this.startAngle += (spinAngle * 2 * Math.PI) / 180;
    },

    stopRotateWheel() {
      this.setInitialAngle(this.startAngle);
      cancelAnimationFrame(this.drawRouletteTime);
      cancelAnimationFrame(this.spinTimeout);
      this.drawRouletteTime = null;
      this.drawRouletteTime = null;
      this.showAnimation = false;

      const dataRoulette = {
        startAngle: this.startAngle,
        arc: this.arc
      };

      const index = calculateIndex(dataRoulette);

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
      await service.setNewTotal(data);
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
    async updateWinnerChoice(winner) {
      const {typeWinner,position,giftCardsLength} = winner;
      
     switch (typeWinner) {
        case "card":
          this.giftCards[position].given = true;
          await service.setGiftCards(this.giftCards);
          return;

        case "topPrice":
          this.topPrices[position-(giftCardsLength+1)].given = true;
          await service.setTopPrices(this.topPrices);
          return;
          
        default:
            return;
      }
    },
    
    generateProbabilityPriceByScheduler() {
      const totalData = this.giftCards.concat(this.topPrices);

      const time = obtenerHoraActual();
      const down = totalData.map(obj => obj.rangeDown);
      const top = totalData.map(obj => obj.rangeTop);
      const givenS = totalData.map(obj => obj.given);

      for (let position = 0; position < totalData.length; position++) {
        if (
          time >= down[position] &&
          time <= top[position] &&
          givenS[position] === false
        ) {
          const typeWinner = position > this.giftCards.length -1 ? 'topPrice': 'card';
          const winner = {
            typeWinner,
            position,
            giftCardsLength: this.giftCards.length -1
          }
          this.updateWinnerChoice(winner);
          if (position >= 0 && position <= 7) {
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
          } else if (position > 7 && position <= 9) {
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

      "giftCards",
      "topPrices",

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
