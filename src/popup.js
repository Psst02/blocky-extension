const DEFAULT_PREFS = {
    master: true,
    ads: true,
    trackers: true,
    annoyances: true,
    redirects: true,
    blacklist: true
};

const toggleSwitches = document.querySelectorAll('input[type="checkbox"]');
const statusText = document.getElementById("status");

async function loadPreferences() {
    const { preferences } = await chrome.storage.local.get("preferences");
    const prefs = Object.assign({}, DEFAULT_PREFS, preferences);

    toggleSwitches.forEach(toggle => {
        const key = toggle.dataset.key;
        toggle.checked = prefs[key];
    });

    updateStatus(prefs.master);
    return prefs;
}

loadPreferences();  // User Prefs init

async function savePreference(key, value) {
    const { preferences } = await chrome.storage.local.get("preferences");
    const newPrefs = Object.assign({}, DEFAULT_PREFS, preferences, {
        [key]: value
    });
    await chrome.storage.local.set({ preferences: newPrefs });
}

function updateStatus(isEnabled) {
    statusText.innerHTML = isEnabled
      ? 'Blocking is <strong>ON</strong>'
      : 'Blocking is <strong>OFF</strong>';
}

// User Prefs toggle UI logic
toggleSwitches.forEach(toggle => {
    toggle.addEventListener("change", (e) => {
        const key = e.target.dataset.key;
        const value = e.target.checked;
        savePreference(key, value);

        if (key === "master") {
            updateStatus(value);
        }
    });
});

// "Page" Transition Logic
const slider = document.querySelector(".view-slider");

document.getElementById("home-btn").onclick = () => {
    slider.style.transform = "translateX(-100%)";
};

document.getElementById("edit-btn").onclick = () => {
    slider.style.transform = "translateX(0%)";
};

document.getElementById("settings-btn").onclick = () => {
    slider.style.transform = "translateX(-200%)";
};
