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

(() => {
  const videoShell = document.querySelector('.video-shell');
  const heroIframe = document.getElementById('hero-video-iframe');

  if (!videoShell || !heroIframe) return;

  const mobileOnlyBreakpoint = 1024;

  const extractVideoId = (rawValue) => {
    if (!rawValue) return '';

    const trimmedValue = rawValue.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedValue)) return trimmedValue;

    try {
      const parsedUrl = new URL(trimmedValue);
      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.replace('/', '').trim();
      }

      if (parsedUrl.hostname.includes('youtube.com')) {
        const watchId = parsedUrl.searchParams.get('v');
        if (watchId) return watchId.trim();

        const pathMatch = parsedUrl.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
        if (pathMatch) return pathMatch[1];
      }
    } catch (error) {
      return '';
    }

    return '';
  };

  const defaultVideoId = extractVideoId(videoShell.dataset.heroVideoId);
  const mobilePortraitVideoId = extractVideoId(videoShell.dataset.mobilePortraitVideoId);
  const mobileLandscapeVideoId = extractVideoId(videoShell.dataset.mobileLandscapeVideoId);

  const buildEmbedSrc = (videoId) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0`;

  const isMobileViewport = () => window.innerWidth <= mobileOnlyBreakpoint;
  const isPortrait = () => window.matchMedia('(orientation: portrait)').matches;

  const getTargetVideoId = () => {
    if (!isMobileViewport()) return defaultVideoId;

    if (isPortrait()) {
      return mobilePortraitVideoId || mobileLandscapeVideoId || defaultVideoId;
    }

    return mobileLandscapeVideoId || mobilePortraitVideoId || defaultVideoId;
  };

  let currentVideoId = '';
  let resizeRafId = null;

  const updateHeroVideoSource = () => {
    const targetVideoId = getTargetVideoId();
    if (!targetVideoId || targetVideoId === currentVideoId) return;

    currentVideoId = targetVideoId;
    heroIframe.src = buildEmbedSrc(targetVideoId);
  };

  const scheduleUpdate = () => {
    if (resizeRafId !== null) return;

    resizeRafId = window.requestAnimationFrame(() => {
      resizeRafId = null;
      updateHeroVideoSource();
    });
  };

  updateHeroVideoSource();
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('orientationchange', scheduleUpdate);
})();
