(function () {
  'use strict';

  // Mobile navigation
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const navMedia = window.matchMedia('(max-width: 768px)');
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

  // Gallery carousel
  const galleryTrack = document.getElementById('gallery-track');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const gallerySlider = document.getElementById('gallery-slider');

  if (galleryTrack && galleryPrev && galleryNext && gallerySlider) {
    const gallerySlides = galleryTrack.querySelectorAll('.gallery__slide');
    let galleryIndex = 0;

    function galleryStep() {
      const slide = gallerySlides[0];
      if (!slide) return 0;
      const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
      return slide.offsetWidth + gap;
    }

    function galleryVisibleCount() {
      const step = galleryStep();
      if (!step) return 1;
      return Math.max(1, Math.floor((gallerySlider.clientWidth + (parseFloat(getComputedStyle(galleryTrack).gap) || 0)) / step));
    }

    function galleryMaxIndex() {
      return Math.max(0, gallerySlides.length - galleryVisibleCount());
    }

    function updateGalleryArrows() {
      const max = galleryMaxIndex();
      galleryPrev.disabled = galleryIndex <= 0;
      galleryNext.disabled = galleryIndex >= max;
    }

    function goToGallery(index) {
      if (gallerySlides.length <= 1) return;
      galleryIndex = Math.max(0, Math.min(index, galleryMaxIndex()));
      galleryTrack.style.transform = 'translateX(-' + galleryIndex * galleryStep() + 'px)';
      updateGalleryArrows();
    }

    galleryPrev.addEventListener('click', function () {
      goToGallery(galleryIndex - 1);
    });

    galleryNext.addEventListener('click', function () {
      goToGallery(galleryIndex + 1);
    });

    window.addEventListener('resize', function () {
      goToGallery(galleryIndex);
    });

    if (gallerySlides.length <= galleryVisibleCount()) {
      galleryPrev.style.visibility = 'hidden';
      galleryNext.style.visibility = 'hidden';
    } else if (gallerySlider) {
      let touchStartX = 0;
      let touchStartY = 0;

      gallerySlider.addEventListener('touchstart', function (event) {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
      }, { passive: true });

      gallerySlider.addEventListener('touchend', function (event) {
        const deltaX = event.changedTouches[0].screenX - touchStartX;
        const deltaY = event.changedTouches[0].screenY - touchStartY;

        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
          goToGallery(galleryIndex + 1);
        } else {
          goToGallery(galleryIndex - 1);
        }
      }, { passive: true });
    }

    updateGalleryArrows();
  }

  // Header shadow on scroll (mobile only)
  const header = document.getElementById('header');
  const headerShadowMedia = window.matchMedia('(max-width: 768px)');

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
