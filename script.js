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

            const main = data.weather[0].main;
            if(main == "Clouds") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
            else if(main == "Clear") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
            else if(main == "Rain") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
            else if(main == "Drizzle") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
            else if(main == "Mist") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
            else weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";

            weatherDiv.style.display = "block";
            errorDiv.style.display = "none";
            searchBox.blur(); // Hide mobile keyboard
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

searchBtn.addEventListener("click", () => {
    if(searchBox.value) checkWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value) checkWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
});

locationBtn.addEventListener("click", () => {
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

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");
    
    if (document.body.classList.contains("dark-mode")) {
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }
});
