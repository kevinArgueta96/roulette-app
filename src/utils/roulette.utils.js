import { calculateIndex } from "./calculate_roulette";

export const FALLBACK_INDEX = 0;

export const RESULT_BY_INDEX = {
  0: "noWin",
  1: "surpriseWin",
  2: "noWin",
  3: "repeat",
  4: "noWin",
  5: "surpriseWin",
  6: "noWin",
  7: "mainPrize"
};

export const RANDOM_START_ANGLES = [5.1, 1.16, 4.3, 3.5, 5.9, 0.35, 2.75];

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
    totalSpecialSurprise: Number(source.totalSpecialSurprise) || 0,
    totalTopPrice: Number(source.totalTopPrice) || 0,
    totalGiftCard: Number(source.totalGiftCard) || 0,
    totalSpin: Number(source.totalSpin) || 0
  };
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

export const buildForcedOptions = (typeWinner) => {
  switch (typeWinner) {
    case "topPrice":
      return [
        { option: "EI VOITTOA", probability: 0 },
        { option: "YLLÄTYSPALKINTO", probability: 0 },
        { option: "EI VOITTOA", probability: 0 },
        { option: "KOKEILE UUDESTAAN", probability: 0 },
        { option: "EI VOITTOA", probability: 0 },
        { option: "YLLÄTYSPALKINTO", probability: 0 },
        { option: "EI VOITTOA", probability: 0 },
        { option: "LAHJAKASSI", probability: 1 }
      ];

    case "card": {
      const firstWins = Math.round(Math.random());
      const secondWins = firstWins === 1 ? 0 : 1;

      return [
        { option: "EI VOITTOA", probability: 0 },
        { option: "YLLÄTYSPALKINTO", probability: firstWins },
        { option: "EI VOITTOA", probability: 0 },
        { option: "KOKEILE UUDESTAAN", probability: 0 },
        { option: "EI VOITTOA", probability: 0 },
        { option: "YLLÄTYSPALKINTO", probability: secondWins },
        { option: "EI VOITTOA", probability: 0 },
        { option: "LAHJAKASSI", probability: 0 }
      ];
    }

    default:
      return null;
  }
};

export const buildNextTotals = (currentTotals, winnerIndex) => {
  const totals = {
    totalReplay: Number(currentTotals.totalReplay) || 0,
    totalSpecialPrice: Number(currentTotals.totalSpecialPrice) || 0,
    totalSpecialSurprise: Number(currentTotals.totalSpecialSurprise) || 0,
    totalTopPrice: Number(currentTotals.totalTopPrice) || 0,
    totalGiftCard: Number(currentTotals.totalGiftCard) || 0,
    totalSpin: (Number(currentTotals.totalSpin) || 0) + 1
  };

  switch (winnerIndex) {
    case 1:
    case 5:
      totals.totalSpecialSurprise += 1;
      break;

    case 3:
      totals.totalReplay += 1;
      break;

    case 7:
      totals.totalTopPrice += 1;
      break;

    case 0:
    case 2:
    case 4:
    case 6:
      totals.totalSpecialPrice += 1;
      break;

    default:
      break;
  }

  return totals;
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
