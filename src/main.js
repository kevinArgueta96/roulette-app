import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./styles/themes.css";

Vue.config.productionTip = false;

document.documentElement.dataset.theme = process.env.VUE_APP_THEME || "parrano";

new Vue({
  store,
  router,
  render: (createElement) => createElement(App)
}).$mount("#app");
