<template>
  <div class="container">
    <div class="container" v-if="visible" style="height: 100%; width: 15rem; ">
      <img :src="srcImg" class="img-fluid win-text" alt="Responsive image" />
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
