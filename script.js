const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf"; // Keep your API Key secure in production
const weatherApi = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const forecastApi = "https://api.openweathermap.org/data/2.5/forecast?units=metric";

// DOM Elements
const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const loader = document.querySelector("#loader");
const weatherDiv = document.querySelector(".weather");
const errorDiv = document.querySelector(".error");
const forecastSection = document.querySelector("#forecast-section");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-toggle i");

let lastCity = "Mumbai";

// --- 1. Weather Function (Data Only) ---
async function checkWeather(city, lat = null, lon = null) {
    let url = lat 
        ? `${weatherApi}&lat=${lat}&lon=${lon}&appid=${apiKey}` 
        : `${weatherApi}&q=${city}&appid=${apiKey}`;
        
    let fUrl = lat 
        ? `${forecastApi}&lat=${lat}&lon=${lon}&appid=${apiKey}` 
        : `${forecastApi}&q=${city}&appid=${apiKey}`;

    try {
        loader.style.display = "block";
        weatherDiv.style.display = "none";
        errorDiv.style.display = "none";
        forecastSection.style.display = "none";

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("City not found");
        }
        
        const data = await response.json();
        lastCity = data.name;

        // Save preference if user is logged in
        if (window.auth && window.auth.currentUser) saveUserPref(lastCity);

        // Update UI Text
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
        // Update Weather Icon
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        // Fetch Forecast
        const fResponse = await fetch(fUrl);
        const fData = await fResponse.json();
        updateForecastUI(fData);

        loader.style.display = "none";
        weatherDiv.style.display = "block";
        forecastSection.style.display = "block";

    } catch (err) {
        console.error(err);
        loader.style.display = "none";
        errorDiv.style.display = "block";
    }
}

function updateForecastUI(fData) {
    const forecastEl = document.querySelector("#forecast");
    forecastEl.innerHTML = "";

    // Filter for 12:00 PM forecasts
    const dailyData = fData.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString("en", {weekday: 'short'});
        forecastEl.innerHTML += `
            <div class="forecast-item">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p><strong>${Math.round(day.main.temp)}°</strong></p>
            </div>`;
    });
}

// --- 2. Interactive Theme Toggle (Controls Video via CSS) ---
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Icon Logic
    if (document.body.classList.contains("dark-mode")) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
    }

    // Save Theme Preference
    if(window.auth && window.auth.currentUser) saveUserPref(lastCity);
});

// --- 3. User Preferences (Firebase) ---
async function saveUserPref(city) {
    if (!window.db || !window.auth.currentUser) return;
    try {
        const uid = window.auth.currentUser.uid;
        await window.dbSet(window.dbDoc(window.db, "users", uid), {
            savedCity: city,
            theme: document.body.classList.contains("dark-mode") ? "dark" : "light"
        }, { merge: true });
    } catch (e) { console.error("Save Error:", e); }
}

// --- 4. Event Listeners ---
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { 
    if(e.key === "Enter") checkWeather(searchBox.value); 
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (p) => checkWeather(null, p.coords.latitude, p.coords.longitude),
            () => alert("Geolocation denied or failed.")
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// --- 5. Auth & Initialization ---
window.addEventListener('load', () => {
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authActionBtn = document.getElementById('auth-action-btn');
    const googleBtn = document.getElementById('google-btn');
    const toggleAuth = document.getElementById('toggle-auth-mode');
    const closeModal = document.getElementById('close-modal');
    let isLoginMode = true;

    // Modal Controls
    loginBtn.addEventListener('click', () => authModal.style.display = 'block');
    closeModal.addEventListener('click', () => authModal.style.display = 'none');
    
    toggleAuth.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('modal-title').textContent = isLoginMode ? "Login" : "Sign Up";
        toggleAuth.textContent = isLoginMode ? "Need an account? Sign Up" : "Have an account? Login";
    });

    // Email/Pass Auth
    authActionBtn.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;

        if(!window.firebaseReady) {
            alert("Firebase is loading... please wait.");
            return;
        }

        try {
            if (isLoginMode) {
                await window.signIn(window.auth, email, pass);
                alert("Welcome back!");
            } else {
                const cred = await window.createUser(window.auth, email, pass);
                await window.dbSet(window.dbDoc(window.db, "users", cred.user.uid), {
                    savedCity: "Mumbai",
                    theme: "light"
                });
                alert("Account Created!");
            }
            authModal.style.display = 'none';
        } catch (error) {
            alert(error.message);
        }
    });

    // Google Auth
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await window.googleSignIn(window.auth, window.googleProvider);
            const user = result.user;
            
            // Merge prevents overwriting existing theme settings
            await window.dbSet(window.dbDoc(window.db, "users", user.uid), {
                email: user.email,
            }, { merge: true });

            alert(`Welcome, ${user.displayName}!`);
            authModal.style.display = 'none';
        } catch (error) {
            console.error(error);
            alert("Google Sign-In Error: " + error.message);
        }
    });

    // Check Login State (Waits for Firebase to be ready)
    const checkAuth = setInterval(() => {
        if (window.userState) {
            clearInterval(checkAuth);
            window.userState(window.auth, async (user) => {
                if (user) {
                    // User is Logged In
                    loginBtn.style.display = 'none';
                    logoutBtn.style.display = 'block';
                    document.getElementById('user-email').textContent = user.email ? user.email.split('@')[0] : "User";
                    
                    try {
                        const docSnap = await window.dbGet(window.dbDoc(window.db, "users", user.uid));
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            
                            // Apply Saved Theme
                            if (data.theme === 'dark') {
                                document.body.classList.add('dark-mode');
                                themeIcon.classList.remove("fa-moon");
                                themeIcon.classList.add("fa-sun");
                            } else {
                                document.body.classList.remove('dark-mode');
                                themeIcon.classList.remove("fa-sun");
                                themeIcon.classList.add("fa-moon");
                            }
                            
                            // Load Saved City
                            checkWeather(data.savedCity || "Mumbai");
                        }
                    } catch (e) { console.error("Error loading user data", e); }
                } else {
                    // User is Logged Out
                    loginBtn.style.display = 'block';
                    logoutBtn.style.display = 'none';
                    document.getElementById('user-email').textContent = "";
                    checkWeather("Mumbai"); // Default city
                }
            });
        }
    }, 500);

    logoutBtn.addEventListener('click', async () => {
        await window.logout(window.auth);
        location.reload();
    });
});
