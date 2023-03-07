<template>
  <div class="container text-center" style="height: 100%;">
    <div class="col" style="height: 100%;">
      <div class="row central-columns-top-down">
        <canvas id="canvas" @click="spin()" ref="myCanvas" width="300" height="200"></canvas>
      </div>
      <!--<div class="row central-columns-top-down" style="height: 100%; background-color: red; position: relative; bottom: 100%; z-index: -1;">
        <canvas id="canvas2" ref="myCanvas2" width="300" height="200"></canvas>
      </div>-->
    </div>
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
        "Premio 1",
        "Premio 2",
        "Premio 3",
        "Premio 4",
        "Premio 5",
        "Premio 6",
      ],
      colors: ['#FF4136', '#2ECC40', '#0074D9', '#FFDC00', '#FF851B', '#B10DC9'],
      startAngle: 0,
      spinTimeout: null,
      spinArcStart: 10, // para decir cuanto girara el arco
      spinTimeTotal: 0,
      spinTime: 0,
      ctx: null,
      circuleLogoCenter: null,
      canvas: null,

      radio: 85
    };
  },
  mounted() {
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
      // determina el color de la line externa
      this.ctx.clearRect(0, 0, 300, 300); // elimina una porcion enviando psicion y tamaño del rectangulo
      this.ctx.beginPath();


      const gradosRectos = 90 * (Math.PI / 180);
      this.ctx.arc(
        150,
        90,
        this.radio /*(radio)*/,
        0 /*Angulo inicial*/,
        2 * Math.PI //*angulo final en radianes
      ); // aca definms donde aparece y el tamaño
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 3; //es rl grosor de la linea externa

      // this.ctx.fillStyle = "black"; // color de fondo
      //this.ctx.fill(); //pintar color de fondo

      this.ctx.stroke();
      this.ctx.save();

      this.ctx.translate(150, 90); // Acá colocamos la posicion del circulo
      for (let i = 0; i < this.options.length; i++) {
        const angle = this.startAngle + i * this.arc; //angulo en radianes
        //const grades = (angle * 180) / Math.PI + 90 // puedo ver los grados
        //console.log({angle,grades})
        //this.ctx.fillStyle = i % 2 === 0 ? "#eaeaea" : "#A4A5A5";
        this.ctx.fillStyle = this.colors[i];
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 80, angle, angle + this.arc); //aca colocamos el tamaño del circulo
        this.ctx.lineTo(0, 0);
        this.ctx.fill();
        this.ctx.save();
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "black"; //color de las letras
        this.ctx.fillStyle = "black ";
        this.ctx.translate(0, 0); // posiciona las palabras
        //console.log({angle,arc:this.arc,pi:(Math.PI/2)})

        this.ctx.rotate(angle + this.arc / 60 + Math.PI / 2); // quien gana y la rotacion

        const text = this.options[i];
        this.ctx.font = "18px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, -20); // colocla el texto en el circulo
        this.ctx.restore();
      }

      this.ctx.restore();

      /*const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;

      const pointIndex = 3; // Índice de la posición deseada
      const pointAngle = pointIndex * this.arc;
      const pointX = centerX + 80 * Math.cos(pointAngle);
      const pointY = centerY + 90 * Math.sin(pointAngle);

      let backgroundImage = new Image();
      backgroundImage.src = "/img/storytel-flecha.png";
      backgroundImage.onload = () => {
        this.ctx.drawImage(backgroundImage, centerX - 5, 0, 10, 10);
      };

      // Dibujar el punto
      /*this.ctx.beginPath();
      this.ctx.arc(pointX, pointY, 10, 0, 2 * Math.PI);
      this.ctx.fill();*/
    },
    drawMiddleRouletteWheel() {
      const canvas = this.$refs.myCanvasOther;
      this.circuleLogoCenter = canvas.getContext("2d");
      this.circuleLogoCenter.beginPath();
      this.circuleLogoCenter.arc(
        canvas.width / 2,
        canvas.height / 2,
        40,
        0,
        Math.PI * 2
      );
      this.circuleLogoCenter.fillStyle = "black";
      this.circuleLogoCenter.fill();

      let backgroundImage = new Image();
      backgroundImage.src = "/img/other_logo.png";
      backgroundImage.onload = () => {
        this.circuleLogoCenter.drawImage(
          backgroundImage,
          25,
          28,
          canvas.width / 2,
          canvas.height / 2
        );
      };
    },
    spin() {
      this.spinTimeTotal = Math.random() * 3 + 4 * 500; //tiempo a girar la ruleta
      console.log(this.spinTimeTotal);

      this.spinTime = 0;
      this.spinArcStart = Math.random() * 10 + 10; // cambiar o que no sea tan predecible

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

      const degrees = (this.startAngle * 180) / Math.PI + 90; // conviete en grados el tamaño del circukl
      const arcd = (this.arc * 180) / Math.PI; // Es el valor de grados de cada parte del Circulo en radianes


     
      const stopIndex = Math.floor((360 - (degrees % 360)) / arcd);
      const index = stopIndex;
      this.ctx.save();
      this.ctx.font = "bold 30px sans-serif";
      const text = this.options[index];
      this.ctx.fillText(
        text,
        150 - this.ctx.measureText(text).width / 2,
        150 + 10
      );
      this.ctx.restore();

      /*const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();*/

      let icon = new Image();
      icon.src = "/img/storytel-flecha.png";

      //console.log(`La fecha actual es: ${day}/${month}/${year}`);

     // const centerX = this.canvas.width / 2;
      //const centerY = this.canvas.height / 2;

      const pathLength = this.ctx.pathLength;
      console.log(pathLength);







      //this.$emit("showImg", { type: "loose" });
      this.$emit("showImg", { type: "win" });
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
