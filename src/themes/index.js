import * as parranoModule from "./parrano";
import * as storytelModule from "./storytel";
import { resolveThemeId } from "./resolveTheme";

const MODULES = { parrano: parranoModule, storytel: storytelModule };

// Runtime registry — consumed by Vuex theme module and components
export const REGISTRY = {
  parrano: parranoModule,
  storytel: storytelModule
};

export const AVAILABLE = (process.env.VUE_APP_AVAILABLE_THEMES || "storytel,parrano")
  .split(",").map((s) => s.trim()).filter((id) => Boolean(MODULES[id]));

export const DEFAULT_THEME_ID = (() => {
  const explicit = process.env.VUE_APP_DEFAULT_THEME;
  if (explicit && AVAILABLE.includes(explicit)) return explicit;
  return AVAILABLE[0] || "parrano";
})();

// Active theme resolved at boot — cached for this session.
// Runtime theme switch requires page reload.
export const THEME_NAME = resolveThemeId();

const ACTIVE = MODULES[THEME_NAME] || MODULES[DEFAULT_THEME_ID];

// Legacy compat exports (unchanged shape — all existing consumers work without modification)
export const OUTCOME_KEYS = ACTIVE.OUTCOME_KEYS;
export const OUTCOME_LOGIC = ACTIVE.OUTCOME_LOGIC;
export const OUTCOME_THEME = ACTIVE.OUTCOME_THEME;
export const SECTOR_PRESET = ACTIVE.SECTOR_PRESET;
export const DEFAULT_TOTAL_SECTORS = ACTIVE.DEFAULT_TOTAL_SECTORS;
