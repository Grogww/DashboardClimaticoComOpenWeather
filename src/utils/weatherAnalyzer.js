/**
 * Weather conditions that indicate rain.
 */
const RAIN_CONDITIONS = ["Rain", "Drizzle", "Thunderstorm"];

/**
 * Maps a weather condition to an emoji.
 * @param {string} main - Weather condition main string
 * @returns {string} Emoji
 */
function toEmoji(main) {
  const map = {
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Rain: "🌧️",
    Snow: "🌨️",
    Mist: "🌫️",
    Smoke: "🌫️",
    Haze: "🌫️",
    Fog: "🌫️",
    Dust: "🌫️",
    Clear: "☀️",
    Clouds: "☁️",
  };
  return map[main] || "🌡️";
}

/**
 * Checks if a weather condition is rainy.
 * @param {string} condition
 * @returns {boolean}
 */
function isRainy(condition) {
  return RAIN_CONDITIONS.includes(condition);
}

/**
 * Formats a UNIX timestamp to a short time string.
 * @param {number} dt - UNIX timestamp in seconds
 * @returns {string}
 */
function formatTime(dt) {
  return new Date(dt * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
}

/**
 * Analyzes current weather + forecast slots and returns
 * the umbrella recommendation with a human-friendly message.
 *
 * @param {Object} current - Current weather API object
 * @param {Array} nextSlots - Filtered forecast slots (next 6h)
 * @returns {{
 *   shouldBring: boolean,
 *   rainingNow: boolean,
 *   rainExpected: boolean,
 *   message: string,
 *   subtitle: string
 * }}
 */
function analyze(current, nextSlots) {
  const rainingNow = isRainy(current.weather[0].main);
  const rainSlots = nextSlots.filter((s) => isRainy(s.weather[0].main));
  const rainExpected = rainSlots.length > 0;
  const shouldBring = rainingNow || rainExpected;

  let message, subtitle;

  if (rainingNow && rainExpected) {
    message = "Yes, bring it!";
    subtitle = "It's raining now and more rain is on the way.";
  } else if (rainingNow) {
    message = "Yes, bring it!";
    subtitle = "It's raining right now. Don't forget your umbrella!";
  } else if (rainExpected) {
    const firstRainTime = formatTime(rainSlots[0].dt);
    message = "Yes, bring it!";
    subtitle = `Rain is expected around ${firstRainTime}. Better safe than sorry.`;
  } else {
    message = "Nah, you're good!";
    subtitle = "No rain expected in the next 6 hours. Enjoy your day!";
  }

  return { shouldBring, rainingNow, rainExpected, message, subtitle };
}

module.exports = { analyze, toEmoji, isRainy };
