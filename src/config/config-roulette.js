export const sectorsRoulette = [
    { 0: "TUOTE", 1: "PALKINTO" }, // 1 vez x dia
    "UUDESTAAN", //15-20%
    { 0: "YLLÄTYS", 1: "PALKINTO" }, // based on probability (surpise win)
    "LAHJAKORTTI",
    { 0: "TUOTE", 1: "PALKINTO" }, // based on probability (surpise win) //10 % special prize
    { 0: "YLLÄTYS", 1: "PALKINTO" }, // based on probability (surpise win)
    "UUDESTAAN", //15-20%
    "PÄÄPALKINTO" // 0% dependiendo la hrora
]

export const colorsSectorRoulette = [
    "#FFF2F1",
    "#C9ECFF",
    "#FF501C",
    "#2B353A",
    "#FFF2F1",
    "#FF501C",
    "#C9ECFF",
    "#FFEDA3"
]

export const textRouletteStyle = {
    fontWeight: '700',
    fontSizeUnit: 'rem',
    fontFamily: 'Helvetica, Arial'
};

export const initialOptionsConfigRoullete = [
    { "option": "LAHJAKORTT", "probability": 0.425 },
    { "option": "UUDESTAAN", "probability": 0.025 },
    { "option": "YLLÄTYSPALKINTO", "probability": 0.05 },
    { "option": "LAHJAKORTTI", "probability": 0 },
    { "option": "TUOTEPALKINTO", "probability": 0.425 },
    { "option": "YLLÄTYSPALKINTO", "probability": 0.05 },
    { "option": "UUDESTAAN", "probability": 0.025 },
    { "option": "PÄÄPALKINTO", "probability": 0 }
]