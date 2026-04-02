import Vue from "vue";
import VueRouter from "vue-router";
import RouletteView from "@/views/RouletteView.vue";
import DashboardView from "@/views/DashboardView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "roulette",
    component: RouletteView
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView
  },
  {
    path: "*",
    redirect: "/"
  }
];

export default new VueRouter({
  mode: "hash",
  routes
});
