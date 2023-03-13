<template>
  <div class="container">
    <div class="container" :class="{ fadeInImage: visible, notShowImg: !visible } " style="height: 100%; width: 20rem; padding-bottom: 30px; ">
      <img :src="srcImg" class="img-fluid win-text" alt="Responsive image" 
      />
      <!--:style="{height: f+'%'}"/>-->
    </div>
  </div>
</template>

<script>
export default {
  name: "WinColumn",
  props: {
    srcImg: String,
    visible: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>

.notShowImg{
  opacity: 1;
  transition: opacity 1s ease-in-out;
  display: none;
}
.fadeInImage{
  animation: fadeIn 2s;
  -webkit-animation: fadeIn 2s;
  -moz-animation: fadeIn 2s;
  -o-animation: fadeIn 2s;
  -ms-animation: fadeIn 2s;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@-moz-keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@-webkit-keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@-o-keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@-ms-keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
