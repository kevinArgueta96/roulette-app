import { CONFIG } from "../../env.config";
import {
  normalizeOptions,
  normalizeTotals,
  normalizeWinDistribution
} from "@/utils";

const REQUEST_TIMEOUT_MS = 8000;
const LOCAL_MODE_KEY = "roulette-data-mode";
const LOCAL_SNAPSHOT_KEY = "roulette-local-snapshot";
const LOCAL_SNAPSHOT_VERSION = 4;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isDirectWinDistribution(payload) {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    (
      payload.mainWin ||
      payload.smallWin ||
      payload.repeat ||
      payload.noWin ||
      Object.prototype.hasOwnProperty.call(payload, "lastResetDate") ||
      Object.prototype.hasOwnProperty.call(payload, "totalSectors")
    )
  );
}

function normalizeBootstrapPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const bootstrapSource = isDirectWinDistribution(source)
    ? { winDistribution: source }
    : source;

  return {
    schemaVersion: LOCAL_SNAPSHOT_VERSION,
    rulesModel: "dynamic-roulette-v1",
    options: normalizeOptions(bootstrapSource.options || bootstrapSource.roulette || []),
    totals: normalizeTotals(bootstrapSource.totals || bootstrapSource.totalPrices || bootstrapSource.total_prices || {}),
    winDistribution: normalizeWinDistribution(
      bootstrapSource.winDistribution ||
      bootstrapSource["win-distribution"] ||
      (isDirectWinDistribution(bootstrapSource) ? bootstrapSource : null)
    ),
    errors: Array.isArray(bootstrapSource.errors) ? bootstrapSource.errors : []
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
  window.localStorage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify({
    ...normalized,
    exportedAt: new Date().toISOString()
  }));
  return normalized;
}

function updateStoredSnapshot(updater) {
  const currentSnapshot = getStoredSnapshot() || normalizeBootstrapPayload({});
  const nextSnapshot = updater(currentSnapshot);
  return setStoredSnapshot(nextSnapshot);
}

function resetWinDistributionCounters(distribution) {
  const normalized = normalizeWinDistribution(distribution);

  return {
    ...normalized,
    lastResetDate: "",
    mainWin: {
      ...normalized.mainWin,
      givenToday: 0,
      slots: normalized.mainWin.slots.map((slot) => ({ ...slot, given: 0 }))
    },
    smallWin: {
      ...normalized.smallWin,
      givenToday: 0,
      slots: normalized.smallWin.slots.map((slot) => ({ ...slot, given: 0 }))
    }
  };
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
  resetLocalSnapshotCounters() {
    return updateStoredSnapshot((snapshot) => ({
      ...snapshot,
      totals: normalizeTotals({}),
      winDistribution: resetWinDistributionCounters(snapshot?.winDistribution)
    }));
  },
  exportLocalSnapshot() {
    const snapshot = getStoredSnapshot();
    if (!snapshot) {
      return null;
    }

    return {
      ...snapshot,
      schemaVersion: LOCAL_SNAPSHOT_VERSION,
      rulesModel: "dynamic-roulette-v1",
      exportedAt: new Date().toISOString()
    };
  },
  hasLocalSnapshot() {
    return Boolean(getStoredSnapshot());
  }
};
