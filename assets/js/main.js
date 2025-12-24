
// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 2000);
});

// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

// Add hover effect to interactive elements
const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card');
interactiveElements.forEach(elem => {
    elem.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    elem.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});


// Advanced Three.js Background
function initThreeJS() {
    const config = window.performanceManager.config;

    if (!config.enableThreeJS) {
        console.log('Three.js disabled due to performance settings.');
        document.body.classList.add('no-webgl'); // Add class for CSS fallback if needed
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: config.tier === 'HIGH' }); // Antialias only on high tier if we wanted, but config doesn't have tier. Let's stick to true or use config. 
    // Better: antialias: true is standard, maybe false for medium? Let's just keep true for now or strictly follow config if we added it.

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Create advanced particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = config.particleCount; // Use dynamic count
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 20;
        posArray[i + 1] = (Math.random() - 0.5) * 20;
        posArray[i + 2] = (Math.random() - 0.5) * 20;

        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6);
        colorsArray[i] = color.r;
        colorsArray[i + 1] = color.g;
        colorsArray[i + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.008,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create geometric shapes
    const geometry1 = new THREE.IcosahedronGeometry(2, 1);
    const material1 = new THREE.MeshPhongMaterial({
        color: 0x0066ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });

    const mesh1 = new THREE.Mesh(geometry1, material1);
    scene.add(mesh1);

    const geometry2 = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material2 = new THREE.MeshPhongMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });

    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.x = 5;
    scene.add(mesh2);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x0066ff, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00d4ff, 1);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    camera.position.z = 8;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth mouse following
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        particlesMesh.rotation.x += 0.0005;
        particlesMesh.rotation.y += 0.0005;

        mesh1.rotation.x += 0.001;
        mesh1.rotation.y += 0.001;
        mesh1.position.x = targetX * 2;
        mesh1.position.y = targetY * 2;

        mesh2.rotation.x -= 0.001;
        mesh2.rotation.y -= 0.001;
        mesh2.position.x = -targetX * 2;
        mesh2.position.y = -targetY * 2;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize Three.js based on Performance Config
if (window.performanceManager) {
    initThreeJS();
} else {
    // Fallback if script didn't load for some reason, default to full
    window.addEventListener('load', initThreeJS);
}

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

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

// Project filter
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
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

// Form submission
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Here you would normally send the data to a server
    console.log('Form submitted:', data);

    // Show success message
    const form = e.target;
    const originalContent = form.innerHTML;
    form.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #00ff64; margin-bottom: 20px;"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Message Sent Successfully!</h3>
                    <p style="color: var(--text-secondary);">Thank you for reaching out. I'll get back to you within 24 hours.</p>
                </div>
            `;

    // Reset form after 5 seconds
    setTimeout(() => {
        form.innerHTML = originalContent;
        form.reset();

        // Re-attach event listener
        document.getElementById('contactForm').addEventListener('submit', arguments.callee);
    }, 5000);
});

// GSAP Animations
if (window.performanceManager && window.performanceManager.config.enableComplexAnimations) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    gsap.from('.hero-badge', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 2.5
    });

    gsap.from('.hero h1', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 2.7
    });

    gsap.from('.hero .subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 2.9
    });

    gsap.from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 3.1
    });

    gsap.from('.hero-card', {
        opacity: 0,
        x: 100,
        rotation: 5,
        duration: 1,
        delay: 3.3
    });

    // Section animations
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.2
        });
    });

    // About section animation
    gsap.from('.about-content', {
        scrollTrigger: {
            trigger: '.about-content',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -50,
        duration: 1
    });

    gsap.from('.about-visual', {
        scrollTrigger: {
            trigger: '.about-visual',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: 50,
        duration: 1
    });

    // Project cards animation
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: index * 0.1
        });
    });

    // Skill cards animation
    gsap.utils.toArray('.skill-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            delay: index * 0.1
        });
    });

    // Timeline animation
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: index % 2 === 0 ? -50 : 50,
            duration: 0.8
        });
    });

    // Contact section animation
    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -50,
        duration: 1
    });

    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: 50,
        duration: 1
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
        if (images.length === 0) return;
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
    // Set to true to use a static image instead of the Lottie animation
    const USE_FAB_IMAGE = true;
    const FAB_IMAGE_REST = 'assets/img/hi.gif';  // Default "Rest" state
    const FAB_IMAGE_THINK = 'assets/img/think.gif'; // "Thinking" state
    // -------------------------

    const toggleBtn = document.getElementById('ai-toggle-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const bubble = document.getElementById('ai-notification-bubble');
    const messagesContainer = document.getElementById('chat-messages');

    // Apply FAB Image if enabled
    if (USE_FAB_IMAGE) {
        toggleBtn.innerHTML = `<img src="${FAB_IMAGE_REST}" alt="AI Assistant" id="fab-img">`;
        toggleBtn.style.background = 'transparent'; // Remove white background for image if needed
        toggleBtn.style.boxShadow = 'none'; // Optional: cleaner look for some avatars
    }

    // Section Summaries - Enhanced Content
    // Section Summaries - Enhanced First-Person POV
    const summaries = {
        'home': "Welcome to my digital workspace. I'm Justin, a developer obsessed with the intersection of AI, Security, and System Architecture. This portfolio isn't just a showcase; it's a window into my experiments with code and creativity.",
        'about': "My journey started with a curiosity for how things work under the hood. Now, I specialize in building autonomous agents and secure frameworks. I don't just write code; I architect solutions that think and adapt.",
        'projects': "These aren't just repos; they're my R&D lab. Q-SAFE, RED-QUEEN, F.R.I.D.A.Y.—each represents a challenge I wanted to solve. Whether it's offensive AI or quantum security, I build what I want to see in the world.",
        'research': "I'm redefining boundaries with Q-SAFE, a Hybrid Sentinel framework, and exploring quantum-time geometry with Chronon-SQL. My research aims to secure the next generation of computing.",
        'skills': "I believe in the right tool for the job. My stack is heavy on performance (Rust, C++, ASM) and intelligence (Python, AI Agents). I treat languages like superpowers—combining them to solve complex problems.",
        'timeline': "Every milestone has been a lesson. From enhancing global satellite data at NASA Space Apps to founding ShopRoyince, I've applied my skills in high-stakes environments where precision matters.",
        'contact': "Communication is key. If you have an idea, a challenge, or just want to talk shop about the future of AI and security, drop me a message. I'm always open to collaboration."
    };

    let currentSection = 'home';
    let isChatOpen = false;
    let hasGreeted = false;
    let thinkingTimeout = null; // Track thinking timer

    const HERO_IMAGE_ORIGINAL = 'assets/img/me.jpg';
    let heroInterval = null;

    // Add click listener to Hero Image for manual summoning
    const heroImageElement = document.querySelector('.hero-card-content img');
    if (heroImageElement) {
        heroImageElement.style.cursor = "pointer";
        heroImageElement.addEventListener('click', () => {
            // Stop glitching
            stopHeroAnimation();

            // Summon the Bot
            if (toggleBtn) {
                toggleBtn.style.transform = 'scale(1)';
                toggleBtn.style.opacity = '1';
                // Add a small glitch effect to the button entry
                toggleBtn.classList.add('glitch-effect');
                setTimeout(() => { toggleBtn.classList.remove('glitch-effect'); }, 500);
            }

            // Open Chat
            if (!isChatOpen) toggleChat();
        });
    }

    function startHeroAnimation() {
        if (heroInterval) return;
        const heroImg = document.querySelector('.hero-card-content img');
        if (!heroImg) return;

        heroInterval = setInterval(() => {
            // Trigger Glitch
            heroImg.classList.add('glitch-effect');

            // Swap Image mid-glitch (Slower timing: 400ms)
            setTimeout(() => {
                if (heroImg.src.includes('me.jpg')) {
                    heroImg.src = FAB_IMAGE_REST;
                    heroImg.style.borderRadius = "50%"; // Match FAB style
                } else {
                    heroImg.src = HERO_IMAGE_ORIGINAL;
                }
            }, 400);

            // Remove Glitch class after animation (Slower timing: 800ms)
            setTimeout(() => {
                heroImg.classList.remove('glitch-effect');
            }, 800);

        }, 3000); // Slower interval for better impact
    }

    function stopHeroAnimation() {
        if (heroInterval) {
            clearInterval(heroInterval);
            heroInterval = null;
        }
        const heroImg = document.querySelector('.hero-card-content img');
        if (heroImg) {
            // Reset to original state
            heroImg.classList.remove('glitch-effect');
            heroImg.src = HERO_IMAGE_ORIGINAL;
        }
    }

    // --- WALKTHROUGH LOGIC ---
    let walkthroughActive = false;
    let walkthroughPaused = false;
    let walkthroughStep = 0;
    let walkthroughTimer = null;
    const sectionsOrder = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
    const FAB_IMAGE_EXPLAIN = 'assets/img/explain.png';

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


    // Toggle Chat
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.add('open');
            bubble.classList.remove('visible'); // Hide bubble when chat is open

            const startTourChip = 'Start Tour 🚀';

            if (!hasGreeted || messagesContainer.children.length === 0) {
                addMessage("Hello! I'm Justin's Digital Twin. I can show you around the portfolio.", 'bot');
                renderChips([startTourChip, ...defaultChips]);
                hasGreeted = true;
            } else {
                // If returning, show chips based on context
                renderChips([startTourChip, ...defaultChips]);
            }

            // If we have a specific section context, mention it
            if (summaries[currentSection] && currentSection !== 'home') {
                // Optional: Add a specific chip for the current section
                const contextChips = [`Explain ${currentSection}`, startTourChip, ...defaultChips.slice(0, 2)];
                renderChips(contextChips);
            }

        } else {
            chatWindow.classList.remove('open');
        }
    }

    // Chat Chips Logic
    const defaultChips = ['Who is Justin?', 'Tell me about Q-SAFE', 'Tech Stack?', 'How to Contact?'];
    const suggestionsContainer = document.getElementById('chat-suggestions');

    function renderChips(chips) {
        if (!suggestionsContainer) return;
        suggestionsContainer.innerHTML = '';

        chips.forEach(text => {
            const chip = document.createElement('div');
            chip.className = 'chat-chip';
            chip.innerText = text;
            chip.addEventListener('click', () => handleChipClick(text));
            suggestionsContainer.appendChild(chip);
        });
    }

    function handleChipClick(text) {
        if (text.includes("Start Tour")) {
            startWalkthrough();
            return;
        }

        // 1. User Message
        addMessage(text, 'user');

        // 2. Clear chips temporarily
        suggestionsContainer.innerHTML = '';

        // 3. Bot Response logic
        let response = "";

        if (text.includes("Who is Justin")) {
            response = "I'm a full-stack developer and security researcher with a passion for AI, Quantum Computing, and Ethical Hacking. I build systems that bridge the gap between abstract theory and robust application.";
        } else if (text.includes("Q-SAFE")) {
            response = "Q-SAFE is my flagship research project: a Hybrid 'Sentinel' framework. It uses an x86 Assembly core for speed and a Python Neural Oracle to detect threats agentically. It's designed to be quantum-resilient.";
        } else if (text.includes("Tech Stack")) {
            response = "My arsenal includes Python, Rust, Java, and JavaScript (Node/React). I also work deeply with Assembly (x86), Linux Kernel modules, and AI frameworks like Ollama and PyTorch.";
        } else if (text.includes("Contact")) {
            response = "You can reach me via the contact form below, or check out my GitHub profiles linked in the projects!";
        } else if (text.includes("Explain")) {
            // Dynamic section explanation
            const section = text.replace("Explain ", "").toLowerCase();
            response = summaries[section] || "This section showcases my work.";
        } else {
            response = "I'm here to help navigate the portfolio. Try checking out the Projects section!";
        }

        // 4. Send Response
        // Use a small delay for "thinking" feel
        setTimeout(() => {
            addMessage(response, 'bot', true);
            // Restore default chips after response
            const startTourChip = 'Start Tour 🚀';
            setTimeout(() => renderChips([startTourChip, ...defaultChips]), 2000 + (response.length * 10));
        }, 500);
    }

    // Add Message to Chat

    // Add Message to Chat
    let currentTypingInterval = null;

    function addMessage(text, sender, isTyping = false) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add(sender === 'bot' ? 'bot-message' : 'user-message');

        if (isTyping && sender === 'bot') {
            msgDiv.innerText = "";
            messagesContainer.appendChild(msgDiv);

            // Clear any existing typing interval to prevent overlaps
            if (currentTypingInterval) {
                clearInterval(currentTypingInterval);
            }

            let i = 0;
            // Enhanced typing speed logic for better flow
            const typingSpeed = 10;

            currentTypingInterval = setInterval(() => {
                msgDiv.innerText += text.charAt(i);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                i++;
                if (i > text.length - 1) {
                    clearInterval(currentTypingInterval);
                    currentTypingInterval = null;
                }
            }, typingSpeed);

        } else {
            msgDiv.innerText = text;
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Provide Summary
    let lastSummarySection = null;
    function provideSummary(sectionId) {
        if (!sectionId || !summaries[sectionId]) return;

        // Don't repeat if it's the same section interaction
        if (sectionId === lastSummarySection && isChatOpen) return;

        const summary = summaries[sectionId];
        // Cleaner intro
        const message = `${summary}`;

        // Use typing effect primarily when auto-triggered
        addMessage(message, 'bot', true);
        lastSummarySection = sectionId;
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
                    if (!walkthroughActive) {
                        toggleBtn.style.transform = 'scale(0)';
                        toggleBtn.style.opacity = '0';
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
                toggleBtn.style.transform = 'scale(1)';
                toggleBtn.style.opacity = '1';

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
