// Меняем только функцию buildSlides() — убираем lock overlay:

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
        video.setAttribute("controls", "false");
        slide.appendChild(video);

        const info = document.createElement("div");
        info.className = "tiktok-slide-info";
        info.innerHTML = `<div class="author">@creador_0${i + 1}</div><div class="desc">Mira hasta el final · #fyp #viral</div>`;
        slide.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "tiktok-side-actions";
        actions.innerHTML = `
            <button class="tiktok-side-btn like-btn"><span class="side-icon">❤</span><span>${Math.floor(Math.random() * 90 + 10)}K</span></button>
            <button class="tiktok-side-btn"><span class="side-icon">💬</span><span>${Math.floor(Math.random() * 9 + 1)}K</span></button>
            <button class="tiktok-side-btn"><span class="side-icon">🔖</span><span>Guardar</span></button>
            <button class="tiktok-side-btn"><span class="side-icon">↗</span><span>Compartir</span></button>
        `;
        slide.appendChild(actions);

        const progress = document.createElement("div");
        progress.className = "tiktok-progress-line";
        slide.appendChild(progress);

        swiper.appendChild(slide);

        // Автозапуск видео при активации слайда
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

// И функция activateSlide() — убираем lock, сразу запускаем видео:

function activateSlide(i) {
    if (slides[currentSlide]) {
        const p = slides[currentSlide];
        p.videoEl.pause();
        p.videoEl.currentTime = 0;
        p.progressEl.style.width = "0%";
        p.unlocked = false;
    }
    currentSlide = i;
    const d = slides[i];
    d.slideEl.scrollIntoView({ behavior: "smooth" });
    updateUI(i);

    const v = d.videoEl;
    v.onended = () => {
        d.unlocked = true;
        d.progressEl.style.width = "100%";
        setEnabled(true);
    };
    v.ontimeupdate = () => {
        if (v.duration && isFinite(v.duration))
            d.progressEl.style.width = Math.min(100, (v.currentTime / v.duration) * 100) + "%";
        if (v.currentTime >= 5 && !d.unlocked) {
            d.unlocked = true;
            setEnabled(true);
            $("#readyText").textContent = "¡Listo!";
        }
    };

    // Автозапуск для Safari
    v.muted = false;
    v.volume = 1;
    const playPromise = v.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Если autoplay заблокирован, показываем плейсхолдер
            setTimeout(() => {
                v.muted = false;
                v.volume = 1;
                v.play().catch(() => {});
            }, 100);
        });
    }

    // Двойной тап
    let lastTap = 0;
    d.slideEl.addEventListener("click", e => {
        if (Date.now() - lastTap < 300 && !e.target.closest("button"))
            showHeart(e, d.slideEl);
        lastTap = Date.now();
    });

    const likeBtn = d.actionsEl.querySelector(".like-btn");
    likeBtn.onclick = () => {
        likeBtn.classList.toggle("liked");
        if (likeBtn.classList.contains("liked"))
            showHeart({ clientX: likeBtn.getBoundingClientRect().left, clientY: likeBtn.getBoundingClientRect().top }, d.slideEl);
    };
}