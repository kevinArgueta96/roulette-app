<template>
    <div class="container">
        <div class="container" style="background-color: red; height: 100%; width: 15rem; " >
            <img :src="srcImg" class="img-fluid win-text" alt="Responsive image">
        </div>
    </div>
</template>

<script>
export default {
  name: 'WinColumn',
  props: {
    srcImg: String
  }
}
</script>
