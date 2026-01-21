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
      ? 'Ad blocking is <strong>ON</strong>'
      : 'Ad blocking is <strong>OFF</strong>';
}