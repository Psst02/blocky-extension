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

let currentEditType = "Whitelist";

document.querySelectorAll('button[role="menuitem"]').forEach(btn => {
    btn.addEventListener("click", (e) => {
        // Validate type
        currentEditType = e.target.textContent.trim();
        const key = currentEditType.toLowerCase();
        if (!["whitelist", "blacklist"].includes(key)) return;

        slider.style.transform = "translateX(0%)";
        renderEditView(currentEditType);
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

document.addEventListener("click", (e) => {  // Click Outside
    if (!menu.contains(e.target) && !editBtn.contains(e.target)) {
        menu.classList.remove("show");
        editBtn.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
    }
});

// RENDER WHITELIST / BLACKLIST ACCORDINGLY
async function renderEditView(type, filter='') {
    const editSection = document.getElementById("view-edit");
    const title = editSection.querySelector("header > h1");
    const description = editSection.querySelector("header > p");

    // Clear previous content
    editSection.querySelectorAll("ul, .empty-state").forEach(e => e.remove());

    title.textContent = type;
    description.textContent =
        type === "Whitelist"
          ? "Add / Remove sites as exceptions"
          : "Add / Remove blocked sites";

    const key = type.toLowerCase();
    const result = await chrome.storage.local.get(key);
    let list = result[key] || [];

    // Filter url if specified
    if (filter) {
        list = list.filter(url =>
            url.toLowerCase().includes(filter.toLowerCase())
        );
    }

    // No results
    if (list.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Add your custom URL";
        p.className = "empty-state fade-text";
        editSection.appendChild(p);
        return;
    }

    // Build list otherwise
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

// LET USER ADD / SEARCH URL
const urlInput = document.getElementById("url-input");

urlInput.addEventListener("change", (e) => {
    if (e.target.value.trim() === '') renderEditView(currentEditType);
});

document.getElementById("add-btn").onclick = async () => {
    const value = urlInput.value.trim();
    if (!value) return;

    const key = currentEditType.toLowerCase();
    const result = await chrome.storage.local.get(key);
    const list = result[key] || [];

    // Add only if no duplicate
    if (!list.includes(value)) {
        list.push(value);
        await chrome.storage.local.set({ [key]: list });  // Ensure key isn't "key"
    }
    urlInput.value = '';
    renderEditView(currentEditType);
};

document.getElementById("search-btn").onclick = () => {
    const query = urlInput.value.trim();
    renderEditView(currentEditType, query);
};

// LET USER REMOVE FROM LIST
