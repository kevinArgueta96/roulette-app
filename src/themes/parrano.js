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

export const meta = {
  id: "parrano",
  label: "Parrano",
  shellClass: "app-shell--parrano",
  assetsBase: "/parrano-assets",
  logo: "/parrano-assets/new-logo.webp",
  background: null,
  decorations: ["/parrano-assets/main-l.webp", "/parrano-assets/main-r.webp"],
  features: {
    heroLayout: false,
    storytelCenter: false,
    showHeroResultLabel: true,
    showMainPrizeBurstFlower: true
  },
  confettiColors: [
    [216, 187, 113],
    [245, 215, 138],
    [246, 237, 209],
    [255, 80, 20],
    [255, 255, 255],
    [46, 94, 57],
    [203, 48, 39],
    [154, 115, 37]
  ],
  wheel: {
    fontFamily: null,
    textAlign: "center",
    defaultScale: 0.038,
    defaultMinSize: 33,
    teslaScale: 0.044,
    teslaMinSize: 44,
    sectorStrokeStyle: null,
    outerRing: { outerColor: "var(--color-gold)", innerColor: "var(--color-gold-dark)" },
    multilineLabels: null
  },
  totalsPathSuffix: ""
};
