const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf"; 
const apiBase = "https://api.openweathermap.org/data/2.5/weather?units=metric";

// DOM Elements
const searchBox = document.querySelector(".search input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");
const themeToggle = document.getElementById("theme-toggle");

// --- Weather Functions ---

async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        
        if (response.status == 404) {
            errorDiv.style.display = "block";
            weatherDiv.style.display = "none";
        } else {
            const data = await response.json();
            updateUI(data);
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

function updateUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    // Update Icon based on condition
    const condition = data.weather[0].main;
    if (condition == "Clouds") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
    else if (condition == "Clear") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    else if (condition == "Rain") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
    else if (condition == "Drizzle") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/3076/3076129.png";
    else if (condition == "Mist") weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
    else weatherIcon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png"; // Default

    weatherDiv.style.display = "block";
    errorDiv.style.display = "none";
}

// Search by City
searchBtn.addEventListener("click", () => {
    if(searchBox.value) fetchWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value) fetchWeather(`${apiBase}&q=${searchBox.value}&appid=${apiKey}`);
});

// Live Location
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(`${apiBase}&lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
            },
            (error) => {
                alert("Unable to retrieve your location. Please allow location access.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// --- Theme Toggle ---
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");
    if(document.body.classList.contains("dark-mode")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
});

// --- Modal Logic (Login & Help) ---

// Login
const loginBtn = document.getElementById("login-btn");
const authModal = document.getElementById("auth-modal");
const closeAuth = document.querySelector(".close-btn");
const toggleAuth = document.getElementById("toggle-auth");
const modalTitle = document.getElementById("modal-title");

loginBtn.onclick = () => authModal.style.display = "flex";
closeAuth.onclick = () => authModal.style.display = "none";

toggleAuth.onclick = () => {
    if (modalTitle.innerText === "Welcome Back") {
        modalTitle.innerText = "Create Account";
        toggleAuth.innerText = "Login";
    } else {
        modalTitle.innerText = "Welcome Back";
        toggleAuth.innerText = "Sign Up";
    }
};

// Help
const helpBtn = document.getElementById("help-btn");
const helpModal = document.getElementById("help-modal");
const closeHelp = document.querySelector(".close-help");

helpBtn.onclick = () => helpModal.style.display = "flex";
closeHelp.onclick = () => helpModal.style.display = "none";

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target == authModal) authModal.style.display = "none";
    if (event.target == helpModal) helpModal.style.display = "none";
};
