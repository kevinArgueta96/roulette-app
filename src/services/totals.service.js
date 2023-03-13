async function getOptions() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/roulette.json"
  );
  return response.json();
}

async function getTotals() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/total-prices.json"
  );
  return response.json();
}

async function setNewTotal(data) {
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
}

async function getHour() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/schedule-range.json"
  );
  return response.json();
}

async function setHour(data) {
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
}


export default {
  getOptions,
  getTotals,
  setNewTotal,
  getHour,
  setHour
};
