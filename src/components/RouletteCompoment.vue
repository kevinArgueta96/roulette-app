<template>
  <div class="container text-center" style="height: 100%" ref="testRef">
    <canvas
      id="canvas"
      @click="spin()"
      ref="myCanvas"
      :width="widthCircule"
      :height="heightCircule"
    ></canvas>

    <!--<div class="row central-columns-top-down" style="height: 100%; background-color: red; position: relative; bottom: 100%; z-index: -1;">
        <canvas id="canvas2" ref="myCanvas2" width="300" height="200"></canvas>
    </div>-->
    <!--<div style="position: relative; bottom: ; 10px;background-color: aquamarine;">
      <canvas id="canvasOther" ref="myCanvasOther" width="100" height="100"></canvas>
    </div>-->
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data: () => {
    return {
      result: [],
      counter: 0,
      name: "",
      options: [
        "LAHJAKORTT",
        "UUDESTAAN",
        "YLLÄTYSPALKINTO",
        "LAHJAKORTTI",
        "TUOTEPALKINTO",
        "YLLÄTYSPALKINTO",
        "UUDESTAAN",
        "PÄÄPALKINTO",
      ],
      colors: [
        "#000000",
        "#c9ecff",
        "#ff501c",
        "#4f6068",
        "#fff2f1",
        "#ff501c",
        "#c9ecff",
        "#ffeda3",
      ],

      heightCircule: 0,
      widthCircule: 0,

      startAngle: 0,
      spinTimeout: null,

      spinArcStart: 10, // para decir cuanto girara el arco
      spinTime: 0,
      spinTimeTotal: 0,

      ctx: null,
      circuleLogoCenter: null,

      canvas: null,
      radio: 85,

      outsideRadius: 400, // radio del circulo, que tan grande sera
      textRadius: 250, // radio del tecto
      insideRadius: 10,
    };
  },
  mounted() {
    //console.log(this.$refs.testRef.offsetWidth);
    //console.log(this.$refs.testRef.offsetHeight);
    this.widthCircule = this.$refs.testRef.offsetWidth;
    this.heightCircule = this.$refs.testRef.offsetHeight;

    //this.drawRouletteWheel();
    // this.drawMiddleRouletteWheel();
    requestAnimationFrame(this.drawRouletteWheel);
  },
  methods: {
    setName(event, lastName) {
      this.name = event.target.value + " " + lastName;
    },
    drawRouletteWheel() {
      this.canvas = this.$refs.myCanvas;

      this.ctx = this.canvas.getContext("2d");
      this.ctx.clearRect(0, 0, 500, 500);

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 1;

      this.ctx = this.canvas.getContext("2d");

      const widthCircle = this.widthCircule / 2;
      const heightCirlce = this.heightCircule / 2;
      // determina el color de la line externa
      this.ctx.clearRect(0, 0, widthCircle, heightCirlce); // elimina una porcion enviando psicion y tamaño del rectangulo
      this.ctx.beginPath();

      this.ctx.font = "bold 20px Helvetica, Arial";

      for (let i = 0; i < this.options.length; i++) {
        let angle = this.startAngle + i * this.arc;
        this.ctx.fillStyle = this.colors[i];
        //this.ctx.fillStyle = i % 2 === 0 ? "#eaeaea" : "#A4A5A5";

        this.ctx.beginPath();
        this.ctx.arc(
          widthCircle,
          heightCirlce,
          this.outsideRadius,
          angle,
          angle + this.arc,
          false
        );

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
        this.ctx.lineWidth = 20;
        this.ctx.arc(
          widthCircle,
          heightCirlce,
          this.outsideRadius + 20,
          angle,
          angle + this.arc,
          false
        );

        this.ctx.stroke();

        this.ctx.shadowOffsetX = -1;
        this.ctx.shadowOffsetY = -1;
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "rgb(220,220,220)";
        this.ctx.fillStyle = "black";

        if (i === 7) {
          //this.textRadius = this.textRadius +50
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
          this.ctx.rotate(angle + this.arc / 2 + Math.PI / 1);
        }

        var text = this.options[i];
        this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);
        this.ctx.restore();
      }

      //Arrow

      this.ctx.fillStyle = "blue";
      this.ctx.beginPath();

      const widthOfArrow = 10;
      const heigthOfArrow = 15;
      const widthOfTriangle = 25;
      const largeOfTriangle = 35;

      this.ctx.moveTo(
        widthCircle - widthOfArrow,
        heightCirlce - (this.outsideRadius + heigthOfArrow)
      );
      this.ctx.lineTo(
        widthCircle + widthOfArrow,
        heightCirlce - (this.outsideRadius + heigthOfArrow)
      );
      this.ctx.lineTo(
        widthCircle + widthOfArrow,
        heightCirlce - (this.outsideRadius - heigthOfArrow)
      );
      this.ctx.lineTo(
        widthCircle + widthOfTriangle,
        heightCirlce - (this.outsideRadius - heigthOfArrow)
      );
      this.ctx.lineTo(
        widthCircle + 0,
        heightCirlce - (this.outsideRadius - largeOfTriangle)
      );
      this.ctx.lineTo(
        widthCircle - widthOfTriangle,
        heightCirlce - (this.outsideRadius - heigthOfArrow)
      );
      this.ctx.lineTo(
        widthCircle - widthOfArrow,
        heightCirlce - (this.outsideRadius - heigthOfArrow)
      );
      this.ctx.lineTo(
        widthCircle - widthOfArrow,
        heightCirlce - (this.outsideRadius + heigthOfArrow)
      );

      this.ctx.fill();
    },

    spin() {
      this.spinAngleStart = Math.random() * 10 + 10;
      this.spinTime = 0;
      this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
      this.rotateWheel();
    },

    rotateWheel() {
      this.spinTime += 30;
      if (this.spinTime >= this.spinTimeTotal) {
        this.stopRotateWheel();
        return;
      }
      const spinAngle =
        this.spinArcStart -
        this.easeOut(this.spinTime, 0, this.spinArcStart, this.spinTimeTotal);

      this.startAngle += (spinAngle * Math.PI) / 180;
      this.drawRouletteWheel();
      this.spinTimeout = setTimeout(this.rotateWheel, 30);
    },

    easeOut(spinTime, b, spinArcStart, spinTimeTotal) {
      const ts = (spinTime /= spinTimeTotal) * spinTime;
      const tc = ts * spinTime;
      return b + spinArcStart * (tc + -3 * ts + 3 * spinTime);
    },

    stopRotateWheel() {
      clearTimeout(this.spinTimeout);
      var degrees = (this.startAngle * 180) / Math.PI + 90;
      var arcd = (this.arc * 180) / Math.PI;
      var index = Math.floor((360 - (degrees % 360)) / arcd);
      this.ctx.save();
      this.ctx.font = "bold 30px Helvetica, Arial";

      if (index === 7) {
        this.$emit("showImg", { type: "win" });
      }
      this.$emit("showImg", { type: "loose" });

      this.ctx.restore();
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
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
