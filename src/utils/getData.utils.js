export const getOptions = async () => {
  const response = await fetch(
    "https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/roulette.json",)
    console.log(response)
   const data = await response.data.json();
  return data;
};
