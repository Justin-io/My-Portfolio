        
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
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        
        // Create advanced particle system
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 4000;
        const posArray = new Float32Array(particlesCount * 3);
        const colorsArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i += 3) {
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
        
        // Parallax effect for hero content
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
// Mobile menu toggle: ensure the .menu-toggle controls .nav-links on small screens
document.addEventListener('DOMContentLoaded', function() {
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

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        setOpenState(!navLinks.classList.contains('active'));
    }, { passive: false });

    // Close when a nav link is clicked (useful on mobile)
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function() {
            // Allow smooth scroll to start before closing
            setTimeout(() => setOpenState(false), 50);
        });
    });

    // Close when clicking outside the nav area
    document.addEventListener('click', function(e) {
        if (!navLinks.classList.contains('active')) return;
        if (e.target.closest('.nav-container')) return;
        setOpenState(false);
    }, { passive: true });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            setOpenState(false);
        }
    });

    // Ensure menu is closed on larger screens when resizing
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            setOpenState(false);
        }
    });
});
