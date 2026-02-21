document.getElementById("favicon").href = CONFIG.favicon;

/* --- Helpers --- */
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\p{Emoji}\p{Extended_Pictographic}]+/gu, "-")
        .replace(/^-+|-+$/g, "");
}

/* Updated: parse ISO date directly from config */
function parseDate(str) {
    return new Date(str);
}

/* --- Read GET parameter ?countdown=SLUG or INDEX --- */
const params = new URLSearchParams(window.location.search);
const param = params.get("countdown");

let index = 0;

if (param !== null) {
    const numeric = parseInt(param, 10);
    if (!isNaN(numeric) && numeric >= 0 && numeric < CONFIG.countdowns.length) {
        index = numeric;
    } else {
        const found = CONFIG.countdowns.findIndex(c => slugify(c.title) === param);
        if (found !== -1) {
            index = found;
        }
    }
}

const slides = document.getElementById("slides");
const dotsContainer = document.getElementById("dots");
const progressBar = document.getElementById("progressBar");

/* Build slides dynamically */
CONFIG.countdowns.forEach((c, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.innerHTML = `
        <div class="container">
            <div class="block"><div class="value" id="days-${i}">00</div><div class="label">Days</div></div>
            <div class="block"><div class="value" id="hours-${i}">00</div><div class="label">Hours</div></div>
            <div class="block"><div class="value" id="minutes-${i}">00</div><div class="label">Minutes</div></div>
            <div class="block"><div class="value" id="seconds-${i}">00</div><div class="label">Seconds</div></div>
        </div>
        <div class="hint" id="hint-${i}"></div>
    `;
    slides.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.onclick = () => showSlide(i);
    dotsContainer.appendChild(dot);
});

const dots = [...document.querySelectorAll(".dot")];

/* Title update with fade */
function updateTitle() {
    const titleEl = document.getElementById("title");
    titleEl.style.opacity = 0;
    setTimeout(() => {
        titleEl.textContent = CONFIG.countdowns[index].title;
        document.title = CONFIG.countdowns[index].title;
        titleEl.style.opacity = 1;
    }, 200);
}

function updateDots() {
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
}

/* Update URL without reload — slug now includes emojis */
function updateURL() {
    const slug = slugify(CONFIG.countdowns[index].title);
    const newURL = `?countdown=${slug}`;
    history.replaceState(null, "", newURL);
}


updateTitle();
updateDots();
updateURL();

/* Dark/Light mode toggle */
const body = document.body;
const toggleBtn = document.getElementById("modeToggle");

if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
    toggleBtn.textContent = "Dark Mode";
}

toggleBtn.onclick = () => {
    body.classList.toggle("light");
    const isLight = body.classList.contains("light");
    toggleBtn.textContent = isLight ? "Dark Mode" : "Light Mode";
    localStorage.setItem("theme", isLight ? "light" : "dark");
};

/* Auto-advance toggle */
const autoToggle = document.getElementById("autoToggle");
let autoAdvance = false;
let autoTimer = null;

function setAutoAdvance(on) {
    autoAdvance = on;
    autoToggle.textContent = autoAdvance ? "Auto ⏸" : "Auto ▶️";
    if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
    }
    if (autoAdvance) {
        autoTimer = setInterval(() => {
            showSlide(index + 1);
        }, 10000);
    }
}

autoToggle.onclick = () => {
    setAutoAdvance(!autoAdvance);
};

/* Share button */
const shareBtn = document.getElementById("shareBtn");
const toast = document.getElementById("toast");

shareBtn.onclick = async () => {
    const url = window.location.href;

    try {
        await navigator.clipboard.writeText(url);
        showToast();
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        showToast();
    }
};

function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1500);
}

function pad(n) {
    return n.toString().padStart(2, "0");
}

function animateValue(el) {
    el.classList.remove("animate");
    void el.offsetWidth;
    el.classList.add("animate");
    setTimeout(() => el.classList.remove("animate"), 200);
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function updateTimer() {
    const now = new Date();

    CONFIG.countdowns.forEach((c, i) => {
        const targetDate = parseDate(c.targetDate);
        const diff = targetDate - now;
        const abs = Math.abs(diff);

        const d = Math.floor(abs / (1000 * 60 * 60 * 24));
        const h = Math.floor(abs / (1000 * 60 * 60)) % 24;
        const m = Math.floor(abs / (1000 * 60)) % 60;
        const s = Math.floor(abs / 1000) % 60;

        const ids = ["days", "hours", "minutes", "seconds"];
        const values = [d, h, m, s];

        values.forEach((val, j) => {
            const el = document.getElementById(`${ids[j]}-${i}`);
            const padded = pad(val);
            if (el.textContent !== padded) animateValue(el);
            el.textContent = padded;
        });

        const hintEl = document.getElementById(`hint-${i}`);
        if (hintEl) {
            const sameDay =
                now.getFullYear() === targetDate.getFullYear() &&
                now.getMonth() === targetDate.getMonth() &&
                now.getDate() === targetDate.getDate();

            if (sameDay) {
                hintEl.textContent = "Today 🎉";
            } else if (diff < 0) {
                hintEl.textContent = "(ago)";
            } else {
                hintEl.textContent = "";
            }
        }

        if (i === index) {
            if (diff > 0) {
                const yearStart = new Date(targetDate.getFullYear(), 0, 1);
                const total = targetDate - yearStart;
                const elapsed = now - yearStart;
                const pct = clamp((elapsed / total) * 100, 0, 100);
                progressBar.style.width = `${pct}%`;
            } else {
                progressBar.style.width = "0%";
            }
        }
    });
}

updateTimer();
setInterval(updateTimer, 1000);

/* Swipe hint visibility */
const swipeHint = document.getElementById("swipeHint");
if (CONFIG.countdowns.length <= 1) {
    swipeHint.style.display = "none";
}

function hideSwipeHint() {
    if (!swipeHint) return;
    swipeHint.classList.add("hidden");
}

/* Navigation */
function showSlide(i) {
    index = (i + CONFIG.countdowns.length) % CONFIG.countdowns.length;

    slides.style.transition = "transform 0.45s cubic-bezier(.25, .8, .25, 1)";
    slides.style.transform = `translateX(-${index * 100}%)`;
    updateTitle();
    updateDots();
    updateURL();
    hideSwipeHint();
}

document.getElementById("prevBtn").onclick = () => showSlide(index - 1);
document.getElementById("nextBtn").onclick = () => showSlide(index + 1);

/* Keyboard navigation */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        showSlide(index - 1);
    }
    if (e.key === "ArrowRight") {
        showSlide(index + 1);
    }
});

/* Swipe gestures */
let startX = 0;
let startTime = 0;
let isDragging = false;

function handleSwipe(endX) {
    const diff = endX - startX;
    const time = Date.now() - startTime;
    const velocity = Math.abs(diff) / time;

    const fast = velocity > 0.4;
    const far = Math.abs(diff) > 60;

    if (fast || far) {
        if (diff < 0) {
            showSlide(index + 1);
        } else {
            showSlide(index - 1);
        }
        if (navigator.vibrate) {
            navigator.vibrate(15);
        }
    } else {
        slides.style.transition = "transform 0.45s cubic-bezier(.25, .8, .25, 1)";
        slides.style.transform = `translateX(-${index * 100}%)`;
    }
}

slides.addEventListener("touchstart", e => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startTime = Date.now();
    slides.style.transition = "none";
});

slides.addEventListener("touchmove", e => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    slides.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
});

slides.addEventListener("touchend", e => {
    if (!isDragging) return;
    isDragging = false;
    handleSwipe(e.changedTouches[0].clientX);
});

slides.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX;
    startTime = Date.now();
    slides.style.transition = "none";
});

slides.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const dx = currentX - startX;
    slides.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
});

slides.addEventListener("mouseup", e => {
    if (!isDragging) return;
    isDragging = false;
    handleSwipe(e.clientX);
});

slides.addEventListener("mouseleave", () => {
    if (!isDragging) return;
    isDragging = false;
    slides.style.transition = "transform 0.45s cubic-bezier(.25, .8, .25, 1)";
    slides.style.transform = `translateX(-${index * 100}%)`;
});

/* Mouse wheel navigation */
let wheelLock = false;
slides.addEventListener("wheel", e => {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;

    if (e.deltaY > 0) {
        showSlide(index + 1);
    } else if (e.deltaY < 0) {
        showSlide(index - 1);
    }

    setTimeout(() => {
        wheelLock = false;
    }, 400);
}, { passive: false });

/* Ensure initial slide position */
slides.style.transform = `translateX(-${index * 100}%)`;
