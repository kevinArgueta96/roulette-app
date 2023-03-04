<template>
  <div id="app">
    
    <div class="container text-center"  id="container-objects" >
      <div class="col-sm-12">
        <div class="row" id="null-column"> 
            <WinRowComponent srcImg="/img/loose-img.png"/>
          </div>
      </div>
      <div class="row" style="height: 100%;">
        <div class="col-sm-1 win-colmun">
          <div class="row" id="null-column"></div>
          <div class="row" id="null-column"> 
            <WinRowComponent srcImg="/img/win-image.png"/>
          </div>
          <div class="row" id="null-column"></div>
        </div>
        <div class="col-sm-10 win-central ">
          <RouletteCompoment msg="Welcome to Your Vue.js App"/>
        </div>
        <div class="col-sm-1 win-colmun">
          <div class="row" id="null-column"></div>
          <div class="row" id="null-column-rigth"> 
            <WinRowComponent srcImg="/img/win-image.png"/>
          </div>
          <div class="row" id="null-column"></div>
        </div>
      </div>
      
    </div>
    <div class="footer">
      <div class="col-auto text-center p-5">
        <img src="/img/logo-img.png" class="img-fluid" alt="Responsive image">
      </div>
    </div>
  </div>
</template>

<script>
import RouletteCompoment from './components/RouletteCompoment.vue'
import WinRowComponent from './components/WinRowComponent.vue'

export default {
  name: 'App',
  components: {
    RouletteCompoment,
    WinRowComponent
  }
}
</script>

<style>
#app {
  height: 85%;
  margin-top: 20px;
}
</style>
