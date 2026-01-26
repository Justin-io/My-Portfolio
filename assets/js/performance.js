/**
 * Performance Manager
 * Detects device capabilities and sets a performance tier.
 */
class PerformanceManager {
    constructor() {
        this.tier = this.detectTier();
        this.config = this.getConfig();
        console.log(`Performance Tier: ${this.tier}`);
    }

    detectTier() {
        // 1. Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return 'LOW';
        }

        // 2. Check for explicit data saver mode
        if (navigator.connection && navigator.connection.saveData) {
            return 'LOW';
        }

        // 3. Hardware Concurrency (CPU Cores)
        // Many low-end mobile devices have 4 cores, but weak ones.
        // We'll treat < 4 as definitely LOW.
        const cores = navigator.hardwareConcurrency || 4;

        // 4. Memory (RAM) - Experimental API
        const memory = navigator.deviceMemory || 4; // Default to 4GB if unknown

        // 5. Screen size (Mobile vs Desktop)
        const isMobile = window.innerWidth < 768;

        if (cores < 4 || memory < 2) {
            return 'LOW';
        }

        if (isMobile) {
            // High-end mobile phones can handle MEDIUM
            return 'MEDIUM';
        }

        // Desktop/Tablet with decent specs
        return 'HIGH';
    }

    getConfig() {
        switch (this.tier) {
            case 'LOW':
                return {
                    enableThreeJS: false,
                    particleCount: 0,
                    enableParallax: false,
                    enableComplexAnimations: false
                };
            case 'MEDIUM':
                return {
                    enableThreeJS: true,
                    particleCount: 1000, // Reduced from 4000
                    enableParallax: true, // Parallax is okay on medium
                    enableComplexAnimations: true
                };
            case 'HIGH':
            default:
                return {
                    enableThreeJS: true,
                    particleCount: 4000, // Original count
                    enableParallax: true,
                    enableComplexAnimations: true
                };
        }
    }
}

// Initialize and expose globally
window.performanceManager = new PerformanceManager();
