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

    giftCardScheduleRangeA: [],
    giftCardScheduleRangeB: [],
    giftCardScheduleRangeC: [],
    giftCardScheduleRangeD: [],
    giftCardScheduleRangeE: [],
    giftCardScheduleRangeF: [],
    giftCardScheduleRangeG: [],
    giftCardScheduleRangeH: [],

    topPriceScheduleRangeA: [],
    topPriceScheduleRangeB: [],

    actualTIme: '',

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

    giftCardScheduleRangeA: (state) => state.giftCardScheduleRangeA,
    giftCardScheduleRangeB: (state) => state.giftCardScheduleRangeB,
    giftCardScheduleRangeC: (state) => state.giftCardScheduleRangeC,
    giftCardScheduleRangeD: (state) => state.giftCardScheduleRangeD,
    giftCardScheduleRangeE: (state) => state.giftCardScheduleRangeE,
    giftCardScheduleRangeF: (state) => state.giftCardScheduleRangeF,
    giftCardScheduleRangeG: (state) => state.giftCardScheduleRangeG,
    giftCardScheduleRangeH: (state) => state.giftCardScheduleRangeH,


    topPriceScheduleRangeA: (state) => state.topPriceScheduleRangeA,
    topPriceScheduleRangeB: (state) => state.topPriceScheduleRangeB,

    actualTIme: (state) => state.actualTIme,

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

    setGiftCardScheduleRangeA(state, payload) {
      state.giftCardScheduleRangeA = payload;
    },
    setGiftCardScheduleRangeB(state, payload) {
      state.giftCardScheduleRangeB = payload;
    },
    setGiftCardScheduleRangeC(state, payload) {
      state.giftCardScheduleRangeC = payload;
    },
    setGiftCardScheduleRangeD(state, payload) {
      state.giftCardScheduleRangeD = payload;
    },
    setGiftCardScheduleRangeE(state, payload) {
      state.giftCardScheduleRangeE = payload;
    },
    setGiftCardScheduleRangeF(state, payload) {
      state.giftCardScheduleRangeF = payload;
    },
    setGiftCardScheduleRangeG(state, payload) {
      state.giftCardScheduleRangeG = payload;
    },
    setGiftCardScheduleRangeH(state, payload) {
      state.giftCardScheduleRangeH = payload;
    },


    setTopPriceScheduleRangeA(state, payload) {
      state.topPriceScheduleRangeA = payload;
    },
    setTopPriceScheduleRangeB(state, payload) {
      state.topPriceScheduleRangeB = payload;
    },

    setActualTime(state, payload) {
      state.actualTIme = payload;
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

    setGiftCardScheduleRangeA(context, payload) {
      context.commit('setGiftCardScheduleRangeA', payload)

    },
    setGiftCardScheduleRangeB(context, payload) {
      context.commit('setGiftCardScheduleRangeB', payload)

    },
    setGiftCardScheduleRangeC(context, payload) {
      context.commit('setGiftCardScheduleRangeC', payload)

    },
    setGiftCardScheduleRangeD(context, payload) {
      context.commit('setGiftCardScheduleRangeD', payload)

    },
    setGiftCardScheduleRangeE(context, payload) {
      context.commit('setGiftCardScheduleRangeE', payload)
    },
    setGiftCardScheduleRangeF(context, payload) {
      context.commit('setGiftCardScheduleRangeF', payload)
    },
    setGiftCardScheduleRangeG(context, payload) {
      context.commit('setGiftCardScheduleRangeG', payload)
    },
    setGiftCardScheduleRangeH(context, payload) {
      context.commit('setGiftCardScheduleRangeH', payload)
    },


    setTopPriceScheduleRangeA(context, payload) {
      context.commit('setTopPriceScheduleRangeA', payload)
    },
    setTopPriceScheduleRangeB(context, payload) {
      context.commit('setTopPriceScheduleRangeB', payload)
    },


    setActualTime(context, payload) {
      context.commit('setActualTime', payload)
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
