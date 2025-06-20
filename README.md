# Impact Factor Finder – Chrome Extension
**Impact Factor Finder** is a lightweight Chrome extension that automatically displays approximate journal impact factors next to each publication on Google Scholar profiles.

[(./assets/chrome-extension.png)](https://chromewebstore.google.com/detail/impact-factor-finder/damonelhcfhpjhgnikakjpjinakfejhe?authuser=0&hl=en-GB)


![Banner](./assets/Banner.png)


## 🔍 Features

- Displays Impact Factor (IF) next to journal names in Google Scholar profiles
- Uses a local, static CSV dataset (2025 edition)
- Fully offline – no API calls or tracking
- No login or configuration needed
- Works instantly upon installation

## 🧠 How It Works

This extension injects a content script into Google Scholar profile pages. Using a locally stored journal metrics CSV file, it matches journal names and appends the corresponding impact factor value inline on the page.

## 📦 Files

- `manifest.json` – Chrome extension config
- `content.js` – Main script that injects IFs
- `data/journal_impact_2024.csv` – Local lookup file
- `icon16/48/128.png` – Extension icons
- `privacy.md` – Privacy policy

## 🔐 Privacy

This extension does **not collect**, store, or share any user data. All operations are performed entirely within your browser.

See [`privacy.md`](./privacy.md) for full policy.

## 🚀 Installation (Manual)

1. Download this repository
2. Go to `chrome://extensions` in your browser
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the folder you downloaded

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## Technology Stack 🛠️

| Layer           | Details                                                                 |
|-----------------|-------------------------------------------------------------------------|
| Language        | JavaScript (ES6)                                                        |
| Platform        | Chrome Extension APIs (`chrome.runtime`, `chrome.storage`, `content_s...|
| Data Sources    | Manually compiled CSV of journal metrics (public data, static file)     |
| Algorithms      | DOM manipulation • String matching • Title normalization                |
| Icon Handling   | Local PNG icons (16x16, 48x48, 128x128)                                 |
| Data Storage    | Local CSV file accessed via `chrome.runtime.getURL()`                   |
| Privacy         | Fully local processing, no data collection                              |


## 📢 Disclaimer 📝

The Impact Factor Finder extension provides approximate journal impact values based on public datasets and heuristic algorithms. Please note the following:

- 📊 **Data Sources**: The journal metrics used are compiled from publicly available academic datasets and third-party repositories, not from proprietary databases like Clarivate’s JCR.
- 🧠 **Heuristic Matching**: Journal titles are matched using string similarity and normalization algorithms, which may occasionally result in mismatches.
- ⏳ **Update Frequency**: The dataset may not always reflect the most recent updates or indexing changes in real-time.
- ⚠️ **Accuracy Notice**: Displayed impact factors are estimates and may not match official values exactly.
- ✅ **Usage Guidance**: This tool is intended as a **quick reference** and supplementary aid for researchers, not a definitive or authoritative source of journal rankings.

We recommend using this extension in conjunction with trusted academic databases for informed publication decisions or evaluations.

