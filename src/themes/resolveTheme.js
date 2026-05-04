function safeAvailable() {
  return (process.env.VUE_APP_AVAILABLE_THEMES || "storytel,parrano")
    .split(",").map((s) => s.trim()).filter(Boolean);
}

function safeDefault(available) {
  const explicit = process.env.VUE_APP_DEFAULT_THEME;
  if (explicit && available.includes(explicit)) return explicit;
  return available[0] || "parrano";
}

export function resolveThemeId() {
  const available = safeAvailable();
  const fallback = safeDefault(available);

  if (typeof window === "undefined") return fallback;

  let url = null;
  try {
    url = new URLSearchParams(window.location.search).get("theme");
  } catch (e) {
    url = null;
  }

  let ls = null;
  try {
    ls = window.localStorage?.getItem("theme") || null;
  } catch (e) {
    ls = null;
  }

  for (const candidate of [url, ls]) {
    if (candidate && available.includes(candidate)) {
      if (url) {
        try { window.localStorage?.setItem("theme", url); } catch (e) { /* ignore */ }
      }
      return candidate;
    }
  }
  return fallback;
}

export function applyThemeAttr(id) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = id;
  }
}
