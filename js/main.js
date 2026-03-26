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
  const playerContainer = document.getElementById('hero-video-player');
  const audioToggle = document.querySelector('.hero-audio-toggle');

  if (!videoShell || !playerContainer || !audioToggle) return;

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

  const videoId = extractVideoId(videoShell.dataset.heroVideoId);
  if (!videoId) return;

  let heroPlayer;

  const setButtonState = (isMuted) => {
    audioToggle.textContent = isMuted ? 'Muted' : 'Sound On';
    audioToggle.setAttribute('aria-label', isMuted ? 'Unmute hero video' : 'Mute hero video');
    audioToggle.setAttribute('aria-pressed', String(!isMuted));
  };

  const createHeroPlayer = () => {
    heroPlayer = new YT.Player('hero-video-player', {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        loop: 1,
        mute: 1,
        playlist: videoId
      },
      events: {
        onReady: (event) => {
          event.target.mute();
          event.target.playVideo();
          setButtonState(true);
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            event.target.playVideo();
          }
        }
      }
    });
  };

  audioToggle.addEventListener('click', () => {
    if (!heroPlayer || typeof heroPlayer.isMuted !== 'function') return;

    const muted = heroPlayer.isMuted();
    if (muted) {
      heroPlayer.unMute();
      setButtonState(false);
    } else {
      heroPlayer.mute();
      setButtonState(true);
    }
  });

  setButtonState(true);

  window.onYouTubeIframeAPIReady = (() => {
    const previousHandler = window.onYouTubeIframeAPIReady;

    return () => {
      if (typeof previousHandler === 'function') previousHandler();
      createHeroPlayer();
    };
  })();

  const youtubeApiScript = document.createElement('script');
  youtubeApiScript.src = 'https://www.youtube.com/iframe_api';
  youtubeApiScript.async = true;
  document.head.appendChild(youtubeApiScript);
})();
