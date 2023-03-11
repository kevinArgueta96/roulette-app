async function getOptions() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/roulette.json"
  );
  return response.json();
}

async function getTotalReplay() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/replay.json"
  );
  return response.json();
}

async function getTotalSpecialPrice() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/special-price.json"
  );
  return response.json();
}

async function getTotalSurpriseWin() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/surprise-win.json"
  );
  return response.json();
}

async function getTopPrice() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/top-price.json"
  );
  return response.json();
}
async function getTotalGiftCard() {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/gift-card.json"
  );
  return response.json();
}

async function setNewTotal(pathValue, data) {
    console.log({pathValue,data})
    return 'hola';
  /*const url = `https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/${pathValue}roulette.json`;
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(url, options);
  console.log(response)
  return 'response.json()';*/
}

export default {
  getOptions,
  getTotalReplay,
  getTotalSpecialPrice,
  getTotalSurpriseWin,
  getTopPrice,
  getTotalGiftCard,
  setNewTotal,
};
