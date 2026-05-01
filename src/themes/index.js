import * as parranoTheme from "./parrano";
import * as storytelTheme from "./storytel";

export const THEME_NAME = process.env.VUE_APP_THEME || "parrano";

const ACTIVE = THEME_NAME === "storytel" ? storytelTheme : parranoTheme;

export const OUTCOME_KEYS = ACTIVE.OUTCOME_KEYS;
export const OUTCOME_LOGIC = ACTIVE.OUTCOME_LOGIC;
export const OUTCOME_THEME = ACTIVE.OUTCOME_THEME;
export const SECTOR_PRESET = ACTIVE.SECTOR_PRESET;
export const DEFAULT_TOTAL_SECTORS = ACTIVE.DEFAULT_TOTAL_SECTORS;
