const weatherAnalyzer = require("../utils/weatherAnalyzer");

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = process.env.OPENWEATHER_API_KEY;
const UNITS = "metric";
const LANG = "en";
const FORECAST_HOURS = 6;

/**
 * Fetches current weather from OpenWeatherMap.
 * Endpoint: GET /data/2.5/weather
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Raw API response
 */
async function fetchCurrentWeather(lat, lon) {
  const url =
    `${BASE_URL}/weather` +
    `?lat=${lat}&lon=${lon}` +
    `&units=${UNITS}&lang=${LANG}` +
    `&appid=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`OpenWeather API error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Fetches the 5-day / 3-hour forecast from OpenWeatherMap.
 * Endpoint: GET /data/2.5/forecast
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Raw API response
 */
async function fetchForecast(lat, lon) {
  const url =
    `${BASE_URL}/forecast` +
    `?lat=${lat}&lon=${lon}` +
    `&units=${UNITS}&lang=${LANG}` +
    `&appid=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`OpenWeather API error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Orchestrates both API calls, filters the forecast to the
 * next FORECAST_HOURS, and returns a fully processed object
 * ready for the frontend to consume — no raw data leaks.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Processed weather data
 */
async function getProcessedWeather(lat, lon) {
  // Fetch both endpoints in parallel
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(lat, lon),
    fetchForecast(lat, lon),
  ]);

  // Filter forecast to next N hours
  const now = Date.now() / 1000;
  const cutoff = now + FORECAST_HOURS * 3600;
  const nextSlots = forecast.list.filter(
    (slot) => slot.dt > now && slot.dt <= cutoff
  );

  // Analyze umbrella recommendation
  const analysis = weatherAnalyzer.analyze(current, nextSlots);

  // Build the processed response
  return {
    location: {
      name: current.name,
      country: current.sys.country,
    },
    recommendation: {
      shouldBring: analysis.shouldBring,
      rainingNow: analysis.rainingNow,
      rainExpected: analysis.rainExpected,
      message: analysis.message,
      subtitle: analysis.subtitle,
    },
    current: {
      condition: current.weather[0].main,
      description: current.weather[0].description,
      icon: weatherAnalyzer.toEmoji(current.weather[0].main),
      temp: Math.round(current.main.temp),
      humidity: current.main.humidity,
      windSpeed: parseFloat((current.wind.speed * 3.6).toFixed(1)),
    },
    forecast: nextSlots.map((slot) => ({
      dt: slot.dt,
      condition: slot.weather[0].main,
      description: slot.weather[0].description,
      icon: weatherAnalyzer.toEmoji(slot.weather[0].main),
      temp: Math.round(slot.main.temp),
      isRainy: weatherAnalyzer.isRainy(slot.weather[0].main),
    })),
    // Raw responses for the assignment's "API Details" section
    _raw: {
      current,
      forecast: { cnt: nextSlots.length, list: nextSlots },
    },
  };
}

module.exports = { getProcessedWeather };
