import { calculateIndex } from "./calculate_roulette";
import { isTimeWithinRange } from "./time.utils";

export const OUTCOME_KEYS = ["mainWin", "smallWin", "repeat", "noWin"];

export const OUTCOME_META = {
  mainWin: {
    label: "LAHJAKASSI",
    color: "#1B1A17",
    textColor: "#d9bf74",
    resultType: "mainPrize",
    defaultSectorCount: 1,
    defaultBaseWeight: 0.03,
    hasDailyLimit: true,
    hasSlots: true
  },
  smallWin: {
    label: "YLLÄTYSPALKINTO",
    color: "#F8F0D8",
    textColor: "#2d5b38",
    resultType: "surpriseWin",
    defaultSectorCount: 4,
    defaultBaseWeight: 0.12,
    hasDailyLimit: true,
    hasSlots: true
  },
  repeat: {
    label: "KOKEILE UUDESTAAN",
    color: "#F8F0D8",
    textColor: "#2d5b38",
    resultType: "repeat",
    defaultSectorCount: 3,
    defaultBaseWeight: 0.1,
    hasDailyLimit: false,
    hasSlots: false
  },
  noWin: {
    label: "",
    color: "#2E5E39",
    textColor: "#f6edd1",
    resultType: "noWin",
    defaultSectorCount: 8,
    defaultBaseWeight: 0.07,
    hasDailyLimit: false,
    hasSlots: false
  }
};

export const DEFAULT_TOTAL_SECTORS = 16;
export const RANDOM_START_ANGLES = [5.1, 1.16, 4.3, 3.5, 5.9, 0.35, 2.75];

export const createDefaultSlot = () => ({
  startTime: "09:00",
  endTime: "18:00",
  limit: 1,
  given: 0,
  weight: 0.1
});

export const DEFAULT_WIN_DISTRIBUTION = () => ({
  totalSectors: DEFAULT_TOTAL_SECTORS,
  mainWin: {
    sectorCount: OUTCOME_META.mainWin.defaultSectorCount,
    baseWeight: OUTCOME_META.mainWin.defaultBaseWeight,
    dailyLimit: 5,
    givenToday: 0,
    slots: []
  },
  smallWin: {
    sectorCount: OUTCOME_META.smallWin.defaultSectorCount,
    baseWeight: OUTCOME_META.smallWin.defaultBaseWeight,
    dailyLimit: 20,
    givenToday: 0,
    slots: []
  },
  repeat: {
    sectorCount: OUTCOME_META.repeat.defaultSectorCount,
    baseWeight: OUTCOME_META.repeat.defaultBaseWeight
  },
  noWin: {
    sectorCount: OUTCOME_META.noWin.defaultSectorCount,
    baseWeight: OUTCOME_META.noWin.defaultBaseWeight
  },
  lastResetDate: ""
});

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
    totalSpin: Number(source.totalSpin) || 0
  };
};

const normalizeSlot = (slot, fallbackWeight) => {
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
  const meta = OUTCOME_META[key];

  const normalized = {
    sectorCount: Math.max(0, Number(source.sectorCount) || base.sectorCount),
    baseWeight: Math.max(0, Number(source.baseWeight) || base.baseWeight)
  };

  if (meta.hasDailyLimit) {
    normalized.dailyLimit = Math.max(0, Number(source.dailyLimit) || base.dailyLimit);
    normalized.givenToday = Math.max(0, Number(source.givenToday) || 0);
  }

  if (meta.hasSlots) {
    normalized.slots = Array.isArray(source.slots)
      ? source.slots.map((slot) => normalizeSlot(slot, normalized.baseWeight))
      : [];
  }

  return normalized;
};

const migrateLegacyDistribution = (payload) => {
  const defaults = DEFAULT_WIN_DISTRIBUTION();
  const source = payload && typeof payload === "object" ? payload : {};
  const sectorCounts = OUTCOME_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

  Object.values(LEGACY_INDEX_TO_KEY).forEach((key) => {
    sectorCounts[key] += 1;
  });

  return {
    ...defaults,
    totalSectors: DEFAULT_TOTAL_SECTORS,
    mainWin: {
      ...defaults.mainWin,
      sectorCount: sectorCounts.mainWin,
      dailyLimit: Math.max(0, Number(source.mainWin?.dailyLimit) || defaults.mainWin.dailyLimit),
      givenToday: Math.max(0, Number(source.mainWin?.givenToday) || 0),
      slots: Array.isArray(source.mainWin?.slots)
        ? source.mainWin.slots.map((slot) => normalizeSlot(slot, defaults.mainWin.baseWeight))
        : []
    },
    smallWin: {
      ...defaults.smallWin,
      sectorCount: sectorCounts.smallWin,
      dailyLimit: Math.max(0, Number(source.smallWin?.dailyLimit) || defaults.smallWin.dailyLimit),
      givenToday: Math.max(0, Number(source.smallWin?.givenToday) || 0),
      slots: Array.isArray(source.smallWin?.slots)
        ? source.smallWin.slots.map((slot) => normalizeSlot(slot, defaults.smallWin.baseWeight))
        : []
    },
    repeat: {
      ...defaults.repeat,
      sectorCount: sectorCounts.repeat
    },
    noWin: {
      ...defaults.noWin,
      sectorCount: sectorCounts.noWin
    },
    lastResetDate: String(source.lastResetDate || "")
  };
};

export const normalizeWinDistribution = (payload) => {
  const defaults = DEFAULT_WIN_DISTRIBUTION();

  if (!payload || typeof payload !== "object") {
    return defaults;
  }

  const hasDynamicShape = Object.prototype.hasOwnProperty.call(payload, "totalSectors") ||
    Object.prototype.hasOwnProperty.call(payload, "repeat") ||
    Object.prototype.hasOwnProperty.call(payload, "noWin");

  const source = hasDynamicShape ? payload : migrateLegacyDistribution(payload);

  const normalized = {
    totalSectors: Math.max(1, Number(source.totalSectors) || defaults.totalSectors),
    mainWin: normalizeOutcomeCategory("mainWin", source.mainWin, defaults),
    smallWin: normalizeOutcomeCategory("smallWin", source.smallWin, defaults),
    repeat: normalizeOutcomeCategory("repeat", source.repeat, defaults),
    noWin: normalizeOutcomeCategory("noWin", source.noWin, defaults),
    lastResetDate: String(source.lastResetDate || "")
  };

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

const distributeOutcomeKeys = (distribution) => {
  const counts = OUTCOME_KEYS.reduce((acc, key) => {
    acc[key] = Math.max(0, Number(distribution?.[key]?.sectorCount) || 0);
    return acc;
  }, {});

  const imagePreset = [
    "noWin",
    "repeat",
    "noWin",
    "smallWin",
    "noWin",
    "repeat",
    "noWin",
    "smallWin",
    "noWin",
    "mainWin",
    "noWin",
    "smallWin",
    "noWin",
    "repeat",
    "noWin",
    "smallWin"
  ];

  const matchesImagePreset = distribution?.totalSectors === 16 &&
    counts.mainWin === 1 &&
    counts.smallWin === 4 &&
    counts.repeat === 3 &&
    counts.noWin === 8;

  if (matchesImagePreset) {
    return imagePreset;
  }

  const ordered = [];

  while (Object.values(counts).some((count) => count > 0)) {
    OUTCOME_KEYS
      .slice()
      .sort((left, right) => counts[right] - counts[left] || OUTCOME_KEYS.indexOf(left) - OUTCOME_KEYS.indexOf(right))
      .forEach((key) => {
        if (counts[key] > 0) {
          ordered.push(key);
          counts[key] -= 1;
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
    label: OUTCOME_META[outcomeKey].label,
    color: OUTCOME_META[outcomeKey].color,
    textColor: OUTCOME_META[outcomeKey].textColor,
    resultType: OUTCOME_META[outcomeKey].resultType
  }));
};

export const getFallbackIndexForDistribution = (distribution) => {
  const sectors = buildSectorsFromDistribution(distribution);
  const preferred = sectors.find((sector) => sector.outcomeKey === "noWin")
    || sectors.find((sector) => sector.outcomeKey === "repeat")
    || sectors[0];
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
    totalSpin: (Number(currentTotals.totalSpin) || 0) + 1
  };

  switch (outcomeKey) {
    case "smallWin":
      totals.totalSpecialSurprise += 1;
      break;
    case "repeat":
      totals.totalReplay += 1;
      break;
    case "mainWin":
      totals.totalTopPrice += 1;
      break;
    case "noWin":
      totals.totalSpecialPrice += 1;
      break;
    default:
      break;
  }

  return totals;
};

const buildOutcomeWeights = (distribution, currentTime) => {
  const normalized = normalizeWinDistribution(distribution);
  const weights = {
    mainWin: 0,
    smallWin: 0,
    repeat: Math.max(0, normalized.repeat.baseWeight),
    noWin: Math.max(0, normalized.noWin.baseWeight)
  };

  ["mainWin", "smallWin"].forEach((key) => {
    const category = normalized[key];
    const activeSlotIndex = findActiveSlotIndex(category.slots, currentTime);
    const activeSlot = activeSlotIndex >= 0 ? category.slots[activeSlotIndex] : null;
    const available = category.givenToday < category.dailyLimit && activeSlot && activeSlot.given < activeSlot.limit;
    weights[key] = available ? Math.max(0, Number(activeSlot.weight) || category.baseWeight) : 0;
  });

  return weights;
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
  if (!sector) return OUTCOME_META.noWin.resultType;
  return OUTCOME_META[sector.outcomeKey]?.resultType || OUTCOME_META.noWin.resultType;
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
