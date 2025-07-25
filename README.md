# Futuristic Dashboard

A sleek, interactive dashboard built with pure vanilla JavaScript, HTML, and CSS. This project offers visually engaging widgets, animated stars, and dynamic UI elements, backed by a Node.js server for live API integration.

---

## Features

### Central Launch Button

* Triggers full UI transformation
* Expands widgets outward in an animated sequence

### Dynamic Widgets

* ** News Widget**: Fetches live top headlines from NewsAPI and displays them in floating, animated cards
* ** Crypto Widget**: Displays real-time cryptocurrency prices and charts from CoinGecko in glowing data cards

### Animations & UI

* Expanding/retracting starburst effects
* Floating neon-glow widget cards
* Responsive transitions between states

---

## Upcoming Features

* ** Planetary Orbits for Widgets**
  Widgets will smoothly rotate around the central button like celestial bodies

* ** Weather Widget**
  Real-time weather with animated iconography and location-based data

* ** More Widgets**
  Calendar, tasks, social feeds, and other modular add-ons

* ** Themes**
  Full support for theme toggling (dark, synthwave, neon, etc.)

---

## Tech Stack

* **JavaScript** (ES6+)
* **HTML5** & **CSS3**
* **Node.js** + **Express.js** (API Proxy Backend)
* **NewsAPI.org** + **CoinGecko API**
* Fetch API for dynamic data

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/stitchoneill/Advanced-Dashboard.git
cd Advanced-Dashboard
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Create `.env` File

Create a `.env` file in the project root:

```env
NEWSAPI_KEY=your_newsapi_key_here
PORT=3001
```

### 4. Start the Server

```bash
node server.js
```

The server runs at: `http://localhost:3001`

### 5. Open the Dashboard

Open `Index.html` in your browser manually or via Live Server extension (for best experience).

---

## Usage

* Press **ENTER** to expand the dashboard
* Click **NEWS**, **CRYPTO**, or other widgets to activate them
* Hover to explore dynamic effects

---

## Project Structure

```text
├── Index.html           # Main HTML UI
├── dashboard.js         # Animation and widget logic
├── style.css            # Custom styles and effects
├── server.js            # Node.js backend (API proxy)
├── .env                 # Environment file (excluded from repo)
├── .gitignore           # Ignores .env, node_modules, etc.
└── README.md            # This file
```

---

## Screenshots

![Launch Screen](./Screenshot%202025-07-25%20013648.png)
![Widget Menu](./Screenshot%202025-07-25%20013704.png)
![News Cards](./Screenshot%202025-07-25%20013722.png)

---

## Author

**Liam O'Neill**
GitHub: [stitchoneill](https://github.com/stitchoneill)

---
