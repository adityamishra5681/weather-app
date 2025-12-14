const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf"; 
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiUrlLocation = "https://api.openweathermap.org/data/2.5/weather?units=metric";

const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const themeToggle = document.querySelector("#theme-toggle");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");

// Function to update UI with weather data
function updateWeatherUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    const weatherMain = data.weather[0].main;
    
    // Mapping weather conditions to icons
    if (weatherMain == "Clouds") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
    else if (weatherMain == "Clear") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    else if (weatherMain == "Rain") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
    else if (weatherMain == "Drizzle") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
    else if (weatherMain == "Mist") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
    else if (weatherMain == "Snow") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/2315/2315309.png";
    else weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // Default

    weatherDiv.style.display = "block";
    errorDiv.style.display = "none";
}

// Check Weather by City Name
async function checkWeather(city) {
    if(!city) return;
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
        if (response.status == 404 || response.status == 401) {
            errorDiv.style.display = "block";
            weatherDiv.style.display = "none";
            errorDiv.innerHTML = "<p>Invalid City Name!</p>";
        } else {
            const data = await response.json();
            updateWeatherUI(data);
        }
    } catch (error) {
        console.error(error);
    }
}

// Check Weather by Coordinates (GPS)
async function checkWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${apiUrlLocation}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error(error);
        errorDiv.style.display = "block";
        errorDiv.innerHTML = "<p>Unable to fetch location data.</p>";
    }
}

// Event Listener: Search Button
searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

// Event Listener: Enter Key
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});

// Event Listener: Location Button (GPS)
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                checkWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                alert("Please allow location access to use this feature.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// Event Listener: Theme Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
