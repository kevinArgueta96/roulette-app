import Vue from "vue";
import Vuex from "vuex";
import { initialOptionsConfigRoulette } from "@/config/config-roulette.js";
import {
  RANDOM_START_ANGLES,
  DEFAULT_WIN_DISTRIBUTION,
  normalizeWinDistribution,
  OUTCOME_KEYS,
  OUTCOME_LOGIC
} from "@/utils";
import themeModule from "./modules/theme";

Vue.use(Vuex);

const createState = () => ({
  options: [...initialOptionsConfigRoulette],
  timeToShowOptions: 7000,
  totalReplay: 0,
  totalSpecialPrice: 0,
  totalSpecialSurprise: 0,
  totalTopPrice: 0,
  totalGiftCard: 0,
  totalGiftCard3m: 0,
  totalGiftCard1m: 0,
  totalSpin: 0,
  winDistribution: DEFAULT_WIN_DISTRIBUTION(),
  initialAngle: RANDOM_START_ANGLES[0],
  spinRoullete: true,
  isMainPrizeActive: false,
  activeHeroResultType: ""
});

const totalKeys = [
  "totalReplay",
  "totalSpecialPrice",
  "totalSpecialSurprise",
  "totalTopPrice",
  "totalGiftCard",
  "totalGiftCard3m",
  "totalGiftCard1m",
  "totalSpin"
];


export default new Vuex.Store({
  modules: { theme: themeModule },
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
    setTotalGiftCard3m(state, payload) {
      state.totalGiftCard3m = Number(payload) || 0;
    },
    setTotalGiftCard1m(state, payload) {
      state.totalGiftCard1m = Number(payload) || 0;
    },
    setTotalSpin(state, payload) {
      state.totalSpin = Number(payload) || 0;
    },
    setWinDistribution(state, payload) {
      state.winDistribution = normalizeWinDistribution(payload);
    },
    incrementSlotGiven(state, { outcomeKey, slotIndex }) {
      if (!outcomeKey || !distHasOutcome(state.winDistribution, outcomeKey)) return;
      const meta = OUTCOME_LOGIC[outcomeKey];
      if (!meta?.hasSlots) return;
      const dist = state.winDistribution;
      const category = dist[outcomeKey];
      const slots = Array.isArray(category?.slots) ? category.slots : [];
      const updated = {
        ...category,
        slots: slots.map((slot, i) =>
          i === slotIndex ? { ...slot, given: (slot.given || 0) + 1 } : slot
        )
      };
      if (meta.hasDailyLimit) {
        updated.givenToday = (category.givenToday || 0) + 1;
      }
      state.winDistribution = {
        ...dist,
        [outcomeKey]: updated
      };
    },
    updateOutcomeConfig(state, { outcomeKey, patch }) {
      if (!distHasOutcome(state.winDistribution, outcomeKey)) return;
      state.winDistribution = normalizeWinDistribution({
        ...state.winDistribution,
        [outcomeKey]: {
          ...state.winDistribution[outcomeKey],
          ...(patch || {})
        }
      });
    },
    resetDailyCounters(state, newDate) {
      const dist = state.winDistribution;
      const next = {
        ...dist,
        lastResetDate: newDate
      };

      OUTCOME_KEYS.forEach((key) => {
        const category = dist[key];
        if (!category) return;
        const meta = OUTCOME_LOGIC[key];
        const updated = { ...category };
        if (meta.hasDailyLimit) {
          updated.givenToday = 0;
        }
        if (meta.hasSlots && Array.isArray(category.slots)) {
          updated.slots = category.slots.map((slot) => ({ ...slot, given: 0 }));
        }
        next[key] = updated;
      });

      state.winDistribution = next;
    },
    setInitialAngle(state, payload) {
      state.initialAngle = Number(payload) || 0;
    },
    setSpinRoullete(state, payload) {
      state.spinRoullete = Boolean(payload);
    },
    setTimeToShowOptions(state, payload) {
      state.timeToShowOptions = Number(payload) || 7000;
    },
    setMainPrizeActive(state, payload) {
      state.isMainPrizeActive = Boolean(payload);
    },
    setActiveHeroResultType(state, payload) {
      state.activeHeroResultType = typeof payload === "string" ? payload : "";
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

function distHasOutcome(distribution, outcomeKey) {
  return Boolean(distribution && Object.prototype.hasOwnProperty.call(distribution, outcomeKey));
}
