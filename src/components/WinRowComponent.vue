<template>
  <div class="container">
    <div
      class="container"
      :class="{ fadeInImage: visible, notShowImg: !visible } "
      style="height: 100%; "
      :style="{width:sizeOfWinImg+'rem'}"
    >
      <img :src="srcImg" class="img-fluid win-text" alt="Responsive image" />
      <!--:style="{height: f+'%'}"/>-->
    </div>
  </div>
</template>

<script>
export default {
  name: "WinColumn",
  data: () => {
    return {
      screenWidth: 0,
      sizeOfWinImg: 0,
    };
  },
  props: {
    srcImg: String,
    visible: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.sizeOfWinImg = 50;
  },
  created() {
    window.addEventListener("resize", this.handleResize);
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      console.log("tets");
      this.screenWidth = window.innerWidth;
    },
  },
  watch: {
    screenWidth(val) {
      if (val > 2000) {
        this.sizeOfWinImg = 60;
      }
    },
  },
};
</script>

<style scoped>
.notShowImg {
  opacity: 1;
  transition: opacity 5s ease-in-out;
  display: none;
}
.fadeInImage {
  animation: fadeIn 3s;
  -webkit-animation: fadeIn 3s;
  -moz-animation: fadeIn 3s;
  -o-animation: fadeIn 3s;
  -ms-animation: fadeIn 3s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-moz-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-o-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-ms-keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
