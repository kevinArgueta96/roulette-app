# roulette-app

## Project Overview

This project is a digital roulette application built to run as an interactive prize wheel.

It currently includes:

- a canvas-based roulette
- prize result flow and animations
- responsive visual layout
- client-side state management with Vuex
- remote configuration/data integration through JSON endpoints

## Current Technical Stack

- Vue 2.7
- Vuex
- Canvas rendering
- Electron support
- Node 22 / npm 10

## Main Purpose

The app is designed for branded event activations where users spin a roulette and receive a prize result based on configured logic.

## Development Commands

### Project setup

```bash
npm install
```

The project is currently pinned to Node 22 through the `engines` field in `package.json`.

### Run in development

```bash
npm run serve
```

### Build for production

```bash
npm run build
```

## Netlify Deployment

This repository is already configured for Netlify.

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

Files included for deployment:

- [netlify.toml](/Users/kevs/Documents/DEV_PROJECTS/4.%20FRONT-END/roulette-app/netlify.toml)
- [.node-version](/Users/kevs/Documents/DEV_PROJECTS/4.%20FRONT-END/roulette-app/.node-version)

The Electron postinstall step is skipped automatically on Netlify and other CI environments.

### Lint

```bash
npm run lint
```

### Run with Electron

```bash
npm run electron:serve
```
