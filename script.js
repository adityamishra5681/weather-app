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
const favBtn = document.querySelector("#fav-btn");
const citySuggestions = document.querySelector("#city-suggestions");

let currentCity = "";
let savedCities = []; 

// --- Helper: Auto-Capitalize City Name ---
function capitalizeCity(str) {
    if (!str) return "";
    return str.trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// --- 1. Weather Function ---
async function checkWeather(city, lat = null, lon = null) {
    if (city) city = capitalizeCity(city);

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
        currentCity = data.name; 

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        updateHeartIcon();
        
        const fResponse = await fetch(fUrl);
        const fData = await fResponse.json();
        updateForecastUI(fData);

        weatherDiv.style.display = "block";
        forecastSection.style.display = "block";

    } catch (err) {
        console.error(err);
        errorDiv.style.display = "block";
    } finally {
        loader.style.display = "none";
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

// --- 2. Favorites Logic ---
function updateHeartIcon() {
    if (savedCities.includes(currentCity)) {
        favBtn.classList.remove("fa-regular");
        favBtn.classList.add("fa-solid"); 
        favBtn.style.color = "#ff4757";   
    } else {
        favBtn.classList.remove("fa-solid");
        favBtn.classList.add("fa-regular"); 
        favBtn.style.color = "inherit";     
    }
}

favBtn.addEventListener("click", async () => {
    if (!window.auth || !window.auth.currentUser) {
        alert("Please login to save cities!");
        return;
    }

    if (savedCities.includes(currentCity)) {
        savedCities = savedCities.filter(c => c !== currentCity);
    } else {
        savedCities.push(currentCity);
    }

    updateHeartIcon();
    updateSuggestions();

    try {
        const uid = window.auth.currentUser.uid;
        await window.dbSet(window.dbDoc(window.db, "users", uid), {
            savedCities: savedCities
        }, { merge: true });
    } catch (e) {
        console.error("Error saving:", e);
    }
});

function updateSuggestions() {
    citySuggestions.innerHTML = "";
    
    savedCities.forEach(city => {
        let option = document.createElement("option");
        option.value = city;
        option.label = "❤️ Saved"; 
        citySuggestions.appendChild(option);
    });

    const defaults = ["Mumbai", "Delhi", "New York", "London", "Tokyo", "Paris", "Berlin"];
    defaults.forEach(city => {
        if (!savedCities.includes(city)) {
            let option = document.createElement("option");
            option.value = city;
            citySuggestions.appendChild(option);
        }
    });
}

// --- 3. Event Listeners ---
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

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
    }
    
    if(window.auth && window.auth.currentUser) {
        const uid = window.auth.currentUser.uid;
        window.dbSet(window.dbDoc(window.db, "users", uid), {
            theme: document.body.classList.contains("dark-mode") ? "dark" : "light"
        }, { merge: true });
    }
});

// --- 4. Auth & Initialization ---
window.addEventListener('load', () => {
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authActionBtn = document.getElementById('auth-action-btn');
    const googleBtn = document.getElementById('google-btn');
    const toggleAuth = document.getElementById('toggle-auth-mode');
    const closeModal = document.getElementById('close-modal');
    let isLoginMode = true;

    loginBtn.addEventListener('click', () => authModal.style.display = 'block');
    closeModal.addEventListener('click', () => authModal.style.display = 'none');
    
    toggleAuth.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('modal-title').textContent = isLoginMode ? "Login" : "Sign Up";
        toggleAuth.textContent = isLoginMode ? "Need an account? Sign Up" : "Have an account? Login";
    });

    authActionBtn.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;

        if(!window.firebaseReady) {
            alert("Firebase is loading...");
            return;
        }

        try {
            if (isLoginMode) {
                await window.signIn(window.auth, email, pass);
                alert("Welcome back!");
            } else {
                const cred = await window.createUser(window.auth, email, pass);
                await window.dbSet(window.dbDoc(window.db, "users", cred.user.uid), {
                    savedCities: [],
                    theme: "light"
                });
                alert("Account Created!");
            }
            authModal.style.display = 'none';

        } catch (error) {
            alert(error.message);
        }
    });

    googleBtn.addEventListener('click', async () => {
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

        try {
            const result = await window.googleSignIn(window.auth, window.googleProvider);
            const user = result.user;
            
            await window.dbSet(window.dbDoc(window.db, "users", user.uid), {
                email: user.email,
            }, { merge: true });

            alert(`Welcome, ${user.displayName}!`);
            authModal.style.display = 'none'; 
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                console.error(error);
                alert("Error: " + error.message);
            }
        } finally {
            googleBtn.disabled = false;
            googleBtn.innerHTML = '<i class="fa-brands fa-google"></i> Sign in with Google';
        }
    });

    const checkAuth = setInterval(() => {
        if (window.userState) {
            clearInterval(checkAuth);
            window.userState(window.auth, async (user) => {
                if (user) {
                    loginBtn.style.display = 'none';
                    logoutBtn.style.display = 'block';
                    document.getElementById('user-email').textContent = user.email ? user.email.split('@')[0] : "User";
                    
                    try {
                        const docSnap = await window.dbGet(window.dbDoc(window.db, "users", user.uid));
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            
                            if (data.theme === 'dark') {
                                document.body.classList.add('dark-mode');
                                themeIcon.classList.remove("fa-moon");
                                themeIcon.classList.add("fa-sun");
                            }

                            if (data.savedCities && Array.isArray(data.savedCities)) {
                                savedCities = data.savedCities;
                                updateSuggestions();
                                
                                if (currentCity === "" && savedCities.length > 0) {
                                    checkWeather(savedCities[0]);
                                }
                            }
                        }
                    } catch (e) { console.error("Error loading user data", e); }
                } else {
                    loginBtn.style.display = 'block';
                    logoutBtn.style.display = 'none';
                    document.getElementById('user-email').textContent = "";
                    savedCities = [];
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
