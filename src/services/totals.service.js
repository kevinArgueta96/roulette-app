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

async function getHour() {
  try { 
    const url =  CONFIG.apiUrlQA+"schedule-range.json";
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return 'error';
  }

}

async function setHour(data) {
  try {
    const url = CONFIG.apiUrlQA+"schedule-range.json";
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
  setNewTotal,
  getHour,
  setHour
};
