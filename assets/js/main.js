
// Loading Screen
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 2000);
});

// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

if (cursor && cursorFollower && typeof gsap !== 'undefined') {
    // Set GSAP percentage transforms to keep cursor centered
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });

    // Hardware-accelerated quick interpolations
    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.08, ease: "power3.out" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.08, ease: "power3.out" });

    const followerX = gsap.quickTo(cursorFollower, "x", { duration: 0.35, ease: "power3.out" });
    const followerY = gsap.quickTo(cursorFollower, "y", { duration: 0.35, ease: "power3.out" });

    document.addEventListener('mousemove', (e) => {
        cursorX(e.clientX);
        cursorY(e.clientY);
        followerX(e.clientX);
        followerY(e.clientY);
    });
} else if (cursor && cursorFollower) {
    // Fallback if GSAP is not loaded
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    });
}

// Add hover effect to interactive elements
const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card');
interactiveElements.forEach(elem => {
    elem.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hover'); });
    elem.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hover'); });
});


// Advanced Three.js Background - Disabled in favor of unified three-scenes.js
function initThreeJS() {}

// Initialize Three.js has been moved to assets/js/three-scenes.js

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// AI Chat Box Visibility
// [Removed conflicting visibility logic to use IntersectionObserver instead]

// Active navigation link
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Lab Project filter
const labSection = document.getElementById('lab');
if (labSection) {
    const filterBtns = labSection.querySelectorAll('.filter-btn');
    const labCards = labSection.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = (btn.getAttribute('data-filter') || 'all').toLowerCase();

            labCards.forEach(card => {
                const rawCats = (card.getAttribute('data-category') || '').toLowerCase().trim();
                const categories = rawCats.split(/\s+/);
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Form submission with live Getform AJAX integration
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const originalContent = form.innerHTML;
                form.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: #00ff64; margin-bottom: 20px;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">Message Sent Successfully!</h3>
                        <p style="color: var(--text-secondary);">Thank you for reaching out. I'll get back to you within 24 hours.</p>
                    </div>
                `;
                setTimeout(() => {
                    form.innerHTML = originalContent;
                    form.reset();
                    const restoredForm = document.getElementById('contactForm');
                    if (restoredForm) {
                        restoredForm.addEventListener('submit', handleFormSubmit);
                    }
                }, 5000);
            } else {
                throw new Error('Server returned error ' + response.status);
            }
        } catch (err) {
            console.error('Contact form submission error:', err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
            alert('Sorry, there was an issue sending your message. Please email directly at harinandan.ofc@gmail.com.');
        }
    });
}

// GSAP Animations
if (window.performanceManager && window.performanceManager.config.enableComplexAnimations) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations - Fast entrance
    gsap.from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        delay: 0.2
    });

    gsap.from('.hero h1', {
        opacity: 0,
        y: 30,
        duration: 0.4,
        delay: 0.3
    });

    gsap.from('.hero .subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        delay: 0.4
    });

    gsap.from('.hero-buttons', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        delay: 0.5
    });

    gsap.from('.hero-card', {
        opacity: 0,
        x: 40,
        rotation: 3,
        duration: 0.4,
        delay: 0.6
    });

    // Section animations - Fast snappy scroll reveal
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: {
                trigger: header,
                start: 'top 92%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 20,
            duration: 0.3,
            stagger: 0.08
        });
    });

    // About section animation
    gsap.from('.about-content', {
        scrollTrigger: {
            trigger: '.about-content',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -30,
        duration: 0.35
    });

    gsap.from('.about-visual', {
        scrollTrigger: {
            trigger: '.about-visual',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: 30,
        duration: 0.35
    });

    // Project cards animation - Fast staggered reveal
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.3,
            delay: Math.min(index * 0.04, 0.2)
        });
    });

    // Service, Process, Skill, and Achievement cards animation - Fast staggered reveal
    gsap.utils.toArray('.service-card, .process-card, .skills-cat-card, .skill-card, .achievement-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 20,
            scale: 0.98,
            duration: 0.3,
            delay: Math.min(index * 0.04, 0.2)
        });
    });

    // Timeline animation
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: index % 2 === 0 ? -30 : 30,
            duration: 0.35
        });
    });

    // Contact section animation
    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -30,
        duration: 0.35
    });

    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: 30,
        duration: 0.35
    });
}

// Parallax effect for hero content
if (window.performanceManager && window.performanceManager.config.enableParallax) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const heroCard = document.querySelector('.hero-card');

        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - scrolled / 800;
        }

        if (heroCard) {
            heroCard.style.transform = `perspective(1000px) rotateY(${-5 + scrolled * 0.01}deg) translateY(${scrolled * 0.2}px)`;
        }
    });
}
// Mobile menu toggle: ensure the .menu-toggle controls .nav-links on small screens
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navContainer = document.querySelector('.nav-container');
    if (!menuToggle || !navLinks) return;

    // Accessibility attributes
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('aria-label', 'Toggle navigation');
    menuToggle.setAttribute('aria-expanded', 'false');

    const lockBody = (lock) => {
        if (lock) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
    };

    const setOpenState = (open) => {
        if (open) {
            navLinks.classList.add('active');
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            lockBody(true);
        } else {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            lockBody(false);
        }
    };

    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpenState(!navLinks.classList.contains('active'));
    }, { passive: false });

    // Close when a nav link is clicked (useful on mobile)
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function () {
            // Allow smooth scroll to start before closing
            setTimeout(() => setOpenState(false), 50);
        });
    });

    // Close when clicking outside the nav area
    document.addEventListener('click', function (e) {
        if (!navLinks.classList.contains('active')) return;
        if (e.target.closest('.nav-container')) return;
        setOpenState(false);
    }, { passive: true });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            setOpenState(false);
        }
    });

    // Ensure menu is closed on larger screens when resizing
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            setOpenState(false);
        }
    });
});

// Timeline Media Carousel Logic
document.addEventListener('DOMContentLoaded', function () {
    // 1. Auto-scroll logic (existing)
    const carousels = document.querySelectorAll('.timeline-carousel');
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.timeline-img');
        if (images.length <= 1) return;
        let currentIndex = 0;
        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 3000);
    });

    // 2. Album Modal Logic
    const modal = document.getElementById('timeline-modal');
    if (modal) {
        const modalImg = document.getElementById('img01');
        const captionText = document.getElementById('caption');
        const closeModal = document.querySelector('.close-modal');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        let currentAlbumImages = []; // Array of image sources
        let currentAlbumIndex = 0;

        // Open Album Function
        window.openAlbum = function (containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Collect all images from this specific container
            const imgs = container.querySelectorAll('.timeline-img');
            currentAlbumImages = Array.from(imgs).map(img => ({
                src: img.src,
                alt: img.alt
            }));

            if (currentAlbumImages.length === 0) return;

            // Find which one is currently active to start with, or default to 0
            // Actually, usually better to start from 0 if it's an album view, 
            // OR find the one currently visible in the carousel.
            const activeImg = container.querySelector('.timeline-img.active');
            currentAlbumIndex = Array.from(imgs).indexOf(activeImg);
            if (currentAlbumIndex === -1) currentAlbumIndex = 0;

            updateModalImage();

            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);
            document.body.style.overflow = 'hidden';
        };

        // Update Image
        function updateModalImage() {
            if (currentAlbumImages.length === 0) return;
            const imgData = currentAlbumImages[currentAlbumIndex];

            // Fade out slightly
            modalImg.style.opacity = '0.5';

            setTimeout(() => {
                modalImg.src = imgData.src;
                captionText.innerText = `(${currentAlbumIndex + 1}/${currentAlbumImages.length}) ${imgData.alt}`;
                modalImg.style.opacity = '1';
            }, 150);
        }

        // Navigation Events
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing modal
                currentAlbumIndex = (currentAlbumIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
                updateModalImage();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentAlbumIndex = (currentAlbumIndex + 1) % currentAlbumImages.length;
                updateModalImage();
            });
        }

        // Keyboard Nav
        document.addEventListener('keydown', function (e) {
            if (modal.style.display === 'block') {
                if (e.key === 'ArrowLeft') {
                    currentAlbumIndex = (currentAlbumIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
                    updateModalImage();
                } else if (e.key === 'ArrowRight') {
                    currentAlbumIndex = (currentAlbumIndex + 1) % currentAlbumImages.length;
                    updateModalImage();
                } else if (e.key === 'Escape') {
                    close();
                }
            }
        });

        // Close functions
        const close = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        };

        if (closeModal) {
            closeModal.addEventListener('click', close);
        }

        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.classList.contains('modal-nav-container')) {
                close();
            }
        });
    }
});

/* AI Chat Assistant Logic */
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('ai-assistant-container');
    if (!chatContainer) return;

    // --- FAB Configuration ---
    // Set to false to use Font Awesome icon
    const USE_FAB_IMAGE = false;
    const FAB_IMAGE_REST = 'assets/img/hi.webp';  // Default "Rest" state
    const FAB_IMAGE_THINK = 'assets/img/think.webp'; // "Thinking" state
    // -------------------------

    const toggleBtn = document.getElementById('ai-toggle-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const bubble = document.getElementById('ai-notification-bubble');
    const messagesContainer = document.getElementById('chat-messages');
    const suggestionsContainer = document.getElementById('chat-suggestions');

    // --- API & State Management ---
    let apiKeys = {
        groq: localStorage.getItem('groq_key') || '',
        gemini: localStorage.getItem('gemini_key') || '',
        openrouter: localStorage.getItem('openrouter_key') || ''
    };

    const defaultChips = ['Who is Hari?', 'Engineering Services', 'Flagship Projects', 'Start a Project', 'Process & Timeline'];

    // Settings Modal
    const settingsModal = document.getElementById('api-settings-modal');
    const openSettingsBtn = document.getElementById('open-settings');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');

    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing chat
            document.getElementById('groq-key').value = apiKeys.groq;
            document.getElementById('gemini-key').value = apiKeys.gemini;
            document.getElementById('openrouter-key').value = apiKeys.openrouter;
            settingsModal.classList.add('show');
        });
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            apiKeys.groq = document.getElementById('groq-key').value.trim();
            apiKeys.gemini = document.getElementById('gemini-key').value.trim();
            apiKeys.openrouter = document.getElementById('openrouter-key').value.trim();

            localStorage.setItem('groq_key', apiKeys.groq);
            localStorage.setItem('gemini_key', apiKeys.gemini);
            localStorage.setItem('openrouter_key', apiKeys.openrouter);

            settingsModal.classList.remove('show');
            addMessage("Configuration saved! I'm now using your stored keys for enhanced intelligence.", 'bot');
        });
    }

    // Input Handling
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    function handleUserInput() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        // Hide suggestions when typing
        if (suggestionsContainer) suggestionsContainer.style.display = 'none';

        processBotResponse(text);
    }

    if (chatSendBtn) chatSendBtn.addEventListener('click', handleUserInput);

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserInput();
        });
        // Show suggestions again if input is cleared? Maybe not needed.
    }


    // Apply FAB Image if enabled
    if (USE_FAB_IMAGE) {
        toggleBtn.innerHTML = `<img src="${FAB_IMAGE_REST}" alt="AI Assistant" id="fab-img">`;
        toggleBtn.style.background = 'transparent'; // Remove white background for image if needed
        toggleBtn.style.boxShadow = 'none'; // Optional: cleaner look for some avatars
    }

    // Section Summaries - High-Converting Freelance Engineering
    const summaries = {
        'home': "Welcome! I'm Hari Nandan K, an AI & Full-Stack Systems Engineer. I build production-ready AI applications, intelligent automations, and resilient web platforms for founders and engineering teams.",
        'work': "Curated case studies solving real commercial bottlenecks: Autonomous Agentic BI (16-stage pipeline & AST SQL validation), Enterprise RAG Evaluation (6 benchmarked architectures), WhatsApp Automation Suite (anti-spam Baileys engine), V.O.I.D.E. (8-layer industrial telemetry anomaly audit), and BLOOMWATCH-PRO (NASA Space Apps 1st Place).",
        'projects': "Curated case studies solving real commercial bottlenecks: Autonomous Agentic BI (16-stage pipeline & AST SQL validation), Enterprise RAG Evaluation (6 benchmarked architectures), WhatsApp Automation Suite (anti-spam Baileys engine), V.O.I.D.E. (8-layer industrial telemetry anomaly audit), and BLOOMWATCH-PRO (NASA Space Apps 1st Place).",
        'services': "I offer four specialized engineering services: 1) AI Applications & LLM Systems, 2) Full-Stack Web Products & MVPs, 3) Workflow Automations & Integrations, and 4) Security Engineering & System Hardening.",
        'process': "A transparent, 5-stage engineering workflow: Discover (scoping & metrics) → Architect (blueprints & schemas) → Build (rapid modular sprints) → Validate (rigorous testing & grounding) → Deploy & Support.",
        'about': "Combining theoretical rigor with practical execution. Over 430+ developers mentored through the HOPE initiative, 70+ public repos, and a proven track record delivering under strict SLA and security requirements.",
        'lab': "The Lab showcases my deeper technical research and experimental systems: discrete spacetime lattice simulations (Chronon Model), AEGIS-X autonomous SOC, hardware true random entropy modules, and audio DSP workstations.",
        'skills': "Structured across four core disciplines: AI & Intelligent Systems (LangGraph, PyTorch, RAG), Full-Stack Web (React, Next.js, Node, TypeScript), Data Systems (Postgres, DuckDB, Kafka), and Security Engineering (Rust, zero-trust, OWASP).",
        'achievements': "Credibility backed by results: 1st Place & Global Nominee at NASA Space Apps, 430+ engineers trained through HOPE, sub-50ms streaming latency benchmarks, and 55+ technical research publications.",
        'contact': "Have an ambitious project in mind? Use the Start a Project form with your requirements, timeline, and budget. I personally review and reply to inquiries within 24 hours."
    };

    let currentSection = 'home';
    let isChatOpen = false;
    let hasGreeted = false;
    let thinkingTimeout = null; // Track thinking timer

    const HERO_IMAGE_ORIGINAL = 'assets/img/me.webp';
    let heroInterval = null;

    // Add click listener to Hero Image for manual summoning
    const heroMainImg = document.getElementById('hero-main-img');
    const heroGlitchContainer = document.getElementById('hero-glitch-container');

    if (heroMainImg && heroGlitchContainer) {
        heroMainImg.style.cursor = "pointer";
        heroMainImg.addEventListener('click', () => {
            // Stop auto animation
            stopHeroAnimation();

            // Open Chat
            if (!isChatOpen) toggleChat();
        });
    }

    // --- REUSABLE GHOST GLITCH LOGIC ---
    function startHeroAnimation() {
        if (heroInterval) return;
        const container = document.getElementById('hero-profile-container');
        const heroImg = document.getElementById('hero-main-img');
        if (!heroImg || !container) return;

        heroInterval = setInterval(() => {
            const currentSrc = heroImg.src;
            const nextSrc = currentSrc.includes('me.webp') ? FAB_IMAGE_REST : HERO_IMAGE_ORIGINAL;

            // Simple Fade Animation
            heroImg.classList.add('switching');
            
            setTimeout(() => {
                heroImg.src = nextSrc;
                heroImg.classList.remove('switching');
            }, 500); // Half second fade

        }, 5000); 
    }

    function stopHeroAnimation() {
        if (heroInterval) {
            clearInterval(heroInterval);
            heroInterval = null;
        }
        const heroImg = document.getElementById('hero-main-img');
        const container = document.getElementById('hero-profile-container');
        if (heroImg && container) {
            heroImg.src = HERO_IMAGE_ORIGINAL;
            heroImg.classList.remove('switching');
        }
    }

    // --- WALKTHROUGH LOGIC ---
    let walkthroughActive = false;
    let walkthroughPaused = false;
    let walkthroughStep = 0;
    let walkthroughTimer = null;
    const sectionsOrder = ['home', 'work', 'services', 'process', 'about', 'lab', 'contact'];
    const FAB_IMAGE_EXPLAIN = 'assets/img/explain.webp';

    function startWalkthrough() {
        walkthroughActive = true;
        walkthroughPaused = false;
        walkthroughStep = 0;

        // Close Chat
        isChatOpen = false;
        chatWindow.classList.remove('open');

        // Show Controls
        const controls = document.getElementById('walkthrough-controls');
        if (controls) controls.style.display = 'flex';

        // Start Step
        processWalkthroughStep();
    }

    function processWalkthroughStep() {
        if (!walkthroughActive || walkthroughPaused) return;

        if (walkthroughStep >= sectionsOrder.length) {
            stopWalkthrough(true); // Completed
            return;
        }

        const sectionId = sectionsOrder[walkthroughStep];
        const sectionEl = document.getElementById(sectionId);

        if (sectionEl) {
            // 1. Scroll to Section
            sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // 2. Set FAB to Explain Mode
            if (USE_FAB_IMAGE) {
                const fabImg = document.getElementById('fab-img');
                if (fabImg) fabImg.src = FAB_IMAGE_EXPLAIN;
            }

            // 3. Show Summary in Bubble (Without opening chat)
            const summary = summaries[sectionId];
            bubble.classList.add('visible');
            // Short preview logic
            const shortSummary = summary.length > 80 ? summary.substring(0, 80) + "..." : summary;
            bubble.innerHTML = `<i class="fas fa-comment-dots"></i> ${shortSummary}`;

            // Update Control Text
            const statusText = document.getElementById('wt-text');
            if (statusText) statusText.innerText = `Explaining ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`;

            // 4. Wait for user to read (8 seconds)
            if (walkthroughTimer) clearTimeout(walkthroughTimer);
            walkthroughTimer = setTimeout(() => {
                walkthroughStep++;
                processWalkthroughStep();
            }, 8000);
        } else {
            walkthroughStep++;
            processWalkthroughStep();
        }
    }

    function toggleWalkthroughPause() {
        walkthroughPaused = !walkthroughPaused;
        const btnIcon = document.querySelector('#wt-pause-btn i');
        if (walkthroughPaused) {
            if (walkthroughTimer) clearTimeout(walkthroughTimer);
            if (btnIcon) {
                btnIcon.classList.remove('fa-pause');
                btnIcon.classList.add('fa-play');
            }
            const statusText = document.getElementById('wt-text');
            if (statusText) statusText.innerText = "Paused";
        } else {
            if (btnIcon) {
                btnIcon.classList.remove('fa-play');
                btnIcon.classList.add('fa-pause');
            }
            processWalkthroughStep();
        }
    }

    function stopWalkthrough(completed = false) {
        walkthroughActive = false;
        if (walkthroughTimer) clearTimeout(walkthroughTimer);

        // Hide Controls
        const controls = document.getElementById('walkthrough-controls');
        if (controls) controls.style.display = 'none';

        // Open Chat with Summary
        toggleChat();

        setTimeout(() => {
            const finalSection = sectionsOrder[walkthroughStep] || 'contact';
            const msg = completed
                ? "Walkthrough complete! I've shown you the highlights. Any specific questions?"
                : `Walkthrough stopped at **${finalSection.toUpperCase()}**. Here is the detailed summary: \n\n${summaries[finalSection]}`;

            addMessage(msg, 'bot', true);
        }, 500);
    }

    // Bind Walkthrough Buttons (Wait for DOM or bind if elements exist)
    const pauseBtn = document.getElementById('wt-pause-btn');
    if (pauseBtn) pauseBtn.addEventListener('click', toggleWalkthroughPause);

    const stopBtn = document.getElementById('wt-stop-btn');
    if (stopBtn) stopBtn.addEventListener('click', () => stopWalkthrough(false));


    // --- Mode Selection Logic ---
    function askModeSelection() {
        if (messagesContainer.children.length > 0 && hasGreeted) return; // Don't ask if conversation exists

        addMessage("Hello! I'm Hari's Digital Twin & Engineering Assistant. How would you like to proceed?", 'bot');

        const modeContainer = document.createElement('div');
        modeContainer.style.display = 'flex';
        modeContainer.style.gap = '10px';
        modeContainer.style.marginTop = '10px';
        modeContainer.style.justifyContent = 'center';

        const apiBtn = document.createElement('button');
        apiBtn.innerText = 'Use API Key';
        apiBtn.className = 'chat-chip';
        apiBtn.style.background = 'var(--gradient-1)'; // Highlight
        apiBtn.onclick = () => handleModeChoice('api');

        const localBtn = document.createElement('button');
        localBtn.innerText = 'Local Mode';
        localBtn.className = 'chat-chip';
        localBtn.onclick = () => handleModeChoice('local');

        modeContainer.appendChild(apiBtn);
        modeContainer.appendChild(localBtn);
        messagesContainer.appendChild(modeContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        hasGreeted = true;
    }

    function handleModeChoice(mode) {
        // Clear buttons
        const lastMsg = messagesContainer.lastElementChild;
        if (lastMsg.tagName === 'DIV' && lastMsg.style.display === 'flex') {
            lastMsg.remove();
        }

        if (mode === 'api') {
            addMessage("Enable Intelligence Mode: Please paste your API Key (Groq, Gemini, or OpenRouter).", 'bot');
            const inputContainer = document.querySelector('.chat-input-container');
            if (inputContainer) {
                inputContainer.style.display = 'flex';
                inputContainer.classList.add('fade-in'); // Add animation class if exists
                setTimeout(() => document.getElementById('chat-input').focus(), 100);
            }
        } else {
            addMessage("Local Mode active. Ask me about services, projects, process, or starting a contract build.", 'bot');
            // Ensure input is hidden
            const inputContainer = document.querySelector('.chat-input-container');
            if (inputContainer) inputContainer.style.display = 'none';

            renderChips(['Who is Hari?', 'Engineering Services', 'Flagship Projects', 'Start a Project', 'Process & Timeline']);
        }
    }

    // Toggle Chat Updated
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.add('open');
            bubble.classList.remove('visible');

            // Check if we need to ask for mode
            const hasKey = apiKeys.gemini || apiKeys.groq || apiKeys.openrouter;
            if (!hasKey && !hasGreeted) {
                askModeSelection();
            } else if (hasKey) {
                // If key exists, show input
                const inputContainer = document.querySelector('.chat-input-container');
                if (inputContainer) inputContainer.style.display = 'flex';
                if (!hasGreeted) {
                    addMessage("Welcome back! Systems online.", 'bot');
                    renderChips(['Start Tour', ...defaultChips]);
                    hasGreeted = true;
                }
            } else {
                // Returning to local mode
                if (messagesContainer.children.length === 0) {
                    // Should not really happen if hasGreeted is true but just in case
                    askModeSelection();
                }
            }

        } else {
            chatWindow.classList.remove('open');
        }
    }

    // Unified Processing Logic
    async function processBotResponse(text) {
        // 1. Check for specific context commands first
        const lowerText = text.toLowerCase();

        // --- API KEY DETECTION ---
        let keyDetected = false;
        let pName = "";

        if (text.startsWith('sk-or-v1-')) {
            apiKeys.openrouter = text.trim();
            localStorage.setItem('openrouter_key', apiKeys.openrouter);
            pName = "OpenRouter";
            keyDetected = true;
        } else if (text.startsWith('gsk_')) {
            apiKeys.groq = text.trim();
            localStorage.setItem('groq_key', apiKeys.groq);
            pName = "Groq";
            keyDetected = true;
        } else if (text.startsWith('AIza')) {
            apiKeys.gemini = text.trim();
            localStorage.setItem('gemini_key', apiKeys.gemini);
            pName = "Gemini";
            keyDetected = true;
        }

        if (keyDetected) {
            // HIDE PRETEXT VALUES (Remove the raw key message from view)
            const userMsgs = document.querySelectorAll('.user-message');
            if (userMsgs.length > 0) {
                const lastUserMsg = userMsgs[userMsgs.length - 1];
                lastUserMsg.innerText = `[${pName} Key Provided]`;
                lastUserMsg.style.fontStyle = 'italic';
                lastUserMsg.style.opacity = '0.7';
            }

            addMessage(`${pName} API Connected! Chat input enabled.`, 'bot');
            return;
        }

        // 2. Determine if we can use an API
        const hasKey = apiKeys.gemini || apiKeys.groq || apiKeys.openrouter;


        if (hasKey) {
            // New Typing Indicator
            const thinkingHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>`;
            const thinkingMsgId = addMessage(thinkingHTML, 'bot', false, true);

            try {
                let response = "";

                // API selection logic remains, but with better response verification in functions
                if (apiKeys.gemini) {
                    response = await callGemini(text, apiKeys.gemini);
                } else if (apiKeys.groq) {
                    response = await callGroq(text, apiKeys.groq);
                } else if (apiKeys.openrouter) {
                    response = await callOpenRouter(text, apiKeys.openrouter);
                }

                // Remove thinking bubbles
                const thinkingEl = document.getElementById(thinkingMsgId);
                if (thinkingEl) thinkingEl.remove();

                if (response) {
                    addMessage(response, 'bot', true);
                } else {
                    // Fallback if empty response
                    handleStaticResponse(text);
                }

            } catch (err) {
                console.error("API Error Details:", err);

                // Remove thinking bubbles immediately
                const thinkingEl = document.getElementById(thinkingMsgId);
                if (thinkingEl) thinkingEl.remove();

                // Show friendly error message
                const errorMsg = `<i>Connection interrupted.</i><br><small style="color:#ff6b6b">${err.message || 'Unknown Error'}</small>`;
                addMessage(errorMsg, 'bot', false, true);

                // Optional: Fallback to local mode automatically after error?
                setTimeout(() => handleStaticResponse(text), 2000);
            }
        } else {
            // No keys, use static response
            handleStaticResponse(text);
        }

        // Restore chips after a delay
        setTimeout(() => {
            if (suggestionsContainer) {
                suggestionsContainer.innerHTML = '';
                // Only show tour chips if not typing purely custom
                renderChips(['Start Tour', ...defaultChips]);
                suggestionsContainer.style.display = 'flex';
            }
        }, 2000);
    }

    // API Function Definitions (unchanged but included to complete block)
    async function callGemini(prompt, key) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
        const systemPrompt = "You are Justin's intelligent portfolio assistant. You are knowledgeable about Cybersecurity, Physics, and Coding. Answer briefly and professionally in the first person as if you are his digital twin.";
        const data = { contents: [{ parts: [{ text: systemPrompt + "\n\nUser: " + prompt }] }] };
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await response.json();
        return json.candidates[0].content.parts[0].text;
    }

    async function callGroq(prompt, key) {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const data = { model: "llama3-8b-8192", messages: [{ role: "system", content: "You are Justin's intelligent portfolio assistant. Answer briefly and professionally." }, { role: "user", content: prompt }] };
        const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await response.json();
        return json.choices[0].message.content;
    }

    async function callOpenRouter(prompt, key) {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        const data = { model: "mistralai/mistral-7b-instruct:free", messages: [{ role: "system", content: "You are Justin's intelligent portfolio assistant." }, { role: "user", content: prompt }] };
        const response = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.href }, body: JSON.stringify(data) });
        const json = await response.json();
        return json.choices[0].message.content;
    }

    // Static Fallback Logic
    function handleStaticResponse(text) {
        let response = "";
        const lowerText = text.toLowerCase();

        // Enhanced NLP-ish matching
        if (lowerText.includes("who is hari") || lowerText.includes("who is justin") || lowerText.includes("about you")) {
            response = "I'm **Hari Nandan K**, an **AI & Full-Stack Systems Engineer**. I design and build production AI products, workflow automations, internal data platforms, and secure web systems for ambitious companies and startups.";
        } else if (lowerText.includes("service") || lowerText.includes("what do you offer") || lowerText.includes("what can you build")) {
            response = "I offer four specialized engineering services:\n1. **AI Applications & LLM Systems** (Autonomous agents, custom RAG, grounded copilots)\n2. **Web Products & MVPs** (Fast, modern full-stack web applications with React/Next.js/Node)\n3. **Workflow Automations & Integrations** (WhatsApp bots, background workers, scrapers, internal tools)\n4. **Security Engineering & System Hardening** (Zero-trust audits, API protection, data privacy architectures).";
        } else if (lowerText.includes("process") || lowerText.includes("workflow") || lowerText.includes("timeline")) {
            response = "My engineering process follows 5 disciplined stages:\n- **01. Discover**: Align on product goals, bottlenecks, and success metrics.\n- **02. Architect**: Design system blueprints, schemas, and security boundaries.\n- **03. Build**: Rapid, modular engineering with transparent check-ins.\n- **04. Validate**: Comprehensive testing, security audits, and grounding checks.\n- **05. Deploy & Support**: Production rollout, telemetry, and complete handover.";
        } else if (lowerText.includes("start a project") || lowerText.includes("hire") || lowerText.includes("pricing") || lowerText.includes("budget")) {
            response = "Ready to kick off a project? You can submit your requirements, timeline, and budget through the **Start a Project** form at the bottom of the page, or email me directly at **harinandan.ofc@gmail.com**. I personally reply within 24 hours.";
        } else if (lowerText.includes("voide") || lowerText.includes("v.o.i.d.e")) {
            response = "**V.O.I.D.E.** is an autonomous industrial telemetry anomaly detection and equipment health monitoring system built for chiller plants and IoT infrastructure. It uses an 8-layer mathematical & physical auditing pipeline, ASHRAE Guideline 14 temporal regression, and zero-trust evidence critic guardrails. Check it out on [GitHub](https://github.com/Justin-io/V.O.I.D.E).";
        } else if (lowerText.includes("resume") || lowerText.includes("cv")) {
            response = "You can download my latest [Resume / CV](CV.pdf) or reach out directly at **harinandan.ofc@gmail.com** for specific project proposals.";
        } else if (lowerText.includes("email") || lowerText.includes("contact")) {
            response = "You can reach me directly at **harinandan.ofc@gmail.com** or submit an inquiry using the **Start a Project** section below.";
        } else if (lowerText.includes("q-safe")) {
            response = "**Q-SAFE** is a hybrid security sentinel combining an x86 Assembly core with Python neural anomaly detection models. Check it out on [GitHub](https://github.com/Justin-io/Q-SAFE).";
        } else if (lowerText.includes("chameleon")) {
            response = "**Chameleon-P2P** is an ephemeral messaging system featuring a Stealth-First design with end-to-end encrypted tunnels. Check it out on [GitHub](https://github.com/Justin-io/Chameleon-P2P).";
        } else if (lowerText.includes("bloomwatch")) {
            response = "**BLOOMWATCH-PRO** won 1st Place at NASA Space Apps (Thrissur) and was selected as a Global Nominee! It maps global vegetation phenology using NASA MODIS & VIIRS telemetry. Check it on [GitHub](https://github.com/Justin-io/BLOOMWATCH-PRO).";
        } else if (lowerText.includes("whatsapp") || lowerText.includes("feedback")) {
            response = "**WhatsApp Automation Suite** is a production campaign & feedback automation platform featuring Baileys multi-device socket engine, anti-spam rate limiting, 24-hour follow-up scheduler, and live inbox UI. Check it out on [GitHub](https://github.com/Justin-io/whatsapp-automation-suite).";
        } else if (lowerText.includes("fraud") || lowerText.includes("temporal gnn") || lowerText.includes("graph fraud")) {
            response = "**Real-Time Graph Fraud Platform** is an end-to-end streaming fraud detection platform featuring an 8-model progression, dynamic graph feature store, Temporal-GNN, and sub-50ms latency engineering. Check it out on [GitHub](https://github.com/Justin-io/realtime-graph-fraud-platform).";
        } else if (lowerText.includes("agentic bi") || lowerText.includes("bi platform") || lowerText.includes("business intelligence")) {
            response = "**Autonomous Agentic BI** is a conversational analytics platform pairing interactive dashboards with natural language exploration, 16-stage pipeline orchestration, AST SQL validation, and cryptographic evidence verification. Check it on [GitHub](https://github.com/Justin-io/autonomous-agentic-bi).";
        } else if (lowerText.includes("rag eval") || lowerText.includes("rag benchmark") || lowerText.includes("rag-eval")) {
            response = "**RAG Scientific Evaluation Platform** rigorously benchmarks 6 canonical architectures (Naive, Hybrid, Reranked, HyDE, GraphRAG, Agentic) across retrieval, grounding, and adversarial resilience. Check it on [GitHub](https://github.com/Justin-io/rag-eval-platform).";
        } else if (lowerText.includes("data scientist") || lowerText.includes("ai data scientist") || lowerText.includes("autonomous ai")) {
            response = "**Autonomous AI Data Scientist** is a production platform governed by a 21-state machine with semantic layer grounding, Bayesian hypothesis engine, and causal inference. Check it on [GitHub](https://github.com/Justin-io/autonomous-ai-data-scientist).";
        } else if (lowerText.includes("adnr") || lowerText.includes("audio workstation") || lowerText.includes("dsp")) {
            response = "**ADNR Workstation** is a modular desktop audio suite built with Python 3.11+, PySide6, and NumPy/SciPy featuring real-time PortAudio processing and batch WAV cleaning. Check it on [GitHub](https://github.com/Justin-io/adnr-workstation).";
        } else if (lowerText.includes("safespend") || lowerText.includes("safe spend") || lowerText.includes("finance")) {
            response = "**SafeSpend** is an AI personal finance and impulse control app with daily safe-spend limits, budget analytics, and Gemini AI assistant built with React and Vite. Check it on [GitHub](https://github.com/Justin-io/safespend).";
        } else if (lowerText.includes("tech stack") || lowerText.includes("skills")) {
            response = "My core engineering stack spans:\n- **AI & ML**: Python, LangGraph, LlamaIndex, Ollama, PyTorch, OpenAI / Gemini APIs\n- **Full-Stack**: TypeScript, React, Next.js, Node.js, Express, TailwindCSS\n- **Data Systems**: PostgreSQL, DuckDB, Redis, Apache Kafka, SQLite\n- **Systems & Security**: Rust, C/C++, Linux Systems, Zero-Trust Hardening";
        } else if (lowerText.includes("office hero") || lowerText.includes("utilities")) {
            response = "**Utilities & Tools**: Check out [tools.html](tools.html) for a suite of client-side browser tools for PDFs, formatters, and dev utilities.";
        } else if (lowerText.includes("explain") || summaries[lowerText]) {
            const section = lowerText.replace("explain ", "").trim();
            response = summaries[section] || summaries[currentSection] || "This section showcases my engineering work.";
        } else {
            response = "I'm currently in **Local Mode**. You can ask about my engineering services, flagship projects (Agentic BI, RAG, WhatsApp Automation, V.O.I.D.E.), process, or how to start a project!";
        }

        const formatted = parseMarkdown(response);
        setTimeout(() => addMessage(formatted, 'bot', false, true), 500);
    }

    function handleChipClick(text) {
        if (text.includes("Start Tour")) {
            startWalkthrough();
            return;
        }
        // Use the unified handler
        addMessage(text, 'user');
        if (suggestionsContainer) suggestionsContainer.style.display = 'none';
        processBotResponse(text);
    }

    function renderChips(chipsList) {
        if (!suggestionsContainer) return;
        suggestionsContainer.innerHTML = '';
        chipsList.forEach(text => {
            const chip = document.createElement('button');
            chip.className = 'chat-chip';
            chip.innerText = text;
            chip.addEventListener('click', () => handleChipClick(text));
            suggestionsContainer.appendChild(chip);
        });
    }

    // --- API Functions ---
    // Helper for timeout
    const fetchWithTimeout = async (resource, options = {}) => {
        const { timeout = 8000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    };

    async function callGemini(prompt, key) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
        // Context instruction
        const systemPrompt = "You are Justin's intelligent portfolio assistant. You are knowledgeable about Cybersecurity, Physics, and Coding. Answer briefly and professionally in the first person as if you are his digital twin.";

        const data = {
            contents: [{
                parts: [{ text: systemPrompt + "\n\nUser: " + prompt }]
            }]
        };

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || `Gemini Error: ${response.status}`);
        }
        const json = await response.json();
        return json.candidates[0].content.parts[0].text;
    }

    async function callGroq(prompt, key) {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const data = {
            model: "llama3-8b-8192", // Fast model
            messages: [
                { role: "system", content: "You are Justin's intelligent portfolio assistant. Answer briefly and professionally." },
                { role: "user", content: prompt }
            ]
        };

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || `Groq Error: ${response.status}`);
        }
        const json = await response.json();
        return json.choices[0].message.content;
    }

    async function callOpenRouter(prompt, key) {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        const data = {
            model: "mistralai/mistral-7b-instruct:free", // Default to free or low cost
            messages: [
                { role: "system", content: "You are Justin's intelligent portfolio assistant." },
                { role: "user", content: prompt }
            ]
        };

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            let errorMsg = `OpenRouter Error: ${response.status}`;
            try {
                const err = await response.json();
                if (err.error && err.error.message) errorMsg = err.error.message;
            } catch (e) { }
            throw new Error(errorMsg);
        }
        const json = await response.json();
        if (!json.choices || !json.choices.length) throw new Error("Invalid response from OpenRouter");
        return json.choices[0].message.content;
    }

    // Add Message to Chat (Enhanced)
    let currentTypingInterval = null;

    function addMessage(text, sender, isTyping = false, isHTML = false) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add(sender === 'bot' ? 'bot-message' : 'user-message');
        const uniqueId = 'msg-' + Date.now();
        msgDiv.id = uniqueId;

        if (isHTML) {
            msgDiv.innerHTML = text; // Direct inject for loading icons etc
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return uniqueId;
        }

        if (isTyping && sender === 'bot') {
            msgDiv.innerText = "";
            messagesContainer.appendChild(msgDiv);

            if (currentTypingInterval) clearInterval(currentTypingInterval);

            let i = 0;
            const typingSpeed = 5;

            currentTypingInterval = setInterval(() => {
                msgDiv.innerText += text.charAt(i);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                i++;
                if (i > text.length - 1) {
                    clearInterval(currentTypingInterval);
                    currentTypingInterval = null;
                    // Parse markdown-like formatting after typing if simple
                    msgDiv.innerHTML = msgDiv.innerText.replace(/\n/g, '<br>');
                }
            }, typingSpeed);

        } else {
            msgDiv.innerText = text;
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        return uniqueId;
    }

    // Provide Summary
    let lastSummarySection = null;
    function provideSummary(sectionId) {
        if (!sectionId || !summaries[sectionId]) return;
        if (sectionId === lastSummarySection && isChatOpen) return;

        const summary = summaries[sectionId];
        // Render with markdown support
        const formattedSummary = parseMarkdown(summary);
        addMessage(formattedSummary, 'bot', true, true);
        lastSummarySection = sectionId;
    }

    // Markdown Helper
    function parseMarkdown(text) {
        if (!text) return "";
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline Code
            .replace(/\n/g, '<br>'); // Line breaks
        return html;
    }


    // Event Listeners
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => {
        isChatOpen = false;
        chatWindow.classList.remove('open');
    });

    bubble.addEventListener('click', () => {
        if (!isChatOpen) toggleChat();
    });

    // --- SCROLL-BASED THINKING LOGIC ---
    let scrollTimeout = null;

    window.addEventListener('scroll', () => {
        // 1. Check if we are in a "Non-Thinking" zone (based on last known section)
        // We use the observer's `currentSection` state.

        // If we are currently on Home or Footer, DO NOT think.
        const isHomeOrFooter = (currentSection === 'home' || currentSection === 'footer');
        if (isHomeOrFooter) return;

        // 2. If valid section: Start Thinking immediately
        if (USE_FAB_IMAGE && !walkthroughActive) {
            const fabImg = document.getElementById('fab-img');
            if (fabImg) {
                // Set to thinking image
                // Optimization: Only update DOM if src is different
                if (!fabImg.src.includes(FAB_IMAGE_THINK)) {
                    fabImg.src = FAB_IMAGE_THINK;
                }

                // Clear any existing timer to revert
                if (scrollTimeout) clearTimeout(scrollTimeout);

                // 3. Set timer to stop thinking 3.5s AFTER scrolling stops
                scrollTimeout = setTimeout(() => {
                    fabImg.src = FAB_IMAGE_REST;
                }, 3500);
            }
        }
    });

    // Interaction Observer for Sections
    // Adjusted detection for better feel
    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const tagName = entry.target.tagName.toLowerCase();

                // 1. NON-THINKING ZONE (Home or Footer)
                if (sectionId === 'home' || tagName === 'footer') {
                    currentSection = sectionId === 'home' ? 'home' : 'footer';

                    // Only hide bubble if NOT in walkthrough (walkthrough uses bubble)
                    if (!walkthroughActive) bubble.classList.remove('visible');

                    if (USE_FAB_IMAGE && !walkthroughActive) {
                        const fabImg = document.getElementById('fab-img');
                        if (fabImg) {
                            fabImg.src = FAB_IMAGE_REST;
                            if (thinkingTimeout) clearTimeout(thinkingTimeout);
                            if (scrollTimeout) clearTimeout(scrollTimeout);
                        }
                    }

                    // Hide FAB in both Home and Footer
                    // But if Walkthrough is active, keep it visible!
                    // Hide FAB in both Home and Footer
                    // But if Walkthrough is active, keep it visible!
                    if (!walkthroughActive) {
                        toggleBtn.style.transform = 'scale(0) rotate(180deg)'; // Added rotation for flair
                        toggleBtn.style.opacity = '0';
                        toggleBtn.style.pointerEvents = 'none'; // Ensure no clicks
                    } else {
                        // Ensure it's visible if walkthrough IS active
                        toggleBtn.style.transform = 'scale(1) rotate(0deg)';
                        toggleBtn.style.opacity = '1';
                        toggleBtn.style.pointerEvents = 'auto';
                    }

                    // Specific Logic for Home vs Footer
                    if (sectionId === 'home' && !walkthroughActive) {
                        startHeroAnimation();
                    } else {
                        stopHeroAnimation(); // Always stop hero glitch if we aren't "idle" on home
                    }
                    return;
                }

                // 2. ACTIVE SECTIONS
                currentSection = sectionId;

                // Show FAB
                // Show FAB
                toggleBtn.style.transform = 'scale(1) rotate(0deg)';
                toggleBtn.style.opacity = '1';
                toggleBtn.style.pointerEvents = 'auto';

                // Stop Hero Animation if leaving home
                stopHeroAnimation();

                if (summaries[sectionId]) {
                    // Update Bubble text if chat is closed AND not in walkthrough
                    if (!isChatOpen && !walkthroughActive) {
                        bubble.innerHTML = `Summarize <b>${sectionId.toUpperCase()}</b>?`;
                        bubble.classList.add('visible');
                    } else if (isChatOpen) {
                        provideSummary(sectionId);
                    }
                    // If walkthroughActive, processWalkthroughStep handles the bubble.
                }
            }
        });
    }, observerOptions);

    // Observe all sections and footer
    document.querySelectorAll('section, header, footer').forEach(element => {
        if (element.id || element.tagName.toLowerCase() === 'footer') {
            observer.observe(element);
        }
    });
});
