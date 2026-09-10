const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.count);
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      counter.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(counter);
  });
}, { threshold: 0.8 });

document.querySelectorAll('[data-count]').forEach((counter) => countObserver.observe(counter));

const testimonial = document.querySelector('.testimonial');
if (testimonial) {
  const items = [...testimonial.querySelectorAll('.testimonial-item')];
  const dots = [...testimonial.querySelectorAll('[data-slide]')];
  let currentSlide = 0;
  let rotation;

  const showTestimonial = (index) => {
    currentSlide = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === currentSlide));
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentSlide;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  };

  const startRotation = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rotation = window.setInterval(() => showTestimonial(currentSlide + 1), 6000);
    }
  };

  testimonial.querySelector('[data-direction="prev"]').addEventListener('click', () => showTestimonial(currentSlide - 1));
  testimonial.querySelector('[data-direction="next"]').addEventListener('click', () => showTestimonial(currentSlide + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => showTestimonial(Number(dot.dataset.slide))));
  testimonial.addEventListener('mouseenter', () => window.clearInterval(rotation));
  testimonial.addEventListener('mouseleave', startRotation);
  startRotation();
}

document.querySelector('#booking-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = new FormData(form).get('nome');
  const status = form.querySelector('.form-status');
  status.textContent = `Valeu, ${name}! Recebemos seu interesse. Em breve falamos com você pelo WhatsApp.`;
  form.reset();
});