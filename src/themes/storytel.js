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

export const meta = {
  id: "storytel",
  label: "Storytel",
  shellClass: "app-shell--storytel",
  assetsBase: "/storytel-assets",
  logo: "/storytel-assets/logo.png",
  background: "/storytel-assets/background.svg",
  decorations: [],
  features: {
    heroLayout: true,
    storytelCenter: true,
    showHeroResultLabel: false,
    showMainPrizeBurstFlower: false
  },
  confettiColors: [
    [255, 80, 28],
    [43, 53, 58],
    [255, 196, 0],
    [50, 110, 220],
    [220, 40, 100],
    [0, 166, 118]
  ],
  wheel: {
    fontFamily: '"Storytel Euclid", system-ui',
    textAlign: "left",
    defaultScale: 0.029,
    defaultMinSize: 25,
    teslaScale: 0.036,
    teslaMinSize: 19,
    sectorStrokeStyle: "#ffffff",
    outerRing: { outerColor: "#000000", innerColor: "#ffffff" },
    multilineLabels: {
      mainPrize: ["Pääpalkinto"],
      surpriseWin: ["Yllätys", "voitto"],
      giftCard3m: ["3kk", "lahjakortti"],
      giftCard1m: ["1kk", "lahjakortti"]
    }
  },
  totalsPathSuffix: "-storytel"
};
