document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    const grid = document.getElementById('testi-grid');
    const cards = document.querySelectorAll('.testi-card');
    const dotsContainer = document.getElementById('testi-dots');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const wrapper = document.getElementById('testi-wrapper');

    if (!grid || !wrapper || !prevBtn || !nextBtn || !dotsContainer) {
        // If slider elements don't exist, just init scroll reveal
        const reveals = document.querySelectorAll('.reveal');
        const revealOnScroll = () => {
            reveals.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.9) {
                    el.classList.add('visible');
                }
            });
        };
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll();
        return;
    }

    let currentIndex = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let autoplayInterval;

    // Responsive items per view
    function getItemsPerView() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const itemsPerView = getItemsPerView();
        const numDots = Math.ceil(cards.length / itemsPerView);
        
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('testi-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i * itemsPerView));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const itemsPerView = getItemsPerView();
        const dotIndex = Math.floor(currentIndex / itemsPerView);
        const dots = document.querySelectorAll('.testi-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === dotIndex);
        });
    }

    function updateSlider() {
        const itemsPerView = getItemsPerView();
        const maxIndex = cards.length - itemsPerView;
        
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (currentIndex < 0) currentIndex = 0;

        const offset = -(currentIndex * (100 / itemsPerView));
        grid.style.transform = `translateX(${offset}%)`;
        
        // Update active classes
        cards.forEach((card, index) => {
            const isActive = index >= currentIndex && index < currentIndex + itemsPerView;
            card.classList.toggle('active', isActive);
        });

        updateDots();
    }

    function nextSlide() {
        const itemsPerView = getItemsPerView();
        if (currentIndex + itemsPerView >= cards.length) {
            currentIndex = 0;
        } else {
            currentIndex += 1;
        }
        updateSlider();
    }

    function prevSlide() {
        if (currentIndex <= 0) {
            const itemsPerView = getItemsPerView();
            currentIndex = cards.length - itemsPerView;
        } else {
            currentIndex -= 1;
        }
        updateSlider();
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
        resetAutoplay();
    }

    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 7000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Touch events
    wrapper.addEventListener('touchstart', touchStart);
    wrapper.addEventListener('touchend', touchEnd);
    wrapper.addEventListener('touchmove', touchMove);

    // Mouse events
    wrapper.addEventListener('mousedown', touchStart);
    wrapper.addEventListener('mouseup', touchEnd);
    wrapper.addEventListener('mouseleave', touchEnd);
    wrapper.addEventListener('mousemove', touchMove);

    function touchStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        animationID = requestAnimationFrame(animation);
        stopAutoplay();
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);

        const movedBy = currentTranslate - prevTranslate;

        if (movedBy < -100) nextSlide();
        else if (movedBy > 100) prevSlide();
        else updateSlider();

        startAutoplay();
    }

    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function animation() {
        if (isDragging) requestAnimationFrame(animation);
    }

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                el.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('resize', () => {
        createDots();
        updateSlider();
    });

    // Init
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    createDots();
    updateSlider();
    startAutoplay();
    revealOnScroll(); // Check initially
});
