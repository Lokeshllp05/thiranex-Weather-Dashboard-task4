const searchForm = document.getElementById('search-form');
const statusEl = document.getElementById('status');
const weatherVisualEl = document.getElementById('weather-visual');
const weatherSceneEl = document.getElementById('weather-scene');
const weatherTaglineEl = document.getElementById('weather-tagline');
const weatherIconEl = document.getElementById('weather-icon');
const weatherConditionEl = document.getElementById('weather-condition');
const weatherSummaryEl = document.getElementById('weather-summary');
const cardsEl = document.getElementById('weather-cards');
const locationEl = document.getElementById('location');
const descriptionEl = document.getElementById('description');
const temperatureEl = document.getElementById('temperature');
const apparentTemperatureEl = document.getElementById('apparent-temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const windDirectionEl = document.getElementById('wind-direction');

const apiKey = '59d8ad926f1f44ce96e15553262805';
const weatherUrl = 'https://api.weatherapi.com/v1/current.json';
const themeClasses = ['sunny', 'rainy', 'cloudy', 'stormy', 'foggy', 'snowy', 'clear-night', 'india-theme', 'andhra-theme'];
const andhraKeywords = ['andhra', 'amaravati', 'vizag', 'visakhapatnam', 'vijayawada', 'tirupati', 'guntur', 'rajahmundry', 'nellore', 'kadapa', 'kurnool', 'eluru'];

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(searchForm);
  const city = formData.get('city').trim();
  if (!city) {
    updateStatus('Please enter a city name.');
    return;
  }
  await loadWeather(city);
});

async function loadWeather(city) {
  updateStatus(`Fetching weather for ${city}...`);
  weatherVisualEl.classList.add('hidden');
  cardsEl.classList.add('hidden');
  try {
    const weather = await fetchWeather(city);
    renderWeather(weather);
    updateStatus(`Live weather for ${weather.location.name}, ${weather.location.country}. Updated just now.`);
  } catch (error) {
    console.error(error);
    updateStatus(error.message || 'Unable to retrieve weather data.');
  }
}

async function fetchWeather(city) {
  const params = new URLSearchParams({ key: apiKey, q: city, aqi: 'no' });
  const response = await fetch(`${weatherUrl}?${params}`);
  if (!response.ok) {
    throw new Error('Weather API request failed. Please check the location and try again.');
  }
  const data = await response.json();
  if (!data.location || !data.current) {
    throw new Error('Weather API returned incomplete data.');
  }
  return data;
}

function renderWeather(data) {
  const location = data.location;
  const current = data.current;
  const iconUrl = current.condition.icon.startsWith('http') ? current.condition.icon : `https:${current.condition.icon}`;
  const condition = mapCondition(current.condition.text, current.is_day);

  locationEl.textContent = `${location.name}, ${location.region}, ${location.country}`;
  descriptionEl.textContent = `${current.condition.text} • Humidity ${current.humidity}%`;
  temperatureEl.textContent = `${current.temp_c.toFixed(1)} °C`;
  apparentTemperatureEl.textContent = `${current.feelslike_c.toFixed(1)} °C`;
  humidityEl.textContent = `${current.humidity}%`;
  windSpeedEl.textContent = `${current.wind_kph.toFixed(1)} km/h`;
  windDirectionEl.textContent = `${current.wind_dir}`;

  weatherIconEl.src = iconUrl;
  weatherIconEl.alt = current.condition.text;
  weatherConditionEl.textContent = current.condition.text;
  weatherSummaryEl.textContent = `Feels like ${current.feelslike_c.toFixed(1)} °C with ${current.wind_kph.toFixed(1)} km/h wind.`;

  updateWeatherTheme(condition, location, current.is_day, iconUrl);
  cardsEl.classList.remove('hidden');
}

function updateWeatherTheme(condition, location, isDay, iconUrl) {
  document.body.classList.remove(...themeClasses);
  if (isIndianLocation(location)) {
    document.body.classList.add('india-theme');
  }
  if (isAndhraLocation(location)) {
    document.body.classList.add('andhra-theme');
  }
  document.body.classList.add(condition);
  weatherVisualEl.classList.remove('hidden');
  weatherSceneEl.className = `weather-scene ${condition}`;
  weatherSceneEl.innerHTML = getWeatherSceneMarkup(condition, iconUrl, isDay);
  weatherTaglineEl.textContent = getWeatherTagline(condition, location, isDay);
}

function mapCondition(conditionText, isDay) {
  const lower = conditionText.toLowerCase();
  if (lower.includes('sunny') || lower.includes('clear')) {
    return isDay ? 'sunny' : 'clear-night';
  }
  if (lower.includes('cloud') || lower.includes('overcast')) {
    return 'cloudy';
  }
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) {
    return 'rainy';
  }
  if (lower.includes('storm') || lower.includes('thunder')) {
    return 'stormy';
  }
  if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) {
    return 'foggy';
  }
  if (lower.includes('snow') || lower.includes('blizzard') || lower.includes('sleet')) {
    return 'snowy';
  }
  return 'cloudy';
}

function isIndianLocation(location) {
  return location.country === 'India' || location.country_code === 'IN';
}

function isAndhraLocation(location) {
  const name = location.name.toLowerCase();
  return isIndianLocation(location) && andhraKeywords.some(keyword => name.includes(keyword));
}

function getWeatherTagline(condition, location, isDay) {
  const regionText = isIndianLocation(location) ? 'India' : location.country;
  const phrases = {
    sunny: `Bright sunshine across ${location.name}, ${regionText}. A vivid day with warm energy.`,
    cloudy: `Clouds are drifting over ${location.name}. Feel the calm sky and soft light.`,
    rainy: `Rainy weather in ${location.name}. Enjoy the refreshing showers and cool breeze.`,
    stormy: `Thunderstorms around ${location.name}. Take care with the powerful rain and wind.`,
    foggy: `Misty air in ${location.name}. The sky is soft and low-light all around.`,
    snowy: `Snow is falling near ${location.name}. A sparkling winter-like scene.`,
    'clear-night': `Clear night in ${location.name}. The sky is calm and perfect for starry views.`,
  };
  return phrases[condition] || `Current weather in ${location.name}, ${regionText}.`;
}

function getWeatherSceneMarkup(condition, iconUrl, isDay) {
  switch (condition) {
    case 'sunny':
      return `
        <div class="weather-image sky-background"></div>
        <img class="weather-image" src="${iconUrl}" alt="Sunny icon" />
        <div class="weather-image wind-lines"></div>
      `;
    case 'cloudy':
      return `
        <div class="weather-image sky-background"></div>
        <img class="weather-image" src="${iconUrl}" alt="Cloudy icon" />
      `;
    case 'rainy':
      return `
        <div class="weather-image sky-background"></div>
        <div class="weather-image rain-lines"></div>
        <img class="weather-image" src="${iconUrl}" alt="Rainy icon" />
      `;
    case 'stormy':
      return `
        <div class="weather-image sky-background"></div>
        <div class="weather-image rain-lines"></div>
        <img class="weather-image" src="${iconUrl}" alt="Stormy icon" />
      `;
    case 'foggy':
      return `
        <div class="weather-image sky-background"></div>
        <img class="weather-image" src="${iconUrl}" alt="Foggy icon" />
      `;
    case 'snowy':
      return `
        <div class="weather-image sky-background"></div>
        <img class="weather-image" src="${iconUrl}" alt="Snowy icon" />
      `;
    case 'clear-night':
      return `
        <div class="weather-image sky-background"></div>
        <img class="weather-image" src="${iconUrl}" alt="Clear night icon" />
      `;
    default:
      return `
        <div class="weather-image sky-background"></div>
        <img class="weather-image" src="${iconUrl}" alt="Weather icon" />
      `;
  }
}

function updateStatus(message) {
  statusEl.textContent = message;
}

window.addEventListener('DOMContentLoaded', () => {
  const defaultCity = 'Hyderabad';
  searchForm.city.value = defaultCity;
  loadWeather(defaultCity);
});
