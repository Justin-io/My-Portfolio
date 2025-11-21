// Disable right-click context menu
document.addEventListener('contextmenu', (event) => event.preventDefault());

// Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'F12' || // F12
        (event.ctrlKey && event.shiftKey && event.key === 'I') || // Ctrl+Shift+I
        (event.ctrlKey && event.shiftKey && event.key === 'J') || // Ctrl+Shift+J
        (event.ctrlKey && event.key === 'U') || // Ctrl+U
        (event.ctrlKey && event.key === 'S') // Ctrl+S
    ) {
        event.preventDefault();
    }
});

// Detect and block the opening of developer tools
(function detectDevTools() {
    const devToolsCheck = new Function('debugger');
    setInterval(() => {
        const start = performance.now();
        devToolsCheck();
        if (performance.now() - start > 100) {
            alert('Developer tools are not allowed on this page.');
            window.close(); // Close the tab
        }
    }, 500);
})();

// Disable drag-and-drop actions
document.addEventListener('dragstart', (event) => event.preventDefault());

// Disable copying, cutting, or pasting
document.addEventListener('copy', (event) => event.preventDefault());
document.addEventListener('cut', (event) => event.preventDefault());
document.addEventListener('paste', (event) => event.preventDefault());

// Hide the source code
document.onkeydown = function (e) {
    if (e.ctrlKey && e.key === 'P') {
        // Disable Print
        e.preventDefault();
    }
};
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
});
