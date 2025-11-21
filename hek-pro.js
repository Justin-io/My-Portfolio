
(function() {
    'use strict';
    
    // Configuration
    const config = {
        mockContent: "HIGH END PROTECTION NEEDED\n\nThis device has been permanently blocked due to unauthorized access attempts.",
        mockFilename: "device-blocked.txt",
        redirectUrl: "about:blank",
        detectionInterval: 1000,  // Increased to reduce CPU usage
        consoleClearInterval: 2000,
        debuggerInterval: 500,
        protectionLevel: 5,
        maxAttempts: 2, // Block after 2 dev tool attempts
        storageKey: "dev_protect_" + btoa(navigator.userAgent + screen.width + screen.height + Date.now()).slice(0, 20)
    };
    
    // State variables
    let devtoolsOpen = false;
    let lastActivity = Date.now();
    let protectionActive = false;  // Changed to false initially
    let debuggerCounter = 0;
    let deviceBlocked = false;
    let detectionActive = true;
    
    // Mock content for download attempts
    const MOCK_CONTENT = config.mockContent;
    const MOCK_FILENAME = config.mockFilename;
    
    // Storage Manager with multiple fallbacks
    const StorageManager = {
        // Get data from all available storage mechanisms
        async getData() {
            let data = { attempts: 0, blocked: false, lastAttempt: 0 };
            
            // Try localStorage
            try {
                const localData = localStorage.getItem(config.storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    data = { ...data, ...parsed };
                }
            } catch (e) {}
            
            // Try IndexedDB
            try {
                const dbData = await this.getIndexedDBData();
                if (dbData) {
                    data = { ...data, ...dbData };
                }
            } catch (e) {}
            
            // Try sessionStorage
            try {
                const sessionData = sessionStorage.getItem(config.storageKey);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    data = { ...data, ...parsed };
                }
            } catch (e) {}
            
            return data;
        },
        
        // Set data to all available storage mechanisms
        async setData(data) {
            const serialized = JSON.stringify(data);
            
            // Set to localStorage
            try {
                localStorage.setItem(config.storageKey, serialized);
            } catch (e) {}
            
            // Set to IndexedDB
            try {
                await this.setIndexedDBData(data);
            } catch (e) {}
            
            // Set to sessionStorage
            try {
                sessionStorage.setItem(config.storageKey, serialized);
            } catch (e) {}
            
            // Set to cookie as fallback
            try {
                document.cookie = `${config.storageKey}=${encodeURIComponent(serialized)}; max-age=31536000; path=/; samesite=strict`;
            } catch (e) {}
        },
        
        // IndexedDB operations
        async getIndexedDBData() {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => resolve(null), 500);
                
                try {
                    const request = indexedDB.open('ProtectionDB', 1);
                    
                    request.onerror = () => {
                        clearTimeout(timeout);
                        resolve(null);
                    };
                    
                    request.onsuccess = (event) => {
                        clearTimeout(timeout);
                        const db = event.target.result;
                        
                        if (!db.objectStoreNames.contains('protection')) {
                            resolve(null);
                            return;
                        }
                        
                        const transaction = db.transaction('protection', 'readonly');
                        const store = transaction.objectStore('protection');
                        const getRequest = store.get(config.storageKey);
                        
                        getRequest.onsuccess = (e) => {
                            resolve(e.target.result || null);
                        };
                        
                        getRequest.onerror = () => {
                            resolve(null);
                        };
                    };
                    
                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('protection')) {
                            db.createObjectStore('protection');
                        }
                    };
                } catch (e) {
                    clearTimeout(timeout);
                    resolve(null);
                }
            });
        },
        
        async setIndexedDBData(data) {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => resolve(), 500);
                
                try {
                    const request = indexedDB.open('ProtectionDB', 1);
                    
                    request.onerror = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                    
                    request.onsuccess = (event) => {
                        clearTimeout(timeout);
                        const db = event.target.result;
                        
                        if (!db.objectStoreNames.contains('protection')) {
                            resolve();
                            return;
                        }
                        
                        const transaction = db.transaction('protection', 'readwrite');
                        const store = transaction.objectStore('protection');
                        store.put(data, config.storageKey);
                        
                        transaction.oncomplete = () => resolve();
                        transaction.onerror = () => resolve();
                    };
                    
                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('protection')) {
                            db.createObjectStore('protection');
                        }
                    };
                } catch (e) {
                    clearTimeout(timeout);
                    resolve();
                }
            });
        },
        
        // Clear all storage (for testing)
        async clearAll() {
            try {
                localStorage.removeItem(config.storageKey);
                sessionStorage.removeItem(config.storageKey);
                document.cookie = `${config.storageKey}=; max-age=0; path=/`;
                
                const request = indexedDB.open('ProtectionDB', 1);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    if (db.objectStoreNames.contains('protection')) {
                        const transaction = db.transaction('protection', 'readwrite');
                        const store = transaction.objectStore('protection');
                        store.delete(config.storageKey);
                    }
                };
            } catch (e) {}
        }
    };
    
    // Utility functions
    const blockEvent = (e) => {
        if (protectionActive) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
    };
    
    const downloadMockFile = () => {
        const element = document.createElement('a');
        const file = new Blob([MOCK_CONTENT], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = MOCK_FILENAME;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        setTimeout(() => document.body.removeChild(element), 100);
    };
    
    const redirectAway = () => {
        window.location.href = config.redirectUrl;
    };
    
    const clearPage = () => {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #f00;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: monospace;
                z-index: 999999;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="font-size: 3em; margin-bottom: 20px;">ACCESS DENIED</h1>
                <p style="font-size: 1.5em; max-width: 800px;">
                    Unauthorized access attempt detected. This action has been logged.
                </p>
                <p style="margin-top: 30px; font-size: 1.2em;">
                    ${MOCK_CONTENT}
                </p>
            </div>
        `;
    };
    
    const blockDevice = async () => {
        deviceBlocked = true;
        protectionActive = true;
        detectionActive = false;
        
        // Update storage to mark device as blocked
        await StorageManager.setData({
            attempts: config.maxAttempts,
            blocked: true,
            lastAttempt: Date.now()
        });
        
        // Clear the page and show blocking message
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #f00;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: monospace;
                z-index: 999999;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="font-size: 3em; margin-bottom: 20px;">DEVICE PERMANENTLY BLOCKED</h1>
                <p style="font-size: 1.5em; max-width: 800px;">
                    This device has been blocked due to repeated unauthorized access attempts.
                </p>
                <p style="margin-top: 30px; font-size: 1.2em;">
                    ${MOCK_CONTENT}
                </p>
                <p style="margin-top: 40px; font-size: 1em;">
                    To unblock, please contact support with reference: ${config.storageKey}
                </p>
            </div>
        `;
        
        // Prevent all interactions
        const blockAllEvents = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // Block all possible events
        const events = [
            'contextmenu', 'selectstart', 'dragstart', 'copy', 'cut', 'paste',
            'keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'click',
            'dblclick', 'mousemove', 'mouseenter', 'mouseleave', 'mouseover',
            'mouseout', 'touchstart', 'touchend', 'touchmove', 'pointerdown',
            'pointerup', 'pointermove', 'wheel', 'beforeunload'
        ];
        
        events.forEach(event => {
            document.addEventListener(event, blockAllEvents, true);
            window.addEventListener(event, blockAllEvents, true);
        });
        
        // Prevent page unload
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = 'Your device is blocked. Are you sure you want to leave?';
            return 'Your device is blocked. Are you sure you want to leave?';
        });
        
        // Try to prevent closing the tab
        setInterval(() => {
            window.location.href = window.location.href;
        }, 1000);
        
        // Log the block
        console.log("%cDEVICE BLOCKED", "color: red; font-size: 40px; font-weight: bold;");
        console.log(`%cDevice ID: ${config.storageKey}`, "color: red; font-size: 20px;");
    };
    
    // Check device status on load
    const checkDeviceStatus = async () => {
        const data = await StorageManager.getData();
        
        if (data.blocked) {
            await blockDevice();
            return true;
        }
        
        return false;
    };
    
    // Record dev tool attempt
    const recordDevToolAttempt = async () => {
        const data = await StorageManager.getData();
        data.attempts += 1;
        data.lastAttempt = Date.now();
        
        if (data.attempts >= config.maxAttempts) {
            data.blocked = true;
            await blockDevice();
        } else {
            await StorageManager.setData(data);
            
            // Show warning
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 5px;
                z-index: 999999;
                font-family: monospace;
                font-size: 16px;
                max-width: 300px;
            `;
            warning.innerHTML = `
                <strong>WARNING!</strong><br>
                DevTools access detected.<br>
                Attempts: ${data.attempts}/${config.maxAttempts}<br>
                Device will be blocked after ${config.maxAttempts} attempts.
            `;
            document.body.appendChild(warning);
            
            setTimeout(() => {
                if (document.body.contains(warning)) {
                    document.body.removeChild(warning);
                }
            }, 5000);
        }
    };
    
    // Protection Layer 1: Event Blockers (only active when DevTools detected)
    const initEventBlockers = () => {
        // Disable right-click
        document.addEventListener('contextmenu', blockEvent, true);
        
        // Disable text selection
        document.addEventListener('selectstart', blockEvent, true);
        document.addEventListener('mousedown', (e) => {
            if (e.detail > 1) blockEvent(e);
        }, true);
        
        // Disable drag and drop
        document.addEventListener('dragstart', blockEvent, true);
        
        // Disable copy, cut, paste
        ['copy', 'cut', 'paste'].forEach(event => {
            document.addEventListener(event, blockEvent, true);
        });
        
        // Disable print screen
        document.addEventListener('keyup', (e) => {
            if (protectionActive && e.keyCode === 44) { // Print Screen
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: white;
                    z-index: 999999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    text-align: center;
                    padding: 20px;
                    color: black;
                `;
                overlay.textContent = MOCK_CONTENT;
                document.body.appendChild(overlay);
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                }, 1000);
            }
        }, true);
    };
    
    // Protection Layer 2: Keyboard Blocking (only active when DevTools detected)
    const initKeyboardBlockers = () => {
        document.addEventListener('keydown', (e) => {
            if (!protectionActive) return;
            
            // Allow only essential keys
            const allowedKeys = [
                8, 9, 13, 16, 17, 18, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46
            ];
            
            // Block all modifier combinations
            if (e.ctrlKey || e.metaKey || e.altKey) {
                // Allow only specific safe combinations
                const safeCombinations = [
                    [e.ctrlKey || e.metaKey, 65], // Ctrl/Cmd + A (select all)
                    [e.ctrlKey || e.metaKey, 67], // Ctrl/Cmd + C (copy)
                    [e.ctrlKey || e.metaKey, 86], // Ctrl/Cmd + V (paste)
                    [e.ctrlKey || e.metaKey, 88], // Ctrl/Cmd + X (cut)
                    [e.ctrlKey || e.metaKey, 90], // Ctrl/Cmd + Z (undo)
                ];
                
                const isSafe = safeCombinations.some(([mod, key]) => mod && e.keyCode === key);
                
                if (!isSafe) {
                    // Special handling for save
                    if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                        e.preventDefault();
                        downloadMockFile();
                        return false;
                    }
                    
                    blockEvent(e);
                    return false;
                }
            }
            
            // Block F12 and other dev tools keys
            if (e.keyCode === 123 || // F12
                (e.shiftKey && e.keyCode === 121) || // Shift + F10
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
                (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
                blockEvent(e);
                return false;
            }
            
            // Block all other keys if protection is active
            if (!allowedKeys.includes(e.keyCode)) {
                blockEvent(e);
                return false;
            }
        }, true);
    };
    
    // Protection Layer 3: DevTools Detection
    const initDevToolsDetection = () => {
        const checkDevTools = () => {
            if (!detectionActive) return;
            
            // More reliable detection with multiple methods
            const widthThreshold = 160;
            const heightThreshold = 160;
            
            // Method 1: Check window dimensions
            const dimensionCheck = (
                window.outerHeight - window.innerHeight > heightThreshold ||
                window.outerWidth - window.innerWidth > widthThreshold
            );
            
            // Method 2: Check console timing (more reliable)
            let consoleCheck = false;
            const start = new Date();
            debugger;
            if (new Date() - start > 100) {
                consoleCheck = true;
            }
            
            // Method 3: Check element size in devtools
            let elementCheck = false;
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: function() {
                    elementCheck = true;
                }
            });
            console.dir(element);
            
            const isDevToolsOpen = dimensionCheck || consoleCheck || elementCheck;
            
            if (isDevToolsOpen && !devtoolsOpen) {
                devtoolsOpen = true;
                handleDevToolsOpen();
            } else if (!isDevToolsOpen && devtoolsOpen) {
                devtoolsOpen = false;
                handleDevToolsClose();
            }
        };
        
        setInterval(checkDevTools, config.detectionInterval);
    };
    
    const handleDevToolsOpen = async () => {
        protectionActive = true;
        console.clear();
        console.log("%cSTOP!", "color: red; font-size: 60px; font-weight: bold;");
        console.log("%cThis is a protected area. Your activity is being monitored.", "color: red; font-size: 20px;");
        
        // Record the attempt
        await recordDevToolAttempt();
        
        if (config.protectionLevel >= 3 && !deviceBlocked) {
            clearPage();
        }
        
        if (config.protectionLevel >= 4 && !deviceBlocked) {
            setTimeout(redirectAway, 2000);
        }
    };
    
    const handleDevToolsClose = () => {
        // Only disable protections if device isn't blocked
        if (!deviceBlocked) {
            protectionActive = false;
        }
    };
    
    // Protection Layer 4: Console Protection (only active when DevTools detected)
    const initConsoleProtection = () => {
        // Clear console periodically
        setInterval(() => {
            if (devtoolsOpen) {
                console.clear();
                console.log("%cACCESS DENIED", "color: red; font-size: 40px; font-weight: bold;");
            }
        }, config.consoleClearInterval);
        
        // Override console methods only when DevTools is open
        const originalConsole = {...console};
        const protectedMethods = ['log', 'info', 'warn', 'error', 'debug'];
        
        protectedMethods.forEach(method => {
            console[method] = function() {
                if (!devtoolsOpen) {
                    // If DevTools is not open, use original console
                    return originalConsole[method].apply(originalConsole, arguments);
                }
                
                originalConsole.clear();
                originalConsole.log("%cPROTECTED CONSOLE", "color: red; font-size: 30px; font-weight: bold;");
                originalConsole.log("%cUnauthorized console access detected.", "color: red; font-size: 18px;");
            };
        });
    };
    
    // Protection Layer 5: Debugger Trap (only active when DevTools detected)
    const initDebuggerTrap = () => {
        const triggerDebugger = () => {
            if (!protectionActive) return;
            
            debuggerCounter++;
            if (debuggerCounter % 10 === 0) {
                console.clear();
                console.log("%cDEBUGGER DETECTED", "color: red; font-size: 40px; font-weight: bold;");
            }
            debugger; // This will break execution if dev tools is open
        };
        
        setInterval(triggerDebugger, config.debuggerInterval);
    };
    
    // Protection Layer 6: Save Protection (only active when DevTools detected)
    const initSaveProtection = () => {
        // Override save functionality
        document.addEventListener('keydown', (e) => {
            if (protectionActive && (e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                e.preventDefault();
                downloadMockFile();
                return false;
            }
        }, true);
        
        // Intercept beforeunload only when protection is active
        window.addEventListener('beforeunload', (e) => {
            if (protectionActive) {
                e.preventDefault();
                e.returnValue = '';
                downloadMockFile();
                return '';
            }
        }, true);
    };
    
    // Protection Layer 7: Content Obfuscation (only active when DevTools detected)
    const initContentObfuscation = () => {
        // Add invisible overlay to prevent selection only when DevTools is open
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999998;
            pointer-events: none;
            user-select: none;
            display: none;
        `;
        document.body.appendChild(overlay);
        
        // Function to toggle overlay
        const toggleOverlay = () => {
            overlay.style.display = protectionActive ? 'block' : 'none';
        };
        
        // Initial state
        toggleOverlay();
        
        // Watch for protection state changes
        setInterval(toggleOverlay, 100);
        
        // Disable developer tools in mobile browsers only when DevTools is detected
        if (config.protectionLevel >= 4) {
            const style = document.createElement('style');
            style.textContent = `
                body.devtools-open * {
                    -webkit-touch-callout: none !important;
                    -webkit-user-select: none !important;
                    user-select: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                }
                body.devtools-open, body.devtools-open html {
                    -webkit-user-drag: none !important;
                    user-drag: none !important;
                }
            `;
            document.head.appendChild(style);
            
            // Toggle class based on protection state
            const toggleDevToolsClass = () => {
                if (protectionActive) {
                    document.body.classList.add('devtools-open');
                } else {
                    document.body.classList.remove('devtools-open');
                }
            };
            
            setInterval(toggleDevToolsClass, 100);
        }
    };
    
    // Protection Layer 8: Tamper Detection (only active when DevTools detected)
    const initTamperDetection = () => {
        const checkIntegrity = () => {
            if (!detectionActive) return;
            
            // Check if our protection is still active
            if (deviceBlocked) {
                redirectAway();
                return;
            }
            
            // Check for unexpected DOM changes only when DevTools might be open
            if (protectionActive && document.querySelectorAll('script:not([src])').length > 1) {
                clearPage();
                setTimeout(redirectAway, 1000);
            }
            
            // Check for unexpected window properties
            if (protectionActive && window.__protected !== true) {
                clearPage();
                setTimeout(redirectAway, 1000);
            }
        };
        
        setInterval(checkIntegrity, 1000);
        
        // Add protection marker
        Object.defineProperty(window, '__protected', {
            value: true,
            writable: false,
            configurable: false
        });
    };
    
    // Initialize all protection layers
    const initProtection = async () => {
        // First check if device is already blocked
        const isBlocked = await checkDeviceStatus();
        if (isBlocked) return;
        
        // Initialize all protection layers
        initEventBlockers();
        initKeyboardBlockers();
        initDevToolsDetection();
        initConsoleProtection();
        initSaveProtection();
        initContentObfuscation();
        initTamperDetection();
        
        if (config.protectionLevel >= 4) {
            initDebuggerTrap();
        }
        
        // Final protection marker
        Object.freeze(config);
    };
    
    // Start protection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProtection);
    } else {
        initProtection();
    }
    
    // Self-destruct after initialization to prevent inspection
    setTimeout(() => {
        const script = document.currentScript;
        if (script) script.remove();
    }, 0);
})();