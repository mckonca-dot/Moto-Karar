// Simple site-wide toast utility
function showToast(message, type = 'info', duration = 3000) {
    try {
        const containerId = 'site-toast-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.right = '20px';
            container.style.bottom = '20px';
            container.style.zIndex = 20000;
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'site-toast ' + type;
        toast.textContent = message;
        toast.style.padding = '12px 16px';
        toast.style.borderRadius = '10px';
        toast.style.color = 'white';
        toast.style.boxShadow = '0 8px 26px rgba(11,13,30,0.25)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'all 220ms ease';

        if (type === 'success') toast.style.background = 'linear-gradient(90deg,#38b000,#2ec4b6)';
        else if (type === 'error') toast.style.background = 'linear-gradient(90deg,#ff6b6b,#ff3b30)';
        else toast.style.background = 'linear-gradient(90deg,#667eea,#764ba2)';

        container.appendChild(toast);

        // trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            setTimeout(() => toast.remove(), 250);
        }, duration);
    } catch (e) {
        console.warn('Toast error', e);
    }
}

// Dark mode toggle
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    if (window.showToast) {
        showToast(isDark ? '🌙 Dark mode açıldı' : '☀️ Light mode açıldı', 'info', 2000);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
});
