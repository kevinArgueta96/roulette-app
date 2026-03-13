import Vue from "vue";
import Vuex from "vuex";
import { initialOptionsConfigRoulette } from "@/config/config-roulette.js";
import { RANDOM_START_ANGLES } from "@/utils";

Vue.use(Vuex);

const createState = () => ({
  options: [...initialOptionsConfigRoulette],
  timeToShowOptions: 7000,
  totalReplay: 0,
  totalSpecialPrice: 0,
  totalSpecialSurprise: 0,
  totalTopPrice: 0,
  totalGiftCard: 0,
  totalSpin: 0,
  giftCards: [],
  topPrices: [],
  teslaPrices: [],
  initialAngle: RANDOM_START_ANGLES[0],
  spinRoullete: true
});

const totalKeys = [
  "totalReplay",
  "totalSpecialPrice",
  "totalSpecialSurprise",
  "totalTopPrice",
  "totalGiftCard",
  "totalSpin"
];

export default new Vuex.Store({
  state: createState(),
  getters: Object.keys(createState()).reduce((accumulator, key) => ({
    ...accumulator,
    [key]: (state) => state[key]
  }), {}),
  mutations: {
    setOptions(state, payload) {
      state.options = Array.isArray(payload) && payload.length
        ? payload
        : [...initialOptionsConfigRoulette];
    },
    setTotals(state, payload) {
      totalKeys.forEach((key) => {
        state[key] = Number(payload?.[key]) || 0;
      });
    },
    setTotalReplay(state, payload) {
      state.totalReplay = Number(payload) || 0;
    },
    setTotalSpecialPrice(state, payload) {
      state.totalSpecialPrice = Number(payload) || 0;
    },
    setTotalSpecialSurprise(state, payload) {
      state.totalSpecialSurprise = Number(payload) || 0;
    },
    setTotalTopPrice(state, payload) {
      state.totalTopPrice = Number(payload) || 0;
    },
    setTotalGiftCard(state, payload) {
      state.totalGiftCard = Number(payload) || 0;
    },
    setTotalSpin(state, payload) {
      state.totalSpin = Number(payload) || 0;
    },
    setGiftCards(state, payload) {
      state.giftCards = Array.isArray(payload) ? payload : [];
    },
    setTopPrices(state, payload) {
      state.topPrices = Array.isArray(payload) ? payload : [];
    },
    setTeslaPrices(state, payload) {
      state.teslaPrices = Array.isArray(payload) ? payload : [];
    },
    setInitialAngle(state, payload) {
      state.initialAngle = Number(payload) || 0;
    },
    setSpinRoullete(state, payload) {
      state.spinRoullete = Boolean(payload);
    },
    setTimeToShowOptions(state, payload) {
      state.timeToShowOptions = Number(payload) || 7000;
    }
  },
  actions: {
    initializeRandomAngle({ commit }) {
      const randomIndex = Math.floor(Math.random() * RANDOM_START_ANGLES.length);
      commit("setInitialAngle", RANDOM_START_ANGLES[randomIndex]);
    },
    hydrateBootstrapData({ commit }, payload) {
      if (payload?.options) {
        commit("setOptions", payload.options);
      }

      if (payload?.totals) {
        commit("setTotals", payload.totals);
      }

      if (payload?.giftCards) {
        commit("setGiftCards", payload.giftCards);
      }

      if (payload?.topPrices) {
        commit("setTopPrices", payload.topPrices);
      }

      if (payload?.teslaPrices) {
        commit("setTeslaPrices", payload.teslaPrices);
      }
    },
    updateState({ commit }, { mutationType, payload }) {
      commit(mutationType, payload);
    }
  }
});
