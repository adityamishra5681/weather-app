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

            // Update Icon
            const main = data.weather[0].main;
            if(main == "Clouds") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
            else if(main == "Clear") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
            else if(main == "Rain") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
            else if(main == "Drizzle") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
            else if(main == "Mist") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
            else weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";

            weatherDiv.style.display = "block";
            errorDiv.style.display = "none";
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Search Button
searchBtn.addEventListener("click", () => {
    console.log("Search button clicked"); // Debug check
    if(searchBox.value) checkWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
});

// Enter Key
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value) checkWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
});

// Location Button
locationBtn.addEventListener("click", () => {
    console.log("Location button clicked"); // Debug check
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                checkWeather(`${apiBase}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
            },
            () => { alert("Location access denied."); }
        );
    } else {
        alert("Geolocation not supported.");
    }
});

// Theme Toggle
themeToggle.addEventListener("click", () => {
    console.log("Theme toggle clicked"); // Debug check
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
