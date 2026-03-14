# Cheese Company Food Fair — Roulette Adaptation Plan

## Overview

Rebrand and simplify the existing Storytel roulette app for a 3-day cheese company food fair event.
The goal is minimal changes — no rewrite — reducing 8 sectors/6 prize types down to 3 categories.

**Budget:** $250 USD (without dashboard) / $400–550 (with dashboard)
**Estimated effort:** 8–11h without dashboard, 12–17h with dashboard

---

## Categories

| Sector | Category | Probability | Mechanism |
|--------|----------|-------------|-----------|
| 0, 3 | **Main Win** | 0 (scheduler only) | Forced by time window via Firebase |
| 1, 4 | **Small Win** | ~0.30 each | Normal weighted probability |
| 2, 5 | **No Win** | ~0.20 each | Normal weighted probability |

---

## Phase 1 — Core Logic (3–4h)

### 1. `src/config/config-roulette.js`
- Reduce from 8 → 6 sectors: `MAIN WIN`, `SMALL WIN`, `NO WIN` (×2 each)
- Replace Finnish labels with the client's preferred language
- Update `colorsSectorRoulette` to cheese brand palette (6 entries)
- Remove `textTeslaRouletteStyle` export
- Update `initialOptionsConfigRoulette` to 6 entries with new probabilities

### 2. `src/utils/roulette.utils.js`
- `RESULT_BY_INDEX`: 6 entries → `mainWin`, `smallWin`, `noWin`
- `FALLBACK_INDEX`: 6 → 2 (noWin sector)
- `buildForcedOptions`: remove `card`, `topPrice`, `teslaWin` — keep `mainWin` and `smallWin`
- `buildNextTotals`: replace 6 counters with `totalMainWin`, `totalSmallWin`, `totalNoWin`, `totalSpin`
- `normalizeTotals`: 4 clean fields, remove typo fallbacks (`totalGitfCard`, `totalSpecialSurprice`)

### 3. `src/store/index.js`
- State: remove `teslaPrices`, `giftCards`, `topPrices` — add `mainWinPrizes: []`
- Totals: replace 6 fields → `totalMainWin`, `totalSmallWin`, `totalNoWin`, `totalSpin`
- Remove mutations: `setTotalSpecialPrice`, `setTotalSpecialSurprise`, `setTotalTopPrice`,
  `setTotalGiftCard`, `setGiftCards`, `setTopPrices`, `setTeslaPrices`
- Add mutations: `setTotalMainWin`, `setTotalSmallWin`, `setTotalNoWin`, `setMainWinPrizes`
- Simplify `hydrateBootstrapData` to hydrate: `options`, `totals`, `mainWinPrizes`

### 4. `src/services/totals.service.js`
- Remove: `getTeslaWin`, `setTeslaWinService`, `getGiftCards`, `setGiftCards`, `getTopPrices`, `setTopPrices`
- Add: `getMainWinPrizes()` → `main-win-prizes.json`, `setMainWinPrizes(data)`
- Simplify `getBootstrapData()` → `Promise.all([getOptions, getTotals, getMainWinPrizes])`

---

## Phase 2 — Components (2–3h)

### 5. `src/components/RouletteCompoment.vue`
- Remove Tesla `@font-face` from `<style>`
- Remove `textTeslaRouletteStyle` import and `isTesla` conditional in `drawRouletteWheel()`
- Remove `teslaFontSize` computed property
- Simplify `generateProbabilityPriceByScheduler()` → only `mainWinPrizes`
- Simplify `updateWinnerChoice()` → only `mainWin` case
- Update `persistSpinResult()` mutation map to new totals
- Update template: new logo and pointer asset paths

### 6. `src/App.vue`
- `RESULT_CONFIG`: 3 entries (`mainWin`, `smallWin`, `noWin`) with new GIF paths and durations
- Update branding text: heading, eyebrow, footer
- Update CSS color tokens to cheese brand palette

### 7. `src/background.js`
- Change `backgroundColor` to cheese brand background color

---

## Phase 3 — Assets & Firebase (1–2h)

### 8. Firebase Setup
- Create new Firebase Realtime DB project for the cheese event
- Update `env.config.js` and `.env` with new project URL
- Import seed JSON (see below)

### 9. Required Client Assets

| Asset | Path | Spec |
|-------|------|------|
| Logo (wheel center) | `/public/img/logo.png` | PNG 300×300, transparent |
| Logo (footer) | `/public/img/logo-img.png` | PNG wide, transparent |
| Arrow pointer | `/public/img/arrow-pointer.png` | PNG transparent |
| Main win GIF | `/public/gift/main_win.gif` | GIF ~500px |
| Small win GIF | `/public/gift/small_win.gif` | GIF ~500px |
| No win GIF | `/public/gift/no_win.gif` | GIF or static PNG ~500px |
| Favicon | `/src/assets/favicon.ico` | ICO 32×32 + 64×64 |

### 10. Files to Remove
- `/src/assets/fonts/tesla-webfont.woff`
- `/src/assets/fonts/tesla-webfont.woff2`
- `/public/gift/gift_card.gif`
- `/public/gift/gifts_storytel_boxes.gif`
- `/public/gift/gifts_storytel_individual.gif`
- `/public/gift/tesla_win.gif`
- `/public/gift/replay.gif`

---

## Phase 4 — Optional Dashboard (+4–6h, +$150–300)

Simple admin panel at `/#/admin?key=<shared-secret>` (no auth framework needed).

**Features:**
- View daily counters (totalMainWin / totalSmallWin / totalNoWin / totalSpin)
- Reset daily counters button → PUT zeros to `total-prices.json`
- Manage main win time slots (add/remove, toggle `given` status)
- Probability sliders for small win vs no win distribution

> **Recommendation:** Without dashboard = $250. With basic dashboard = $400–450.

---

## Firebase Seed

```json
{
  "roulette": {
    "sectors": [
      { "option": "MAIN WIN",  "probability": 0    },
      { "option": "SMALL WIN", "probability": 0.30 },
      { "option": "NO WIN",    "probability": 0.20 },
      { "option": "MAIN WIN",  "probability": 0    },
      { "option": "SMALL WIN", "probability": 0.30 },
      { "option": "NO WIN",    "probability": 0.20 }
    ]
  },
  "total-prices": {
    "totalMainWin":  0,
    "totalSmallWin": 0,
    "totalNoWin":    0,
    "totalSpin":     0
  },
  "main-win-prizes": [
    { "position": 0, "type": "mainWin", "given": false, "rangeDown": "10:00", "rangeTop": "12:00", "day": 1 },
    { "position": 1, "type": "mainWin", "given": false, "rangeDown": "13:00", "rangeTop": "15:00", "day": 1 },
    { "position": 2, "type": "mainWin", "given": false, "rangeDown": "10:00", "rangeTop": "12:00", "day": 2 },
    { "position": 3, "type": "mainWin", "given": false, "rangeDown": "13:00", "rangeTop": "15:00", "day": 2 },
    { "position": 4, "type": "mainWin", "given": false, "rangeDown": "10:00", "rangeTop": "12:00", "day": 3 },
    { "position": 5, "type": "mainWin", "given": false, "rangeDown": "13:00", "rangeTop": "15:00", "day": 3 }
  ]
}
```

> Time windows and amounts per day are confirmed with the client and configured before each event day.
> Reset `total-prices` to zeros and `given` to `false` at the start of each day.

---

## Phase 5 — Testing Checklist (2h)

### Functional
- [ ] 6 sectors render with correct labels and colors
- [ ] `spinTo(0)` through `spinTo(5)` lands on correct sectors (debug API)
- [ ] `FALLBACK_INDEX` lands on a no-win sector
- [ ] No-win: correct GIF, no confetti, auto-dismisses ~2.5s
- [ ] Small win: correct GIF, confetti fires, auto-dismisses ~5s
- [ ] Main win: correct GIF, confetti fires, auto-dismisses ~7s
- [ ] Totals increment correctly per spin type in Firebase
- [ ] Scheduled main win fires when inside `rangeDown`–`rangeTop` window
- [ ] Scheduled main win does NOT fire on wrong day (day field check)
- [ ] After main win fires, `given: true` is persisted — no double fire
- [ ] Stress test passes: `window.__rouletteDebug.runCanvasStressTest(100)`

### Regression
- [ ] Canvas resizes on window resize (ResizeObserver)
- [ ] Enter and Space keys trigger spin
- [ ] Spin button disables during animation
- [ ] App loads with defaults when Firebase is unreachable
- [ ] `normalizeOptions` handles object vs array from Firebase
- [ ] Time validation rejects `24:00`, `\"23:00"` and other malformed strings

### Event Day
- [ ] Reset `total-prices` to zeros each morning
- [ ] Reset `given: false` on that day's main-win entries
- [ ] Verify time windows are correct for the day
- [ ] Test on actual event laptop and display
- [ ] Confirm Electron launches fullscreen

---

## Pending Info from Client

- [ ] Sector label language (English / Spanish / other)
- [ ] Brand colors (hex values)
- [ ] Brand font (or confirm using default system font)
- [ ] Number of small wins per day
- [ ] Number of main wins per day and time windows
- [ ] Screen size / display resolution
- [ ] Event start date (needed for day 1/2/3 detection logic)
- [ ] All visual assets (logos, GIFs)
- [ ] Dashboard required? (affects budget tier)
