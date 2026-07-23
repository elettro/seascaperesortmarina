(() => {
  const PROJECT_PREFIX = '/seascaperesortmarina/';
  const BOOKING_URL = 'https://booking-directly.com/widgets/v7lnd6kJdFVJ8w0hUq4SwsdEwxReP62DytBF6jNsIwQLbHSbyA65BAQvKsMz6';
  const PHONE_URL = 'tel:+13057436212';
  const CORRECT_EMAIL = 'info@seascaperesortandmarina.com';
  const INCORRECT_EMAIL = 'info@seascaperesortmarina.com';

  const isProjectHosted = () => {
    const pathname = window.location.pathname || '/';
    return pathname === '/seascaperesortmarina' || pathname.startsWith(PROJECT_PREFIX);
  };

  const resolveSitePath = (path = '') => {
    const cleanedPath = String(path).replace(/^\/+/, '');
    return isProjectHosted() ? `${PROJECT_PREFIX}${cleanedPath}` : `/${cleanedPath}`;
  };

  const normalizeProjectPath = (value) => {
    if (!value || isProjectHosted()) return value;
    return value.replaceAll(PROJECT_PREFIX, '/');
  };

  const windows1252Bytes = new Map([
    [0x20ac, 0x80],
    [0x201a, 0x82],
    [0x0192, 0x83],
    [0x201e, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x02c6, 0x88],
    [0x2030, 0x89],
    [0x0160, 0x8a],
    [0x2039, 0x8b],
    [0x0152, 0x8c],
    [0x017d, 0x8e],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201c, 0x93],
    [0x201d, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x02dc, 0x98],
    [0x2122, 0x99],
    [0x0161, 0x9a],
    [0x203a, 0x9b],
    [0x0153, 0x9c],
    [0x017e, 0x9e],
    [0x0178, 0x9f]
  ]);

  const repairMojibake = (value) => {
    if (!value || !/[ÃÂâðï]/.test(value)) return value;

    const bytes = [];
    for (const character of value) {
      const codePoint = character.codePointAt(0);
      if (codePoint <= 0xff) {
        bytes.push(codePoint);
      } else if (windows1252Bytes.has(codePoint)) {
        bytes.push(windows1252Bytes.get(codePoint));
      } else {
        return value;
      }
    }

    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    } catch (error) {
      return value;
    }
  };

  const updateLinkBehavior = (link) => {
    const rawHref = link.getAttribute('href') || '';
    const label = (link.textContent || '').trim().toLowerCase();

    if (rawHref.includes(INCORRECT_EMAIL)) {
      link.setAttribute('href', rawHref.replaceAll(INCORRECT_EMAIL, CORRECT_EMAIL));
    }

    if (
      rawHref === '/accommodations/' ||
      rawHref === `${PROJECT_PREFIX}accommodations/`
    ) {
      link.setAttribute('href', resolveSitePath('rooms/'));
    }

    if (
      link.classList.contains('mobile-book-now') ||
      rawHref === '/book-now/' ||
      rawHref === `${PROJECT_PREFIX}book-now/`
    ) {
      link.setAttribute('href', BOOKING_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }

    if (rawHref === '#') {
      if (label.includes('call to book') || label.includes('call now')) {
        link.setAttribute('href', PHONE_URL);
      } else if (label.includes('explore rooms') || label.includes('view accommodations')) {
        link.setAttribute('href', resolveSitePath('rooms/'));
      } else if (label.includes('check availability') || label.includes('plan your stay')) {
        const bookingSection = document.querySelector('.booking-direct-section');
        if (bookingSection) {
          if (!bookingSection.id) bookingSection.id = 'booking-direct';
          link.setAttribute('href', '#booking-direct');
        } else {
          link.setAttribute('href', BOOKING_URL);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
  };

  const repairElement = (element) => {
    if (!(element instanceof Element)) return;

    ['href', 'src', 'poster', 'action'].forEach((attributeName) => {
      const currentValue = element.getAttribute(attributeName);
      if (!currentValue) return;

      const repairedValue = repairMojibake(normalizeProjectPath(currentValue));
      if (repairedValue !== currentValue) {
        element.setAttribute(attributeName, repairedValue);
      }
    });

    ['title', 'aria-label', 'alt', 'placeholder'].forEach((attributeName) => {
      const currentValue = element.getAttribute(attributeName);
      if (!currentValue) return;

      const repairedValue = repairMojibake(currentValue);
      if (repairedValue !== currentValue) {
        element.setAttribute(attributeName, repairedValue);
      }
    });

    if (element.hasAttribute('data-images')) {
      const currentValue = element.getAttribute('data-images') || '';
      const repairedValue = normalizeProjectPath(currentValue);
      if (repairedValue !== currentValue) {
        element.setAttribute('data-images', repairedValue);
      }
    }

    if (element.hasAttribute('style') && !isProjectHosted()) {
      const currentStyle = element.getAttribute('style') || '';
      const repairedStyle = currentStyle.replaceAll(PROJECT_PREFIX, '/');
      if (repairedStyle !== currentStyle) {
        element.setAttribute('style', repairedStyle);
      }
    }

    if (element.matches('a[href]')) updateLinkBehavior(element);
  };

  const repairSubtree = (root) => {
    if (!root) return;

    if (root instanceof Element) repairElement(root);
    root.querySelectorAll?.('*').forEach(repairElement);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((textNode) => {
      const parentTag = textNode.parentElement?.tagName;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE'].includes(parentTag)) return;

      const currentValue = textNode.nodeValue || '';
      const repairedValue = repairMojibake(currentValue);
      if (repairedValue !== currentValue) textNode.nodeValue = repairedValue;
    });

    if (!isProjectHosted()) {
      root.querySelectorAll?.('style').forEach((styleElement) => {
        const currentValue = styleElement.textContent || '';
        const repairedValue = currentValue.replaceAll(PROJECT_PREFIX, '/');
        if (repairedValue !== currentValue) styleElement.textContent = repairedValue;
      });
    }
  };

  window.SeascapeSite = Object.freeze({
    bookingUrl: BOOKING_URL,
    phoneUrl: PHONE_URL,
    resolveSitePath,
    repairSubtree
  });

  repairSubtree(document.body || document.documentElement);

  let observerQueued = false;
  const observer = new MutationObserver(() => {
    if (observerQueued) return;
    observerQueued = true;

    window.requestAnimationFrame(() => {
      observerQueued = false;
      repairSubtree(document.body || document.documentElement);
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

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
 const heroAudioToggles = document.querySelectorAll('.hero-audio-toggle');

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

 const getEmbedOrigin = () => {
 if (!window.location?.origin || window.location.origin === 'null') return '';
 return `&origin=${encodeURIComponent(window.location.origin)}`;
 };

 // Best-effort request to prevent YouTube captions from loading by default.
 // Browser Live Caption and viewer accessibility preferences remain outside website control.
 const buildEmbedSrc = (videoId) =>
 `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&enablejsapi=1&cc_load_policy=0&iv_load_policy=3&disablekb=1${getEmbedOrigin()}`;

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
 let heroIsMuted = true;
 let heroPlayer = null;
 let heroPlayerReady = false;
 let ytApiReadyPromise = null;

 const postPlayerCommand = (func, args = []) => {
 if (!heroIframe.contentWindow) return;

 heroIframe.contentWindow.postMessage(
 JSON.stringify({
 event: 'command',
 func,
 args
 }),
 '*'
 );
 };

 const ensureYouTubeApiReady = () => {
 if (window.YT?.Player) return Promise.resolve(window.YT);
 if (ytApiReadyPromise) return ytApiReadyPromise;

 ytApiReadyPromise = new Promise((resolve) => {
 const previousOnReady = window.onYouTubeIframeAPIReady;
 window.onYouTubeIframeAPIReady = () => {
 if (typeof previousOnReady === 'function') previousOnReady();
 resolve(window.YT);
 };

 const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
 if (!existingScript) {
 const script = document.createElement('script');
 script.src = 'https://www.youtube.com/iframe_api';
 script.async = true;
 document.head.appendChild(script);
 }
 });

 return ytApiReadyPromise;
 };

 const ensureHeroPlayer = () => {
 if (heroPlayer) return Promise.resolve(heroPlayer);

 return ensureYouTubeApiReady().then((YT) =>
 new Promise((resolve) => {
 heroPlayer = new YT.Player(heroIframe, {
 events: {
 onReady: () => {
 heroPlayerReady = true;
 resolve(heroPlayer);
 applyHeroAudioState();
 }
 }
 });
 })
 );
 };

 const syncAudioToggleUi = () => {
 if (!heroAudioToggles.length) return;

 heroAudioToggles.forEach((audioToggle) => {
 audioToggle.setAttribute('aria-pressed', String(!heroIsMuted));
 audioToggle.setAttribute(
 'aria-label',
 heroIsMuted ? 'Turn on video sound' : 'Turn off video sound'
 );
 });
 };

 const applyHeroAudioState = () => {
 if (heroPlayerReady && heroPlayer) {
 if (heroIsMuted) {
 heroPlayer.mute();
 } else {
 heroPlayer.unMute();
 heroPlayer.setVolume(100);
 heroPlayer.playVideo();
 }
 return;
 }

 postPlayerCommand(heroIsMuted ? 'mute' : 'unMute');
 if (!heroIsMuted) {
 postPlayerCommand('setVolume', [100]);
 postPlayerCommand('playVideo');
 }
 };

 const updateHeroVideoSource = () => {
 const targetVideoId = getTargetVideoId();
 if (!targetVideoId || targetVideoId === currentVideoId) return;

 currentVideoId = targetVideoId;
 heroPlayerReady = false;
 heroIframe.src = buildEmbedSrc(targetVideoId);
 };

 const scheduleUpdate = () => {
 if (resizeRafId !== null) return;

 resizeRafId = window.requestAnimationFrame(() => {
 resizeRafId = null;
 updateHeroVideoSource();
 });
 };

 if (heroAudioToggles.length) {
 syncAudioToggleUi();
 let lastTouchToggleAt = 0;

 const toggleHeroAudio = (event) => {
 if (event.type === 'click' && Date.now() - lastTouchToggleAt < 350) return;
 if (event.type === 'touchend') {
 lastTouchToggleAt = Date.now();
 }
 event.preventDefault();
 event.stopPropagation();
 heroIsMuted = !heroIsMuted;
 syncAudioToggleUi();
 applyHeroAudioState();
 };

 heroAudioToggles.forEach((audioToggle) => {
 audioToggle.addEventListener('click', toggleHeroAudio);
 audioToggle.addEventListener('touchend', toggleHeroAudio, { passive: false });
 });
 }

 heroIframe.addEventListener('load', () => {
 window.setTimeout(() => {
 applyHeroAudioState();
 ensureHeroPlayer().catch(() => {
 // Fallback to postMessage controls when the API cannot initialize.
 });
 }, 220);
 });

 ensureHeroPlayer().catch(() => {
 // Fallback to postMessage controls when the API cannot initialize.
 });

 updateHeroVideoSource();
 window.addEventListener('resize', scheduleUpdate);
 window.addEventListener('orientationchange', scheduleUpdate);
})();

// Landscape mobile: measure real nav height and push hero below it
(function() {
 const nav = document.querySelector('.main-nav');
 const audioToggle = document.getElementById('hero-audio-toggle');
 if (!nav) return;

 function applyLandscapeLayout() {
  const isLandscape = window.matchMedia('(orientation: landscape) and (max-width: 1024px)').matches;
  if (!isLandscape) {
   document.body.style.paddingTop = '';
   if (audioToggle) audioToggle.style.top = '';
   return;
  }
  const navH = Math.round(nav.getBoundingClientRect().height);
  document.body.style.paddingTop = navH + 'px';
  if (audioToggle) audioToggle.style.top = (navH + 12) + 'px';
 }

 applyLandscapeLayout();
 window.addEventListener('resize', applyLandscapeLayout);
 window.addEventListener('orientationchange', function() {
  setTimeout(applyLandscapeLayout, 150);
 });
})();


(() => {
 const existingUniversalScript = document.querySelector('script[data-ml-universal="true"]');
 if (existingUniversalScript || typeof window.ml === 'function') return;

 const universalScript = document.createElement('script');
 universalScript.setAttribute('data-ml-universal', 'true');
 universalScript.text = "(function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments);},l=d.createElement(e),l.async=1,l.src=u,n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})(window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');ml('account', '2240972');";
 document.head.appendChild(universalScript);
})();

(() => {
 const footerAlreadyPresent = document.querySelector('.site-global-footer');
 if (footerAlreadyPresent) return;

 const injectMarkupWithExecutableScripts = (target, markup) => {
 const parser = new DOMParser();
 const doc = parser.parseFromString(markup, 'text/html');
 const scripts = [...doc.querySelectorAll('script')];

 scripts.forEach((script) => script.remove());
 target.innerHTML = doc.body.innerHTML;

 scripts.forEach((oldScript) => {
 if (oldScript.src && document.querySelector(`script[src="${oldScript.src}"]`)) return;

 const newScript = document.createElement('script');
 [...oldScript.attributes].forEach((attribute) => {
 newScript.setAttribute(attribute.name, attribute.value);
 });

 if (!oldScript.src) {
 newScript.textContent = oldScript.textContent;
 }

 target.appendChild(newScript);
 });
 };

 const existingTarget = document.getElementById('site-footer');
 const target = existingTarget || document.createElement('div');
 if (!existingTarget) {
 target.id = 'site-footer';
 document.body.appendChild(target);
 }

 const resolveDefaultFooterPath = () => {
 if (window.SeascapeSite?.resolveSitePath) {
 return window.SeascapeSite.resolveSitePath('footer/index.html');
 }

 const isProjectPath =
 window.location.pathname === '/seascaperesortmarina' ||
 window.location.pathname.startsWith('/seascaperesortmarina/');

 return isProjectPath
 ? '/seascaperesortmarina/footer/index.html'
 : '/footer/index.html';
 };

 const footerPath = target.dataset.footerPath || resolveDefaultFooterPath();

 fetch(footerPath)
 .then((response) => {
 if (!response.ok) throw new Error(`Failed to load ${footerPath}`);
 return response.text();
 })
 .then((markup) => {
 injectMarkupWithExecutableScripts(target, markup);
 window.SeascapeSite?.repairSubtree(target);
 const yearNode = target.querySelector('#footer-current-year');
 if (yearNode) yearNode.textContent = String(new Date().getFullYear());
 })
 .catch((error) => {
 console.warn(error);
 });
})();

function removeExpiredEvents() {
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 document.querySelectorAll('[data-event-date]').forEach((eventCard) => {
 const eventDateValue = eventCard.getAttribute('data-event-date');
 if (!eventDateValue) return;

 const eventDate = new Date(`${eventDateValue}T00:00:00`);
 eventDate.setHours(0, 0, 0, 0);

 if (eventDate < today) {
 eventCard.remove();
 }
 });
}

document.addEventListener('DOMContentLoaded', removeExpiredEvents);
