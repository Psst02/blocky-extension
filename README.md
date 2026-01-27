# Blocky

Blocky is a Chrome extension built with Manifest V3 that implements a modular content-blocking system using Chrome’s `declarativeNetRequest` API.

This project is a personal engineering exercise focused on:
- browser extension architecture
- rule-based request blocking
- user-controlled preferences
- dynamic rule management

It is not intended as a consumer-facing product, but as a technical exploration and portfolio project.

---

## Project Goals

The main goals of this project are:
- Design a clean and minimal extension architecture
- Implement rule-based blocking using static and dynamic rules
- Provide a simple UI for managing user preferences
- Support user-defined whitelist and blacklist logic
- Explore Chrome’s modern extension APIs (MV3)

---

## Architecture Overview

Blocky is structured around four main components:

### 1. Popup UI (`popup.html`, `popup.js`)
Responsible for:
- rendering the user interface
- handling user input
- updating preferences and lists in `chrome.storage`

### 2. Background Service Worker (`background.js`)
Responsible for:
- enabling/disabling static rulesets
- generating and managing dynamic rules
- syncing Chrome storage with network rules

### 3. Rulesets (`rulesets/*.json`)
Static blocking rules generated from external and community-maintained Adblock Plus (ABP) filter lists, including:
- [EasyList](https://easylist.to/)
- [uBlock Origin badware](https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt)
- [Spam404](https://raw.githubusercontent.com/Spam404/lists/master/main-blacklist.txt)
and converted into Chrome-compatible rules using the `abp2dnr` npm module.

### 4. Filter List Updates (`update-lists.sh`)
To simplify maintenance and updates, a shell script is used to automate the ruleset generation process:
- downloading updated filter lists
- converting them into `declarativeNetRequest` rules
- outputting JSON rulesets ready for packaging

The script acts as a lightweight tooling layer around the rule pipeline, making it easier to refresh and maintain blocking logic over time.

It can be run via:
```bash
bash scripts/update-lists.sh
# OR
npm run update-lists
```

---

## Core Concepts

### Static Rules
Static rules are packaged with the extension and represent known blocking patterns, such as:
- ad domains
- tracking scripts
- annoyance resources
- redirect patterns

These are enabled or disabled via:
```js
chrome.declarativeNetRequest.updateEnabledRulesets()
```

### Dynamic Rules
Dynamic rules are generated at runtime from:
- user-defined whitelist
- user-defined blacklist

They are managed using:
```js
chrome.declarativeNetRequest.updateDynamicRules()
```

This allows:
- persistent user customization
- higher priority overrides
- runtime updates without rebuilding the extension

---

## Implemented Features

### Core Functionality
- Open extension popup
- Enable blocking by default
- Master enable / disable toggle
- Block known ad domains
- Block popup scripts
- Block tracking scripts

### Settings & Preferences
- Persist user preferences
- Whitelist specific URLs
- Remove URLs from whitelist
- View and manage whitelist
- Blacklist specific URLs
- Remove URLs from blacklist
- View and manage blacklist

### User Interface
- Display current blocking status
- Toggle categories (ads, trackers, annoyances, redirects, blacklist)
- Popup page navigation (home / edit / settings)
- Popover menu for list selection
- Search and filter user lists
- Add and remove URLs dynamically

### Rule Management
- Load static rules from configuration
- Enable / disable rulesets dynamically
- Generate dynamic rules from user input
- Whitelist has higher priority than blacklist

---

## Design Decisions

### Declarative over Imperative
Blocky uses `declarativeNetRequest` instead of request interception.

This means:
- better performance
- no request listeners
- Chrome-managed enforcement

### No Real-Time Request Logging
Chrome does not support real-time blocked request counts for production extensions. Debug APIs are intentionally excluded.

This project prioritizes:
- correctness
- stability
- architectural clarity
over live analytics.

### Dynamic Rule Ranges
Dynamic rules use separate ID ranges for:
- whitelist (allow rules)
- blacklist (block rules)
This avoids collisions and allows predictable rule management.

---

## Development Setup

This project is built as a local Chrome extension.

To load it in development:
1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select the project directory

---

## Future Work (Stretch Goals)

The following are planned updates for future refinement:
- Import public filter lists
- Per-site enable / disable

---

## Why This Project Exists

This project exists primarily to:
- understand Chrome MV3
- practice system-level UI + background coordination
- explore real-world state management in browser extensions
- build something non-trivial without a framework

It is designed as a learning and engineering artifact rather than a product.
