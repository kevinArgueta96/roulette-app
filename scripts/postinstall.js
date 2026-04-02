const { spawnSync } = require("child_process");

const shouldSkip = Boolean(
  process.env.NETLIFY ||
  process.env.CI ||
  process.env.SKIP_ELECTRON_BUILDER_INSTALL
);

if (shouldSkip) {
  process.stdout.write("Skipping electron-builder install-app-deps in CI/Netlify.\n");
  process.exit(0);
}

const result = spawnSync("npx", ["electron-builder", "install-app-deps"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.error) {
  throw result.error;
}

process.exit(result.status || 0);
