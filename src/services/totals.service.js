import { CONFIG } from '../../env.config'

async function getOptions() {
  try {
    const url = CONFIG.apiUrlQA+"roulette.json";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function getTotals() {
  try {
    const url = CONFIG.apiUrlQA+"total-prices.json";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function getGiftCards() {
  try { 
    const url =  CONFIG.apiUrlQA+"gift-cards.json";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function getTopPrices() {
  try { 
    const url =  CONFIG.apiUrlQA+"top-prices.json";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function getTeslaWin() {
  try { 
    const url =  CONFIG.apiUrlQA+"tesla-win.json";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function setNewTotal(data) {
  try {
    const url = CONFIG.apiUrlQA+"total-prices.json";
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function setGiftCards(data) {
  try {
    const url = CONFIG.apiUrlQA+"gift-cards.json";
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function setTopPrices(data) {
  try {
    const url = CONFIG.apiUrlQA+"top-prices.json";
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function setTeslaWinService(data) {
  try {
    const url = CONFIG.apiUrlQA+"tesla-win.json";
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    return 'error';
  }
}

export default {
  getOptions,
  getTotals,
  getGiftCards,
  getTopPrices,
  setGiftCards,
  getTeslaWin,
  setNewTotal,
  setTopPrices,
  setTeslaWinService
};
