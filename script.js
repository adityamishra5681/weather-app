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

let lastCity = "Mumbai";

async function checkWeather(city, lat = null, lon = null) {
    let url = lat ? `${weatherApi}&lat=${lat}&lon=${lon}&appid=${apiKey}` : `${weatherApi}&q=${city}&appid=${apiKey}`;
    let fUrl = lat ? `${forecastApi}&lat=${lat}&lon=${lon}&appid=${apiKey}` : `${forecastApi}&q=${city}&appid=${apiKey}`;

    try {
        loader.style.display = "block";
        weatherDiv.style.display = "none";
        errorDiv.style.display = "none";
        forecastSection.style.display = "none";

        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const data = await response.json();
        lastCity = data.name;

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
        // Main high-res weather icon
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        // Forecast fetching
        const fResponse = await fetch(fUrl);
        const fData = await fResponse.json();
        const forecastEl = document.querySelector("#forecast");
        forecastEl.innerHTML = "";

        // Filter one forecast per day (around noon)
        fData.list.filter(item => item.dt_txt.includes("12:00:00")).forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString("en", {weekday: 'short'});
            forecastEl.innerHTML += `
                <div class="forecast-item">
                    <p>${date}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                    <p><strong>${Math.round(day.main.temp)}°</strong></p>
                </div>`;
        });

        loader.style.display = "none";
        weatherDiv.style.display = "block";
        forecastSection.style.display = "block";
        searchBox.blur(); // Hide keyboard
    } catch (err) {
        loader.style.display = "none";
        errorDiv.style.display = "block";
    }
}

// Pull to refresh mechanism for mobile
let touchStart = 0;
window.addEventListener('touchstart', (e) => { touchStart = e.targetTouches[0].pageY; }, {passive: true});
window.addEventListener('touchend', (e) => {
    if (touchStart < e.changedTouches[0].pageY - 150) checkWeather(lastCity);
}, {passive: true});

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


