const toggleSwitch = document.querySelector('input[type="checkbox"]');
const statusText = document.getElementById("status");

toggleSwitch.addEventListener("change", (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ blockingEnabled: isEnabled });
    updateStatus(isEnabled);
});

chrome.storage.local.get(["blockingEnabled"]).then((result) => {
    const isEnabled = result.blockingEnabled ?? true;
    toggleSwitch.checked = isEnabled;
    updateStatus(isEnabled);
});

function updateStatus(isEnabled) {
    statusText.innerHTML = isEnabled
      ? 'Blocking is <strong>ON</strong>'
      : 'Blocking is <strong>OFF</strong>';
}

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