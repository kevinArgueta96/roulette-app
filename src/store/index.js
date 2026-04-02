import Vue from "vue";
import Vuex from "vuex";
import { initialOptionsConfigRoulette } from "@/config/config-roulette.js";
import { RANDOM_START_ANGLES, DEFAULT_WIN_DISTRIBUTION } from "@/utils";

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
  winDistribution: DEFAULT_WIN_DISTRIBUTION(),
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
    setWinDistribution(state, payload) {
      if (payload && typeof payload === "object") {
        state.winDistribution = {
          ...DEFAULT_WIN_DISTRIBUTION(),
          ...payload,
          mainWin: { ...DEFAULT_WIN_DISTRIBUTION().mainWin, ...(payload.mainWin || {}) },
          smallWin: { ...DEFAULT_WIN_DISTRIBUTION().smallWin, ...(payload.smallWin || {}) }
        };
      }
    },
    incrementMainWinGiven(state, slotIndex) {
      const dist = state.winDistribution;
      state.winDistribution = {
        ...dist,
        mainWin: {
          ...dist.mainWin,
          givenToday: dist.mainWin.givenToday + 1,
          slots: dist.mainWin.slots.map((slot, i) =>
            i === slotIndex ? { ...slot, given: slot.given + 1 } : slot
          )
        }
      };
    },
    incrementSmallWinGiven(state, slotIndex) {
      const dist = state.winDistribution;
      state.winDistribution = {
        ...dist,
        smallWin: {
          ...dist.smallWin,
          givenToday: dist.smallWin.givenToday + 1,
          slots: dist.smallWin.slots.map((slot, i) =>
            i === slotIndex ? { ...slot, given: slot.given + 1 } : slot
          )
        }
      };
    },
    resetDailyCounters(state, newDate) {
      const dist = state.winDistribution;
      state.winDistribution = {
        ...dist,
        lastResetDate: newDate,
        mainWin: {
          ...dist.mainWin,
          givenToday: 0,
          slots: dist.mainWin.slots.map((slot) => ({ ...slot, given: 0 }))
        },
        smallWin: {
          ...dist.smallWin,
          givenToday: 0,
          slots: dist.smallWin.slots.map((slot) => ({ ...slot, given: 0 }))
        }
      };
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

      if (payload?.winDistribution) {
        commit("setWinDistribution", payload.winDistribution);
      }
    },
    updateState({ commit }, { mutationType, payload }) {
      commit(mutationType, payload);
    }
  }
});
