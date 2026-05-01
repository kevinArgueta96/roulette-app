import { calculateIndex } from "./calculate_roulette";
import { isTimeWithinRange } from "./time.utils";
import {
  OUTCOME_KEYS,
  OUTCOME_LOGIC,
  OUTCOME_THEME,
  SECTOR_PRESET,
  DEFAULT_TOTAL_SECTORS,
  THEME_NAME
} from "@/themes";

export {
  OUTCOME_KEYS,
  OUTCOME_LOGIC,
  OUTCOME_THEME,
  SECTOR_PRESET,
  DEFAULT_TOTAL_SECTORS
};

export const OUTCOME_META = OUTCOME_KEYS.reduce((acc, key) => {
  acc[key] = {
    ...OUTCOME_LOGIC[key],
    ...OUTCOME_THEME[key]
  };
  return acc;
}, {});

export const RANDOM_START_ANGLES = THEME_NAME === "storytel"
  ? [Math.PI * 1.5 - (Math.PI * 2 / DEFAULT_TOTAL_SECTORS) / 2]
  : [5.1, 1.16, 4.3, 3.5, 5.9, 0.35, 2.75];

const slotAwareKeys = () => OUTCOME_KEYS.filter((key) => OUTCOME_LOGIC[key].hasSlots);

export const createDefaultSlot = () => ({
  startTime: "09:00",
  endTime: "18:00",
  limit: 1,
  given: 0,
  weight: 0.1
});

export const DEFAULT_WIN_DISTRIBUTION = () => {
  const distribution = {
    totalSectors: DEFAULT_TOTAL_SECTORS,
    lastResetDate: ""
  };

  OUTCOME_KEYS.forEach((key) => {
    const meta = OUTCOME_LOGIC[key];
    const entry = {
      sectorCount: meta.defaultSectorCount,
      baseWeight: meta.defaultBaseWeight
    };

    if (meta.hasDailyLimit) {
      entry.dailyLimit = meta.defaultDailyLimit ?? 0;
      entry.givenToday = 0;
    }

    if (meta.hasSlots) {
      entry.slots = [];
    }

    distribution[key] = entry;
  });

  return distribution;
};

const LEGACY_INDEX_TO_KEY = {
  0: "mainWin",
  1: "noWin",
  2: "smallWin",
  3: "noWin",
  4: "repeat",
  5: "noWin",
  6: "smallWin",
  7: "noWin",
  8: "repeat",
  9: "noWin",
  10: "smallWin",
  11: "noWin"
};

export const FALLBACK_INDEX = 0;

export const normalizePrizeCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...item }));
  }

  if (payload && typeof payload === "object") {
    return Object.values(payload).map((item) => ({ ...item }));
  }

  return [];
};

export const normalizeOptions = (payload) => {
  const sectors = Array.isArray(payload?.sectors)
    ? payload.sectors
    : Array.isArray(payload)
      ? payload
      : [];

  return sectors.map((item) => ({
    option: item?.option || "",
    probability: Number(item?.probability) || 0
  }));
};

export const normalizeTotals = (payload) => {
  const source = payload && typeof payload === "object" ? payload : {};

  return {
    totalReplay: Number(source.totalReplay) || 0,
    totalSpecialPrice: Number(source.totalSpecialPrice) || 0,
    totalSpecialSurprise: Number(source.totalSpecialSurprise || source.totalSpecialSurprice) || 0,
    totalTopPrice: Number(source.totalTopPrice) || 0,
    totalGiftCard: Number(source.totalGiftCard || source.totalGitfCard) || 0,
    totalGiftCard3m: Number(source.totalGiftCard3m) || 0,
    totalGiftCard1m: Number(source.totalGiftCard1m) || 0,
    totalSpin: Number(source.totalSpin) || 0
  };
};

const normalizeSlot = (slot, fallbackWeight = 0) => {
  const source = slot && typeof slot === "object" ? slot : {};

  return {
    startTime: String(source.startTime || source.start || "09:00"),
    endTime: String(source.endTime || source.end || "18:00"),
    limit: Math.max(0, Number(source.limit) || 0),
    given: Math.max(0, Number(source.given) || 0),
    weight: Math.max(0, Number(source.weight) || fallbackWeight || 0)
  };
};

const normalizeOutcomeCategory = (key, payload, defaults) => {
  const source = payload && typeof payload === "object" ? payload : {};
  const base = defaults[key];
  const meta = OUTCOME_LOGIC[key];

  const normalized = {
    sectorCount: Math.max(0, Number(source.sectorCount) || base.sectorCount),
    baseWeight: Math.max(0, Number(source.baseWeight) || base.baseWeight)
  };

  if (meta.hasDailyLimit) {
    normalized.dailyLimit = Math.max(0, Number(source.dailyLimit) || base.dailyLimit || 0);
    normalized.givenToday = Math.max(0, Number(source.givenToday) || 0);
  }

  if (meta.hasSlots) {
    normalized.slots = Array.isArray(source.slots)
      ? source.slots.map((slot) => normalizeSlot(slot, normalized.baseWeight))
      : [];
  }

  return normalized;
};

const isLegacyParranoPayload = (payload) => {
  if (THEME_NAME !== "parrano") return false;
  if (!payload || typeof payload !== "object") return false;
  const hasNewShape = Object.prototype.hasOwnProperty.call(payload, "totalSectors") ||
    Object.prototype.hasOwnProperty.call(payload, "repeat") ||
    Object.prototype.hasOwnProperty.call(payload, "noWin");
  return !hasNewShape;
};

const migrateLegacyDistribution = (payload) => {
  const defaults = DEFAULT_WIN_DISTRIBUTION();
  const source = payload && typeof payload === "object" ? payload : {};
  const sectorCounts = OUTCOME_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

  Object.values(LEGACY_INDEX_TO_KEY).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(sectorCounts, key)) {
      sectorCounts[key] += 1;
    }
  });

  const migrated = {
    ...defaults,
    totalSectors: DEFAULT_TOTAL_SECTORS,
    lastResetDate: String(source.lastResetDate || "")
  };

  OUTCOME_KEYS.forEach((key) => {
    const meta = OUTCOME_LOGIC[key];
    const base = defaults[key];
    const sourceCategory = source[key] && typeof source[key] === "object" ? source[key] : {};

    const entry = {
      sectorCount: sectorCounts[key] || base.sectorCount,
      baseWeight: base.baseWeight
    };

    if (meta.hasDailyLimit) {
      entry.dailyLimit = Math.max(0, Number(sourceCategory.dailyLimit) || base.dailyLimit || 0);
      entry.givenToday = Math.max(0, Number(sourceCategory.givenToday) || 0);
    }

    if (meta.hasSlots) {
      entry.slots = Array.isArray(sourceCategory.slots)
        ? sourceCategory.slots.map((slot) => normalizeSlot(slot, base.baseWeight))
        : [];
    }

    migrated[key] = entry;
  });

  return migrated;
};

export const normalizeWinDistribution = (payload) => {
  const defaults = DEFAULT_WIN_DISTRIBUTION();

  if (!payload || typeof payload !== "object") {
    return defaults;
  }

  const hasDynamicShape = Object.prototype.hasOwnProperty.call(payload, "totalSectors") ||
    OUTCOME_KEYS.some((key) => Object.prototype.hasOwnProperty.call(payload, key));

  const source = (hasDynamicShape || !isLegacyParranoPayload(payload))
    ? payload
    : migrateLegacyDistribution(payload);

  const normalized = {
    totalSectors: Math.max(1, Number(source.totalSectors) || defaults.totalSectors),
    lastResetDate: String(source.lastResetDate || "")
  };

  OUTCOME_KEYS.forEach((key) => {
    normalized[key] = normalizeOutcomeCategory(key, source[key], defaults);
  });

  if (THEME_NAME === "storytel") {
    const storytelAssigned = OUTCOME_KEYS.reduce((sum, key) => sum + normalized[key].sectorCount, 0);
    if (storytelAssigned !== DEFAULT_TOTAL_SECTORS) {
      OUTCOME_KEYS.forEach((key) => {
        normalized[key] = { ...normalized[key], sectorCount: defaults[key].sectorCount };
      });
      normalized.totalSectors = DEFAULT_TOTAL_SECTORS;
    }
  }

  const assigned = OUTCOME_KEYS.reduce((sum, key) => sum + normalized[key].sectorCount, 0);
  if (assigned !== normalized.totalSectors) {
    normalized.totalSectors = assigned || defaults.totalSectors;
  }

  return normalized;
};

const todayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const shouldResetDaily = (lastResetDate) => lastResetDate !== todayDateString();

export const findActiveSlotIndex = (slots, currentTime) => {
  if (!Array.isArray(slots) || !currentTime) return -1;

  return slots.findIndex((slot) => {
    if (!slot.startTime || !slot.endTime) return false;
    return isTimeWithinRange(currentTime, slot.startTime, slot.endTime);
  });
};

const presetMatchesCounts = (counts) => {
  if (!Array.isArray(SECTOR_PRESET) || !SECTOR_PRESET.length) return false;
  const presetCounts = SECTOR_PRESET.reduce((acc, key) => {
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return OUTCOME_KEYS.every((key) => (presetCounts[key] || 0) === (counts[key] || 0));
};

const distributeOutcomeKeys = (distribution) => {
  const counts = OUTCOME_KEYS.reduce((acc, key) => {
    acc[key] = Math.max(0, Number(distribution?.[key]?.sectorCount) || 0);
    return acc;
  }, {});

  if (presetMatchesCounts(counts) && distribution?.totalSectors === SECTOR_PRESET.length) {
    return SECTOR_PRESET.slice();
  }

  const ordered = [];
  const working = { ...counts };

  while (Object.values(working).some((count) => count > 0)) {
    OUTCOME_KEYS
      .slice()
      .sort((left, right) => working[right] - working[left] || OUTCOME_KEYS.indexOf(left) - OUTCOME_KEYS.indexOf(right))
      .forEach((key) => {
        if (working[key] > 0) {
          ordered.push(key);
          working[key] -= 1;
        }
      });
  }

  return ordered;
};

export const buildSectorsFromDistribution = (distribution) => {
  const normalized = normalizeWinDistribution(distribution);
  const sequence = distributeOutcomeKeys(normalized);

  return sequence.map((outcomeKey, index) => ({
    index,
    outcomeKey,
    label: OUTCOME_THEME[outcomeKey].label,
    color: OUTCOME_THEME[outcomeKey].color,
    textColor: OUTCOME_THEME[outcomeKey].textColor,
    resultType: OUTCOME_LOGIC[outcomeKey].resultType
  }));
};

export const getFallbackIndexForDistribution = (distribution) => {
  const sectors = buildSectorsFromDistribution(distribution);
  const noLimitKeys = OUTCOME_KEYS.filter((key) => !OUTCOME_LOGIC[key].hasDailyLimit);
  let preferred;
  for (const key of noLimitKeys) {
    preferred = sectors.find((sector) => sector.outcomeKey === key);
    if (preferred) break;
  }
  preferred = preferred || sectors[0];
  return preferred ? preferred.index : 0;
};

export const pickWeightedIndex = (probabilities, fallbackIndex = FALLBACK_INDEX) => {
  if (!Array.isArray(probabilities) || !probabilities.length) {
    return fallbackIndex;
  }

  const weights = probabilities.map((item) => Math.max(0, Number(item?.probability) || 0));
  const totalWeight = weights.reduce((accumulator, value) => accumulator + value, 0);

  if (totalWeight <= 0) {
    return fallbackIndex;
  }

  const threshold = Math.random() * totalWeight;
  let cumulative = 0;

  for (let index = 0; index < weights.length; index += 1) {
    cumulative += weights[index];
    if (threshold <= cumulative) {
      return index;
    }
  }

  return weights.length - 1;
};

export const buildNextTotals = (currentTotals, outcomeKey) => {
  const totals = {
    totalReplay: Number(currentTotals.totalReplay) || 0,
    totalSpecialPrice: Number(currentTotals.totalSpecialPrice) || 0,
    totalSpecialSurprise: Number(currentTotals.totalSpecialSurprise) || 0,
    totalTopPrice: Number(currentTotals.totalTopPrice) || 0,
    totalGiftCard: Number(currentTotals.totalGiftCard) || 0,
    totalGiftCard3m: Number(currentTotals.totalGiftCard3m) || 0,
    totalGiftCard1m: Number(currentTotals.totalGiftCard1m) || 0,
    totalSpin: (Number(currentTotals.totalSpin) || 0) + 1
  };

  switch (outcomeKey) {
    case "smallWin":
    case "surpriseWin":
      totals.totalSpecialSurprise += 1;
      break;
    case "repeat":
      totals.totalReplay += 1;
      break;
    case "mainWin":
    case "mainPrize":
      totals.totalTopPrice += 1;
      break;
    case "noWin":
      totals.totalSpecialPrice += 1;
      break;
    case "giftCard3m":
      totals.totalGiftCard3m += 1;
      totals.totalGiftCard += 1;
      break;
    case "giftCard1m":
      totals.totalGiftCard1m += 1;
      totals.totalGiftCard += 1;
      break;
    default:
      break;
  }

  return totals;
};

export const buildOutcomeWeights = (distribution, currentTime) => {
  const normalized = normalizeWinDistribution(distribution);
  const activeOutcomeKeys = OUTCOME_KEYS.filter((key) => Math.max(0, Number(normalized[key]?.sectorCount) || 0) > 0);
  const slotKeys = slotAwareKeys().filter((key) => activeOutcomeKeys.includes(key));

  const slotWeights = OUTCOME_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  slotKeys.forEach((key) => {
    const category = normalized[key];
    if (!category) return;
    const activeSlotIndex = findActiveSlotIndex(category.slots, currentTime);
    const activeSlot = activeSlotIndex >= 0 ? category.slots[activeSlotIndex] : null;
    const dailyOk = !OUTCOME_LOGIC[key].hasDailyLimit || (category.givenToday < category.dailyLimit);
    const available = dailyOk && activeSlot && activeSlot.given < activeSlot.limit;
    slotWeights[key] = available ? Math.max(0, Number(activeSlot.weight) || 0) : 0;
  });

  const reservedRaw = slotKeys.reduce((sum, key) => sum + slotWeights[key], 0);
  const reserved = Math.min(1, reservedRaw);
  const remaining = Math.max(0, 1 - reserved);

  const fallbackKeys = OUTCOME_KEYS.filter((key) => activeOutcomeKeys.includes(key) && !OUTCOME_LOGIC[key].hasSlots);
  const fallbackTotal = fallbackKeys.reduce(
    (sum, key) => sum + Math.max(0, Number(normalized[key]?.baseWeight) || 0),
    0
  );

  const result = OUTCOME_KEYS.reduce((acc, key) => {
    if (slotKeys.includes(key)) {
      acc[key] = slotWeights[key];
    } else if (fallbackKeys.includes(key) && fallbackTotal > 0) {
      const share = Math.max(0, Number(normalized[key]?.baseWeight) || 0) / fallbackTotal;
      acc[key] = remaining * share;
    } else {
      acc[key] = 0;
    }
    return acc;
  }, {});

  return result;
};

export const buildDynamicProbabilities = (distribution, currentTime) => {
  const normalized = normalizeWinDistribution(distribution);
  const sectors = buildSectorsFromDistribution(normalized);
  const outcomeWeights = buildOutcomeWeights(normalized, currentTime);
  const totalWeight = Object.values(outcomeWeights).reduce((sum, value) => sum + value, 0);

  if (!sectors.length || totalWeight <= 0) {
    return sectors.map((sector) => ({ option: String(sector.index), probability: 0 }));
  }

  const sectorCounts = OUTCOME_KEYS.reduce((acc, key) => {
    acc[key] = Math.max(1, sectors.filter((sector) => sector.outcomeKey === key).length);
    return acc;
  }, {});

  return sectors.map((sector) => {
    const outcomeWeight = outcomeWeights[sector.outcomeKey] || 0;
    const normalizedOutcomeWeight = outcomeWeight / totalWeight;
    return {
      option: String(sector.index),
      probability: normalizedOutcomeWeight / sectorCounts[sector.outcomeKey]
    };
  });
};

export const getSectorResultType = (sector) => {
  if (!sector) {
    const fallbackKey = OUTCOME_KEYS.find((key) => !OUTCOME_LOGIC[key].hasDailyLimit) || OUTCOME_KEYS[0];
    return OUTCOME_LOGIC[fallbackKey].resultType;
  }
  return OUTCOME_LOGIC[sector.outcomeKey]?.resultType || OUTCOME_KEYS[0];
};

export const getTargetDegreesForIndex = (winnerIndex, arc) => {
  const matches = [];

  for (let degree = 0; degree < 360; degree += 0.5) {
    const index = calculateIndex({
      startAngle: (degree * Math.PI) / 180,
      arc
    });

    if (index === winnerIndex) {
      matches.push(degree);
    }
  }

  if (!matches.length) {
    return 0;
  }

  return matches[Math.floor(matches.length / 2)];
};
