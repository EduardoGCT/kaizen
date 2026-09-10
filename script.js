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
  let items = [...testimonial.querySelectorAll('.testimonial-item')];
  let dots = [...testimonial.querySelectorAll('[data-slide]')];
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

  const createCommentItem = (comment, index) => {
    const item = document.createElement('article');
    const identity = comment.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    item.className = 'testimonial-item';
    item.dataset.testimonial = String(index);

    const quote = document.createElement('blockquote');
    quote.textContent = comment.text;
    const author = document.createElement('p');
    const initials = document.createElement('span');
    initials.textContent = identity;
    const name = document.createElement('strong');
    name.textContent = comment.name;
    const modality = document.createElement('small');
    modality.textContent = `${comment.modality} · Comentário da comunidade`;
    author.append(initials, name, modality);
    item.append(quote, author);
    testimonial.querySelector('.testimonial-stage').append(item);
    return item;
  };

  const addCommentDot = (index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.dataset.slide = String(index);
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Feedback ${index + 1}`);
    dot.setAttribute('aria-selected', 'false');
    dot.addEventListener('click', () => showTestimonial(index));
    testimonial.querySelector('.testimonial-dots').append(dot);
    return dot;
  };

  const loadSavedComments = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('kaizen-comments') || '[]');
      saved.slice(0, 3).forEach((comment) => {
        items.push(createCommentItem(comment, items.length));
        dots.push(addCommentDot(dots.length));
      });
    } catch {
      // A private browsing context may block localStorage.
    }
  };

  loadSavedComments();

  const commentPanel = testimonial.querySelector('.testimonial-form-wrap');
  commentPanel?.addEventListener('toggle', () => {
    if (commentPanel.open || commentPanel.classList.contains('is-closing')) return;
    commentPanel.open = true;
    window.requestAnimationFrame(() => commentPanel.classList.add('is-closing'));
    window.setTimeout(() => {
      commentPanel.open = false;
      window.requestAnimationFrame(() => commentPanel.classList.remove('is-closing'));
    }, 450);
  });

  testimonial.querySelector('[data-direction="prev"]').addEventListener('click', () => showTestimonial(currentSlide - 1));
  testimonial.querySelector('[data-direction="next"]').addEventListener('click', () => showTestimonial(currentSlide + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => showTestimonial(Number(dot.dataset.slide))));
  testimonial.addEventListener('mouseenter', () => window.clearInterval(rotation));
  testimonial.addEventListener('mouseleave', startRotation);
  startRotation();

  testimonial.querySelector('#testimonial-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.testimonial-form-status');
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('kaizen-comments') || '[]');
    } catch {
      saved = [];
    }
    if (saved.length >= 3) {
      status.textContent = 'O limite de 3 comentários por navegador já foi atingido.';
      return;
    }

    const data = new FormData(form);
    const comment = {
      name: String(data.get('nome')).trim(),
      modality: String(data.get('modalidade')), 
      text: String(data.get('comentario')).trim()
    };
    saved.push(comment);
    try {
      localStorage.setItem('kaizen-comments', JSON.stringify(saved));
    } catch {
      // The comment still appears for this session if storage is unavailable.
    }
    items.push(createCommentItem(comment, items.length));
    dots.push(addCommentDot(dots.length));
    showTestimonial(items.length - 1);
    form.reset();
    status.textContent = 'Comentário adicionado aos depoimentos.';
    if (saved.length >= 3) {
      form.querySelector('button').disabled = true;
      status.textContent += ' Limite atingido.';
    }
  });
}

document.querySelector('#booking-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = new FormData(form).get('nome');
  const status = form.querySelector('.form-status');
  status.textContent = `Valeu, ${name}! Recebemos seu interesse. Em breve falamos com você pelo WhatsApp.`;
  form.reset();
});