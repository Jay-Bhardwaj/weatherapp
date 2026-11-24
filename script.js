const weather = {
  apiKey: "2ab9992d0e4e30d74dc00136abaa9750",
  cities: [
    "Agra, IN", "Ahmedabad, IN", "Amritsar, IN", "Bengaluru, IN", "Bhopal, IN",
    "Bhubaneswar, IN", "Chandigarh, IN", "Chennai, IN", "Coimbatore, IN", "Delhi, IN",
    "Goa, IN", "Guwahati, IN", "Hyderabad, IN", "Indore, IN", "Jaipur, IN",
    "Kanpur, IN", "Kochi, IN", "Kolkata, IN", "Lucknow, IN", "Ludhiana, IN",
    "Madurai, IN", "Mangaluru, IN", "Mumbai, IN", "Mysuru, IN", "Nagpur, IN",
    "Nashik, IN", "Noida, IN", "Patna, IN", "Pune, IN", "Surat, IN", "Thiruvananthapuram, IN",
    "Udaipur, IN", "Vadodara, IN", "Varanasi, IN", "Visakhapatnam, IN",
    "Amsterdam", "Berlin", "Cairo", "Dubai", "London", "Melbourne", "New York", "Paris", "Singapore", "Sydney", "Tokyo", "Toronto"
  ],
  async fetchWeather(city) {
    const cleanCity = city.trim();
    if (!cleanCity) return this.showError("Enter a city to see its weather.");
    this.setLoading(true); this.hideError();
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanCity)}&units=metric&appid=${this.apiKey}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We could not find that city.");
      this.displayWeather(data);
    } catch (error) {
      this.showError(error.message === "Failed to fetch" ? "Weather service is unavailable. Check your connection and try again." : error.message);
    } finally { this.setLoading(false); }
  },
  displayWeather(data) {
    const { name, sys, timezone, visibility = 0 } = data; const { icon, description, id } = data.weather[0]; const { temp, feels_like: feelsLike, humidity } = data.main;
    const city = `${name}${sys?.country ? `, ${sys.country}` : ""}`;
    document.querySelector(".city").textContent = city; document.querySelector(".temp").textContent = `${Math.round(temp)}°`; document.querySelector(".description").textContent = description; document.querySelector(".feels-like").textContent = `Feels like ${Math.round(feelsLike)}°`; document.querySelector(".humidity").textContent = `${humidity}%`; document.querySelector(".wind").textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; document.querySelector(".visibility").textContent = `${(visibility / 1000).toFixed(1)} km`;
    const emojiNode = document.querySelector(".weather-emoji"); emojiNode.textContent = this.weatherEmoji(id, icon); emojiNode.setAttribute("aria-label", description); document.querySelector(".local-time").textContent = this.getLocalTime(timezone);
  },
  weatherEmoji(id, icon) { if (id >= 200 && id < 300) return "⛈️"; if (id >= 300 && id < 600) return "🌧️"; if (id >= 600 && id < 700) return "❄️"; if (id >= 700 && id < 800) return "🌫️"; if (id === 800) return icon.endsWith("n") ? "🌙" : "☀️"; return icon.endsWith("n") ? "☁️" : "⛅"; },
  getLocalTime(offset) { return new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date(Date.now() + offset * 1000 + new Date().getTimezoneOffset() * 60000)); },
  setLoading(isLoading) { document.querySelector(".weather").classList.toggle("loading", isLoading); },
  showError(message) { const error = document.querySelector(".error"); error.textContent = `Unable to load weather: ${message}`; error.hidden = false; },
  hideError() { document.querySelector(".error").hidden = true; },
};
const form = document.querySelector(".search"), input = document.querySelector(".search-bar"), suggestions = document.querySelector(".suggestions");
function showSuggestions(value = "") { const matches = weather.cities.filter(city => city.toLowerCase().includes(value.toLowerCase())).slice(0, 6); suggestions.innerHTML = matches.map(city => `<li role="option"><button class="suggestion" type="button" data-city="${city}">📍 ${city}</button></li>`).join(""); suggestions.hidden = !matches.length; input.setAttribute("aria-expanded", String(matches.length > 0)); }
function closeSuggestions() { suggestions.hidden = true; input.setAttribute("aria-expanded", "false"); }
form.addEventListener("submit", event => { event.preventDefault(); weather.fetchWeather(input.value); closeSuggestions(); }); input.addEventListener("input", () => showSuggestions(input.value)); input.addEventListener("focus", () => showSuggestions(input.value)); input.addEventListener("keydown", event => { if (event.key === "Escape") closeSuggestions(); }); suggestions.addEventListener("click", event => { const button = event.target.closest(".suggestion"); if (!button) return; input.value = button.dataset.city; weather.fetchWeather(input.value); closeSuggestions(); }); document.addEventListener("click", event => { if (!event.target.closest(".search-wrap")) closeSuggestions(); });
weather.fetchWeather("Delhi");
