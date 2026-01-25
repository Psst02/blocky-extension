const DEFAULT_PREFS = {
    master: true,
    ads: true,
    trackers: true,
    annoyances: true,
    redirects: true,
    blacklist: true
};

// USER PREFS INIT
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

loadPreferences();

// UPDATE USER PREFS UPON CHANGES
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

// PAGE SWIPE ANIMATION TRANSITION
const slider = document.querySelector(".view-slider");

document.getElementById("home-btn").onclick = () => {
    slider.style.transform = "translateX(-100%)";
};

document.getElementById("settings-btn").onclick = () => {
    slider.style.transform = "translateX(-200%)";
};

document.querySelectorAll('button[role="menuitem"]').forEach(btn => {
    btn.addEventListener("click", (e) => {
        const option = e.target.textContent.trim();
        slider.style.transform = "translateX(0%)";
        renderEditView(option);
    });
});


// SMALL POPOVER MENU LOGIC
const editBtn = document.getElementById("edit-btn");
const menu = document.getElementById("my-menu");

editBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent immediate close
    const isOpen = menu.classList.toggle("show");

    editBtn.setAttribute("aria-expanded", isOpen);
    menu.setAttribute("aria-hidden", !isOpen);
});

document.addEventListener("click", (e) => {  // CLICK OUTSIDE
    if (!menu.contains(e.target) && !editBtn.contains(e.target)) {
        menu.classList.remove("show");
        editBtn.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
    }
});

// RENDER WHITELIST / BLACKLIST ACCORDINGLY
async function renderEditView(type) {
    const editSection = document.getElementById("view-edit");
    const titleEl = editSection.querySelector("header > h1");
    const descEl = editSection.querySelector("header > p");

    // Clear old list/content
    const oldList = editSection.querySelector("ul");
    if (oldList) oldList.remove();

    const oldEmpty = editSection.querySelector(".empty-state");
    if (oldEmpty) oldEmpty.remove();

    let storageKey;
    let description;

    switch (type) {
        case "Whitelist":
            storageKey = "whitelist";
            description = "Add / Remove sites as exceptions";
            break;
        case "Blacklist":
            storageKey = "blacklist";
            description = "Add / Remove sites to always block";
            break;
    }
    titleEl.textContent = type;
    descEl.textContent = description;

    const result = await chrome.storage.local.get(storageKey);
    const list = result[storageKey] || [];

    // Empty state
    if (list.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Add your custom URL";
        p.className = "empty-state";
        editSection.appendChild(p);
        return;
    }

    // Build list
    const ul = document.createElement("ul");
    list.forEach(url => {
        const li = document.createElement("li");
        li.className = "ul-items";

        li.innerHTML = `
            <p>${url}</p>
            <button
              id="remove-btn"
              class="icon-btn"
              aria-label="Remove ${url}"
              title="Remove URL"
            >
            <span class="material-icons">remove_circle</span>
            </button>
        `;
        ul.appendChild(li);
    });
    editSection.appendChild(ul);
}