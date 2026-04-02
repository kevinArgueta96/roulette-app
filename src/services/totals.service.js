import { CONFIG } from "../../env.config";
import {
  normalizeOptions,
  normalizePrizeCollection,
  normalizeTotals
} from "@/utils";

const REQUEST_TIMEOUT_MS = 8000;
const LOCAL_MODE_KEY = "roulette-data-mode";
const LOCAL_SNAPSHOT_KEY = "roulette-local-snapshot";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeBootstrapPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};

  return {
    options: normalizeOptions(source.options || source.roulette || []),
    totals: normalizeTotals(source.totals || source.totalPrices || source.total_prices || {}),
    giftCards: normalizePrizeCollection(source.giftCards || source.gift_cards || []),
    topPrices: normalizePrizeCollection(source.topPrices || source.top_prices || []),
    teslaPrices: normalizePrizeCollection(source.teslaPrices || source.tesla_prices || source.teslaWin || []),
    errors: Array.isArray(source.errors) ? source.errors : []
  };
}

function getStoredSnapshot() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_SNAPSHOT_KEY);
    if (!raw) {
      return null;
    }

    return normalizeBootstrapPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

function setStoredSnapshot(snapshot) {
  if (!canUseStorage()) {
    return null;
  }

  const normalized = normalizeBootstrapPayload(snapshot);
  window.localStorage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify(normalized));
  return normalized;
}

function updateStoredSnapshot(updater) {
  const currentSnapshot = getStoredSnapshot() || normalizeBootstrapPayload({});
  const nextSnapshot = updater(currentSnapshot);
  return setStoredSnapshot(nextSnapshot);
}

function getDataSourceMode() {
  if (!canUseStorage()) {
    return "remote";
  }

  return window.localStorage.getItem(LOCAL_MODE_KEY) === "local" ? "local" : "remote";
}

function setDataSourceMode(mode) {
  if (!canUseStorage()) {
    return "remote";
  }

  const nextMode = mode === "local" ? "local" : "remote";
  window.localStorage.setItem(LOCAL_MODE_KEY, nextMode);
  return nextMode;
}

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${CONFIG.apiUrlQA}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function putJson(path, data) {
  return requestJson(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

async function getOptions() {
  if (getDataSourceMode() === "local") {
    return getStoredSnapshot()?.options || [];
  }

  const response = await requestJson("roulette.json");
  return response === null ? null : normalizeOptions(response);
}

async function getTotals() {
  if (getDataSourceMode() === "local") {
    return getStoredSnapshot()?.totals || normalizeTotals({});
  }

  const response = await requestJson("total-prices.json");
  return response === null ? null : normalizeTotals(response);
}

async function getGiftCards() {
  if (getDataSourceMode() === "local") {
    return getStoredSnapshot()?.giftCards || [];
  }

  const response = await requestJson("gift-cards.json");
  return response === null ? null : normalizePrizeCollection(response);
}

async function getTopPrices() {
  if (getDataSourceMode() === "local") {
    return getStoredSnapshot()?.topPrices || [];
  }

  const response = await requestJson("top-prices.json");
  return response === null ? null : normalizePrizeCollection(response);
}

async function getTeslaWin() {
  if (getDataSourceMode() === "local") {
    return getStoredSnapshot()?.teslaPrices || [];
  }

  const response = await requestJson("tesla-win.json");
  return response === null ? null : normalizePrizeCollection(response);
}

async function getBootstrapData() {
  if (getDataSourceMode() === "local") {
    const localSnapshot = getStoredSnapshot();

    if (localSnapshot) {
      return {
        ...localSnapshot,
        errors: []
      };
    }
  }

  const [options, totals, giftCards, topPrices, teslaPrices] = await Promise.all([
    getOptions(),
    getTotals(),
    getGiftCards(),
    getTopPrices(),
    getTeslaWin()
  ]);

  const errors = [];

  if (options === null) {
    errors.push("options");
  }

  if (totals === null) {
    errors.push("totals");
  }

  if (giftCards === null) {
    errors.push("giftCards");
  }

  if (topPrices === null) {
    errors.push("topPrices");
  }

  if (teslaPrices === null) {
    errors.push("teslaPrices");
  }

  return {
    options: options || [],
    totals: totals || null,
    giftCards: giftCards || [],
    topPrices: topPrices || [],
    teslaPrices: teslaPrices || [],
    errors
  };
}

async function saveTotals(data) {
  if (getDataSourceMode() === "local") {
    updateStoredSnapshot((snapshot) => ({
      ...snapshot,
      totals: normalizeTotals(data)
    }));
    return true;
  }

  return Boolean(await putJson("total-prices.json", data));
}

async function setGiftCards(data) {
  if (getDataSourceMode() === "local") {
    updateStoredSnapshot((snapshot) => ({
      ...snapshot,
      giftCards: normalizePrizeCollection(data)
    }));
    return true;
  }

  return Boolean(await putJson("gift-cards.json", data));
}

async function setTopPrices(data) {
  if (getDataSourceMode() === "local") {
    updateStoredSnapshot((snapshot) => ({
      ...snapshot,
      topPrices: normalizePrizeCollection(data)
    }));
    return true;
  }

  return Boolean(await putJson("top-prices.json", data));
}

async function setTeslaWinService(data) {
  if (getDataSourceMode() === "local") {
    updateStoredSnapshot((snapshot) => ({
      ...snapshot,
      teslaPrices: normalizePrizeCollection(data)
    }));
    return true;
  }

  return Boolean(await putJson("tesla-win.json", data));
}

export default {
  getBootstrapData,
  getOptions,
  getTotals,
  getGiftCards,
  getTopPrices,
  getTeslaWin,
  saveTotals,
  setGiftCards,
  setTopPrices,
  setTeslaWinService,
  getDataSourceMode,
  setDataSourceMode,
  importLocalSnapshot(payload) {
    return setStoredSnapshot(payload);
  },
  exportLocalSnapshot() {
    return getStoredSnapshot();
  },
  hasLocalSnapshot() {
    return Boolean(getStoredSnapshot());
  }
};
