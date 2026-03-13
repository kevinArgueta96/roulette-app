export const sectorsRoulette = [
  "LAHJAKORTTI",
  "TESLA",
  { 0: "YLLÄTYS", 1: "PALKINTO" },
  "LAHJAKORTTI",
  { 0: "TUOTE", 1: "PALKINTO" },
  { 0: "YLLÄTYS", 1: "PALKINTO" },
  "UUDESTAAN",
  "PÄÄPALKINTO"
];

export const colorsSectorRoulette = [
  "#FFF2F1",
  "#000000",
  "#FF501C",
  "#FFF2F1",
  "#C9ECFF",
  "#FF501C",
  "#2B353A",
  "#FFEDA3"
];

export const textDefaultRouletteStyle = {
  fontWeight: "700",
  fontFamily: "Helvetica, Arial"
};

export const textTeslaRouletteStyle = {
  fontWeight: "100",
  fontFamily: "TeslaRegular"
};

export const initialOptionsConfigRoulette = [
  { option: "LAHJAKORTTI", probability: 0 },
  { option: "TESLA", probability: 0 },
  { option: "YLLÄTYSPALKINTO", probability: 0.15 },
  { option: "LAHJAKORTTI", probability: 0 },
  { option: "TUOTEPALKINTO", probability: 0.6 },
  { option: "YLLÄTYSPALKINTO", probability: 0.15 },
  { option: "UUDESTAAN", probability: 0.1 },
  { option: "PÄÄPALKINTO", probability: 0 }
];

export const initialOptionsConfigRoullete = initialOptionsConfigRoulette;
