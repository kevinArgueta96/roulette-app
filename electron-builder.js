/**
* @type {import('electron-builder').Configuration}
* @see https://www.electron.build/configuration/configuration
**/
module.exports = {
  appId: "com.roulette.game",
  productName: "Roulette Game",
  win: {
    target: "nsis",
    icon: "public/logo_256x256.ico"
  },
  rpm: {
    category: "Other"
  }
};
