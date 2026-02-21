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
            mileage: formData.get('mileage'),
            condition: formData.get('condition'),
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
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: #fff;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            box-shadow: 0 8px 24px rgba(39, 174, 96, 0.3);
        `;
        
        document.body.appendChild(successMessage);
        
        // Remove message after 4 seconds
        setTimeout(() => {
            successMessage.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => successMessage.remove(), 300);
        }, 4000);
        
        // Reset form
        form.reset();
        
        // Reset file preview
        const previewContainer = document.getElementById('file-preview');
        if (previewContainer) previewContainer.innerHTML = '';
        const fileCountEl = document.querySelector('.file-count');
        if (fileCountEl) fileCountEl.textContent = '';
    });

    // File Upload Handler
    const fileInput = document.querySelector('input[type="file"]');
    const fileUploadArea = document.querySelector('.file-upload-area');
    const filePreviewContainer = document.getElementById('file-preview');
    
    if (fileInput && fileUploadArea) {
        fileInput.addEventListener('change', handleFileSelect);
        
        // Drag & Drop support
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, () => {
                fileUploadArea.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, () => {
                fileUploadArea.classList.remove('drag-over');
            }, false);
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            // Create a new DataTransfer to merge files
            const dataTransfer = new DataTransfer();
            
            // Add dropped files
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    dataTransfer.items.add(file);
                }
            });
            
            fileInput.files = dataTransfer.files;
            handleFileSelect();
        }, false);
        
        function handleFileSelect() {
            const files = fileInput.files;
            const fileCount = files ? files.length : 0;
            const fileCountEl = document.querySelector('.file-count');
            
            // Update counter
            if (fileCount > 0) {
                const word = getFilesWord(fileCount);
                fileCountEl.textContent = `Выбрано: ${fileCount} ${word}`;
            } else {
                fileCountEl.textContent = '';
            }
            
            // Show previews
            if (filePreviewContainer) {
                filePreviewContainer.innerHTML = '';
                
                Array.from(files).forEach((file, index) => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            const previewItem = document.createElement('div');
                            previewItem.className = 'file-preview-item';
                            previewItem.innerHTML = `
                                <img src="${e.target.result}" alt="Превью ${index + 1}">
                                <button type="button" class="file-preview-remove" data-index="${index}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            `;
                            filePreviewContainer.appendChild(previewItem);
                            
                            // Add remove handler
                            previewItem.querySelector('.file-preview-remove').addEventListener('click', () => {
                                removeFile(index);
                            });
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
        }
        
        function removeFile(indexToRemove) {
            const dataTransfer = new DataTransfer();
            
            Array.from(fileInput.files).forEach((file, index) => {
                if (index !== indexToRemove) {
                    dataTransfer.items.add(file);
                }
            });
            
            fileInput.files = dataTransfer.files;
            handleFileSelect();
        }
        
        function getFilesWord(n) {
            if (n % 10 === 1 && n % 100 !== 11) return 'файл';
            if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'файла';
            return 'файлов';
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
    
    // Reviews Slider
    const reviewsTrack = document.querySelector('.reviews-track');
    const reviewCards = document.querySelectorAll('.review-card');
    const reviewsPrevBtn = document.querySelector('.reviews-prev');
    const reviewsNextBtn = document.querySelector('.reviews-next');
    const reviewsDotsContainer = document.querySelector('.reviews-dots');
    
    if (reviewsTrack && reviewCards.length > 0) {
        let reviewsIndex = 0;
        
        function getVisibleReviews() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }
        
        function getTotalReviewPages() {
            return Math.ceil(reviewCards.length / getVisibleReviews());
        }
        
        function createReviewsDots() {
            reviewsDotsContainer.innerHTML = '';
            const totalPages = getTotalReviewPages();
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.className = 'reviews-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => goToReviewPage(i));
                reviewsDotsContainer.appendChild(dot);
            }
        }
        
        function goToReviewPage(page) {
            const visibleReviews = getVisibleReviews();
            const maxPage = getTotalReviewPages() - 1;
            reviewsIndex = Math.max(0, Math.min(page, maxPage));
            updateReviewsSlider();
        }
        
        function updateReviewsSlider() {
            const visibleReviews = getVisibleReviews();
            const cardWidth = reviewCards[0].offsetWidth + 24; // width + gap
            const offset = reviewsIndex * visibleReviews * cardWidth;
            reviewsTrack.style.transform = `translateX(-${offset}px)`;
            
            // Update dots
            const dots = reviewsDotsContainer.querySelectorAll('.reviews-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === reviewsIndex);
            });
            
            // Update buttons
            reviewsPrevBtn.disabled = reviewsIndex === 0;
            reviewsNextBtn.disabled = reviewsIndex >= getTotalReviewPages() - 1;
        }
        
        function nextReviewPage() {
            if (reviewsIndex < getTotalReviewPages() - 1) {
                reviewsIndex++;
                updateReviewsSlider();
            }
        }
        
        function prevReviewPage() {
            if (reviewsIndex > 0) {
                reviewsIndex--;
                updateReviewsSlider();
            }
        }
        
        reviewsPrevBtn.addEventListener('click', prevReviewPage);
        reviewsNextBtn.addEventListener('click', nextReviewPage);
        
        // Initialize
        createReviewsDots();
        updateReviewsSlider();
        
        // Handle resize
        let resizeReviewsTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeReviewsTimeout);
            resizeReviewsTimeout = setTimeout(() => {
                reviewsIndex = 0;
                createReviewsDots();
                updateReviewsSlider();
            }, 150);
        });
        
        // Touch support for reviews
        let reviewsTouchStartX = 0;
        let reviewsTouchEndX = 0;
        
        reviewsTrack.addEventListener('touchstart', (e) => {
            reviewsTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        reviewsTrack.addEventListener('touchend', (e) => {
            reviewsTouchEndX = e.changedTouches[0].screenX;
            const diff = reviewsTouchStartX - reviewsTouchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextReviewPage();
                } else {
                    prevReviewPage();
                }
            }
        }, { passive: true });
        
        // Mouse drag support for reviews
        let reviewsMouseStartX = 0;
        let isReviewsMouseDragging = false;
        
        reviewsTrack.addEventListener('mousedown', (e) => {
            reviewsMouseStartX = e.clientX;
            isReviewsMouseDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isReviewsMouseDragging) return;
            reviewsTouchEndX = e.clientX;
        });
        
        document.addEventListener('mouseup', () => {
            if (!isReviewsMouseDragging) return;
            isReviewsMouseDragging = false;
            
            const diff = reviewsMouseStartX - reviewsTouchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextReviewPage();
                } else {
                    prevReviewPage();
                }
            }
        });
    }

    // ===== SCROLL ANIMATIONS =====
    initScrollAnimations();
});

// Scroll Animations with Intersection Observer
function initScrollAnimations() {
    // Add animation classes to elements
    const animationConfig = [
        // Process section
        { selector: '.process .section-title', class: 'animate-fade-up' },
        { selector: '.process-step', class: 'animate-fade-up' },
        
        // Gallery section
        { selector: '.gallery-section .section-title', class: 'animate-fade-up' },
        { selector: '.gallery-slider', class: 'animate-fade-up' },
        
        // Advantages section
        { selector: '.advantages .section-title', class: 'animate-fade-up' },
        { selector: '.advantage-card', class: 'animate-scale' },
        { selector: '.stat-item', class: 'animate-fade-up' },
        
        // Reviews section
        { selector: '.reviews .section-title', class: 'animate-fade-up' },
        { selector: '.reviews .section-subtitle', class: 'animate-fade-up' },
        { selector: '.reviews-slider-container', class: 'animate-fade-up' },
        
        // Form section
        { selector: '.form-section .section-title', class: 'animate-fade-up' },
        { selector: '.form-section .section-subtitle', class: 'animate-fade-up' },
        { selector: '.evaluation-form', class: 'animate-fade-up' },
        
        // Footer
        { selector: '.footer-section', class: 'animate-fade-up' }
    ];

    // Apply classes to elements
    animationConfig.forEach(config => {
        document.querySelectorAll(config.selector).forEach(el => {
            el.classList.add(config.class);
        });
    });

    // Create Intersection Observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -80px 0px', // trigger slightly before fully visible
        threshold: 0.1 // 10% visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
        '.animate-fade-up, .animate-fade, .animate-scale, .animate-slide-left, .animate-slide-right, .animate-on-scroll'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Animate hero elements immediately on page load - smooth sequence
    // Model loads separately and fades in when ready
    requestAnimationFrame(() => {
        // Header appears first - smooth fade
        const logo = document.querySelector('.logo');
        const headerRight = document.querySelector('.header-right');
        
        if (logo) logo.classList.add('visible');
        
        setTimeout(() => {
            if (headerRight) headerRight.classList.add('visible');
        }, 150);
        
        // Hero background and particles
        setTimeout(() => {
            document.querySelectorAll('.hero-bg-text, .hero-particles').forEach(el => {
                el.classList.add('visible');
            });
        }, 250);
        
        // Hero title
        setTimeout(() => {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) heroTitle.classList.add('visible');
        }, 400);
        
        // Hero button (model animates separately in car3d.js)
        setTimeout(() => {
            const heroButton = document.querySelector('.hero-button');
            if (heroButton) heroButton.classList.add('visible');
        }, 600);
    });
}
