# Roulette App

Canvas-based prize wheel for branded event activations. Operators configure win limits per hourly slot via a dashboard; the wheel resolves outcomes against Firebase RTDB in real time.

## Stack

- Vue 2.7 + Vuex 3 + vue-router 3
- HTML5 Canvas (custom, no external wheel lib)
- Firebase Realtime Database (QA: `qa-roulette-app-default-rtdb.firebaseio.com`)
- Electron (optional desktop shell)
- Node 22 / npm 10

## Quick start

```bash
npm install
npm run serve          # browser dev server
npm run electron:serve # Electron shell
npm run build          # production build → dist/
```

## Architecture

```
src/
  utils/roulette.utils.js   ← OUTCOME_META (colors + logic), probability math
  services/totals.service.js ← Firebase GET/PUT + localStorage fallback
  store/index.js             ← Vuex: winDistribution, hydrateBootstrapData
  components/
    RouletteCompoment.vue    ← canvas wheel + animations (1049 lines, mixed)
    DashboardWinConfig.vue   ← slot editor (1424 lines, mixed)
    ConfettiComponent.vue
    WinRowComponent.vue      ← orphan, old GIF reveal (unused)
  views/
    RouletteView.vue         ← player screen + prize reveal
    DashboardView.vue        ← operator dashboard
```

## Data source modes

The app has two modes toggled from the dashboard toolbar:

| Mode | Storage | Use |
|---|---|---|
| **Online** | Firebase RTDB (QA URL) | Live events — all devices share data |
| **Local** | `localStorage["roulette-local-snapshot"]` | Offline testing / prep |

> All Firebase writes use `apiUrlQA` (`totals.service.js:131`). Prod URL exists in `env.config.js` but is not wired in yet.

## Daily operator workflow

**Before the event:**
1. Open dashboard → switch to **Online**
2. Set `dailyLimit` and hourly slots for `mainWin` and `smallWin`
3. Click **Save online**

**End of day (after last session):**
1. Dashboard → **Online** mode
2. Click **Reset counters** → confirm in modal
3. Done — all counters zeroed, slots preserved, ready for tomorrow

> Never click **Restore defaults** during an event. It wipes ALL slots and limits (now requires a confirmation modal).

## Firebase data shape

`win-distribution.json`:
```json
{
  "lastResetDate": "YYYY-MM-DD",
  "mainWin":  { "dailyLimit": 2,  "givenToday": 0, "slots": [{ "startTime": "13:00", "endTime": "13:15", "limit": 1, "given": 0, "weight": 0.25 }] },
  "smallWin": { "dailyLimit": 450, "givenToday": 0, "slots": [...] },
  "repeat":   { "sectorCount": 3, "baseWeight": 0.3 },
  "noWin":    { "sectorCount": 8, "baseWeight": 0.7 },
  "totalSectors": 16
}
```

Counters reset when `lastResetDate !== today` — triggered on the first spin of the day. Manual reset via dashboard button also clears `lastResetDate`.

## Known bugs (fixed)

| Bug | Fix |
|---|---|
| Day-2 counters not resetting until first spin | By design — `shouldResetDaily` only fires on spin. Manual reset button (Online mode) added as workaround. |
| "Reset counters" disabled in Online mode | Fixed — `confirmResetCounters` now handles both Local and Online. |
| "Restore defaults" wiped slots silently | Fixed — confirmation modal added. |

## Pending work — Storytel theme

A second client (Storytel) wants to reuse this codebase with their visual identity on a **landscape screen** (laptop → HDMI). Reference design is in `roulette-app-old-version/`.

**What Storytel needs vs current (Parrano):**

| | Parrano (current) | Storytel |
|---|---|---|
| Colors | Green `#265135` / Red `#cf3b2d` / Gold `#d9bf74` | Orange `#FF501C` / Pink `#FFF2F1` / Blue `#C9ECFF` |
| Font | Lumios Marker + Agenda One | Jost (Google) |
| Layout | Tablet portrait | Landscape (laptop+HDMI) |
| Prize reveal | Hero wheel scale + handwritten copy | Side-column GIFs |
| Sections | mainWin, smallWin, repeat, noWin | Pääpalkinto, 3kk Lahjakortti, Yllätyspalkinto, Kokeile uudestaan |

**Recommended implementation (theme layer):**

1. `src/styles/themes.css` — CSS custom properties per `[data-theme]` attribute
2. `src/themes/parrano.js` / `src/themes/storytel.js` — outcome label + color maps (decouple from `OUTCOME_META` in `roulette.utils.js`)
3. `src/main.js` — set `document.documentElement.dataset.theme = process.env.VUE_APP_THEME`
4. `.env.parrano` / `.env.storytel` — `VUE_APP_THEME=parrano|storytel`
5. `public/storytel-assets/` — copy from `roulette-app-old-version/public/img/` and `public/gift/`
6. `App.vue` + `RouletteView.vue` — landscape layout + GIF reveal under `[data-theme="storytel"]`
7. Section labels: fold "Lahjakortti 1kk" into "Yllätyspalkinto" (no logic change needed)

**Obstacles:**
- `OUTCOME_META` in `roulette.utils.js:6-47` co-locates sector colors with probability logic — must split before theming the canvas
- ~40 hex literals across 11 files — replace with `var(--color-*)` first
- No current design token system

**Budget:** $180 USD quoted. Slim scope (tokens + relabel + assets + CSS landscape) fits; full GIF reveal + logic decoupling is ~$300.

## Deployment

Netlify auto-deploys from main:
- Build: `npm run build`
- Publish: `dist/`
- Node: 22

## Lint

```bash
npm run lint
```
