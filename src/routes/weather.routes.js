const { Router } = require('express');
const { getWeather, getWeatherForecast } = require('../controllers/weather.controller');

const router = Router();

router.get('/', getWeather);
router.get('/forecast', getWeatherForecast);

module.exports = router;
