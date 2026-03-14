import { CONFIG } from "../../env.config";
import {
  normalizeOptions,
  normalizePrizeCollection,
  normalizeTotals
} from "@/utils";

const REQUEST_TIMEOUT_MS = 8000;
const MODE_KEY = "roulette_mode";
const LOCAL_DB_KEY = "roulette_local_db";

const LOCAL_DB_SEED = {
  "roulette": {
    "sectors": [
      { "option": "LAHJAKORTTI", "probability": 0 },
      { "option": "TESLA", "probability": 0 },
      { "option": "YLLÄTYSPALKINTO", "probability": 0.15 },
      { "option": "LAHJAKORTTI", "probability": 0 },
      { "option": "TUOTEPALKINTO", "probability": 0.6 },
      { "option": "YLLÄTYSPALKINTO", "probability": 0.15 },
      { "option": "UUDESTAAN", "probability": 0.1 },
      { "option": "PÄÄPALKINTO", "probability": 0 }
    ]
  },
  "total-prices": {
    "totalReplay": 0,
    "totalSpecialPrice": 0,
    "totalSpecialSurprise": 0,
    "totalTopPrice": 0,
    "totalGiftCard": 0,
    "totalSpin": 0
  },
  "gift-cards": [
    { "position": 0, "type": "card", "given": false, "rangeDown": "10:00", "rangeTop": "23:00" },
    { "position": 1, "type": "card", "given": false, "rangeDown": "12:00", "rangeTop": "14:00" },
    { "position": 2, "type": "card", "given": false, "rangeDown": "14:00", "rangeTop": "16:00" }
  ],
  "top-prices": [
    { "position": 0, "type": "topPrice", "given": false, "rangeDown": "10:00", "rangeTop": "23:59" }
  ],
  "tesla-win": [
    { "position": 0, "type": "teslaWin", "given": false, "rangeDown": "13:00", "rangeTop": "19:00" }
  ]
};

// ── Local mode helpers ──────────────────────────────────────────────────────

function getMode() {
  try { return localStorage.getItem(MODE_KEY) || "remote"; } catch (e) { return "remote"; }
}

function setMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch (e) { return e; }
}

function isLocalMode() {
  return getMode() === "local";
}

function getLocalDb() {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    return raw ? JSON.parse(raw) : { ...LOCAL_DB_SEED };
  } catch {
    return { ...LOCAL_DB_SEED };
  }
}

function setLocalDb(db) {
  try { localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db)); } catch (e) { return e; }
}

function buildLocalBootstrap() {
  const db = getLocalDb();
  return {
    options:     normalizeOptions(db["roulette"]),
    totals:      normalizeTotals(db["total-prices"]),
    giftCards:   normalizePrizeCollection(db["gift-cards"]),
    topPrices:   normalizePrizeCollection(db["top-prices"]),
    teslaPrices: normalizePrizeCollection(db["tesla-win"]),
    errors:      []
  };
}

// ── Remote HTTP helpers ─────────────────────────────────────────────────────

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

// ── Bootstrap ───────────────────────────────────────────────────────────────

async function getBootstrapData() {
  if (isLocalMode()) {
    return buildLocalBootstrap();
  }

  const [options, totals, giftCards, topPrices, teslaPrices] = await Promise.all([
    getOptions(),
    getTotals(),
    getGiftCards(),
    getTopPrices(),
    getTeslaWin()
  ]);

  const errors = [];
  if (options === null)     errors.push("options");
  if (totals === null)      errors.push("totals");
  if (giftCards === null)   errors.push("giftCards");
  if (topPrices === null)   errors.push("topPrices");
  if (teslaPrices === null) errors.push("teslaPrices");

  // Auto-fallback: all requests failed → switch to local mode
  if (errors.length === 5) {
    setMode("local");
    return { ...buildLocalBootstrap(), autoFallback: true };
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

// ── Write operations (branch on mode) ──────────────────────────────────────

async function saveTotals(data) {
  if (isLocalMode()) {
    const db = getLocalDb();
    setLocalDb({ ...db, "total-prices": data });
    return true;
  }
  return Boolean(await putJson("total-prices.json", data));
}

async function setGiftCards(data) {
  if (isLocalMode()) {
    const db = getLocalDb();
    setLocalDb({ ...db, "gift-cards": data });
    return true;
  }
  return Boolean(await putJson("gift-cards.json", data));
}

async function setTopPrices(data) {
  if (isLocalMode()) {
    const db = getLocalDb();
    setLocalDb({ ...db, "top-prices": data });
    return true;
  }
  return Boolean(await putJson("top-prices.json", data));
}

async function setTeslaWinService(data) {
  if (isLocalMode()) {
    const db = getLocalDb();
    setLocalDb({ ...db, "tesla-win": data });
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
  getMode,
  setMode,
  getLocalDb,
  setLocalDb
};