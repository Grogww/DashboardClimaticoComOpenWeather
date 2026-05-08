// ============================================
// Should I Bring my Umbrella? — Frontend
// Calls the Express server at /api/weather
// ============================================

// Fallback coordinates (Videira, SC, Brazil)
const FALLBACK = {
  lat: -27.0038,
  lon: -51.1522,
  label: "Videira, SC",
};

// ---- DOM Elements ----
const $ = (id) => document.getElementById(id);

const DOM = {
  screenLoading: $("screen-loading"),
  screenResult: $("screen-result"),
  screenError: $("screen-error"),
  errorText: $("error-text"),
  btnRetry: $("btn-retry"),
  locationName: $("location-name"),
  answerSection: $("answer-section"),
  answerIcon: $("answer-icon"),
  answerText: $("answer-text"),
  answerSubtitle: $("answer-subtitle"),
  condDesc: $("cond-desc"),
  condTemp: $("cond-temp"),
  condHumidity: $("cond-humidity"),
  condWind: $("cond-wind"),
  forecastTimeline: $("forecast-timeline"),
  apiToggle: $("api-toggle"),
  apiArrow: $("api-arrow"),
  apiPanel: $("api-panel"),
  rawCurrent: $("raw-current"),
  rawForecast: $("raw-forecast"),
};

// ---- Helpers ----

/**
 * Formats a UNIX timestamp to a short time string.
 */
function formatTime(dt) {
  return new Date(dt * 1000).toLocaleTimeString([], {
    hour: "numeric",
    hour12: true,
  });
}

// ---- Screen Management ----

function showScreen(screen) {
  DOM.screenLoading.classList.add("hidden");
  DOM.screenResult.classList.add("hidden");
  DOM.screenError.classList.add("hidden");
  screen.classList.remove("hidden");
}

function showError(message) {
  DOM.errorText.textContent = message;
  showScreen(DOM.screenError);
}

// ---- Geolocation ----

/**
 * Gets the user's current position via the Geolocation API.
 * Falls back to FALLBACK coordinates if denied or unavailable.
 */
function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: FALLBACK.lat, lon: FALLBACK.lon, fromGeo: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          fromGeo: true,
        }),
      () =>
        resolve({ lat: FALLBACK.lat, lon: FALLBACK.lon, fromGeo: false }),
      { timeout: 8000 }
    );
  });
}

// ---- Fetch from our Express server ----

/**
 * Calls our server endpoint which proxies and processes
 * the OpenWeather data. The API key never reaches the browser.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Processed weather data
 */
async function fetchWeatherData(lat, lon) {
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Server error: ${response.status}`);
  }

  return response.json();
}

// ---- Render ----

/**
 * Renders the processed server response into the UI.
 */
function render(data, fromGeo) {
  // Location
  const loc = data.location;
  DOM.locationName.textContent = fromGeo
    ? `${loc.name}, ${loc.country}`
    : `${FALLBACK.label} (default)`;

  // Big answer
  const rec = data.recommendation;

  if (rec.shouldBring) {
    DOM.answerSection.className = "answer answer--yes";
    DOM.answerIcon.textContent = "☂️";
  } else {
    DOM.answerSection.className = "answer answer--no";
    DOM.answerIcon.textContent = "😎";
  }

  DOM.answerText.textContent = rec.message;
  DOM.answerSubtitle.textContent = rec.subtitle;

  // Current conditions (already processed by the server)
  const cur = data.current;
  const descCapitalized =
    cur.description.charAt(0).toUpperCase() + cur.description.slice(1);

  DOM.condDesc.textContent = `${cur.icon} ${descCapitalized}`;
  DOM.condTemp.textContent = `${cur.temp}°C`;
  DOM.condHumidity.textContent = `${cur.humidity}%`;
  DOM.condWind.textContent = `${cur.windSpeed} km/h`;

  // Forecast timeline
  DOM.forecastTimeline.innerHTML = "";

  data.forecast.forEach((slot) => {
    const div = document.createElement("div");
    div.className = `forecast-slot${slot.isRainy ? " forecast-slot--rain" : ""}`;
    div.innerHTML = `
      <span class="forecast-slot__time">${formatTime(slot.dt)}</span>
      <span class="forecast-slot__icon">${slot.icon}</span>
      <span class="forecast-slot__temp">${slot.temp}°C</span>
    `;
    DOM.forecastTimeline.appendChild(div);
  });

  // Raw API responses (for assignment demonstration)
  DOM.rawCurrent.textContent = JSON.stringify(data._raw.current, null, 2);
  DOM.rawForecast.textContent = JSON.stringify(data._raw.forecast, null, 2);

  showScreen(DOM.screenResult);
}

// ---- Events ----

DOM.apiToggle.addEventListener("click", () => {
  DOM.apiPanel.classList.toggle("hidden");
  DOM.apiArrow.classList.toggle("open");
});

DOM.btnRetry.addEventListener("click", () => init());

// ---- Init ----

async function init() {
  showScreen(DOM.screenLoading);

  try {
    const location = await getUserLocation();
    const data = await fetchWeatherData(location.lat, location.lon);
    render(data, location.fromGeo);
  } catch (error) {
    console.error("App error:", error);
    showError(error.message || "Something went wrong. Please try again.");
  }
}

init();
