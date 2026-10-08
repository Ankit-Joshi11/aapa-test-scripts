# AAPA Test Scripts Repository

This repository contains automated test suites for AAPA platforms organized into distinct feature modules:

---

## 📁 Repository Structure

```text
aapa-test-scripts/
│
├── 🦅 hawk-search-sanity/            # Hawk Search Multi-Site Sanity Suite
│   ├── tests/
│   │   ├── specs/                   # Production & Staging test specs
│   │   │   ├── hawk-search.spec.js
│   │   │   └── hawk-search-staging.spec.js
│   │   ├── pages/                   # Page Object Models with error assertions
│   │   ├── reporters/               # Custom Executive HTML Dashboard
│   │   ├── config/                  # Multi-site definitions & categories
│   │   └── helpers/
│   ├── HAWK_SEARCH_TEST_SUITE_DOCUMENTATION.md # Architecture & assertions doc
│   ├── package.json
│   └── playwright.config.js
│
└── 🔄 prod-asg-refresh/              # Production ASG Refresh Validation Suite
    ├── scripts/
    │   └── Validate-Prod-ASG-Refresh.js
    ├── tests/
    │   └── Validate-Prod-ASG-Refresh.spec.js
    └── docs/
        └── Production_ASG_Refresh_doc.md
```

---

## 🚀 Quick Execution Guide

### 1. Hawk Search Sanity Suite (`hawk-search-sanity/`)
```bash
cd hawk-search-sanity

# Run Production Sites (5 live platforms)
npm test

# Run Staging Site (Buy Auto Parts Now)
npm run test:staging

# Open Executive Dashboard
npm run test:dashboard
```

### 2. Production ASG Refresh Validation (`prod-asg-refresh/`)
```bash
# Run ASG Refresh validation
npx playwright test prod-asg-refresh/tests/Validate-Prod-ASG-Refresh.spec.js
```
