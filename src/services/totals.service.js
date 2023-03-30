async function getOptions() {
  try {
    const response = await fetch(
      "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/roulette.json"
    );
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function getTotals() {
  try {
    const response = await fetch(
      "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/total-prices.json"
    );
    return response.json();
  } catch (error) {
    return 'error';
  }
}

async function setNewTotal(data) {
  try {
    const url = `https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/total-prices.json`;
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
    const response = await fetch(
      "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/schedule-range.json"
    );
    return response.json();
  } catch (error) {
    return 'error';
  }

}

async function setHour(data) {
  try {
    const url = `https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/schedule-range.json`;
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
