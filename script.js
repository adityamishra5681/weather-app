const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf";
const weatherApi = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const forecastApi = "https://api.openweathermap.org/data/2.5/forecast?units=metric";

const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const loader = document.querySelector("#loader");
const weatherDiv = document.querySelector(".weather");
const errorDiv = document.querySelector(".error");
const forecastSection = document.querySelector("#forecast-section");

let lastCity = "London"; // Fallback for refresh

async function checkWeather(city, lat = null, lon = null) {
    let url = lat ? `${weatherApi}&lat=${lat}&lon=${lon}&appid=${apiKey}` : `${weatherApi}&q=${city}&appid=${apiKey}`;
    let fUrl = lat ? `${forecastApi}&lat=${lat}&lon=${lon}&appid=${apiKey}` : `${forecastApi}&q=${city}&appid=${apiKey}`;

    try {
        loader.style.display = "block";
        weatherDiv.style.display = "none";
        errorDiv.style.display = "none";
        forecastSection.style.display = "none";

        const response = await fetch(url);
        if (!response.ok) throw new Error("Not Found");
        const data = await response.json();
        lastCity = data.name;

        // Update Current Weather
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
        const main = data.weather[0].main;
        const iconId = data.weather[0].icon;
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconId}@4x.png`;

        // Update Forecast
        const fResponse = await fetch(fUrl);
        const fData = await fResponse.json();
        const forecastEl = document.querySelector("#forecast");
        forecastEl.innerHTML = "";

        fData.list.filter(item => item.dt_txt.includes("12:00:00")).forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString("en", {weekday: 'short'});
            forecastEl.innerHTML += `
                <div class="forecast-item">
                    <p style="opacity: 0.7;">${date}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                    <p><strong>${Math.round(day.main.temp)}°</strong></p>
                </div>`;
        });

        loader.style.display = "none";
        weatherDiv.style.display = "block";
        forecastSection.style.display = "block"; // Show line + forecast
        searchBox.blur();
    } catch (err) {
        loader.style.display = "none";
        errorDiv.style.display = "block";
    }
}

// Mobile Pull-to-Refresh Logic
let touchStart = 0;
window.addEventListener('touchstart', (e) => { touchStart = e.targetTouches[0].pageY; }, {passive: true});
window.addEventListener('touchend', (e) => {
    let touchEnd = e.changedTouches[0].pageY;
    if (touchStart < touchEnd - 150 && window.scrollY === 0) {
        checkWeather(lastCity); // Refresh current city
    }
}, {passive: true});

// Listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { if(e.key === "Enter") checkWeather(searchBox.value); });
locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(p => checkWeather(null, p.coords.latitude, p.coords.longitude));
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-moon"); icon.classList.toggle("fa-sun");
});
