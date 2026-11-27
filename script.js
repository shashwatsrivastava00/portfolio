const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function initFooterYear() {
  $('#year').textContent = new Date().getFullYear();
}

function initScrollProgress() {
  const bar = $('#progress-bar');

  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    bar.style.transform = `scaleX(${ratio})`;
  }, { passive: true });
}

function initMobileMenu() {
  const toggle = $('#menu-toggle');
  const nav = $('#site-nav');

  function setOpen(isOpen) {
    nav.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Close' : 'Menu';
  }

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $$('.nav-link', nav).forEach(link => link.addEventListener('click', () => setOpen(false)));
}

function initActiveNavLink() {
  const links = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      links.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  links.forEach(link => observer.observe($(link.getAttribute('href'))));
}

function initTabFilter({ tabs, items, onChange }) {
  const buttons = $$('.tab', $(tabs));
  const targets = $$(items);

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      buttons.forEach(other => other.classList.toggle('is-active', other === button));

      targets.forEach(item => {
        const categories = item.dataset.category.split(' ');
        item.hidden = !(filter === 'all' || categories.includes(filter));
      });

      if (onChange) onChange(targets.filter(item => !item.hidden).length);
    });
  });
}

function animateNumber(element) {
  const target = parseFloat(element.dataset.target);
  const decimals = parseInt(element.dataset.decimals, 10);
  const suffix = element.dataset.suffix;
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = (target * eased).toFixed(decimals) + suffix;

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      obs.unobserve(entry.target);
      animateNumber(entry.target);
    });
  }, { threshold: 0.6 });

  $$('.stat-number').forEach(element => observer.observe(element));
}

function initEmail() {
  const emailLink = $('#contact-email');
  const copyButton = $('#copy-email');
  const address = emailLink.textContent.trim();

  emailLink.href = `mailto:${address}`;

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address);
      copyButton.textContent = 'Copied';
    } catch (error) {
      copyButton.textContent = 'Copy failed';
    }

    setTimeout(() => { copyButton.textContent = 'Copy'; }, 1800);
  });
}

function initContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  const address = $('#contact-email').textContent.trim();

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = $('#form-name').value.trim();
    const email = $('#form-email').value.trim();
    const message = $('#form-message').value.trim();

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n${name} (${email})`);

    window.location.href = `mailto:${address}?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email app. Press send there to finish.';
    form.reset();
  });
}

initFooterYear();
initScrollProgress();
initMobileMenu();
initActiveNavLink();
initTabFilter({ tabs: '#project-tabs', items: '.project-card' });
initTabFilter({
  tabs: '#skill-tabs',
  items: '.skill-node',
  onChange: count => { $('#node-count').textContent = count; }
});
initCounters();
initEmail();
initContactForm();
