# Countdown Website

A lightweight, swipe‑friendly, mobile‑first countdown viewer.  
Each countdown is defined in `config.js`, and the site automatically builds slides, navigation, and shareable URLs.

---

## 🚀 Features

- Multiple countdowns with smooth slide navigation  
- Touch, mouse‑drag, and scroll‑wheel support  
- Light/Dark mode toggle with localStorage persistence  
- Share button (copies the current countdown URL)  
- Auto‑generated pagination dots  
- Past‑event hint (“This was X ago”)  
- Fully static — no backend required  

---

## 📁 File Structure

```
/
├── index.html
├── style.css
├── script.js
└── config.js
```

---

## ⚙️ Configuration

All countdowns are defined in `config.js`:

```js
const CONFIG = {
    favicon: "favicon.ico",
    countdowns: [
        {
            title: "2025 New Years",
            targetDate: "2025-01-01T00:00:00Z"
        }
    ]
};
```

### `targetDate`
Must be an ISO‑8601 string (`YYYY-MM-DDTHH:MM:SSZ`).  
The script parses it directly with:

```js
new Date(targetDate)
```

---

## 🔗 Deep Linking

Each countdown has a URL slug based on its title:

```
?countdown=2025-new-years
```

You can also navigate by index:

```
?countdown=0
```

---

## 🌓 Light/Dark Mode

The toggle button switches themes and stores the preference:

```
localStorage.setItem("theme", "light" | "dark")
```

---

## 📱 Gestures & Navigation

- Swipe left/right (touch)
- Click & drag (mouse)
- Scroll wheel (desktop)
- Arrow buttons
- Pagination dots

---

## 📤 Sharing

The “Share 🔗” button copies the current URL to the clipboard.  
If clipboard API fails, it falls back to a hidden `<textarea>`.

---

## 🛠️ Development

Just open `index.html` in any browser — no build step required.

If you modify `config.js`, the page reloads it with a cache‑busting query param:

```html
cfg.src = "./config.js?v=" + Date.now();
```

---

## 📦 Deployment

Any static host works:

- GitHub Pages  
- Netlify  
- Vercel  
- Cloudflare Pages  
- Local filesystem  

No server logic is needed.

---

## 📝 License

Free to use, modify, and deploy.