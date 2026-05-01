export const OUTCOME_KEYS = ["mainWin", "smallWin", "repeat", "noWin"];

export const DEFAULT_TOTAL_SECTORS = 16;

export const OUTCOME_LOGIC = {
  mainWin: {
    resultType: "mainPrize",
    defaultSectorCount: 1,
    defaultBaseWeight: 0,
    hasDailyLimit: true,
    hasSlots: true,
    defaultDailyLimit: 5
  },
  smallWin: {
    resultType: "surpriseWin",
    defaultSectorCount: 4,
    defaultBaseWeight: 0,
    hasDailyLimit: true,
    hasSlots: true,
    defaultDailyLimit: 20
  },
  repeat: {
    resultType: "repeat",
    defaultSectorCount: 3,
    defaultBaseWeight: 0.3,
    hasDailyLimit: false,
    hasSlots: false
  },
  noWin: {
    resultType: "noWin",
    defaultSectorCount: 8,
    defaultBaseWeight: 0.7,
    hasDailyLimit: false,
    hasSlots: false
  }
};

export const SECTOR_PRESET = [
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

export const OUTCOME_THEME = {
  mainWin: { color: "#1B1A17", textColor: "#d9bf74", label: "LAHJAKASSI" },
  smallWin: { color: "#F8F0D8", textColor: "#2d5b38", label: "YLLÄTYSPALKINTO" },
  repeat: { color: "#F8F0D8", textColor: "#2d5b38", label: "KOKEILE UUDESTAAN" },
  noWin: { color: "#2E5E39", textColor: "#f6edd1", label: "" }
};
