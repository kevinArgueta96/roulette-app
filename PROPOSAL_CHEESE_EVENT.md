# Digital Roulette Proposal For Cheese Company

## Context

This project can be adapted for a cheese company running a 3-day food fair event.

The client is evaluating a physical roulette versus a digital roulette and needs a practical, low-risk option with limited budget.

## Recommendation

Do not rebuild the project in Astro for this event.

Reason:

- This app is not mainly a static website.
- The core value is an interactive roulette with canvas rendering, prize logic, and client-side state.
- Rewriting in Astro would increase time, cost, and risk without giving enough benefit for a short event.

The recommended path is to adapt the current project.

## Proposed Scope

1. Rebrand the roulette for the cheese company
2. Update colors, text, logos, and reward assets
3. Adjust layout when final screen size is confirmed
4. Simplify the logic into 3 categories:
   - Main win
   - Small win
   - No win

## Prize Logic Recommendation

For a 3-day event, the best logic is daily quota based prizes instead of time-slot based prizes.

### Daily configuration

- `mainWinPerDay`
- `smallWinPerDay`
- `noWin` for the remaining spins

### Expected behavior

1. Count how many main wins were already delivered today
2. Count how many small wins were already delivered today
3. Stop assigning a category when its daily quota is exhausted
4. Send the rest of the spins to `noWin`

This is simpler to operate during an event and easier to explain to the client.

## Dashboard Impact

The requirement "should be possible to change from the dashboard" affects budget.

### Minimal dashboard option

A simple config/admin screen to edit:

- main wins per day
- small wins per day
- basic labels

This is feasible if kept minimal.

### Features that increase cost

- authentication
- roles/permissions
- analytics
- exports
- logs
- advanced scheduling

## Estimate

### Option A

Rebrand + simplified prize logic

Estimated range:

- `200 USD to 300 USD`

Conclusion:

- `250 USD` is realistic

### Option B

Rebrand + simplified logic + minimal dashboard

Estimated range:

- `450 USD to 800 USD`

Conclusion:

- `250 USD` is not realistic if dashboard is included

### Option C

Full rebuild in Astro

Estimated range:

- `900 USD+`

Conclusion:

- not recommended for this event

## Recommended Delivery Strategy

### Phase 1

- rebrand visuals
- simplify prize categories
- prepare the app for the final screen format

### Phase 2

Only if needed:

- add a lightweight dashboard/config panel

## Client-facing Summary

> Based on the current roulette app, the best option for a short 3-day event is to adapt the existing project instead of rebuilding it in another framework.
>
> We can rebrand the current roulette for the cheese company, simplify the prize logic into 3 categories (main win, small win, no win), and adjust it to the final screen size once confirmed.
>
> If the scope is limited to rebranding and adapting the prize logic, a budget around 250 USD is realistic.
>
> If a dashboard is required to manage prize quantities per day, the budget would need to be higher depending on how simple or advanced that dashboard needs to be.
