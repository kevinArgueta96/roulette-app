<template>
  <div class="container text-center" style="height: 100%" ref="testRef">
    <canvas
      id="canvas"
      ref="myCanvas"
      :width="widthCircule"
      :height="heightCircule"
    ></canvas>
    <img
      src="/img/logo.png"
      style="position: absolute;"
      :style="{top: topCentralLogo + '%' , right: rightCentralLogo + '%', width: widthCentralLogo + '%' }"
      class="img-fluid win-text"
      alt="Responsive image"
    />
    <img
      src="/img/storytel-flecha.png"
      style="position: absolute;"
      :style="{top: topArrowLogo + '%' , right: rightArrowLogo + '%', width: widthArrowLogo + '%' }"
      class="img-fluid win-text"
      alt="Responsive image"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import service from "@/services/totals.service";

export default {
  data: () => {
    return {
      actualTime: "",
      auxState: "",
      winner: null,
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
        "LAHJAKORTTI", // 1 vez x dia
        "UUDESTAAN", //15-20%
        "YLLÄTYSPALKINTO", // based on probability (surpise win)
        "LAHJAKORTTI", // based on probability (surpise win)
        "TUOTEPALKINTO", //10 % special prize
        "YLLÄTYSPALKINTO", // based on probability (surpise win)
        "UUDESTAAN", //15-20%
        "PÄÄPALKINTO", // 0% dependiendo la hrora
      ],
      colors: [
        "#000000",
        "#C9ECFF",
        "#FF501C",
        "#2B353A",
        "#FFF2F1",
        "#FF501C",
        "#C9ECFF",
        "#FFEDA3",
      ],

      spinRoullete: true,
      heightCircule: 0,
      widthCircule: 0,
      startAngle: 5.1,
      spinTimeout: null,
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
    };
  },
  created() {
    window.addEventListener("resize", this.handleResize);
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  mounted() {
    setInterval(() => {
      this.actualTime = this.obtenerHoraActual();
    }, 1000);
    document.addEventListener("keyup", this.spinRoulleteByEnter);

    this.widthCircule = this.$refs.testRef.offsetWidth;
    this.heightCircule = this.$refs.testRef.offsetHeight - 100;
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

      "setGiftCardScheduleRangeA",
      "setGiftCardScheduleRangeB",
      "setGiftCardScheduleRangeC",
      "setGiftCardScheduleRangeD",
      "setGiftCardScheduleRangeE",

      "setTopPriceScheduleRangeA",
      "setTopPriceScheduleRangeB",
    ]),

    obtenerHoraActual() {
      const ahora = new Date();
      const hora = ahora.getHours();
      const minutos = ahora.getMinutes();

      // Formatear hora en formato 24 horas
      const hora24 = (hora < 10 ? "0" : "") + hora;
      const minutos24 = (minutos < 10 ? "0" : "") + minutos;

      return `${hora24}:${minutos24}`;
    },
    spinRoulleteByEnter(event) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        this.spin();
      }
    },

    validateSizeOfImg() {
      if (
        this.screenWidth > 0 &&
        this.screenWidth < 900 &&
        this.screenHeight > 0 &&
        this.screenHeight <= 700
      ) {
        this.topCentralLogo = 30;
        this.rightCentralLogo = 42;
        this.widthCentralLogo = 12;
        this.topArrowLogo = -1;
        this.rightArrowLogo = 46;
        this.widthArrowLogo = 6;

        this.outsideRadius = 100; // radio del circulo, que tan grande sera
        this.textRadius = 100; // radio del tecto
        this.insideRadius = 5;
        this.letterSize = 0.7;
      }
      if (
        this.screenWidth > 0 &&
        this.screenWidth <= 1280 &&
        this.screenHeight > 0 &&
        this.screenHeight <= 1000
      ) {
        this.topCentralLogo = 30;
        this.rightCentralLogo = 42;
        this.widthCentralLogo = 12;
        this.topArrowLogo = -1;
        this.rightArrowLogo = 46;
        this.widthArrowLogo = 6;

        this.outsideRadius = 210; // radio del circulo, que tan grande sera
        this.textRadius = 140; // radio del tecto
        this.insideRadius = 5;
        this.letterSize = 0.7;
      }
      if (this.screenWidth < 1400 && this.screenHeight < 1000) {
        this.topCentralLogo = 30;
        this.rightCentralLogo = 42;
        this.widthCentralLogo = 12;
        this.topArrowLogo = -1;
        this.rightArrowLogo = 46;
        this.widthArrowLogo = 6;

        this.outsideRadius = 210; // radio del circulo, que tan grande sera
        this.textRadius = 140; // radio del tecto
        this.insideRadius = 5;
        this.letterSize = 0.7;
      }
      if (this.screenWidth <= 1920 && this.screenHeight < 1080) {
        this.topCentralLogo = 34;
        this.rightCentralLogo = 42;
        this.widthCentralLogo = 12;
        this.topArrowLogo = 8;
        this.rightArrowLogo = 46;
        this.widthArrowLogo = 6;

        this.outsideRadius = 210; // radio del circulo, que tan grande sera
        this.textRadius = 140; // radio del tecto
        this.insideRadius = 5;
        this.letterSize = 0.7;
      }

      if (
        this.screenWidth > 1280 &&
        this.screenWidth < 1920 &&
        this.screenHeight > 720 &&
        this.screenHeight < 1080
      ) {
        this.topCentralLogo = 30;
        this.rightCentralLogo = 42;
        this.widthCentralLogo = 12;
        this.topArrowLogo = 4;
        this.rightArrowLogo = 45;
        this.widthArrowLogo = 6;

        this.outsideRadius = 230; // radio del circulo, que tan grande sera
        this.textRadius = 150; // radio del tecto
        this.insideRadius = 10;
        this.letterSize = 0.7;
      }
      if (
        this.screenWidth >= 1920 &&
        this.screenWidth &&
        this.screenHeight >= 600 &&
        this.screenHeight <= 2160
      ) {
        this.topCentralLogo = 35;
        this.rightCentralLogo = 40;
        this.widthCentralLogo = 17;
        this.topArrowLogo = 0;
        this.rightArrowLogo = 45;
        this.widthArrowLogo = 9;

        this.outsideRadius = 300; // radio del circulo, que tan grande sera
        this.textRadius = 200; // radio del tecto
        this.insideRadius = 10;
        this.letterSize = 1;
      }
    },
    handleResize() {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    },
    drawRouletteWheel() {
      this.canvas = this.$refs.myCanvas;
      this.ctx = this.canvas.getContext("2d");
      const widthCircle = this.widthCircule / 2;
      const heightCirlce = this.heightCircule / 2;

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 1;

      this.ctx = this.canvas.getContext("2d");

      // determina el color de la line externa
      this.ctx.clearRect(0, 0, widthCircle, heightCirlce); // elimina una porcion enviando psicion y tamaño del rectangulo
      this.ctx.beginPath();

      this.ctx.font = `bold ${this.letterSize}rem Helvetica, Arial`;

      for (let i = 0; i < this.sectors.length; i++) {
        let angle = this.startAngle + i * this.arc;

        this.ctx.fillStyle = this.colors[i];
        this.ctx.beginPath();
        this.ctx.arc(
          widthCircle,
          heightCirlce,
          this.outsideRadius,
          angle,
          angle + this.arc,
          false
        );

        this.ctx.arc(
          widthCircle,
          heightCirlce,
          this.insideRadius,
          angle + this.arc,
          angle,
          true
        );

        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.save();

        this.ctx.beginPath();

        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 15;
        this.ctx.arc(
          widthCircle,
          heightCirlce,
          this.outsideRadius + 20,
          angle,
          angle + this.arc,
          false
        );

        this.ctx.stroke();

        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;

        if (i === 0 || i === 2 || i === 3 || i === 5) {
          this.ctx.shadowColor = "white";
          this.ctx.fillStyle = "white";
        }

        if (i === 1 || i === 4 || i === 6 || i === 7) {
          this.ctx.shadowColor = "black";
          this.ctx.fillStyle = "black";
        }

        if (i === 7) {
          this.ctx.translate(
            this.widthCircule / 2 +
              Math.cos(angle + this.arc / 2) * this.textRadius,
            this.heightCircule / 2 +
              Math.sin(angle + this.arc / 2) * this.textRadius
          );
          this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
        } else {
          this.ctx.translate(
            this.widthCircule / 2 +
              Math.cos(angle + this.arc / 2) * this.textRadius +
              20,
            this.heightCircule / 2 +
              Math.sin(angle + this.arc / 2) * this.textRadius
          );
          this.ctx.rotate(angle + this.arc / 2 + Math.PI / 180);
        }

        var text = this.sectors[i];
        this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);

        this.ctx.restore();
      }
    },

    spin() {
      if (this.spinRoullete) {
        const numberWinner = this.generateNumberToShow();
        this.winner = this.generateAnglesToWin(numberWinner);
        this.updateOptionRoulette(numberWinner);
        this.spinRoullete = false;
        this.spinTimeTotal = 100;
        this.spinTime = 0;
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
        this.spinTime += 2.5;
        if (this.spinTime >= this.spinTimeTotal) {
          this.stopRotateWheel();
          return;
        }
      }

      const spinAngle =
        this.spinArcStart -
        this.easeOut(this.spinTime, 0, this.spinArcStart, this.spinTimeTotal);

      this.startAngle += (spinAngle * 2 * Math.PI) / 180;
      this.drawRouletteWheel();
      this.spinTimeout = setTimeout(this.rotateWheel, 30);
    },

    easeOut(spinTime, b, spinArcStart, spinTimeTotal) {
      const ts = (spinTime /= spinTimeTotal) * spinTime;
      const tc = ts * spinTime;
      return b + spinArcStart * (tc + -2 * ts + 2 * spinTime);
    },

    stopRotateWheel() {
      clearTimeout(this.spinTimeout);
      var degrees = (this.startAngle * 180) / Math.PI + 90;
      var arcd = (this.arc * 180) / Math.PI;
      var index = Math.floor((360 - (degrees % 360)) / arcd);
      this.ctx.save();
      this.ctx.font = "bold 30px Helvetica, Arial";

      if (index === 1 || index === 6) {
        this.$emit("showImg", { type: "loose" });
      } else {
        this.$emit("showImg", { type: "win" });
        this.$emit("showImg", { type: "confetti" });
      }
      setTimeout(() => {
        this.spinRoullete = true;
      }, this.timeToShowOptions);
      this.ctx.restore();
    },
    nameToUpdate(update) {
      this.setTotalSpin(this.totalSpin + 1);
      switch (update) {
        case 0:
        case 3:
          this.setTotalGiftCard(this.totalGiftCard - 1);
          break;
        case 1:
        case 6:
          this.setTotalReplay(this.totalReplay - 1);
          break;
        case 2:
        case 5:
          this.setTotalSpecialSurprise(this.totalSpecialSurprise - 1);
          break;
        case 4:
          this.setTotalSpecialPrice(this.totalSpecialPrice - 1);

          break;
        case 7:
          this.setTotalTopPrice(this.totalTopPrice - 1);
          break;
      }
    },

    generateAnglesToWin(positionIndex) {
      switch (positionIndex) {
        case 0:
          return {
            topAngle: 45,
            downAngle: 0,
          };
        case 1:
          return {
            topAngle: 90,
            downAngle: 46,
          };

        case 2:
          return {
            topAngle: 135,
            downAngle: 91,
          };

        case 3:
          return {
            topAngle: 180,
            downAngle: 136,
          };

        case 4:
          return {
            topAngle: 225,
            downAngle: 181,
          };

        case 5:
          return {
            topAngle: 270,
            downAngle: 226,
          };

        case 6:
          return {
            topAngle: 315,
            downAngle: 271,
          };

        case 7:
          return {
            topAngle: 360,
            downAngle: 316,
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
        totalSpin: this.totalSpin,
      };
      const response = await service.setNewTotal(data);
      response === 0;
    },
    generateNumberToShow() {
      const newProbabilitie = this.generateProbabilityPriceByScheduler();
      const probabilities = newProbabilitie === null ? this.options : newProbabilitie;
      console.log(probabilities);


      let randomNum = Math.random();
      let positionIndex = 0;
      let cumulativeProbability = 0; // Las probabilidades deben sumar 1
      while (randomNum > cumulativeProbability) {
        positionIndex++;
        cumulativeProbability += probabilities[positionIndex].probability; // faltaba el arreglo "probabilities" en esta línea
      }

      //let selectedOption = probabilities[positionIndex].opcion; // se selecciona la opción correspondiente al índice obtenido
      console.log(positionIndex)
      return positionIndex;
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
        topPriceScheduleRangeB: this.topPriceScheduleRangeB,
      };
      service.setHour(data);
    },
    generateProbabilityPriceByScheduler() {
      if (
        this.actualTime >= this.giftCardScheduleRangeA.rangeDown &&
        this.actualTime <= this.giftCardScheduleRangeA.rangeTop &&
        this.giftCardScheduleRangeA.given === false
      ) {
        console.log('cardA')
        this.changeStateOfSchedulerWin("cardA");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 0 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      if (
        this.actualTime >= this.giftCardScheduleRangeB.rangeDown &&
        this.actualTime <= this.giftCardScheduleRangeB.rangeTop &&
        this.giftCardScheduleRangeB.given === false
      ) {
        this.changeStateOfSchedulerWin("cardB");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 0 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      if (
        this.actualTime >= this.giftCardScheduleRangeC.rangeDown &&
        this.actualTime <= this.giftCardScheduleRangeC.rangeTop &&
        this.giftCardScheduleRangeC.given === false
      ) {
        this.changeStateOfSchedulerWin("cardC");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 0 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      if (
        this.actualTime >= this.giftCardScheduleRangeD.rangeDown &&
        this.actualTime <= this.giftCardScheduleRangeD.rangeTop &&
        this.giftCardScheduleRangeD.given === false
      ) {
        this.changeStateOfSchedulerWin("cardD");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 0 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      if (
        this.actualTime >= this.giftCardScheduleRangeE.rangeDown &&
        this.actualTime <= this.giftCardScheduleRangeE.rangeTop &&
        this.giftCardScheduleRangeE.given === false
      ) {
        this.changeStateOfSchedulerWin("cardE");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0.5 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 0 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      if (
        this.actualTime >= this.topPriceScheduleRangeA.rangeDown &&
        this.actualTime <= this.topPriceScheduleRangeA.rangeTop &&
        this.topPriceScheduleRangeA.given === false
      ) {
        this.changeStateOfSchedulerWin("topPriceA");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 1 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      if (
        this.actualTime >= this.topPriceScheduleRangeB.rangeDown &&
        this.actualTime <= this.topPriceScheduleRangeB.rangeTop &&
        this.topPriceScheduleRangeB.given === false
      ) {
        this.changeStateOfSchedulerWin("topPriceB");
        const probabilities = [
          { opcion: "LAHJAKORTTI", probability: 0 }, // 1 vez x dia
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "LAHJAKORTTI", probability: 0 }, // based on probability (surpise win)
          { opcion: "TUOTEPALKINTO", probability: 0 }, //10 % special prize
          { opcion: "YLLÄTYSPALKINTO", probability: 0 }, // based on probability (surpise win)
          { opcion: "UUDESTAAN", probability: 0 }, //15-20%
          { opcion: "PÄÄPALKINTO", probability: 1 }, // 0% dependiendo la hrora
        ];
        return probabilities;
      }

      return null;
    },
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
    ]),
    selectedTotalReplay: {
      get() {
        return this.totalReplay;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalReplay(val);
      },
    },

    selectedTotalSpecialPrice: {
      get() {
        return this.totalSpecialPrice;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalSpecialPrice(val);
      },
    },
    selectedTotalSpecialSuprise: {
      get() {
        return this.totalSpecialSurprise;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalSpecialSurprise(val);
      },
    },

    selectedTotalTopPrice: {
      get() {
        return this.totalTopPrice;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalTopPrice(val);
      },
    },

    selectedTotalGiftCard: {
      get() {
        return this.totalGiftCard;
      },
      set(value) {
        const val = parseInt(value);
        this.setTotalGiftCard(val);
      },
    },

    arc() {
      return Math.PI / (this.sectors.length / 2); // valor de cada arco
    },
    actualPosition() {
      var degrees = (this.startAngle * 180) / Math.PI + 90;
      return Math.floor(360 - (degrees % 360));
    },
  },
  watch: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
