const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf"; 
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");

async function checkWeather(city) {
    if(!city) return;

    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

        if (response.status == 404 || response.status == 401) {
            errorDiv.style.display = "block";
            weatherDiv.style.display = "none";
            if(response.status == 401) console.error("Invalid API Key.");
        } else {
            var data = await response.json();

            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

            // Map weather conditions to icons
            const weatherMain = data.weather[0].main;
            if (weatherMain == "Clouds") {
                weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
            } else if (weatherMain == "Clear") {
                weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
            } else if (weatherMain == "Rain") {
                weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
            } else if (weatherMain == "Drizzle") {
                weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
            } else if (weatherMain == "Mist") {
                weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
            } else if (weatherMain == "Snow") {
                weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/2315/2315309.png"; 
            }

            weatherDiv.style.display = "block";
            errorDiv.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorDiv.style.display = "block";
        errorDiv.innerHTML = "<p>Network Error. Check connection.</p>";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});
