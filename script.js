const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf"; 
// CRITICAL FIX: Must use HTTPS for GitHub Pages
const apiBase = "https://api.openweathermap.org/data/2.5/weather?units=metric";

// Select Elements safely
const searchBox = document.querySelector(".search input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");
const themeToggle = document.getElementById("theme-toggle");

// --- 1. Weather Function ---
async function checkWeather(url) {
    try {
        const response = await fetch(url);
        
        if (response.status === 404) {
            errorDiv.style.display = "block";
            weatherDiv.style.display = "none";
        } else {
            const data = await response.json();
            
            // Update Text
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

            // Update Icon
            if(data.weather[0].main == "Clouds") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
            else if(data.weather[0].main == "Clear") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
            else if(data.weather[0].main == "Rain") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
            else if(data.weather[0].main == "Drizzle") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
            else if(data.weather[0].main == "Mist") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
            else weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";

            weatherDiv.style.display = "block";
            errorDiv.style.display = "none";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch weather. Check console for details.");
    }
}

// --- 2. Event Listeners (With Safety Checks) ---

// Search Button
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        if(searchBox.value) checkWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
    });
}

// Enter Key
if (searchBox) {
    searchBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchBox.value) checkWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
    });
}

// Location Button (The feature you want)
if (locationBtn) {
    locationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            // Visual feedback that it's loading
            locationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; 
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    checkWeather(`${apiBase}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
                    locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>'; // Reset icon
                },
                (error) => {
                    locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                    alert("Location access denied or timed out. Please reset permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });
}

// Theme Toggle
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const icon = themeToggle.querySelector("i");
        if (document.body.classList.contains("dark-mode")) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    });
}
