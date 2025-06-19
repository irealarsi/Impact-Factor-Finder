# Impact Factor Finder – Chrome Extension

![Banner](./assets/banner.png)

**Impact Factor Finder** is a lightweight Chrome extension that automatically displays approximate journal impact factors next to each publication on Google Scholar profiles.

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
