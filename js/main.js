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

 const buildEmbedSrc = (videoId) =>
 `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&enablejsapi=1${getEmbedOrigin()}`;

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

 const existingTarget = document.getElementById('site-footer');
 const target = existingTarget || document.createElement('div');
 if (!existingTarget) {
 target.id = 'site-footer';
 document.body.appendChild(target);
 }

 const resolveDefaultFooterPath = () => {
 const pathSegments = window.location.pathname.split('/').filter(Boolean);
 const repoSegmentIndex = pathSegments.indexOf('seascaperesortmarina');
 if (repoSegmentIndex === -1) return 'footer/index.html';

 const depthFromRepoRoot = pathSegments.length - repoSegmentIndex - 1;
 const relativePrefix = depthFromRepoRoot > 0 ? '../'.repeat(depthFromRepoRoot) : '';
 return `${relativePrefix}footer/index.html`;
 };

 const footerPath = target.dataset.footerPath || resolveDefaultFooterPath();

 fetch(footerPath)
 .then((response) => {
 if (!response.ok) throw new Error(`Failed to load ${footerPath}`);
 return response.text();
 })
 .then((markup) => {
 target.innerHTML = markup;
 const yearNode = target.querySelector('#footer-current-year');
 if (yearNode) yearNode.textContent = String(new Date().getFullYear());
 })
 .catch((error) => {
 console.warn(error);
 });
})();
