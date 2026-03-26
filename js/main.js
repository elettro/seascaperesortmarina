(() => {
  const mobileBreakpoint = 1024;
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');

  if (!menuToggle || !mobileMenu) return;

  const isMobileViewport = () => window.innerWidth <= mobileBreakpoint;

  const closeAllSubmenus = () => {
    submenuToggles.forEach((toggle) => {
      const submenuId = toggle.getAttribute('aria-controls');
      const submenu = submenuId ? document.getElementById(submenuId) : null;
      toggle.setAttribute('aria-expanded', 'false');
      if (submenu) submenu.hidden = true;
    });
  };

  const closeMobileMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileMenu.hidden = true;
    closeAllSubmenus();
  };

  const openMobileMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation');
    mobileMenu.hidden = false;
  };

  closeMobileMenu();

  menuToggle.addEventListener('click', () => {
    if (!isMobileViewport()) return;

    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  submenuToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      if (!isMobileViewport()) return;

      const submenuId = toggle.getAttribute('aria-controls');
      const submenu = submenuId ? document.getElementById(submenuId) : null;
      if (!submenu) return;

      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      submenu.hidden = isExpanded;
    });
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!isMobileViewport()) return;
      closeMobileMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (!isMobileViewport()) {
      closeMobileMenu();
    }
  });
})();
