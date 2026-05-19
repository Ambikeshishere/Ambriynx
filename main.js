// ========================
// 1. CANVAS PARTICLE NETWORK
// ========================
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = -1000, mouseY = -1000;
let animId;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

const PARTICLE_COUNT = 60;
const CONNECTION_DIST = 150;
const MOUSE_CONNECTION_DIST = 200;

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 1.5;
    this.opacity = Math.random() * 0.5 + 0.3;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < -50) this.x = canvas.width + 50;
    if (this.x > canvas.width + 50) this.x = -50;
    if (this.y < -50) this.y = canvas.height + 50;
    if (this.y > canvas.height + 50) this.y = -50;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 229, ${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

let packets = [];
class DataPacket {
  constructor(from, to) {
    this.from = from; this.to = to;
    this.progress = 0; this.speed = 0.008 + Math.random() * 0.012;
  }
  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      [this.from, this.to] = [this.to, this.from];
      this.progress = 0;
    }
  }
  draw() {
    const x = this.from.x + (this.to.x - this.from.x) * this.progress;
    const y = this.from.y + (this.to.y - this.from.y) * this.progress;
    const pulse = Math.sin(this.progress * Math.PI) * 0.8 + 0.2;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 229, ${pulse})`;
    ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 229, ${pulse * 0.2})`;
    ctx.fill();
  }
}

function spawnPackets() {
  packets = [];
  for (let i = 0; i < 8; i++) {
    const a = Math.floor(Math.random() * particles.length);
    let b = Math.floor(Math.random() * particles.length);
    while (b === a) b = Math.floor(Math.random() * particles.length);
    packets.push(new DataPacket(particles[a], particles[b]));
  }
}
spawnPackets();
setInterval(() => { if (!document.hidden) spawnPackets(); }, 4000);

function drawNetwork() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECTION_DIST) {
        const opacity = (1 - dist / CONNECTION_DIST) * 0.3;
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 229, 229, ${opacity})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
    const dx = particles[i].x - mouseX;
    const dy = particles[i].y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_CONNECTION_DIST) {
      const opacity = (1 - dist / MOUSE_CONNECTION_DIST) * 0.5;
      ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
  }
  particles.forEach(p => { p.update(); p.draw(); });
  packets.forEach(p => { p.update(); p.draw(); });
  animId = requestAnimationFrame(drawNetwork);
}
drawNetwork();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(animId); else drawNetwork();
});

// ========================
// 2. TYPEWRITER
// ========================
(function typewriter() {
  const el = document.getElementById('typewriter');
  const phrases = [
    'Use Better Data',
    'Get Clear Insights',
    'Grow 2x Faster',
    'Find Hidden Profits',
    'Get Visibility',
    'Need Automation'
  ];
  let phraseIdx = 0, charIdx = 0, isDeleting = false, speed = 80;
  function tick() {
    const current = phrases[phraseIdx];
    if (!isDeleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) { isDeleting = true; speed = 1200; }
      else speed = 60 + Math.random() * 50;
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) { isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; speed = 300; }
      else speed = 30 + Math.random() * 30;
    }
    setTimeout(tick, speed);
  }
  tick();
})();

// ========================
// 3. DASHBOARD CAROUSEL (auto-shuffle)
// ========================
(function dashboardCarousel() {
  const slides = document.querySelectorAll('.db-slide');
  const dots = document.querySelectorAll('.db-dot');
  const title = document.getElementById('dbTitle');
  if (!slides.length) return;

  let current = 0;
  let interval;

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
    title.textContent = slides[idx].dataset.title;
    current = idx;
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  // Click dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(parseInt(dot.dataset.slide));
      clearInterval(interval);
      interval = setInterval(nextSlide, 4000);
    });
  });

  // Start auto-shuffle
  interval = setInterval(nextSlide, 4000);

  // Pause on hover
  const container = document.querySelector('.dashboard-slides');
  if (container) {
    container.addEventListener('mouseenter', () => clearInterval(interval));
    container.addEventListener('mouseleave', () => {
      clearInterval(interval);
      interval = setInterval(nextSlide, 4000);
    });
  }
})();

// ========================
// 4. PIPELINE ANIMATION
// ========================
(function pipelineAnim() {
  const fill = document.getElementById('pipelineFill');
  const dot = document.getElementById('pipelineDot');
  const section = document.getElementById('processSteps');
  if (!fill || !dot || !section) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fill.classList.add('animate');
        dot.classList.add('animate');
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(section);
})();

// ========================
// 5. SCROLL REVEAL
// ========================
(function scrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
})();

// ========================
// 6. FAQ ACCORDION
// ========================
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ========================
// 7. NAVBAR
// ========================
const toggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

// ========================
// 8. BACK TO TOP
// ========================
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => backBtn.classList.toggle('show', window.scrollY > 500));
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ========================
// 9. APPOINTMENT FAB → scroll to contact
// ========================
document.getElementById('appointmentFab').addEventListener('click', () => {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
});

// ========================
// 10. FORM
// ========================
const scriptURL = "https://script.google.com/macros/s/AKfycbwGBgUSd1lroPU8GC69JBAzv7McQZ2lmS1qS0617FgilBvq5XPoNxeCXD3J7_WU9bcV7A/exec";
const form = document.getElementById('appointmentForm');
const statusEl = document.getElementById('status');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Submitting...'; statusEl.className = '';
  try {
    await fetch(scriptURL, { method: 'POST', body: JSON.stringify({
      name: form.name.value, company: form.company.value, phone: form.phone.value,
      email: form.email.value, industry: form.industry.value, service: form.service.value,
      task: form.task.value
    })});
    statusEl.textContent = 'Request submitted! We\'ll call you within 24 hours.';
    statusEl.className = 'success'; form.reset();
    // Refresh the request counter after successful submission
    fetchRequestCounter();
  } catch(e) {
    statusEl.textContent = 'Something went wrong. Please call us directly.';
    statusEl.className = 'error';
  }
});

// ========================
// 11. LIVE REQUEST COUNTER
// ========================
async function fetchRequestCounter() {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKHuHFV1FmdSHMs0-1V5RwqgnAD5pKTNMN5H0waYzan7znJmK2reBJFCkEvoXQveRZa14QEDV8eQsp/pub?output=csv";
  const el = document.getElementById('requestCount');
  if (!el) return;
  try {
    const res = await fetch(csvUrl);
    const text = await res.text();
    const lines = text.trim().split('\n');
    const count = lines.length > 1 ? lines.length - 1 : 0;
    el.textContent = count.toLocaleString();
  } catch(e) {
    el.textContent = '—';
  }
}
// Fetch on page load
fetchRequestCounter();