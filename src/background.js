chrome.storage.local.get(["blockingEnabled"]).then((result) => {
    const isEnabled = result.blockingEnabled ?? true;
    setRulesetState(isEnabled);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockingEnabled) {
        setRulesetState(changes.blockingEnabled.newValue);
    }
});

function setRulesetState(isEnabled) {
    chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: isEnabled ? ["ads", "trackers", "annoyances"] : [],
        disableRulesetIds: isEnabled ? [] : ["ads", "trackers", "annoyances"]
    });
}