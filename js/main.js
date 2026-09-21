(function () {
  'use strict';

  // Scroll reveal
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function showAllReveals() {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  function startRevealObserver() {
    if (!revealItems.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      showAllReveals();
      return;
    }

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -6% 0px'
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  function whenFontsReady(callback) {
    var finished = false;

    function run() {
      if (finished) return;
      finished = true;
      callback();
    }

    if (document.fonts && document.fonts.load) {
      document.fonts.load('800 2rem Inter').then(run).catch(run);
    } else if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }

    window.setTimeout(run, 2000);
  }

  whenFontsReady(startRevealObserver);

  // Mobile navigation
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const navMedia = window.matchMedia('(max-width: 1200px)');
  let navAnchor = null;

  if (navToggle && nav) {
    navAnchor = document.createComment('nav-anchor');
    nav.parentNode.insertBefore(navAnchor, nav.nextSibling);

    function isMobileNav() {
      return navMedia.matches;
    }

    function restoreNavPosition() {
      if (navAnchor.parentNode && nav.parentNode !== navAnchor.parentNode) {
        navAnchor.parentNode.insertBefore(nav, navAnchor);
      }
    }

    function setMenuOpen(isOpen) {
      if (isMobileNav()) {
        if (isOpen) {
          document.body.appendChild(nav);
        } else {
          restoreNavPosition();
        }
      } else {
        restoreNavPosition();
        isOpen = false;
      }

      nav.classList.toggle('is-open', isOpen);
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Zavřít menu' : 'Otevřít menu');
      document.body.classList.toggle('nav-open', isOpen);
    }

    navToggle.addEventListener('click', function () {
      setMenuOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function (event) {
        const href = link.getAttribute('href');

        if (!href || href.charAt(0) !== '#') {
          return;
        }

        event.preventDefault();

        if (isMobileNav()) {
          setMenuOpen(false);
        }

        const target = document.querySelector(href);

        if (target) {
          requestAnimationFrame(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (!isMobileNav()) {
        setMenuOpen(false);
      }
    });
  }

  // References slider
  const track = document.getElementById('references-track');
  const prevBtn = document.getElementById('ref-prev');
  const nextBtn = document.getElementById('ref-next');
  const mobilePrevBtn = document.getElementById('ref-mobile-prev');
  const mobileNextBtn = document.getElementById('ref-mobile-next');
  const dotsContainer = document.getElementById('references-dots');
  const slider = document.getElementById('references-slider');

  if (track && prevBtn && nextBtn) {
    const slides = track.querySelectorAll('.references__slide');
    let currentIndex = 0;
    const dots = [];

    function updateDots() {
      dots.forEach(function (dot, index) {
        const isActive = index === currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function goToSlide(index) {
      if (slides.length <= 1) return;
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
      updateDots();
    }

    if (dotsContainer && slides.length > 1) {
      slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'references__dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Recenze ' + (index + 1));
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', function () {
          goToSlide(index);
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    prevBtn.addEventListener('click', function () {
      goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function () {
      goToSlide(currentIndex + 1);
    });

    if (mobilePrevBtn) {
      mobilePrevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
      });
    }

    if (mobileNextBtn) {
      mobileNextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
      });
    }

    if (slides.length <= 1) {
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
      if (mobilePrevBtn) mobilePrevBtn.style.visibility = 'hidden';
      if (mobileNextBtn) mobileNextBtn.style.visibility = 'hidden';
    } else if (slider) {
      let touchStartX = 0;
      let touchStartY = 0;

      slider.addEventListener('touchstart', function (event) {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
      }, { passive: true });

      slider.addEventListener('touchend', function (event) {
        const deltaX = event.changedTouches[0].screenX - touchStartX;
        const deltaY = event.changedTouches[0].screenY - touchStartY;

        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }, { passive: true });
    }
  }

  // Gallery marquee + lightbox
  const galleryTrack = document.getElementById('gallery-track');

  if (galleryTrack) {
    const galleryGroup = galleryTrack.querySelector('.gallery__group');

    if (galleryGroup && !reduceMotion.matches) {
      const galleryClone = galleryGroup.cloneNode(true);
      galleryClone.setAttribute('aria-hidden', 'true');
      galleryClone.querySelectorAll('button, img').forEach(function (el) {
        el.setAttribute('tabindex', '-1');
        if (el.tagName === 'IMG') {
          el.setAttribute('alt', '');
        }
      });
      galleryTrack.appendChild(galleryClone);
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    let lightboxTrigger = null;
    let lightboxIgnoreCloseUntil = 0;

    function isLightboxOpen() {
      return lightbox && !lightbox.hasAttribute('hidden');
    }

    function closeLightbox() {
      if (!lightbox || !isLightboxOpen()) return;

      lightbox.setAttribute('hidden', '');
      document.body.classList.remove('lightbox-open');
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';

      if (lightboxTrigger) {
        lightboxTrigger.focus();
        lightboxTrigger = null;
      }
    }

    function openLightbox(trigger) {
      if (!lightbox || !lightboxImage || isLightboxOpen()) return;
      if (trigger.closest('[aria-hidden="true"]')) return;

      const image = trigger.querySelector('.gallery__image');
      if (!image) return;

      lightboxTrigger = trigger;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '';
      lightbox.removeAttribute('hidden');
      document.body.classList.add('lightbox-open');
      lightboxIgnoreCloseUntil = Date.now() + 400;

      if (lightboxClose) {
        lightboxClose.focus();
      }
    }

    galleryTrack.addEventListener('click', function (event) {
      const trigger = event.target.closest('.gallery__trigger');
      if (!trigger || !galleryTrack.contains(trigger)) return;
      openLightbox(trigger);
    });

    if (lightbox) {
      lightbox.addEventListener('click', function (event) {
        if (Date.now() < lightboxIgnoreCloseUntil) return;
        if (event.target.closest('.lightbox__image')) return;
        closeLightbox();
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isLightboxOpen()) {
        closeLightbox();
      }
    });
  }

  // Header shadow on scroll (mobile only)
  const header = document.getElementById('header');
  const headerShadowMedia = window.matchMedia('(max-width: 1200px)');

  if (header) {
    function updateHeaderShadow() {
      if (headerShadowMedia.matches && window.scrollY > 10) {
        header.style.boxShadow = '0 2px 16px rgba(54, 38, 29, 0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    }

    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
    window.addEventListener('resize', updateHeaderShadow);
    updateHeaderShadow();
  }
})();
