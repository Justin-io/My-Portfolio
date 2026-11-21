(() => {
  'use strict';

  const boot = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A very thin reading-position indicator; it does not affect layout.
    const progress = document.createElement('div');
    progress.id = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    let ticking = false;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, ratio)) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();

    // Reveal image-led case studies as they enter the viewport.
    const revealTargets = document.querySelectorAll('.flagship-card, .lab-card');
    if (!reduceMotion && 'IntersectionObserver' in window) {
      document.body.classList.add('motion-ready');
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

      revealTargets.forEach((element, index) => {
        element.dataset.motion = 'reveal';
        element.style.setProperty('--motion-delay', (index % 3) * 75 + 'ms');
        revealObserver.observe(element);
      });
    } else {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
    }

    // Subtle, localized light follows the pointer on large screens.
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const cards = document.querySelectorAll(
        '.flagship-card, .lab-card, .service-card, .process-card, .skills-cat-card, .achievement-card, .testimonial-card, .contact-card'
      );

      cards.forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--spot-x', (event.clientX - rect.left) + 'px');
          card.style.setProperty('--spot-y', (event.clientY - rect.top) + 'px');
        }, { passive: true });

        card.addEventListener('pointerleave', () => {
          card.style.removeProperty('--spot-x');
          card.style.removeProperty('--spot-y');
        }, { passive: true });
      });
    }

    // Keep the navigation state aligned with the section currently in view.
    if ('IntersectionObserver' in window) {
      const links = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
      const targets = links
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

      if (targets.length) {
        const navObserver = new IntersectionObserver((entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (!visible) return;
          links.forEach((link) => {
            const active = link.getAttribute('href') === '#' + visible.target.id;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }, {
          rootMargin: '-22% 0px -62% 0px',
          threshold: [0, 0.1, 0.25, 0.5]
        });

        targets.forEach((target) => navObserver.observe(target));
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();