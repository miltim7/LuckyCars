document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Phone Input Masking
    const phoneInput = document.getElementById('phone-input');

    phoneInput.addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        
        if (!x[2] && x[1] !== '') {
            e.target.value = x[1] === '7' || x[1] === '8' ? '+7 ' : '+7 (' + x[1];
        } else {
            e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
        }
    });

    // Form Submit Handler
    const form = document.getElementById('evaluation-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(form);
        const data = {
            brand: formData.get('brand'),
            year: formData.get('year'),
            condition: formData.get('condition'),
            desiredPrice: formData.get('desired-price'),
            phone: formData.get('phone'),
            photosCount: formData.getAll('photos').length
        };
        
        // Log form submission (in production, send to backend)
        console.log('Form submitted:', data);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = '✅ Заявка успешно отправлена! Мы скоро свяжемся с вами.';
        successMessage.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #00d084, #ffd700);
            color: #0f1419;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            box-shadow: 0 8px 24px rgba(0, 208, 132, 0.3);
        `;
        
        document.body.appendChild(successMessage);
        
        // Remove message after 4 seconds
        setTimeout(() => {
            successMessage.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => successMessage.remove(), 300);
        }, 4000);
        
        // Reset form
        form.reset();
        
        // Reset file input display
        updateFileLabels();
    });

    // File Upload Handler
    const fileInput = document.querySelector('input[type="file"]');
    
    fileInput.addEventListener('change', updateFileLabels);
    
    function updateFileLabels() {
        const fileCount = fileInput.files ? fileInput.files.length : 0;
        const fileLabelText = document.querySelector('.file-label-text');
        const fileCount_ = document.querySelector('.file-count');
        
        if (fileCount > 0) {
            fileLabelText.textContent = fileCount === 1 ? '1 фото добавлено' : `Добавлено фото: ${fileCount}`;
            fileLabelText.style.color = '#fff';
            fileCount_.textContent = `${fileCount} ${fileCount === 1 ? 'файл' : 'файлов'} выбрано`;
        } else {
            fileLabelText.textContent = 'Прикрепить фото авто';
            fileLabelText.style.color = 'var(--accent-green)';
            fileCount_.textContent = '';
        }
    }

    // Smooth Scroll for CTA buttons
    const scrollButtons = document.querySelectorAll('[data-scroll]');
    
    scrollButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = button.getAttribute('data-scroll');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Focus on form input for better UX
                setTimeout(() => {
                    const firstInput = targetSection.querySelector('input, select');
                    if (firstInput) firstInput.focus();
                }, 500);
            }
        });
    });

    // Testimonials Auto-scroll
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (testimonialsSlider) {
        let scrollPosition = 0;
        
        // Optional: Auto-scroll testimonials
        // setInterval(() => {
        //     if (testimonialsSlider.scrollLeft < testimonialsSlider.scrollWidth - testimonialsSlider.clientWidth) {
        //         testimonialsSlider.scrollLeft += 300;
        //     } else {
        //         testimonialsSlider.scrollLeft = 0;
        //     }
        // }, 5000);
    }

    // Logo scroll to top
    const logo = document.querySelector('.logo');
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    logo.style.cursor = 'pointer';

    // Add animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.advantage-card, .gallery-item, .testimonial-card, .step').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });

    // Add CSS animation for success message
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);

    // Gallery Slider
    const galleryTrack = document.querySelector('.gallery-track');
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const dotsContainer = document.querySelector('.gallery-dots');
    
    if (galleryTrack && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        
        // Get visible slides count based on viewport
        function getVisibleSlides() {
            if (window.innerWidth <= 480) return 1;
            if (window.innerWidth <= 768) return 2;
            return 3;
        }
        
        function getSlidePercent() {
            const visible = getVisibleSlides();
            return 100 / visible;
        }
        
        function getMaxIndex() {
            return Math.max(0, totalSlides - getVisibleSlides());
        }
        
        // Create dots
        function createDots() {
            dotsContainer.innerHTML = '';
            const maxIdx = getMaxIndex();
            for (let i = 0; i <= maxIdx; i++) {
                const dot = document.createElement('button');
                dot.className = 'gallery-dot' + (i === currentIndex ? ' active' : '');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }
        
        createDots();
        
        function updateSlider() {
            const slidePercent = getSlidePercent();
            galleryTrack.style.transform = `translateX(-${currentIndex * slidePercent}%)`;
            
            const dots = document.querySelectorAll('.gallery-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        function goToSlide(index) {
            const maxIdx = getMaxIndex();
            currentIndex = Math.max(0, Math.min(index, maxIdx));
            updateSlider();
        }
        
        function nextSlide() {
            const maxIdx = getMaxIndex();
            if (currentIndex < maxIdx) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSlider();
        }
        
        function prevSlide() {
            const maxIdx = getMaxIndex();
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIdx;
            }
            updateSlider();
        }
        
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        
        // Recalculate on resize
        window.addEventListener('resize', () => {
            const maxIdx = getMaxIndex();
            if (currentIndex > maxIdx) {
                currentIndex = maxIdx;
            }
            createDots();
            updateSlider();
        });
        
        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;
        
        galleryTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });
        
        galleryTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            touchEndX = e.touches[0].clientX;
        }, { passive: true });
        
        galleryTrack.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });
        
        // Mouse drag support
        let mouseStartX = 0;
        let isMouseDragging = false;
        
        galleryTrack.addEventListener('mousedown', (e) => {
            mouseStartX = e.clientX;
            isMouseDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isMouseDragging) return;
            touchEndX = e.clientX;
        });
        
        document.addEventListener('mouseup', () => {
            if (!isMouseDragging) return;
            isMouseDragging = false;
            
            const diff = mouseStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
    }
});
