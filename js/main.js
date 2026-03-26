(() => {
  const navWrap = document.querySelector('.nav-wrap');
  const menuToggle = document.querySelector('.menu-toggle');
  const menuPanel = document.querySelector('#mobile-menu-panel');
  const exploreItem = document.querySelector('.menu-item-has-children');
  const exploreLink = exploreItem?.querySelector('.explore-link');

  if (!navWrap) return;

  const handleScroll = () => {
    navWrap.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const closeMobileMenu = () => {
    if (!menuToggle || !menuPanel) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    navWrap.classList.remove('menu-open');
    menuPanel.hidden = true;
  };

  if (menuToggle && menuPanel) {
    closeMobileMenu();

    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      menuToggle.setAttribute('aria-label', isExpanded ? 'Open menu' : 'Close menu');
      navWrap.classList.toggle('menu-open', !isExpanded);
      menuPanel.hidden = isExpanded;
    });

    menuPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMobileMenu();
      }
    });
  }

  if (exploreItem && exploreLink) {
    exploreLink.addEventListener('click', (event) => {
      if (window.innerWidth <= 900) return;
      const isOpen = exploreItem.classList.contains('dropdown-open');
      event.preventDefault();
      exploreItem.classList.toggle('dropdown-open', !isOpen);
      exploreLink.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!exploreItem.contains(event.target)) {
        exploreItem.classList.remove('dropdown-open');
        exploreLink.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
