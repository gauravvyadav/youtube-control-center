(function() {
  try {
    const theme = localStorage.getItem('ytcc-theme');
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 1. Determine the target theme
    const isDark = theme ? (theme === 'dark') : systemIsDark;

    // 2. Apply theme immediately
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#09090b';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#fafafa';
    }

    // 3. Prevent any transitions during the initial "jump"
    const style = document.createElement('style');
    style.textContent = `* { transition: none !important; }`;
    document.head.appendChild(style);
    setTimeout(() => style.remove(), 100);

  } catch (e) {}
})();
