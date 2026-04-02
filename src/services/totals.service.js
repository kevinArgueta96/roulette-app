import { CONFIG } from "../../env.config";
import {
  normalizeOptions,
  normalizeTotals,
  normalizeWinDistribution
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
    winDistribution: normalizeWinDistribution(source.winDistribution || source["win-distribution"] || null),
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

async function getWinDistribution() {
  if (getDataSourceMode() === "local") {
    return getStoredSnapshot()?.winDistribution || null;
  }

  const response = await requestJson("win-distribution.json");
  return response === null ? null : normalizeWinDistribution(response);
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

  const [options, totals, winDistribution] = await Promise.all([
    getOptions(),
    getTotals(),
    getWinDistribution()
  ]);

  const errors = [];

  if (options === null) errors.push("options");
  if (totals === null) errors.push("totals");
  if (winDistribution === null) errors.push("winDistribution");

  return {
    options: options || [],
    totals: totals || null,
    winDistribution: winDistribution || null,
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

async function saveWinDistribution(data) {
  if (getDataSourceMode() === "local") {
    updateStoredSnapshot((snapshot) => ({
      ...snapshot,
      winDistribution: normalizeWinDistribution(data)
    }));
    return true;
  }

  return Boolean(await putJson("win-distribution.json", data));
}

export default {
  getBootstrapData,
  getOptions,
  getTotals,
  getWinDistribution,
  saveTotals,
  saveWinDistribution,
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
