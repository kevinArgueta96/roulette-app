import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Roulette",
    component: () => import("@/views/RouletteView.vue")
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardView.vue")
  }
];

export default new VueRouter({
  routes
});