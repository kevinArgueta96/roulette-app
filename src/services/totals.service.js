import { CONFIG } from "../../env.config";

async function requestJson(path, options) {
  try {
    const response = await fetch(`${CONFIG.apiUrlQA}${path}`, options);

    if (!response.ok) {
      return "error";
    }

    return await response.json();
  } catch (error) {
    return "error";
  }
}

function putJson(path, data) {
  return requestJson(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

function getOptions() {
  return requestJson("roulette.json");
}

function getTotals() {
  return requestJson("total-prices.json");
}

function getGiftCards() {
  return requestJson("gift-cards.json");
}

function getTopPrices() {
  return requestJson("top-prices.json");
}

function getTeslaWin() {
  return requestJson("tesla-win.json");
}

function setNewTotal(data) {
  return putJson("total-prices.json", data);
}

function setGiftCards(data) {
  return putJson("gift-cards.json", data);
}

function setTopPrices(data) {
  return putJson("top-prices.json", data);
}

function setTeslaWinService(data) {
  return putJson("tesla-win.json", data);
}

export default {
  getOptions,
  getTotals,
  getGiftCards,
  getTopPrices,
  getTeslaWin,
  setNewTotal,
  setGiftCards,
  setTopPrices,
  setTeslaWinService
};
