const weatherService = require("../services/weatherService");

/**
 * GET /api/weather
 * Query params: lat, lon
 *
 * Validates input, delegates to the service layer,
 * and returns the processed weather data to the client.
 */
async function getWeather(req, res) {
  try {
    const { lat, lon } = req.query;

    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({
        error: "Missing required query parameters: lat and lon",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: "lat and lon must be valid numbers",
      });
    }

    // Delegate to the service layer
    const result = await weatherService.getProcessedWeather(latitude, longitude);

    return res.json(result);
  } catch (error) {
    console.error("WeatherController error:", error.message);

    // Forward API-specific errors with appropriate status
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getWeather };
