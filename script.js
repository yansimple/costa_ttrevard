const $ = (s) => document.querySelector(s);

let userName = localStorage.userName || "";
let balance = 0;
let videoIndex = 0;
let videoUnlocked = false;
let spinCount = 0;

const videoFiles = [
    "./videos/1t.mp4",
    "./videos/2t.mp4",
    "/videos/3t.mp4",
    "./videos/4t.mp4"
];

function randomReward() {
    const usd = 7 + Math.random() * 5;
    return Math.round(usd * 500);
}

const rewards = videoFiles.map(() => randomReward());

const reactions = [
    ["🔥", "VIRAL"], ["🚀", "TOP"], ["👍", "BUENO"],
    ["😐", "MEH"], ["⚠️", "PELIGRO"], ["👎", "FLOP"]
];

// ==================== NAVEGACIÓN ====================
function stopAllVideos() {
    document.querySelectorAll("video").forEach(v => {
        try { v.pause(); v.currentTime = 0; } catch (e) {}
    });
}

function go(id) {
    stopAllVideos();
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    history.replaceState(null, "", location.pathname);
    window.currentPage = id;
    updateToasts(id);
    if (id === "video") buildSlides();
    if (id === "spin") setupSpin();
    if (id === "final") setupFinal();
    if (id === "selected") runVerification();
}

// ==================== SINCRONIZAR NOMBRE ====================
function syncName() {
    const raw = userName || "Nombre";
    const short = raw.length > 12 ? raw.slice(0, 12) + "…" : raw;
    $("#who").textContent = short;
    $("#who2").textContent = short;
    $("#initial").textContent = raw[0].toUpperCase();
    $("#userBadge").textContent = raw[0].toUpperCase();
}

// ==================== CONTADOR EN LÍNEA ====================
setInterval(() => {
    $("#online").textContent = (5180 + Math.floor(Math.random() * 160)).toLocaleString("es-CR");
}, 1600);

// ==================== INICIO (HOME) ====================
(function() {
    const nameInput = document.getElementById("name");
    const continueBtn = document.getElementById("continue");

    if (nameInput && continueBtn) {
        nameInput.addEventListener("input", function(e) {
            userName = e.target.value.trim();
            if (userName) {
                continueBtn.disabled = false;
                continueBtn.style.opacity = "1";
                continueBtn.style.pointerEvents = "auto";
            } else {
                continueBtn.disabled = true;
                continueBtn.style.opacity = "0.35";
                continueBtn.style.pointerEvents = "none";
            }
        });

        function handleContinue(e) {
            e.preventDefault();
            if (!userName) return;
            localStorage.userName = userName;
            syncName();
            go("selected");
        }

        continueBtn.addEventListener("click", handleContinue);
        continueBtn.addEventListener("touchend", handleContinue);
    }
})();

// ==================== SELECCIONADO ====================
function runVerification() {
    const bar = document.getElementById("verifyBar");
    const checks = document.querySelectorAll(".verify-check");
    const btn = document.getElementById("verifyContinue");

    bar.classList.remove("running", "done");
    checks.forEach(c => c.classList.remove("done"));
    btn.disabled = true;
    btn.textContent = "VERIFICANDO...";
    btn.style.opacity = "0.5";
    btn.style.pointerEvents = "none";

    void bar.offsetWidth;
    bar.classList.add("running");

    [800, 2000, 3200, 4400].forEach((delay, i) => {
        setTimeout(() => {
            if (window.currentPage === "selected" && checks[i]) checks[i].classList.add("done");
        }, delay);
    });

    setTimeout(() => {
        if (window.currentPage === "selected") {
            bar.classList.add("done");
            btn.disabled = false;
            btn.textContent = "CONTINUAR ❯";
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
            btn.onclick = function(e) {
                e.preventDefault();
                go("video");
            };
        }
    }, 5000);
}

// ==================== VIDEO TIKTOK ====================
let slides = [];
let currentSlide = 0;

function buildSlides() {
    if (slides.length) return;
    const swiper = document.getElementById("tiktokSwiper");
    swiper.innerHTML = "";
    slides = videoFiles.map((file, i) => {
        const slide = document.createElement("div");
        slide.className = "tiktok-slide";

        const video = document.createElement("video");
        video.src = file;
        video.playsInline = true;
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("playsinline", "");
        video.preload = "metadata";
        video.loop = false;
        video.muted = false;
        video.volume = 1;
        slide.appendChild(video);

        const info = document.createElement("div");
        info.className = "tiktok-slide-info";
        info.innerHTML = '<div class="author">@creador_0' + (i + 1) + '</div><div class="desc">Mira hasta el final · #fyp #viral</div>';
        slide.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "tiktok-side-actions";
        actions.innerHTML = '<button class="tiktok-side-btn like-btn"><span class="side-icon">❤</span><span>' + (Math.floor(Math.random() * 90 + 10)) + 'K</span></button><button class="tiktok-side-btn"><span class="side-icon">💬</span><span>' + (Math.floor(Math.random() * 9 + 1)) + 'K</span></button><button class="tiktok-side-btn"><span class="side-icon">🔖</span><span>Guardar</span></button><button class="tiktok-side-btn"><span class="side-icon">↗</span><span>Compartir</span></button>';
        slide.appendChild(actions);

        const progress = document.createElement("div");
        progress.className = "tiktok-progress-line";
        slide.appendChild(progress);

        swiper.appendChild(slide);

        return {
            videoEl: video,
            progressEl: progress,
            actionsEl: actions,
            slideEl: slide,
            unlocked: false,
            index: i,
            reward: rewards[i]
        };
    });

    setupSwipe();
    activateSlide(0);
}

function setupSwipe() {
    const swiper = document.getElementById("tiktokSwiper");
    let startY = 0;
    swiper.addEventListener("touchstart", function(e) { startY = e.touches[0].clientY; }, { passive: true });
    swiper.addEventListener("touchend", function(e) {
        var diff = startY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 35) {
            if (diff > 0 && currentSlide < slides.length - 1) activateSlide(currentSlide + 1);
            else if (diff < 0 && currentSlide > 0) activateSlide(currentSlide - 1);
        }
    });
}

function activateSlide(i) {
    if (slides[currentSlide]) {
        var p = slides[currentSlide];
        p.videoEl.pause();
        p.videoEl.currentTime = 0;
        p.progressEl.style.width = "0%";
        p.unlocked = false;
    }
    currentSlide = i;
    var d = slides[i];
    d.slideEl.scrollIntoView({ behavior: "smooth" });
    updateUI(i);

    var v = d.videoEl;
    v.onended = function() {
        d.unlocked = true;
        d.progressEl.style.width = "100%";
        setEnabled(true);
    };
    v.ontimeupdate = function() {
        if (v.duration && isFinite(v.duration))
            d.progressEl.style.width = Math.min(100, (v.currentTime / v.duration) * 100) + "%";
        if (v.currentTime >= 5 && !d.unlocked) {
            d.unlocked = true;
            setEnabled(true);
            $("#readyText").textContent = "¡Listo!";
        }
    };

    v.muted = false;
    v.volume = 1;
    var playPromise = v.play();
    if (playPromise !== undefined) {
        playPromise.catch(function() {
            setTimeout(function() {
                v.muted = false;
                v.volume = 1;
                v.play().catch(function() {});
            }, 100);
        });
    }

    var lastTap = 0;
    d.slideEl.addEventListener("click", function(e) {
        if (Date.now() - lastTap < 300 && !e.target.closest("button"))
            showHeart(e, d.slideEl);
        lastTap = Date.now();
    });

    var likeBtn = d.actionsEl.querySelector(".like-btn");
    likeBtn.onclick = function() {
        likeBtn.classList.toggle("liked");
        if (likeBtn.classList.contains("liked"))
            showHeart({ clientX: likeBtn.getBoundingClientRect().left, clientY: likeBtn.getBoundingClientRect().top }, d.slideEl);
    };
}

function showHeart(e, slide) {
    var h = document.createElement("div");
    h.className = "heart-burst";
    h.textContent = "❤️";
    h.style.left = (e.clientX - slide.getBoundingClientRect().left - 28) + "px";
    h.style.top = (e.clientY - slide.getBoundingClientRect().top - 28) + "px";
    slide.appendChild(h);
    setTimeout(function() { h.remove(); }, 700);
}

function showEmoji(emoji, slide) {
    var f = document.createElement("div");
    f.className = "emoji-float";
    f.textContent = emoji;
    f.style.left = "50%";
    f.style.top = "40%";
    slide.appendChild(f);
    setTimeout(function() { f.remove(); }, 1000);
}

function updateUI(i) {
    videoIndex = i;
    $("#videoCounter").textContent = (i + 1) + "/" + videoFiles.length;
    $("#rewardTop").textContent = Math.round(rewards[i]).toLocaleString("es-CR");
    $("#bal").textContent = Math.round(balance).toLocaleString("es-CR");
    renderDots();
    renderReactions();
    setEnabled(false);
    $("#readyText").textContent = "Bloqueado";
}

function renderDots() {
    var p = $("#progress");
    p.innerHTML = "";
    for (var i = 0; i < videoFiles.length; i++) {
        var s = document.createElement("span");
        s.className = "dot-seg" + (i <= videoIndex ? " on" : "");
        p.appendChild(s);
    }
}

function renderReactions() {
    var b = $("#choices");
    b.innerHTML = "";
    reactions.forEach(function(r) {
        var btn = document.createElement("button");
        btn.className = "tiktok-reaction-btn";
        btn.disabled = true;
        btn.innerHTML = "<b>" + r[0] + "</b>" + r[1];
        btn.onclick = function() { chooseReaction(btn); };
        b.appendChild(btn);
    });
}

function setEnabled(v) {
    videoUnlocked = v;
    document.querySelectorAll(".tiktok-reaction-btn").forEach(function(b) {
        b.disabled = !v;
        b.style.pointerEvents = v ? "auto" : "none";
    });
    $("#readyText").textContent = v ? "¡Listo!" : "Bloqueado";
}

function chooseReaction(btn) {
    var d = slides[currentSlide];
    if (!d || !d.unlocked) return;
    document.querySelectorAll(".tiktok-reaction-btn").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    balance += d.reward;
    $("#bal").textContent = Math.round(balance).toLocaleString("es-CR");
    $("#modalReward").textContent = Math.round(d.reward).toLocaleString("es-CR");
    $("#modalCash").textContent = Math.round(d.reward).toLocaleString("es-CR");
    showEmoji(btn.querySelector("b").textContent, d.slideEl);
    $("#nextVideo").textContent = currentSlide < videoFiles.length - 1
        ? (videoFiles.length - currentSlide - 1) + " video más →"
        : "Abrir rueda de bono →";
    $("#rewardModal").classList.add("show");
}

$("#nextVideo").onclick = function() {
    $("#rewardModal").classList.remove("show");
    if (currentSlide < videoFiles.length - 1) activateSlide(currentSlide + 1);
    else { balance = 89200; go("spin"); }
};

// ==================== DATOS ====================
var ranks = [
    ["1", "Marie L. 🇨🇷 👑", "₡4,923,500"],
    ["2", "Thomas P. 🇨🇷 💎", "₡4,261,500"],
    ["3", "Lea M. 🇨🇷 🔥", "₡3,552,500"],
    ["4", "Nicolas D. 🇨🇷 ⭐", "₡3,144,500"],
    ["5", "Camille B. 🇨🇷 ⭐", "₡2,767,000"]
];
var withdrawals = [
    ["Jessica M.", "PayPal · 15 Ene", "₡620,000"],
    ["Brandon K.", "CashApp · 14 Ene", "₡445,250"],
    ["Logan S.", "Banco · ahora", "₡175,500"],
    ["Isabella R.", "PayPal · 2 min", "₡1,431,000"],
    ["Mia C.", "PayPal · 5 min", "₡920,000"],
    ["David L.", "Zelle · 18 min", "₡2,010,500"]
];
var reviewsData = [
    ["Julia S.", "1 día", "¡Recibí mi primer retiro en 24 horas!"],
    ["Mark T.", "2 días", "Fácil de usar, pagos rápidos."],
    ["Sophie R.", "3 días", "¡Gran plataforma!"],
    ["Lucas P.", "5 días", "¡Ya gané más de ₡1,000,000 este mes!"]
];

function fillLists() {
    var templates = {
        finalRankList: ranks.map(function(r, i) {
            var cls = "";
            if (i === 1) cls = "silver";
            if (i === 2) cls = "bronze";
            return '<div class="rank-item"><div class="rank-pos ' + cls + '">' + r[0] + '</div><div class="rank-info"><div class="rank-name">' + r[1] + '</div><div class="rank-badge">✅ Verificado</div></div><div class="rank-amount">' + r[2] + '</div></div>';
        }).join(""),
        finalWithdrawList: withdrawals.map(function(w) {
            return '<div class="withdraw-item"><div><b>' + w[0] + '</b><br><span style="color:var(--muted);font-size:12px">' + w[1] + '</span></div><div class="withdraw-amount">' + w[2] + '</div></div>';
        }).join(""),
        finalReviewList: reviewsData.map(function(r) {
            return '<div class="review-card-item"><b>' + r[0] + '</b> <span style="color:var(--muted);float:right;font-size:12px">' + r[1] + '</span><br><span class="stars">⭐⭐⭐⭐⭐</span><p style="color:var(--muted);margin:6px 0 0;font-size:13px">' + r[2] + '</p></div>';
        }).join("")
    };
    for (var id in templates) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = templates[id];
    }
}

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("tab-btn")) {
        var bar = e.target.closest(".tabs-bar");
        bar.querySelectorAll(".tab-btn").forEach(function(b) { b.classList.remove("active"); });
        e.target.classList.add("active");
        var wrap = bar.parentElement;
        wrap.querySelectorAll(".tab-panel").forEach(function(p) { p.classList.remove("active"); });
        document.getElementById(e.target.dataset.tab).classList.add("active");
    }
});

// ==================== RULETA ====================
function setupSpin() {
    spinCount = 0;
    $("#spinBal").textContent = "89,200";
    $("#spinNote").classList.add("hidden");
    $("#spinSuccess").classList.add("hidden");
    document.getElementById("wheel").style.transform = "rotate(0deg)";
    var btn = document.getElementById("spinBtn");
    btn.disabled = false;
    btn.textContent = "GIRAR PARA MULTIPLICAR";
    btn.onclick = spinWheel;
}

function spinWheel() {
    spinCount++;
    document.getElementById("spinBtn").disabled = true;
    var first = spinCount === 1;
    document.getElementById("wheel").style.transform = first ? "rotate(1755deg)" : "rotate(3915deg)";
    setTimeout(function() {
        if (first) {
            $("#spinNote").classList.remove("hidden");
            document.getElementById("spinBtn").disabled = false;
            document.getElementById("spinBtn").textContent = "¡GIRO DE BONO GRATIS!";
        } else {
            $("#spinBal").textContent = "178,400";
            $("#successAmount").textContent = "₡178,400";
            $("#spinSuccess").classList.remove("hidden");
            document.getElementById("spinBtn").disabled = false;
            document.getElementById("spinBtn").textContent = "CONTINUAR →";
            document.getElementById("spinBtn").onclick = function() { go("final"); };
        }
    }, 4200);
}

document.addEventListener("click", function(e) {
    if (e.target.closest("#wheel") && document.getElementById("spinBtn") && !document.getElementById("spinBtn").disabled) {
        document.getElementById("spinBtn").click();
    }
});

// ==================== FINAL ====================
function setupFinal() {
    fillLists();
    setupReviewStrip();
}

function setupReviewStrip() {
    document.querySelectorAll(".review-video-thumb").forEach(function(thumb) {
        var video = thumb.querySelector("video");
        var overlay = thumb.querySelector(".play-overlay");
        if (!video || !overlay) return;
        thumb.onclick = function() {
            document.querySelectorAll(".review-video-thumb video").forEach(function(v2) {
                v2.pause();
                v2.currentTime = 0;
                v2.parentElement.querySelector(".play-overlay").style.display = "flex";
            });
            overlay.style.display = "none";
            video.muted = false;
            video.volume = 1;
            video.play().catch(function() {});
        };
        video.onended = function() { overlay.style.display = "flex"; };
    });
}

// ==================== TOASTS ====================
var people = ["James K.", "Emily R.", "Michael B.", "Sarah M.", "Daniel P.", "Olivia M.", "Chris W.", "Jessica H.", "Ryan T.", "Ashley C.", "Brandon S.", "Megan D.", "Liam H.", "Noah B.", "Ava R.", "Sophia L."];
var cities = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón", "Escazú", "Santa Ana", "Tamarindo", "Jacó", "La Fortuna"];

function showToast() {
    var box = document.getElementById("withdrawToast");
    if (!box || window.currentPage === "home") return;
    var name = people[Math.floor(Math.random() * people.length)];
    var city = cities[Math.floor(Math.random() * cities.length)];
    var amt = Math.round(8000 + Math.random() * 417000).toLocaleString("es-CR");
    box.innerHTML = '<div class="toast-avatar"></div><div class="toast-info"><div class="toast-name">' + name + '</div><div class="toast-location">' + city + ', Costa Rica</div></div><div class="toast-value">+₡' + amt + '</div>';
    box.classList.add("show");
    clearTimeout(window._toastHide);
    window._toastHide = setTimeout(function() { box.classList.remove("show"); }, 2200);
}

function startToasts() {
    var box = document.getElementById("withdrawToast");
    if (!box || window.currentPage === "home") {
        if (box) box.classList.remove("show");
        clearTimeout(window._toastLoop);
        return;
    }
    clearTimeout(window._toastLoop);
    function schedule() {
        window._toastLoop = setTimeout(function() { showToast(); schedule(); }, Math.floor(Math.random() * 3000) + 5000);
    }
    schedule();
}

function updateToasts(id) {
    var box = document.getElementById("withdrawToast");
    if (!box) return;
    if (id === "home") {
        box.classList.remove("show");
        clearTimeout(window._toastLoop);
        clearTimeout(window._toastHide);
        return;
    }
    startToasts();
}

// ==================== INICIALIZAR ====================
renderReactions();
syncName();
go("home");