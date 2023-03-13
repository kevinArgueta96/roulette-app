export const getOptions = async () => {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/roulette.json",)
   const data = await response.data.json();
  return data;
};
