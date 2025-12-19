const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf"; 
const apiBase = "https://api.openweathermap.org/data/2.5/weather?units=metric";

const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");
const themeToggle = document.querySelector("#theme-toggle");

async function checkWeather(url) {
    try {
        // Mobile UX: Show a slight fade-out during load
        weatherDiv.style.opacity = "0.5";
        
        const response = await fetch(url);
        
        if (response.status === 404) {
            errorDiv.style.display = "block";
            weatherDiv.style.display = "none";
        } else {
            const data = await response.json();
            
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

            // Weather Icon Mapping
            const main = data.weather[0].main;
            const iconMap = {
                "Clouds": "1163624.png",
                "Clear": "869869.png",
                "Rain": "1163657.png",
                "Drizzle": "3076129.png",
                "Mist": "4005901.png",
                "Snow": "2315309.png" // Added Snow as a bonus
            };

            const iconCode = iconMap[main] || "869869.png";
            weatherIcon.src = `https://cdn-icons-png.flaticon.com/512/${iconCode.split('.')[0]}/${iconCode}`;

            weatherDiv.style.display = "block";
            weatherDiv.style.opacity = "1";
            errorDiv.style.display = "none";
            
            // Mobile UX: Hide keyboard after search
            searchBox.blur(); 
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    if(searchBox.value.trim()) {
        checkWeather(`${apiBase}&q=${searchBox.value.trim()}&appid=${apiKey}`);
    }
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value.trim()) {
        checkWeather(`${apiBase}&q=${searchBox.value.trim()}&appid=${apiKey}`);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        // Mobile UX: visual feedback for location fetch
        locationBtn.style.transform = "rotate(360deg)";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lon } = position.coords;
                checkWeather(`${apiBase}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
                locationBtn.style.transform = "rotate(0deg)";
            },
            () => { 
                alert("Please enable location access in your settings.");
                locationBtn.style.transform = "rotate(0deg)";
            }
        );
    }
});

// Theme Toggle Logic with Restored Animation Support
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");
    
    if (document.body.classList.contains("dark-mode")) {
        icon.className = "fa-solid fa-sun"; // Switch to Sun icon
    } else {
        icon.className = "fa-solid fa-moon"; // Switch to Moon icon
    }
});
