const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

// GET /api/weather?lat={lat}&lon={lon}
// Returns processed weather data with umbrella recommendation
router.get("/weather", weatherController.getWeather);

module.exports = router;
