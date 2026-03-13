import { CONFIG } from "../../env.config";
import {
  normalizeOptions,
  normalizePrizeCollection,
  normalizeTotals
} from "@/utils";

const REQUEST_TIMEOUT_MS = 8000;

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
  const response = await requestJson("roulette.json");
  return response === null ? null : normalizeOptions(response);
}

async function getTotals() {
  const response = await requestJson("total-prices.json");
  return response === null ? null : normalizeTotals(response);
}

async function getGiftCards() {
  const response = await requestJson("gift-cards.json");
  return response === null ? null : normalizePrizeCollection(response);
}

async function getTopPrices() {
  const response = await requestJson("top-prices.json");
  return response === null ? null : normalizePrizeCollection(response);
}

async function getTeslaWin() {
  const response = await requestJson("tesla-win.json");
  return response === null ? null : normalizePrizeCollection(response);
}

async function getBootstrapData() {
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
  return Boolean(await putJson("total-prices.json", data));
}

async function setGiftCards(data) {
  return Boolean(await putJson("gift-cards.json", data));
}

async function setTopPrices(data) {
  return Boolean(await putJson("top-prices.json", data));
}

async function setTeslaWinService(data) {
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
  setTeslaWinService
};
