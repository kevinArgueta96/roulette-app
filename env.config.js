const config = {
    apiUrlProd: process.env.VUE_APP_API_URL_PROD || 'https://rouletee-app-default-rtdb.europe-west1.firebasedatabase.app/',
    apiUrlQA: process.env.VUE_APP_API_URL_QA || 'https://qa-roulette-app-default-rtdb.firebaseio.com/'
};

module.exports = {
    CONFIG: config
};