const DEFAULT_PREFS = {
    master: true,
    ads: true,
    trackers: true,
    annoyances: true,
    redirects: true,
    blacklist: true
};

const RULE_RANGES = {
    whitelist: { start: 5001, priority: 2000, action: "allow" },
    blacklist: { start: 1, priority: 1000, action: "block" }
};
const DYNAMIC_CAPACITY = 5000;

// ASYNC GUARD, NO RACE CONDITION
let dynamicRuleQueue = Promise.resolve();

function queueDynamicUpdate(fn) {
    dynamicRuleQueue = dynamicRuleQueue.then(fn);
    return dynamicRuleQueue;
}

// INIT
chrome.storage.local.get("preferences").then(({ preferences }) => {
    const prefs = Object.assign({}, DEFAULT_PREFS, preferences);
    applyPreferences(prefs);
    queueDynamicUpdate(() => syncDynamicList("whitelist"));  // Always ON
});

// STORAGE LISTENER
chrome.storage.onChanged.addListener(async changes => {
    // Toggle changes
    if (changes.preferences) {
        const prefs = Object.assign({}, DEFAULT_PREFS, changes.preferences.newValue);
        applyPreferences(prefs);
    }

    // User input URL
    if (changes.whitelist) {
        queueDynamicUpdate(() => syncDynamicList("whitelist"));
    }
    if (changes.blacklist) {
        const { preferences } = await chrome.storage.local.get("preferences");
        if (preferences?.master && preferences?.blacklist) {
            queueDynamicUpdate(() => syncDynamicList("blacklist"));
        }
    }
});

// CORE LOGIC (ENBALE / DISABLE RELEVANT RULESETS & DYNAMIC RULES)
async function applyPreferences(prefs) {
    // Main switch OFF
    if (!prefs.master) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: [],
            disableRulesetIds: ["ads", "trackers", "annoyances", "redirects"]
        });
        queueDynamicUpdate(() => clearDynamicRules("blacklist"));
        return;
    }

    // Main switch ON (Static rules)
    const enabled = [];
    const disabled = [];

    ["ads", "trackers", "annoyances", "redirects"].forEach(key => {
        (prefs[key] ? enabled : disabled).push(key);
    });

    await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled,
        disableRulesetIds: disabled
    });

    // Main switch ON (Dynamic rules)
    if (prefs.blacklist) {
        queueDynamicUpdate(() => syncDynamicList("blacklist"));
    } else {
        queueDynamicUpdate(() => clearDynamicRules("blacklist"));
    }
}

// GENERATE DYNAMIC RULES
async function syncDynamicList(type) {
    const { whitelist = [], blacklist = [] } =
        await chrome.storage.local.get(["whitelist", "blacklist"]);

    // Filter URL overlaps if any
    const list = type === "whitelist"
        ? whitelist
        : blacklist.filter(url => !whitelist.includes(url));

    const { start, priority, action } = RULE_RANGES[type];

    const rules = list.map((url, i) => ({
        id: start + i,
        priority: priority,
        action: { type: action },
        condition: { urlFilter: url }
    }));

    // Overwrite (Clear & Add)
    await clearDynamicRules(type);
    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
    });
}

async function clearDynamicRules(type) {
    const { start } = RULE_RANGES[type];
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const idsToRemove = existing
        .filter(r => r.id >= start && r.id < start + DYNAMIC_CAPACITY)
        .map(r => r.id);

    if (idsToRemove.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: idsToRemove
        });
    }
}
