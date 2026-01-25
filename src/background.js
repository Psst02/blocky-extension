const DEFAULT_PREFS = {
    master: true,
    ads: true,
    trackers: true,
    annoyances: true,
    redirects: true,
    blacklist: true
};

chrome.storage.local.get(["preferences", "whitelist", "blacklist"])
    .then(({ preferences, whitelist, blacklist }) => {
        const prefs = Object.assign({}, DEFAULT_PREFS, preferences);
        applyRules(prefs);
        applyUserLists({ whitelist, blacklist }, prefs);
    });

chrome.storage.onChanged.addListener(changes => {
    if (changes.preferences) {
        const prefs = Object.assign(DEFAULT_PREFS, changes.preferences.newValue);
        if (prefs.blacklist) applyUserLists({ whitelist });
        applyRules(prefs);
    }
    else if (changes.whitelist || changes.blacklist) {}
});

function applyRules(prefs) {
    if (!prefs.master) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: [],
            disableRulesetIds: ["ads", "trackers", "annoyances", "redirects"]
        });
        return;
    }

    const enabled = [];
    const disabled = [];

    ["ads", "trackers", "annoyances", "redirects"].forEach(key => {
        if (prefs[key]) enabled.push(key);
        else disabled.push(key);
    });

    chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled,
        disableRulesetIds: disabled
    });
}

async function applyUserLists({ whitelist = [], blacklist = [] }, prefs) {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();

    // Define range
    const oldIds = existing
        .filter(r => r.id >= 1 && r.id < 5000)
        .map(r => r.id);

    const rules = [];

    // Whitelist (always allow, highest priority)
    whitelist.forEach((url, i) => {
        rules.push({
            id: 1 + i,
            priority: 2000,
            action: { type: "allow" },
            condition: { urlFilter: url }
        });
    });

    // Blacklist (only if toggle is on)
    if (prefs.blacklist) {
        blacklist.forEach((url, i) => {
            rules.push({
                id: 2500 + i,
                priority: 1000,
                action: { type: "block" },
                condition: { urlFilter: url }
            });
        });
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldIds,
        addRules: rules
    });
}

