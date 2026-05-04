import { REGISTRY, DEFAULT_THEME_ID } from "@/themes";
import { resolveThemeId, applyThemeAttr } from "@/themes/resolveTheme";

export default {
  state: () => ({ id: resolveThemeId() }),
  getters: {
    theme: (state) => REGISTRY[state.id] || REGISTRY[DEFAULT_THEME_ID],
    themeId: (state) => state.id,
    themeMeta: (_state, getters) => getters.theme?.meta || null,
    isStorytel: (state) => state.id === "storytel"
  },
  mutations: {
    setTheme(state, id) {
      if (!REGISTRY[id]) return;
      state.id = id;
      applyThemeAttr(id);
      try { localStorage.setItem("theme", id); } catch (e) { /* ignore */ }
    }
  }
};
