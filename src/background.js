const DEFAULT_PREFS = {
    master: true,
    ads: true,
    trackers: true,
    annoyances: true,
    redirects: true,
    blacklist: true
};

chrome.storage.local.get("preferences").then(({ preferences }) => {
    const prefs = Object.assign({}, DEFAULT_PREFS, preferences);
    applyRules(prefs);
});

chrome.storage.onChanged.addListener(changes => {
    if (changes.preferences) {
        const prefs = Object.assign(DEFAULT_PREFS, changes.preferences.newValue);
        applyRules(prefs);
    }
});

function applyRules(prefs) {
    if (!prefs.master) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: [],
            disableRulesetIds: [
                "ads",
                "trackers",
                "annoyances",
                "redirects",
                "blacklist"
            ]
        });
        return;
    }

    const enabled = [];
    const disabled = [];

    ["ads", "trackers", "annoyances", "redirects", "blacklist"].forEach(key => {
        if (prefs[key]) enabled.push(key);
        else disabled.push(key);
    });

    chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled,
        disableRulesetIds: disabled
    });
}
