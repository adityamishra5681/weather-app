// --- CONFIGURATION ---
const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf";
const weatherApi = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const forecastApi = "https://api.openweathermap.org/data/2.5/forecast?units=metric";

// --- DOM ELEMENTS ---
const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const loader = document.querySelector("#loader");
const weatherDiv = document.querySelector(".weather");
const errorDiv = document.querySelector(".error");
const forecastSection = document.querySelector("#forecast-section");

let lastCity = "Mumbai";

// --- 1. WEATHER FUNCTIONS ---

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

        // SAVE TO FIREBASE IF LOGGED IN
        if (window.auth && window.auth.currentUser) {
            saveUserPref(lastCity);
        }

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        const fResponse = await fetch(fUrl);
        const fData = await fResponse.json();
        const forecastEl = document.querySelector("#forecast");
        forecastEl.innerHTML = "";

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
        searchBox.blur();
    } catch (err) {
        console.error(err);
        loader.style.display = "none";
        errorDiv.style.display = "block";
    }
}

async function saveUserPref(city) {
    if (!window.dbSet || !window.dbDoc || !window.db) return;
    try {
        const uid = window.auth.currentUser.uid;
        await window.dbSet(window.dbDoc(window.db, "users", uid), {
            savedCity: city,
            theme: document.body.classList.contains("dark-mode") ? "dark" : "light"
        }, { merge: true });
    } catch (e) {
        console.error("Save Error:", e);
    }
}

// --- 2. BASIC EVENT LISTENERS ---

searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { if(e.key === "Enter") checkWeather(searchBox.value); });
locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(p => checkWeather(null, p.coords.latitude, p.coords.longitude));
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = document.querySelector("#theme-toggle i");
    
    if(document.body.classList.contains("dark-mode")){
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }

    if(window.auth && window.auth.currentUser) saveUserPref(lastCity);
});

// --- 3. LOGIN / AUTHENTICATION LOGIC (CRITICAL PART) ---

// We use window.onload to ensure HTML is ready before we look for the buttons
window.addEventListener('load', () => {
    console.log("Page Loaded - Setting up Login Listeners...");

    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authActionBtn = document.getElementById('auth-action-btn');
    const toggleAuth = document.getElementById('toggle-auth-mode');
    const closeModal = document.getElementById('close-modal');

    let isLoginMode = true;

    // DEBUG: Check if button exists
    if (!loginBtn) {
        console.error("CRITICAL ERROR: Login Button NOT found in HTML");
        return;
    }

    // 1. OPEN MODAL
    loginBtn.addEventListener('click', () => {
        console.log("Login Button Clicked!"); // Check Console for this
        authModal.style.display = 'block';
    });

    // 2. CLOSE MODAL
    closeModal.addEventListener('click', () => authModal.style.display = 'none');

    // 3. TOGGLE SIGNUP/LOGIN
    toggleAuth.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('modal-title').textContent = isLoginMode ? "Login" : "Sign Up";
        toggleAuth.textContent = isLoginMode ? "Need an account? Sign Up" : "Have an account? Login";
    });

    // 4. SUBMIT FORM
    authActionBtn.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;

        try {
            if (isLoginMode) {
                await window.signIn(window.auth, email, pass);
                alert("Login Success!");
            } else {
                const cred = await window.createUser(window.auth, email, pass);
                // Initialize User Data
                await window.dbSet(window.dbDoc(window.db, "users", cred.user.uid), {
                    savedCity: "Mumbai",
                    theme: "light"
                });
                alert("Account Created!");
            }
            authModal.style.display = 'none';
        } catch (error) {
            alert("Error: " + error.message);
        }
    });

    // 5. LISTEN FOR USER STATE (Login/Logout)
    // We need to wait for Firebase to define 'window.userState'
    const waitForFirebase = setInterval(() => {
        if (window.userState) {
            clearInterval(waitForFirebase);
            window.userState(window.auth, async (user) => {
                if (user) {
                    loginBtn.style.display = 'none';
                    logoutBtn.style.display = 'block';
                    document.getElementById('user-email').textContent = user.email.split('@')[0];

                    // Load User Settings
                    try {
                        const docSnap = await window.dbGet(window.dbDoc(window.db, "users", user.uid));
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            if (data.theme === 'dark' && !document.body.classList.contains('dark-mode')) {
                                document.querySelector("#theme-toggle").click();
                            }
                            checkWeather(data.savedCity || "Mumbai");
