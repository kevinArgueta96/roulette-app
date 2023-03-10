import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options:[],
    timeToShowOptions:5000,
    totalReplay:0,
    totalSpecialPrice:0,
    totalSpecialSurprise:0,
    totalTopPrice:0
  },
  getters: {
    options: (state) => state.options,
    timeToShowOptions: (state) => state.timeToShowOptions,
    totalReplay: (state) => state.totalReplay,
    totalSpecialPrice: (state) => state.totalSpecialPrice,
    totalSpecialSurprise: (state) => state.totalSpecialSurprise,
    totalTopPrice: (state) => state.totalTopPrice,
  },
  mutations: {
    setOptions(state,payload){
      state.options = payload.payload;
    },
    setTotalReplay(state,payload){
      state.totalReplay = payload;
    },
    setTotalSpecialPrice(state,payload){
      state.totalSpecialPrice = payload;
    },
    setTotalSpecialSurprise(state,payload){
      state.totalSpecialSurprise = payload;
    },
    setTotalTopPrice(state,payload){
      state.totalTopPrice = payload;
    }
  },
  actions: {
    setOptions(context,payload){
      context.commit('setOptions',payload)
    },
    setTotalReplay(context,payload){
      context.commit('setTotalReplay',payload)
    },
    setTotalSpecialPrice(context,payload){
      context.commit('setTotalSpecialPrice',payload)
    },
    setTotalSpecialSurprise(context,payload){
      context.commit('setTotalSpecialSurprise',payload)
    },
    setTotalTopPrice(context,payload){
      context.commit('setTotalTopPrice',payload)
    },
  },
  modules: {
  }
})
