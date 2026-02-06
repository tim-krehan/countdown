document.getElementById("favicon").href = CONFIG.favicon;

let index = 0;
const savedIndex = parseInt(getCookie("lastCountdownIndex"));
if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < CONFIG.countdowns.length) {
    index = savedIndex;
}


const slides = document.getElementById("slides");
const dotsContainer = document.getElementById("dots");

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
    `;
    slides.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.onclick = () => showSlide(i);
    dotsContainer.appendChild(dot);
});

const dots = [...document.querySelectorAll(".dot")];

function updateDots() {
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
}

function updateTitle() {
    const titleEl = document.getElementById("title");
    titleEl.style.opacity = 0;
    setTimeout(() => {
        titleEl.textContent = CONFIG.countdowns[index].title;
        document.title = CONFIG.countdowns[index].title;
        titleEl.style.opacity = 1;
    }, 200);
}

updateTitle();
updateDots();

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

function pad(n) {
    return n.toString().padStart(2, "0");
}

function animateValue(el) {
    el.classList.add("animate");
    setTimeout(() => el.classList.remove("animate"), 200);
}

function updateTimer() {
    CONFIG.countdowns.forEach((c, i) => {
        const targetDate = new Date(c.targetDate);
        const now = new Date();
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
    });
}

updateTimer();
setInterval(updateTimer, 1000);

/* Navigation */
function showSlide(i) {
    index = (i + CONFIG.countdowns.length) % CONFIG.countdowns.length;

    // Save to cookie
    setCookie("lastCountdownIndex", index);

    slides.style.transform = `translateX(-${index * 100}%)`;
    updateTitle();
    updateDots();
}


document.getElementById("prevBtn").onclick = () => showSlide(index - 1);
document.getElementById("nextBtn").onclick = () => showSlide(index + 1);

/* Swipe gestures (touch + mouse) with momentum */
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
        if (diff < 0) showSlide(index + 1);
        else showSlide(index - 1);
    }
}

slides.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startTime = Date.now();
});

slides.addEventListener("touchend", e => {
    handleSwipe(e.changedTouches[0].clientX);
});

slides.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX;
    startTime = Date.now();
});

slides.addEventListener("mouseup", e => {
    if (!isDragging) return;
    isDragging = false;
    handleSwipe(e.clientX);
});

slides.addEventListener("mouseleave", () => {
    isDragging = false;
});

/* Hide swipe hint if only one countdown */
if (CONFIG.countdowns.length <= 1) {
    document.querySelector(".swipe-hint").style.display = "none";
}

function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1];
}

