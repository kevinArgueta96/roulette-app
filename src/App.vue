<template>
  <div id="app" class="app-shell">
    <main class="tablet-stage">
      <section class="tablet-canvas">
        <header class="screen-header">
          <router-link
            to="/"
            class="brand-link"
            :class="{
              'brand-link--hero': isMainPrizeActive && $route.name !== 'dashboard',
              'brand-link--dashboard': $route.name === 'dashboard'
            }"
          >
            <img class="brand-logo" src="/parrano-assets/new-logo.webp" alt="Parrano" fetchpriority="high" decoding="async" />
          </router-link>

          <nav class="menu-shell">
            <button
              class="menu-button"
              type="button"
              aria-label="Menu"
              :aria-expanded="isMenuOpen ? 'true' : 'false'"
              @click="toggleMenu"
            >
              <svg class="menu-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle class="menu-icon__dot" cx="18" cy="12" r="2.2"/>
                <circle class="menu-icon__dot" cx="18" cy="18" r="2.2"/>
                <circle class="menu-icon__dot" cx="18" cy="24" r="2.2"/>
              </svg>
            </button>
            <transition name="fade-up">
              <div v-if="isMenuOpen" class="menu-dropdown" role="menu">
                <router-link
                  to="/"
                  class="menu-dropdown__item"
                  :class="{ 'menu-dropdown__item--active': $route.name === 'roulette' }"
                  role="menuitem"
                  @click.native="closeMenu"
                >
                  Roulette
                </router-link>
                <router-link
                  to="/dashboard"
                  class="menu-dropdown__item"
                  :class="{ 'menu-dropdown__item--active': $route.name === 'dashboard' }"
                  role="menuitem"
                  @click.native="closeMenu"
                >
                  Dashboard
                </router-link>
              </div>
            </transition>
          </nav>
        </header>

        <router-view class="router-outlet" />

        <div v-if="loadWarning" class="status-banner">
          {{ loadWarning }}
        </div>

        <div v-if="isLoading" class="loading-overlay">
          <span class="status-spinner"></span>
          <p>Cargando configuracion…</p>
        </div>

        <img
          v-if="$route.name !== 'dashboard'"
          class="bottom-wave"
          src="@/assets/brand/infe_sin_blanco.svg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      </section>
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import service from "@/services/totals.service";

export default {
  name: "App",
  data() {
    return {
      isLoading: true,
      loadWarning: "",
      isMenuOpen: false
    };
  },
  mounted() {
    this.syncViewportHeight();
    window.addEventListener("resize", this.syncViewportHeight, { passive: true });
    window.addEventListener("orientationchange", this.handleOrientationChange, { passive: true });
    this.loadInitialData();

    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.syncViewportHeight);
    window.removeEventListener("orientationchange", this.handleOrientationChange);
    document.removeEventListener("click", this.handleOutsideClick);
  },
  computed: {
    ...mapGetters(["isMainPrizeActive"])
  },
  methods: {
    ...mapActions(["initializeRandomAngle", "hydrateBootstrapData"]),
    syncViewportHeight() {
      if (typeof document === "undefined") return;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    },
    handleOrientationChange() {
      this.syncViewportHeight();
      window.setTimeout(() => this.syncViewportHeight(), 250);
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    handleOutsideClick(event) {
      if (this.isMenuOpen && !event.target.closest(".menu-shell")) {
        this.isMenuOpen = false;
      }
    },
    async loadInitialData() {
      this.isLoading = true;
      this.loadWarning = "";
      this.initializeRandomAngle();

      const bootstrapData = await service.getBootstrapData();
      this.hydrateBootstrapData(bootstrapData);

      if (bootstrapData.errors.length) {
        this.loadWarning = "Some remote data did not respond. Fallback values are being used.";
      }

      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.app-shell {
  min-height: var(--app-height, 100vh);
  background: #f5efdd;
}

.tablet-stage {
  width: 100vw;
  height: var(--app-height, 100vh);
}

.tablet-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5efdd;
  padding: 0 1.05rem 0;
}

.screen-header {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  min-height: 4.8rem;
  margin-top: 0.6rem;
  flex-shrink: 0;
  column-gap: 0.8rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  z-index: 9;
}

.brand-link:not(.brand-link--dashboard) {
  grid-column: 1 / -1;
  justify-self: center;
  position: fixed;
  left: 50%;
  top: 6.7rem;
  transform: translateX(-50%);
  transform-origin: center top;
  transition: transform 0.72s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-link--hero {
  transform: translateX(-50%) translateY(20px) scale(1.12);
}

.brand-logo {
  display: block;
  width: clamp(240px, 38vw, 400px);
  max-height: 5rem;
  height: auto;
  object-fit: contain;
}

.brand-link--dashboard {
  grid-column: 1;
  justify-self: start;
  position: relative;
}

.brand-link--dashboard .brand-logo {
  width: clamp(176px, 20vw, 244px);
  max-height: 3.4rem;
}

.menu-button {
  background: transparent;
  border: 0;
  width: 3rem;
  height: 3rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 999px;
  opacity: 0.52;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.menu-icon {
  width: 2.2rem;
  height: 2.2rem;
  display: block;
  transition: transform 0.18s ease;
}

.menu-icon__dot {
  fill: rgba(31, 90, 63, 0.52);
}

.menu-button:hover {
  opacity: 0.66;
}

.menu-button:focus-visible {
  opacity: 0.82;
  outline: none;
  box-shadow: 0 0 0 2px rgba(31, 90, 63, 0.12);
}

.menu-button[aria-expanded="true"] {
  opacity: 0.78;
}

.menu-button[aria-expanded="true"] .menu-icon {
  transform: scale(1.02);
}

.menu-shell {
  grid-column: 3;
  justify-self: end;
  align-self: center;
  position: relative;
  z-index: 10;
  transform: translateX(-2rem);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 8;
  min-width: 148px;
  padding: 0.35rem;
  border-radius: 0.8rem;
  background: rgba(255, 251, 243, 0.98);
  border: 1px solid rgba(31, 90, 63, 0.12);
  box-shadow: 0 14px 24px rgba(29, 43, 34, 0.12);
}

.menu-dropdown__item {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: #1d2b22;
  text-align: left;
  padding: 0.7rem 0.8rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-family: inherit;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-dropdown__item:hover {
  background: rgba(47, 96, 57, 0.08);
}

.menu-dropdown__item--active {
  color: #1f5a3f;
  font-weight: 700;
  background: rgba(31, 90, 63, 0.06);
}

.router-outlet {
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 2;
  overflow: auto;
}

.status-banner {
  position: absolute;
  left: 2rem;
  right: 2rem;
  bottom: 1.2rem;
  z-index: 5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 80, 28, 0.08);
  border: 1px solid rgba(255, 80, 28, 0.18);
  color: #8d3a1a;
  font-size: 0.92rem;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: grid;
  place-items: center;
  gap: 0.6rem;
  background: rgba(245, 239, 221, 0.92);
  text-align: center;
}

.status-spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 4px solid rgba(255, 80, 28, 0.18);
  border-top-color: #d3382d;
  animation: spin 0.8s linear infinite;
}

.bottom-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4rem;
  width: 100%;
  display: block;
  object-fit: fill;
  object-position: bottom center;
  z-index: 1;
  pointer-events: none;
}

.fade-up-enter-active {
  transition: opacity 0.32s ease, transform 0.36s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-up-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .tablet-canvas {
    padding: 1rem 0.8rem 0;
  }

  .screen-header {
    min-height: 4rem;
    margin-top: 0.35rem;
  }

  .brand-link:not(.brand-link--dashboard) {
    top: 5.9rem;
  }

  .brand-link--hero {
    transform: translateX(-50%) translateY(18px) scale(1.1);
  }

  .brand-logo {
    width: clamp(189px, 52.2vw, 288px);
    max-height: 3.42rem;
  }
}

@media (orientation: landscape) {
  .tablet-canvas {
    padding: 0.6rem 0.9rem 0;
  }

  .screen-header {
    min-height: 3.7rem;
    margin-top: 0.4rem;
  }

  .brand-link:not(.brand-link--dashboard) {
    top: 4.35rem;
  }

  .brand-link--hero {
    transform: translateX(-50%) translateY(16px) scale(1.08);
  }


}

@media (max-height: 560px) and (orientation: landscape) {
  .tablet-canvas {
    padding: 0.5rem 0.75rem 0;
  }

  .screen-header {
    margin-top: 0.2rem;
    min-height: 3.3rem;
  }

  .brand-link:not(.brand-link--dashboard) {
    top: 4rem;
  }

  .brand-link--hero {
    transform: translateX(-50%) translateY(14px) scale(1.06);
  }

  .status-banner {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
  }


}
</style>
