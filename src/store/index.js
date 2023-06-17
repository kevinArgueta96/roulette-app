import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options: [
      { "option": "LAHJAKORTT", "probability": 0.425 }, { "opcion": "UUDESTAAN", "probability": 0.025 }, { "opcion": "YLLÄTYSPALKINTO", "probability": 0.05 }, { "opcion": "LAHJAKORTTI", "probability": 0 }, { "opcion": "TUOTEPALKINTO", "probability": 0.425 }, { "opcion": "YLLÄTYSPALKINTO", "probability": 0.05 }, { "opcion": "UUDESTAAN", "probability": 0.025 }, { "opcion": "PÄÄPALKINTO", "probability": 0 }
    ],
    timeToShowOptions: 7000,
    totalReplay: 0,
    totalSpecialPrice: 0,
    totalSpecialSurprise: 0,
    totalTopPrice: 0,
    totalGiftCard: 0,
    totalSpin: 0,

    giftCards: [],
    topPrices: [],

    initialAngle: 5.1,
    spinRoullete: true,

  },
  getters: {
    options: (state) => state.options,
    timeToShowOptions: (state) => state.timeToShowOptions,
    totalReplay: (state) => state.totalReplay,
    totalSpecialPrice: (state) => state.totalSpecialPrice,
    totalSpecialSurprise: (state) => state.totalSpecialSurprise,
    totalTopPrice: (state) => state.totalTopPrice,
    totalGiftCard: (state) => state.totalGiftCard,
    totalSpin: (state) => state.totalSpin,

    giftCards: (state) => state.giftCards,
    topPrices: (state) => state.topPrices,
  
    initialAngle: (state) => state.initialAngle,
    spinRoullete: (state) => state.spinRoullete,

  },
  mutations: {
    setOptions(state, payload) {
      state.options = payload;
    },
    setTotalReplay(state, payload) {
      state.totalReplay = payload;
    },
    setTotalSpecialPrice(state, payload) {
      state.totalSpecialPrice = payload;
    },
    setTotalSpecialSurprise(state, payload) {
      state.totalSpecialSurprise = payload;
    },
    setTotalTopPrice(state, payload) {
      state.totalTopPrice = payload;
    },
    setTotalGiftCard(state, payload) {
      state.totalGiftCard = payload;
    },
    setTotalSpin(state, payload) {
      state.totalSpin = payload;
    },

    

    setGiftCards(state, payload) {
      state.giftCards = payload;
    },
    setTopPrices(state, payload) {
      state.topPrices = payload;
    },


    setInitialAngle(state, payload) {
      state.initialAngle = payload;
    },

    setSpinRoullete(state, payload) {
      state.spinRoullete = payload;
    },

    setTimeToShowOptions(state, payload){
      state.timeToShowOptions = payload;
    }
  },
  actions: {
    setOptions(context, payload) {
      context.commit('setOptions', payload)
    },
    setTotalReplay(context, payload) {
      context.commit('setTotalReplay', payload)
    },
    setTotalSpecialPrice(context, payload) {
      context.commit('setTotalSpecialPrice', payload)
    },
    setTotalSpecialSurprise(context, payload) {
      context.commit('setTotalSpecialSurprise', payload)
    },
    setTotalTopPrice(context, payload) {
      context.commit('setTotalTopPrice', payload)
    },
    setTotalGiftCard(context, payload) {
      context.commit('setTotalGiftCard', payload)
    },
    setTotalSpin(context, payload) {
      context.commit('setTotalSpin', payload)
    },

    

    setGiftCards(context, payload) {
      context.commit('setGiftCards', payload)
    },
    setTopPrices(context, payload) {
      context.commit('setTopPrices', payload)
    },


    setInitialAngle(context, payload) {
      context.commit('setInitialAngle', payload)
    },

    setSpinRoullete(context, payload) {
      context.commit('setSpinRoullete', payload)
    },

    setTimeToShowOptions(context, payload) {
      context.commit('setTimeToShowOptions', payload)
    },
  },
  modules: {
  }
})
