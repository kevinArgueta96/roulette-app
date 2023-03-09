<template>
  <div class="container text-center" style="height: 100%" ref="testRef">
    <canvas
      id="canvas"
      @click="spin()"
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
export default {
  name: "HelloWorld",

  data: () => {
    return {
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
      options: [
        "LAHJAKORTT", // 1 vez x dia
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

      outsideRadius: 300, // radio del circulo, que tan grande sera
      textRadius: 200, // radio del tecto
      insideRadius: 50,

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
    this.widthCircule = this.$refs.testRef.offsetWidth;
    this.heightCircule = this.$refs.testRef.offsetHeight;
    this.validateSizeOfImg();
    requestAnimationFrame(this.drawRouletteWheel);
  },
  methods: {
    validateSizeOfImg() {
      if (this.screenWidth > 1024) {
        this.topCentralLogo = 40;
        this.rightCentralLogo = 40;
        this.widthCentralLogo = 17;
        this.topArrowLogo = 0;
        this.rightArrowLogo = 45;
        this.widthArrowLogo = 8;
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

      this.ctx.font = "bold 1rem Helvetica, Arial";

      for (let i = 0; i < this.options.length; i++) {
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

        var text = this.options[i];
        this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);
       
        this.ctx.restore();
      }
    },

    spin() {
      if (this.spinRoullete) {
        this.winner = this.generateNumberToShow(this.actualPosition);
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
      }, 5000);
      this.ctx.restore();
    },
    generateNumberToShow() {
      let probabilities = [
        { opcion: "LAHJAKORTT", probability: 0 }, // 1 vez x dia
        { opcion: "UUDESTAAN", probability: 0.025 }, //15-20%
        { opcion: "YLLÄTYSPALKINTO", probability: 0.1 }, // based on probability (surpise win)
        { opcion: "LAHJAKORTTI", probability: 0 }, // based on probability (surpise win)
        { opcion: "TUOTEPALKINTO", probability: 0.85 }, //10 % special prize
        { opcion: "YLLÄTYSPALKINTO", probability: 0.1 }, // based on probability (surpise win)
        { opcion: "UUDESTAAN", probability: 0.025 }, //15-20%
        { opcion: "PÄÄPALKINTO", probability: 0.5 }, // 0% dependiendo la hrora
      ];

      let randomNum = Math.random();
      let positionIndex = 0;
      let cumulativeProbability = probabilities[0].probability; // Las probabilidades deben sumar 1

      while (randomNum > cumulativeProbability) {
        positionIndex++;
        cumulativeProbability += probabilities[positionIndex].probability;
      }
      console.log(positionIndex);
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
    add(num) {
      fetch("https://roulette-db-default-rtdb.firebaseio.com/suervey.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "test",
          rating: "otherTest",
        }),
      }).then(function (response) {
        console.log(response);
      });
      this.counter = this.counter + num;
    },
    sendData(payload) {
      fetch("https://roulette-db-default-rtdb.firebaseio.com/wins.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      }).then(function (response) {
        console.log(response);
      });
    },
    reduce(num) {
      fetch("https://roulette-db-default-rtdb.firebaseio.com/suervey.json", {})
        .then((response) => {
          console.log(response);
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          console.log(data);
          const results = [];
          for (const id in data) {
            results.push({ id: id, name: data[id].rating });
          }
          this.result = results;
        });
      this.counter = this.counter - num;
      // this.counter--;
    },
  },
  computed: {
    arc() {
      return Math.PI / (this.options.length / 2); // valor de cada arco
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
