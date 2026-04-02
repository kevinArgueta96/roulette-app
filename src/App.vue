<template>
  <div id="app" class="app-shell">
    <main class="tablet-stage">
      <section class="tablet-canvas">
        <header class="screen-header">
          <router-link to="/" class="brand-link">
            <img class="brand-logo" src="@/assets/brand/new-logo.png" alt="Parrano" />
          </router-link>

          <nav class="menu-shell">
            <button
              class="menu-button"
              type="button"
              aria-label="Menu"
              :aria-expanded="isMenuOpen ? 'true' : 'false'"
              @click="toggleMenu"
            >
              <span></span><span></span><span></span>
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

        <svg class="bottom-wave" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 112 C120 150 320 170 500 170 C680 170 880 150 1000 112 L1000 260 L0 260 Z" fill="#2f6039" />
        </svg>
      </section>
    </main>
  </div>
</template>

<script>
import { mapActions } from "vuex";
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  margin-top: 0.6rem;
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.brand-logo {
  display: block;
  width: clamp(110px, 14vw, 168px);
  max-height: 2.15rem;
  height: auto;
  object-fit: contain;
}

.menu-button {
  background: transparent;
  border: 0;
  width: 2.15rem;
  height: 2.15rem;
  padding: 0;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-button span {
  width: 18px;
  height: 2px;
  background: #1f5a3f;
  display: block;
  border-radius: 999px;
  transition: opacity 0.2s;
}

.menu-shell {
  position: relative;
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
  bottom: 0;
  width: 100%;
  height: 28%;
  display: block;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
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
    min-height: 2.6rem;
    margin-top: 0.35rem;
  }

  .brand-logo {
    width: clamp(100px, 30vw, 138px);
    max-height: 1.9rem;
  }
}

@media (orientation: landscape) {
  .tablet-canvas {
    padding: 0.6rem 0.9rem 0;
  }

  .screen-header {
    min-height: 2.4rem;
    margin-top: 0.4rem;
  }

  .bottom-wave {
    height: 12%;
  }
}

@media (max-height: 560px) and (orientation: landscape) {
  .tablet-canvas {
    padding: 0.5rem 0.75rem 0;
  }

  .screen-header {
    margin-top: 0.2rem;
    min-height: 2.25rem;
  }

  .status-banner {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .bottom-wave {
    height: 10%;
  }
}
</style>
