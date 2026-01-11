const apiKey = "f86a031b7d83efe3ba8c9b41060f4baf";
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
const favBtn = document.querySelector("#fav-btn"); // The new Heart Button
const citySuggestions = document.querySelector("#city-suggestions");

// State Variables
let currentCity = "";
let savedCities = []; // Array to store multiple cities

// --- 1. Weather Function ---
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
        if (!response.ok) throw new Error("City not found");
        
        const data = await response.json();
        currentCity = data.name; // Store clean name (e.g., "London")

        // Update UI
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        // Update Heart Icon State
        updateHeartIcon();

        // Forecast
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

// --- 2. Favorites Logic (Heart Button) ---
function updateHeartIcon() {
    // Check if the current city is in the saved list
    if (savedCities.includes(currentCity)) {
        favBtn.classList.remove("fa-regular");
        favBtn.classList.add("fa-solid"); // Solid Heart
        favBtn.style.color = "#ff4757";   // Red Color
    } else {
        favBtn.classList.remove("fa-solid");
        favBtn.classList.add("fa-regular"); // Outline Heart
        favBtn.style.color = "inherit";     // Default Color
    }
}

favBtn.addEventListener("click", async () => {
    if (!window.auth || !window.auth.currentUser) {
        alert("Please login to save cities!");
        return;
    }

    if (savedCities.includes(currentCity)) {
        // Remove from list
        savedCities = savedCities.filter(c => c !== currentCity);
    } else {
        // Add to list
        savedCities.push(currentCity);
    }

    // Update UI immediately
    updateHeartIcon();
    updateSuggestions();

    // Save to Firebase
    try {
        const uid = window.auth.currentUser.uid;
        await window.dbSet(window.dbDoc(window.db, "users", uid), {
            savedCities: savedCities
        }, { merge: true });
    } catch (e) {
        console.error("Error saving favorites:", e);
        alert("Failed to save. Check console.");
    }
});

function updateSuggestions() {
    // Clear existing options
    citySuggestions.innerHTML = "";
    // Add saved cities to the autocomplete list
    savedCities.forEach(city => {
        let option = document.createElement("option");
        option.value = city;
        option.innerText = "❤️ Saved"; // Adds a visual cue
        citySuggestions.appendChild(option);
    });
    // Add standard major cities
    const defaults = ["Mumbai", "Delhi", "New York", "London", "Tokyo"];
    defaults.forEach(city => {
        if (!savedCities.includes(city)) { // Don't duplicate
            let option = document.createElement("option");
            option.value = city;
            citySuggestions.appendChild(option);
        }
    });
}

// --- 3. Theme Toggle ---
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
    }
    // Save preference
    if(window.auth && window.auth.currentUser) {
        const uid = window.auth.currentUser.uid;
        window.dbSet(window.dbDoc(window.db, "users", uid), {
            theme: document.body.classList.contains("dark-mode") ? "dark" : "light"
        }, { merge: true });
    }
});

// --- 4. Event Listeners ---
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { 
    if(e.key === "Enter") checkWeather(searchBox.value); 
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (p) => checkWeather(null, p.coords.latitude, p.coords.longitude),
            () => alert("Geolocation denied.")
        );
    } else {
        alert("Geolocation not supported.");
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

    // Open/Close Modal
    loginBtn.addEventListener('click', () => authModal.style.display = 'block');
    closeModal.addEventListener('click', () => authModal.style.display = 'none');
    
    // Toggle Login/Signup Mode
    toggleAuth.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('modal-title').textContent = isLoginMode ? "Login" : "Sign Up";
        toggleAuth.textContent = isLoginMode ? "Need an account? Sign Up" : "Have an account? Login";
    });

    // Email/Pass Auth Action
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
                // Initialize empty favorites for new user
                await window.dbSet(window.dbDoc(window.db, "users", cred.user.uid), {
                    savedCities: [],
                    theme: "light"
                });
                alert("Account Created Successfully!");
            }
            // CLOSE DIALOG BOX (This runs for both Login and Signup)
            authModal.style.display = 'none';

        } catch (error) {
            alert(error.message);
        }
    });

    // Google Auth
    googleBtn.addEventListener('click', async () => {
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

        try {
            const result = await window.googleSignIn(window.auth, window.googleProvider);
            const user = result.user;
            
            // Only update email, don't overwrite existing cities
            await window.dbSet(window.dbDoc(window.db, "users", user.uid), {
                email: user.email,
            }, { merge: true });

            alert(`Welcome, ${user.displayName}!`);
            authModal.style.display = 'none';
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                console.error(error);
                alert("Google Sign-In Error: " + error.message);
            }
        } finally {
            googleBtn.disabled = false;
            googleBtn.innerHTML = '<i class="fa-brands fa-google"></i> Sign in with Google';
        }
    });

    // Check Login State & Load Data
    const checkAuth = setInterval(() => {
        if (window.userState) {
            clearInterval(checkAuth);
            window.userState(window.auth, async (user) => {
                if (user) {
                    // Logged In
                    loginBtn.style.display = 'none';
                    logoutBtn.style.display = 'block';
                    document.getElementById('user-email').textContent = user.email ? user.email.split('@')[0] : "User";
                    
                    try {
                        const docSnap = await window.dbGet(window.dbDoc(window.db, "users", user.uid));
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            
                            // Load Theme
                            if (data.theme === 'dark') {
                                document.body.classList.add('dark-mode');
                                themeIcon.classList.remove("fa-moon");
                                themeIcon.classList.add("fa-sun");
                            }

                            // Load Saved Cities
                            if (data.savedCities && Array.isArray(data.savedCities)) {
                                savedCities = data.savedCities;
                                updateSuggestions();
                                
                                // Load the LAST saved city if no city is currently shown
                                if (savedCities.length > 0 && currentCity === "") {
                                    checkWeather(savedCities[savedCities.length - 1]);
                                }
                            }
                        }
                    } catch (e) { console.error("Error loading user data", e); }
                } else {
                    // Logged Out
                    loginBtn.style.display = 'block';
                    logoutBtn.style.display = 'none';
                    document.getElementById('user-email').textContent = "";
                    savedCities = []; // Clear local favorites
                    updateSuggestions();
                }
            });
        }
    }, 500);

    logoutBtn.addEventListener('click', async () => {
        await window.logout(window.auth);
        location.reload();
    });
});
