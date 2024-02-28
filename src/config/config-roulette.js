export const sectorsRoulette = [
    "LAHJAKORTTI",
    "TESLA", //15-20%
    { 0: "YLLÄTYS", 1: "PALKINTO" }, // based on probability (surpise win)
    "LAHJAKORTTI",
    { 0: "TUOTE", 1: "PALKINTO" }, // based on probability (surpise win) //10 % special prize
    { 0: "YLLÄTYS", 1: "PALKINTO" }, // based on probability (surpise win)
    "UUDESTAAN", //15-20%
    "PÄÄPALKINTO" // 0% dependiendo la hrora
]

export const colorsSectorRoulette = [
    "#FFF2F1", //Blanco
    "#000000", // NEGRO
    "#FF501C", // anaranjado
    "#FFF2F1", //bLANCO
    "#C9ECFF", //CELESTE
    "#FF501C",// anaranjado
    "#2B353A", // celeste
    "#FFEDA3" // amarillo 
]

export const textDefaultRouletteStyle = {
    fontWeight: '700',
    fontSizeUnit: 'rem',
    fontFamily: 'Helvetica, Arial',
};

export const textTeslaRouletteStyle = {
    fontWeight: '100',
    fontSizeUnit: 'rem',
    fontFamily: 'TeslaRegular',
};

export const initialOptionsConfigRoullete = [
    { "option": "LAHJAKORTT", "probability": 0.425 },
    { "option": "TESLA", "probability": 0 },
    { "option": "YLLÄTYSPALKINTO", "probability": 0.05 },
    { "option": "LAHJAKORTTI", "probability": 0 },
    { "option": "TUOTEPALKINTO", "probability": 0.425 },
    { "option": "YLLÄTYSPALKINTO", "probability": 0.05 },
    { "option": "UUDESTAAN", "probability": 0.025 },
    { "option": "PÄÄPALKINTO", "probability": 0 }
]