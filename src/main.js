import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./styles/themes.css";
import { resolveThemeId, applyThemeAttr } from "./themes/resolveTheme";

Vue.config.productionTip = false;

applyThemeAttr(resolveThemeId());

new Vue({
  store,
  router,
  render: (createElement) => createElement(App)
}).$mount("#app");
