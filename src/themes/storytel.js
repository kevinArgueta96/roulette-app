export const OUTCOME_KEYS = [
  "mainPrize",
  "surpriseWin",
  "repeat",
  "giftCard3m",
  "giftCard1m"
];

export const DEFAULT_TOTAL_SECTORS = 8;

export const OUTCOME_LOGIC = {
  mainPrize: {
    resultType: "mainPrize",
    defaultSectorCount: 1,
    defaultBaseWeight: 0,
    hasDailyLimit: true,
    hasSlots: true,
    defaultDailyLimit: 2,
    selectionMode: "amountPerTime"
  },
  surpriseWin: {
    resultType: "surpriseWin",
    defaultSectorCount: 3,
    defaultBaseWeight: 0.5,
    hasDailyLimit: false,
    hasSlots: false,
    selectionMode: "percentage"
  },
  giftCard3m: {
    resultType: "giftCard3m",
    defaultSectorCount: 1,
    defaultBaseWeight: 0,
    hasDailyLimit: true,
    hasSlots: true,
    defaultDailyLimit: 4,
    selectionMode: "amountPerTime"
  },
  giftCard1m: {
    resultType: "giftCard1m",
    defaultSectorCount: 0,
    defaultBaseWeight: 0,
    hasDailyLimit: false,
    hasSlots: false,
    selectionMode: "disabled"
  },
  repeat: {
    resultType: "repeat",
    defaultSectorCount: 3,
    defaultBaseWeight: 0.5,
    hasDailyLimit: false,
    hasSlots: false,
    selectionMode: "percentage"
  }
};

export const SECTOR_PRESET = [
  "surpriseWin",
  "repeat",
  "giftCard3m",
  "surpriseWin",
  "repeat",
  "surpriseWin",
  "repeat",
  "mainPrize"
];

export const OUTCOME_THEME = {
  mainPrize: { color: "#ffeda3", textColor: "#2b353a", label: "Pääpalkinto" },
  surpriseWin: { color: "#ff501c", textColor: "#fdf1f0", label: "Yllätyspalkinto" },
  repeat: { color: "#fdf1f0", textColor: "#2b353a", label: "Kokeile uudestaan" },
  giftCard3m: { color: "#c9ecff", textColor: "#2b353a", label: "3kk lahjakortti" },
  giftCard1m: { color: "#2b353a", textColor: "#fdf1f0", label: "1kk lahjakortti" }
};
