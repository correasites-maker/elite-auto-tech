const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const progress = document.querySelector('[data-scroll-progress]');

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 24);
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const value = distance > 0 ? (window.scrollY / distance) * 100 : 0;
  if (progress) progress.style.width = `${Math.min(value, 100)}%`;
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const closeMenu = () => {
  toggle?.setAttribute('aria-expanded', 'false');
  menu?.classList.remove('open');
  document.body.classList.remove('menu-open');
};

toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const mobileViewport = window.matchMedia('(max-width: 680px)');
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px' },
);

document.querySelectorAll('.reveal').forEach((element, index) => {
  if (mobileViewport.matches) {
    element.classList.add('is-visible');
    element.style.transitionDelay = '0ms';
    return;
  }
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

// Rede de segurança: se o IntersectionObserver falhar em algum navegador,
// nada de conteúdo (imagens inclusive) pode ficar escondido para sempre.
const revealFallback = () => {
  let pending = 0;
  document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
      element.classList.add('is-visible');
    } else {
      pending += 1;
    }
  });
  if (!pending) window.removeEventListener('scroll', revealFallback);
};
window.addEventListener('scroll', revealFallback, { passive: true });
window.addEventListener('load', revealFallback);
setTimeout(revealFallback, 1200);

mobileViewport.addEventListener('change', (event) => {
  if (!event.matches) return;
  document.querySelectorAll('.reveal').forEach((element) => {
    revealObserver.unobserve(element);
    element.classList.add('is-visible');
    element.style.transitionDelay = '0ms';
  });
});

const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (supportsFinePointer && !reducedMotion) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  window.addEventListener('pointermove', (event) => {
    glow.style.opacity = '1';
    glow.style.transform = `translate(${event.clientX - 210}px, ${event.clientY - 210}px)`;
  }, { passive: true });

  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', () => {
      element.style.transform = '';
    });
  });

  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const renderParallax = () => {
    parallaxItems.forEach((element) => {
      const factor = Number(element.dataset.parallax || 0);
      const rect = element.parentElement.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      element.style.transform = `translate3d(0, ${center * factor}px, 0) scale(1.04)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(renderParallax);
      ticking = true;
    }
  }, { passive: true });
  renderParallax();
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();
