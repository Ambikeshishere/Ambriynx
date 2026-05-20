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
// 11. COUNTER ANIMATION UTILITY
// ========================
function animateCounter(el, target) {
  if (!el) return;
  const start = 0;
  const duration = 1200;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ========================
// 12. LIVE REQUEST COUNTER + VISITOR COUNTER
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
    animateCounter(el, count);
  } catch(e) {
    el.textContent = '—';
  }
}
fetchRequestCounter();

async function fetchVisitorCount() {
  const el = document.getElementById('visitorCount');
  if (!el) return;
  try {
    const res = await fetch('https://api.countapi.xyz/hit/ambriynx/visitors');
    const data = await res.json();
    animateCounter(el, data.value);
  } catch {
    el.textContent = '—';
  }
}
fetchVisitorCount();

// ========================
// 13. LANGUAGE TOGGLE (EN / HI)
// ========================
(function langToggle() {
  const translations = {
    en: {
      nav_services: 'Services',
      nav_tech: 'Tech Stack',
      nav_process: 'How It Works',
      nav_contact: 'Book Appointment',
      proof_requests: 'business owners have already reached out',
      proof_visitors: 'Total Page Views:',
      live: 'LIVE',
      hero_badge: 'Business Analytics \u2022 Data \u2022 Growth',
      hero_title: 'Your Business',
      hero_problem: 'The Problem: Your factory runs thousands of transactions every month \u2014 but you don\'t know which products are actually profitable, where the money is leaking, or why margins are shrinking. Your data sits in Excel sheets and ERP reports, but nobody connects the dots.',
      hero_solution: 'Our Solution: We unify all your data \u2014 sales, expenses, P&L, inventory \u2014 into one live dashboard and tell you exactly where to focus. No jargon. No complexity. Just clear, actionable intelligence \u2014 in the language you\'re comfortable with.',
      hero_btn1: 'Book Free Consultation \u2192',
      hero_btn2: 'View Services',
      pain1_title: 'You don\'t know which products are actually profitable',
      pain1_desc: 'Running blind without data \u2014 guessing instead of knowing',
      pain2_title: 'Money comes in and goes out \u2014 but where it goes is a mystery',
      pain2_desc: 'Profit leaks go unnoticed until it\'s too late',
      pain3_title: 'Growth opportunities are slipping through your fingers',
      pain3_desc: 'Making decisions on gut feel instead of hard data',
      services_tag: 'What We Offer',
      services_title: 'Business Analytics \u2014 Full Stack',
      services_sub: 'From sales analysis to financial intelligence \u2014 we cover every aspect of your business.',
      svc1_title: 'Sales & Revenue Analytics',
      svc1_desc: 'Track sales trends, seasonal patterns, product-wise performance, and revenue leakages. Know what\'s selling and why.',
      svc2_title: 'Profit & Loss Intelligence',
      svc2_desc: 'Deep-dive into costs, margins, overheads, and net profitability. We pinpoint exactly where money is being lost.',
      svc3_title: 'Operational Dashboards',
      svc3_desc: 'Real-time dashboards for production, inventory, dispatch, and workforce \u2014 built specifically for industrial units.',
      svc4_title: 'Data Integration & Automation',
      svc4_desc: 'Connect your ERP, billing software, spreadsheets, and bank statements into one unified analytics pipeline.',
      svc5_title: 'Growth Forecasting',
      svc5_desc: 'Data-backed projections for the next quarter, year, and beyond. Make informed decisions, not gut feelings.',
      svc6_title: 'BA Outsourcing',
      svc6_desc: 'Dedicated business analyst for your firm \u2014 monthly reports, ad-hoc analysis, and strategy calls. Like having an in-house BA team.',
      svc7_title: 'GST & Tax Reconciliation',
      svc7_desc: 'Reconcile your purchases, sales, and tax filings. Catch mismatches, claim missed credits, and stay compliant.',
      svc8_title: 'Bank & Cash Flow Analysis',
      svc8_desc: 'Track every inflow and outflow. Forecast cash shortages, optimize working capital, and never run dry.',
      svc9_title: 'Inventory Optimization',
      svc9_desc: 'Analyze stock levels, dead inventory, reorder patterns, and holding costs. Free up cash stuck in inventory.',
      svc10_title: 'Vendor & Procurement Analytics',
      svc10_desc: 'Compare vendor performance, negotiate better rates, and identify procurement savings you didn\'t know existed.',
      svc11_title: 'Pricing & Break-even Analysis',
      svc11_desc: 'Find the optimal price for every product. Know your break-even point and margin thresholds with confidence.',
      svc12_title: 'Loan & Finance Application Support',
      svc12_desc: 'Prepare bank-ready financial statements, projections, and data packs that help you get approved faster.',
      tech_tag: 'Tech Stack',
      tech_title: 'Built With Industrial-Grade Tools',
      tech_sub: 'We use modern data technology to give you enterprise-level analytics without the enterprise-level cost.',
      about_tag: 'Who We Are',
      about_title: 'Do You Really Know How Much Your Business Earns Each Month?',
      about_intro: 'This is for you if:',
      about_li1: 'You feel profits should be there, but the bank balance doesn\'t match?',
      about_li2: 'Which product line is losing money \u2014 you have no idea?',
      about_li3: 'High turnover every month, but net profit is only 2-3%?',
      about_li4: 'Expenses feel out of control \u2014 no visibility into what\'s truly needed?',
      about_outro: 'We tell the complete story behind your numbers \u2014 sales, P&L, costs, trends \u2014 in plain language you actually understand. Where there\'s a problem, we show the solution. All it takes is one call.',
      abt_f1_title: 'Zero Tech Hassle',
      abt_f1_desc: 'We set up everything. You just get reports.',
      abt_f2_title: 'Plain Language Reports',
      abt_f2_desc: 'No jargon. Reports tailored to your preferred language.',
      abt_f3_title: 'Global, Affordable',
      abt_f3_desc: 'BA services starting at $120/month. Value that pays for itself.',
      abt_f4_title: 'On-Site & Remote',
      abt_f4_desc: 'We visit your facility or work fully remote \u2014 your choice.',
      process_tag: 'The Process',
      process_title: 'From Data to Decisions',
      process_sub: 'We make business analytics simple and actionable \u2014 in 4 steps.',
      proc1_title: 'Discovery Call',
      proc1_desc: 'We understand your business, operations, and data sources \u2014 on-site or remote.',
      proc2_title: 'Data Setup',
      proc2_desc: 'We connect your billing, inventory, and accounting systems into one pipeline.',
      proc3_title: 'Analysis',
      proc3_desc: 'We analyze trends, find anomalies, and build dashboards that make sense.',
      proc4_title: 'Monthly Reviews',
      proc4_desc: 'You get plain-language reports and strategy calls every month.',
      ind_tag: 'Who Needs This',
      ind_title: 'If You\'re in Any of These, Let\'s Talk',
      ind_sub: 'Whether you run a \u20b92 Cr workshop or a \u20b950 Cr factory \u2014 data clarity changes everything.',
      ind1: 'Manufacturing',
      ind2: 'Logistics & Distribution',
      ind3: 'Food Processing',
      ind4: 'Workshops & Fabrication',
      ind5: 'Construction Supplies',
      ind6: 'Wholesale & Trading',
      trans_tag: 'The Transformation',
      trans_title: 'Before Ambriyx vs After Ambriyx',
      trans_sub: 'Same business \u2014 but now with the power of data. See the difference for yourself.',
      trans_bad_head: '\u274c Before Ambriyx',
      tbad1_title: 'Running in the dark',
      tbad1_desc: 'No visibility into which products make money and which don\'t.',
      tbad2_title: 'Money disappears without a trace',
      tbad2_desc: 'Crores in turnover, but 2-3% leaks out every month.',
      tbad3_title: 'Data is dumped in Excel graveyards',
      tbad3_desc: 'You have the numbers, but no insights, no direction.',
      tbad4_title: 'Costs spiral out of control',
      tbad4_desc: 'You only realize you overspent at month-end \u2014 by then, the damage is done.',
      tbad5_title: 'Growth is just a wish',
      tbad5_desc: 'Without data, your growth strategy is just hope.',
      trans_good_head: '\u2705 After Ambriyx',
      tgood1_title: 'Live dashboard on your phone',
      tgood1_desc: 'Every morning \u2014 what sold, what margin, what spent. Crystal clear.',
      tgood2_title: 'Every rupee is tracked',
      tgood2_desc: 'Revenue, cost, profit \u2014 by product, by customer, nothing hidden.',
      tgood3_title: 'One page tells the whole story',
      tgood3_desc: 'Trends visible, anomalies highlighted, action items clear.',
      tgood4_title: 'Real-time cost alerts',
      tgood4_desc: 'The moment a cost spikes, you get notified.',
      tgood5_title: 'Data-backed growth roadmap',
      tgood5_desc: 'Next quarter, next year \u2014 planned with data.',
      faq_tag: 'FAQ',
      faq_title: 'Common Questions',
      faq1_q: 'I\'m not tech-savvy. Will I understand the reports?',
      faq1_a: 'Absolutely. We don\'t use jargon. Your reports come in clear, simple language with specific takeaways.',
      faq2_q: 'What data do you need from me?',
      faq2_a: 'Whatever you have \u2014 invoices, bank statements, ERP exports, Excel, or handwritten records.',
      faq3_q: 'How much does it cost?',
      faq3_a: 'Our analytics retainer starts at $120/month. One-time setup projects start from $300. No hidden costs.',
      faq4_q: 'Do you visit our factory?',
      faq4_a: 'Yes, for local clients. For international clients, we work fully remote.',
      faq5_q: 'Can you integrate with our existing software?',
      faq5_a: 'Yes \u2014 ERP, Tally, QuickBooks, Excel, Google Sheets, bank portals, e-commerce platforms.',
      contact_tag: 'Book Appointment',
      contact_title: 'Let\'s Look at Your Numbers',
      contact_sub: 'Free discovery call. No commitment. Just honest advice.',
      contact_h3: 'Get In Touch',
      contact_p: 'Fill the form and we\'ll call you within 24 hours to schedule a free 30-minute discovery call.',
      contact_response: 'Response within 24 hours',
      contact_onsite: 'On-site & remote \u2014 worldwide',
      form_btn: 'Book Free Discovery Call \u2192',
      footer_tagline: 'Business Analytics & Industrial Intelligence',
      footer_copy: '\u00a9 2026 Ambriyx. Data-driven decisions for businesses worldwide.',
      footer_tag: 'Analytics \u2022 Intelligence \u2022 Growth',
      fab_text: 'Book Appointment',
    },
    hi: {
      nav_services: 'सेवाएं',
      nav_tech: 'टेक स्टैक',
      nav_process: 'यह कैसे काम करता है',
      nav_contact: 'अपॉइंटमेंट बुक करें',
      proof_requests: 'व्यवसाय मालिकों ने संपर्क किया है',
      proof_visitors: 'कुल पेज विज़िट:',
      live: 'लाइव',
      hero_badge: 'बिज़नेस एनालिटिक्स \u2022 डेटा \u2022 ग्रोथ',
      hero_title: 'आपका व्यवसाय',
      hero_problem: 'समस्या: आपकी फैक्टरी हर महीने हज़ारों लेन-देन करती है \u2014 लेकिन आप नहीं जानते कि कौन से उत्पाद वास्तव में लाभदायक हैं, पैसा कहाँ लीक हो रहा है, या मार्जिन क्यों घट रहा है। आपका डेटा एक्सेल शीट्स और ERP रिपोर्ट्स में पड़ा है, लेकिन कोई बिंदु नहीं जोड़ता।',
      hero_solution: 'हमारा समाधान: हम आपके सभी डेटा \u2014 बिक्री, खर्च, P&L, इन्वेंट्री \u2014 को एक लाइव डैशबोर्ड में जोड़ते हैं और आपको बताते हैं कि वास्तव में कहाँ ध्यान केंद्रित करना है। कोई जार्गन नहीं। बस स्पष्ट, कार्रवाई योग्य जानकारी।',
      hero_btn1: 'मुफ़्त परामर्श बुक करें \u2192',
      hero_btn2: 'सेवाएं देखें',
      pain1_title: 'आप नहीं जानते कि कौन से उत्पाद वास्तव में लाभदायक हैं',
      pain1_desc: 'डेटा के बिना अंधेरे में दौड़ना \u2014 जानने के बजाय अनुमान लगाना',
      pain2_title: 'पैसा आता और जाता है \u2014 लेकिन कहाँ जाता है, यह रहस्य है',
      pain2_desc: 'मुनाफ़ा लीक होता है और देर होने तक पता नहीं चलता',
      pain3_title: 'ग्रोथ के अवसर आपकी उंगलियों से फिसल रहे हैं',
      pain3_desc: 'डेटा के बजाय अंतर्ज्ञान पर निर्णय लेना',
      services_tag: 'हम क्या प्रदान करते हैं',
      services_title: 'बिज़नेस एनालिटिक्स \u2014 फुल स्टैक',
      services_sub: 'बिक्री विश्लेषण से वित्तीय खुफिया तक \u2014 हम आपके व्यवसाय के हर पहलू को कवर करते हैं।',
      svc1_title: 'बिक्री और राजस्व एनालिटिक्स',
      svc1_desc: 'बिक्री रुझान, मौसमी पैटर्न, उत्पाद-वार प्रदर्शन और राजस्व लीकेज को ट्रैक करें। जानें क्या बिक रहा है और क्यों।',
      svc2_title: 'लाभ और हानि इंटेलिजेंस',
      svc2_desc: 'लागत, मार्जिन, ओवरहेड और शुद्ध लाभप्रदता में गहराई से जाएं। हम बताते हैं कि पैसा कहाँ खो रहा है।',
      svc3_title: 'ऑपरेशनल डैशबोर्ड',
      svc3_desc: 'उत्पादन, इन्वेंट्री, डिस्पैच और कार्यबल के लिए रीयल-टाइम डैशबोर्ड \u2014 विशेष रूप से औद्योगिक इकाइयों के लिए।',
      svc4_title: 'डेटा इंटीग्रेशन और ऑटोमेशन',
      svc4_desc: 'अपने ERP, बिलिंग सॉफ्टवेयर, स्प्रेडशीट और बैंक स्टेटमेंट को एक एकीकृत एनालिटिक्स पाइपलाइन में जोड़ें।',
      svc5_title: 'ग्रोथ फोरकास्टिंग',
      svc5_desc: 'अगली तिमाही, वर्ष और उससे आगे के लिए डेटा-समर्थित अनुमान। अंतर्ज्ञान से नहीं, डेटा से निर्णय लें।',
      svc6_title: 'BA आउटसोर्सिंग',
      svc6_desc: 'आपकी फर्म के लिए समर्पित बिज़नेस एनालिस्ट \u2014 मासिक रिपोर्ट, एड-हॉक विश्लेषण और रणनीति कॉल।',
      svc7_title: 'GST और कर समाधान',
      svc7_desc: 'अपनी खरीद, बिक्री और कर फाइलिंग का मिलान करें। बेमेल पकड़ें, छूटे क्रेडिट दावा करें।',
      svc8_title: 'बैंक और कैश फ्लो विश्लेषण',
      svc8_desc: 'हर आने-जाने वाली राशि को ट्रैक करें। नकदी की कमी का पूर्वानुमान लगाएं, कार्यशील पूंजी अनुकूलित करें।',
      svc9_title: 'इन्वेंट्री ऑप्टिमाइज़ेशन',
      svc9_desc: 'स्टॉक स्तर, डेड इन्वेंट्री, रीऑर्डर पैटर्न और होल्डिंग लागत का विश्लेषण करें।',
      svc10_title: 'विक्रेता और क्रय एनालिटिक्स',
      svc10_desc: 'विक्रेता प्रदर्शन की तुलना करें, बेहतर दरों पर बातचीत करें, क्रय बचत की पहचान करें।',
      svc11_title: 'मूल्य निर्धारण और ब्रेक-ईवन विश्लेषण',
      svc11_desc: 'हर उत्पाद के लिए इष्टतम मूल्य खोजें। आत्मविश्वास से अपना ब्रेक-ईवन पॉइंट जानें।',
      svc12_title: 'ऋण और वित्त आवेदन सहायता',
      svc12_desc: 'बैंक-तैयार वित्तीय विवरण, अनुमान और डेटा पैक तैयार करें जो तेज़ी से स्वीकृति दिलाने में मदद करें।',
      tech_tag: 'टेक स्टैक',
      tech_title: 'औद्योगिक-ग्रेड टूल्स के साथ निर्मित',
      tech_sub: 'हम आपको एंटरप्राइज़-स्तर का एनालिटिक्स देने के लिए आधुनिक डेटा तकनीक का उपयोग करते हैं।',
      about_tag: 'हम कौन हैं',
      about_title: 'क्या आप वास्तव में जानते हैं कि आपका व्यवसाय हर महीने कितना कमाता है?',
      about_intro: 'यह आपके लिए है अगर:',
      about_li1: 'आपको लगता है मुनाफ़ा होना चाहिए, लेकिन बैंक बैलेंस मेल नहीं खाता?',
      about_li2: 'कौन सा उत्पाद लाइन पैसा खो रही है \u2014 आपको कोई अंदाज़ा नहीं?',
      about_li3: 'हर महीने अधिक टर्नओवर, लेकिन शुद्ध लाभ केवल 2-3%?',
      about_li4: 'खर्च नियंत्रण से बाहर लगते हैं \u2014 कोई दृश्यता नहीं?',
      about_outro: 'हम आपकी संख्याओं के पीछे की पूरी कहानी बताते हैं \u2014 बिक्री, P&L, लागत, रुझान \u2014 सरल भाषा में जो आप समझते हैं। जहाँ समस्या है, हम समाधान दिखाते हैं।',
      abt_f1_title: 'शून्य तकनीकी परेशानी',
      abt_f1_desc: 'हम सब कुछ सेट करते हैं। आप बस रिपोर्ट पाएं।',
      abt_f2_title: 'सरल भाषा रिपोर्ट',
      abt_f2_desc: 'कोई जार्गन नहीं। आपकी पसंदीदा भाषा में रिपोर्ट।',
      abt_f3_title: 'वैश्विक, किफ़ायती',
      abt_f3_desc: '$120/माह से BA सेवाएं। मूल्य जो खुद चुकाता है।',
      abt_f4_title: 'ऑन-साइट और रिमोट',
      abt_f4_desc: 'हम आपकी सुविधा पर आते हैं या पूरी तरह रिमोट काम करते हैं \u2014 आपकी पसंद।',
      process_tag: 'प्रक्रिया',
      process_title: 'डेटा से निर्णय तक',
      process_sub: 'हम बिज़नेस एनालिटिक्स को सरल और कार्रवाई योग्य बनाते हैं \u2014 4 कदमों में।',
      proc1_title: 'डिस्कवरी कॉल',
      proc1_desc: 'हम आपके व्यवसाय, संचालन और डेटा स्रोतों को समझते हैं \u2014 ऑन-साइट या रिमोट।',
      proc2_title: 'डेटा सेटअप',
      proc2_desc: 'हम आपके बिलिंग, इन्वेंट्री और अकाउंटिंग सिस्टम को एक पाइपलाइन में जोड़ते हैं।',
      proc3_title: 'विश्लेषण',
      proc3_desc: 'हम रुझानों का विश्लेषण करते हैं, विसंगतियाँ ढूंढते हैं और सार्थक डैशबोर्ड बनाते हैं।',
      proc4_title: 'मासिक समीक्षा',
      proc4_desc: 'आपको हर महीने सरल रिपोर्ट और रणनीति कॉल मिलते हैं।',
      ind_tag: 'किसे चाहिए',
      ind_title: 'अगर आप इनमें से किसी में हैं, तो बात करें',
      ind_sub: 'चाहे आप ₹2 करोड़ की वर्कशॉप चलाएं या ₹50 करोड़ की फैक्टरी \u2014 डेटा स्पष्टता सब कुछ बदल देती है।',
      ind1: 'विनिर्माण',
      ind2: 'लॉजिस्टिक्स और वितरण',
      ind3: 'खाद्य प्रसंस्करण',
      ind4: 'वर्कशॉप और फैब्रिकेशन',
      ind5: 'निर्माण आपूर्ति',
      ind6: 'थोक और व्यापार',
      trans_tag: 'परिवर्तन',
      trans_title: 'Ambriyx से पहले बनाम Ambriyx के बाद',
      trans_sub: 'वही व्यवसाय \u2014 लेकिन अब डेटा की शक्ति के साथ। फ़र्क खुद देखें।',
      trans_bad_head: '❌ Ambriyx से पहले',
      tbad1_title: 'अंधेरे में दौड़ना',
      tbad1_desc: 'कोई दृश्यता नहीं कि कौन से उत्पाद पैसा कमा रहे हैं।',
      tbad2_title: 'पैसा बिना निशान के गायब',
      tbad2_desc: 'करोड़ों का टर्नओवर, लेकिन हर महीने 2-3% लीक।',
      tbad3_title: 'डेटा एक्सेल कब्रिस्तान में दफ़न',
      tbad3_desc: 'नंबर हैं, लेकिन कोई कहानी नहीं, कोई दिशा नहीं।',
      tbad4_title: 'लागत बेकाबू होती जा रही',
      tbad4_desc: 'महीने के अंत में पता चलता है \u2014 तब तक नुकसान हो चुका।',
      tbad5_title: 'ग्रोथ सिर्फ एक इच्छा है',
      tbad5_desc: 'डेटा के बिना, आपकी ग्रोथ रणनीति सिर्फ उम्मीद है।',
      trans_good_head: '✅ Ambriyx के बाद',
      tgood1_title: 'आपके फ़ोन पर लाइव डैशबोर्ड',
      tgood1_desc: 'हर सुबह \u2014 क्या बिका, क्या मार्जिन, क्या खर्च। बिल्कुल स्पष्ट।',
      tgood2_title: 'हर रुपया ट्रैक होता है',
      tgood2_desc: 'राजस्व, लागत, लाभ \u2014 उत्पाद द्वारा, ग्राहक द्वारा। कुछ छिपा नहीं।',
      tgood3_title: 'एक पेज पूरी कहानी बताता है',
      tgood3_desc: 'रुझान दिखते हैं, विसंगतियाँ हाइलाइट होती हैं, कार्रवाई स्पष्ट है।',
      tgood4_title: 'रीयल-टाइम लागत अलर्ट',
      tgood4_desc: 'जैसे ही लागत बढ़ती है, आपको सूचना मिलती है।',
      tgood5_title: 'डेटा-समर्थित ग्रोथ रोडमैप',
      tgood5_desc: 'अगली तिमाही, अगला वर्ष \u2014 डेटा के साथ योजनाबद्ध।',
      faq_tag: 'सामान्य प्रश्न',
      faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
      faq1_q: 'मैं तकनीकी नहीं हूँ। क्या मैं रिपोर्ट समझ पाऊंगा?',
      faq1_a: 'बिल्कुल। हम जार्गन का उपयोग नहीं करते। आपकी रिपोर्ट सरल भाषा में आएगी।',
      faq2_q: 'आपको मुझसे क्या डेटा चाहिए?',
      faq2_a: 'जो भी आपके पास है \u2014 चालान, बैंक स्टेटमेंट, ERP एक्सपोर्ट, एक्सेल, या हस्तलिखित रिकॉर्ड।',
      faq3_q: 'इसकी लागत कितनी है?',
      faq3_a: 'हमारा एनालिटिक्स रिटेनर $120/माह से शुरू होता है। एक बार का सेटअप $300 से। कोई छिपी लागत नहीं।',
      faq4_q: 'क्या आप हमारी फैक्टरी आते हैं?',
      faq4_a: 'हाँ, स्थानीय ग्राहकों के लिए। अंतर्राष्ट्रीय ग्राहकों के लिए, हम पूरी तरह रिमोट काम करते हैं।',
      faq5_q: 'क्या आप हमारे मौजूदा सॉफ्टवेयर से जुड़ सकते हैं?',
      faq5_a: 'हाँ \u2014 ERP, Tally, QuickBooks, Excel, Google Sheets, बैंक पोर्टल, ई-कॉमर्स प्लेटफॉर्म।',
      contact_tag: 'अपॉइंटमेंट बुक करें',
      contact_title: 'आइए आपके नंबर देखें',
      contact_sub: 'मुफ़्त डिस्कवरी कॉल। कोई बाध्यता नहीं। बस ईमानदार सलाह।',
      contact_h3: 'संपर्क करें',
      contact_p: 'फॉर्म भरें और हम आपको 24 घंटे के भीतर कॉल करेंगे।',
      contact_response: '24 घंटे के भीतर जवाब',
      contact_onsite: 'ऑन-साइट और रिमोट \u2014 दुनिया भर में',
      form_btn: 'मुफ़्त डिस्कवरी कॉल बुक करें \u2192',
      footer_tagline: 'बिज़नेस एनालिटिक्स और औद्योगिक खुफिया',
      footer_copy: '© 2026 Ambriyx. डेटा-संचालित निर्णय दुनिया भर के व्यवसायों के लिए।',
      footer_tag: 'एनालिटिक्स • इंटेलिजेंस • ग्रोथ',
      fab_text: 'अपॉइंटमेंट बुक करें',
    },
  };

  const btn = document.getElementById('langToggle');
  if (!btn) return;

  let lang = localStorage.getItem('ambriynx_lang') || 'en';

  function applyLang(l) {
    lang = l;
    localStorage.setItem('ambriynx_lang', l);
    btn.textContent = l === 'en' ? 'हि' : 'EN';
    const t = translations[l];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
    });
  }

  btn.addEventListener('click', () => {
    applyLang(lang === 'en' ? 'hi' : 'en');
  });

  applyLang(lang);
})();

// ========================
// 14. CHATBOT
// ========================
(function chatbot() {
  const toggle = document.getElementById('chatbotToggle');
  const window = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const input = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');
  const body = document.getElementById('chatbotBody');

  if (!toggle || !window || !closeBtn || !input || !sendBtn || !body) return;

  const knowledgeBase = [
    { keywords: ['what is ambriyx', 'who are you', 'tell me about yourself', 'ambriyx', 'about'], response: 'Ambriyx is a Business Analytics & Industrial Intelligence firm. We help industrial businesses understand their data — sales, P&L, costs, inventory — so you know exactly where your money is going and how to grow.' },
    { keywords: ['services', 'what do you do', 'offer'], response: 'We offer full-stack business analytics: Sales & Revenue Analytics, P&L Intelligence, Operational Dashboards, Data Integration, Growth Forecasting, BA Outsourcing, GST Reconciliation, Cash Flow Analysis, Inventory Optimization, Vendor Analytics, Pricing Analysis, and Loan Support.' },
    { keywords: ['cost', 'price', 'pricing', 'fees', 'charge', 'how much', 'retainer'], response: 'Our analytics retainer starts at $120/month, which includes monthly reports, a live dashboard, and a monthly strategy call. One-time setup starts from $300. No hidden costs.' },
    { keywords: ['contact', 'phone', 'email', 'reach', 'call'], response: 'You can call us at +91 9129451978 or email us at abhay2004raj15@gmail.com. We typically respond within 24 hours.' },
    { keywords: ['appointment', 'book', 'consultation', 'discovery call', 'meeting'], response: 'You can book a free discovery call by filling out the appointment form on this page. We\'ll call you within 24 hours to schedule a 30-minute call — no commitment.' },
    { keywords: ['industry', 'who need', 'manufacturing', 'fabrication', 'food processing', 'logistics', 'construction', 'trading', 'wholesale'], response: 'We work with manufacturing units, logistics & distribution, food processing, workshops & fabrication, construction supplies, and wholesale & trading businesses. If you run a business with data, we can help.' },
    { keywords: ['data', 'setup', 'integration', 'connect', 'erp', 'excel', 'spreadsheet', 'software'], response: 'We connect with ERP systems, Tally, QuickBooks, Xero, Busy, Excel, Google Sheets, bank portals, e-commerce platforms, and custom databases. If you use something else, we\'ll find a way to integrate it.' },
    { keywords: ['dashboard', 'report', 'reporting', 'live'], response: 'We build live dashboards that show your sales, P&L, production, workforce, and more — all in one place. Accessible on your phone and updated in real-time.' },
    { keywords: ['who is ambikesh', 'ambikesh', 'founder', 'owner'], response: 'Ambikesh Srivastava is the founder of Ambriyx. You can reach out directly for any business analytics needs.' },
    { keywords: ['onsite', 'on-site', 'remote', 'location', 'visit'], response: 'We offer both on-site and remote services. For clients within reachable regions, we visit your facility. For international clients, we work fully remote via video calls.' },
  ];

  const suggestions = [
    'What services do you offer?',
    'How much does it cost?',
    'How do I book an appointment?',
    'What industries do you work with?',
    'Can you integrate with my ERP?',
  ];

  function findResponse(query) {
    const q = query.toLowerCase().trim();
    for (const item of knowledgeBase) {
      if (item.keywords.some(k => q.includes(k))) {
        return item.response;
      }
    }
    return 'Please book an appointment with Ambikesh for better help.';
  }

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function showSuggestions() {
    const container = document.createElement('div');
    container.className = 'chat-suggestions';
    suggestions.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn';
      btn.textContent = s;
      btn.addEventListener('click', () => {
        addMessage(s, 'user');
        container.remove();
        setTimeout(() => {
          const reply = findResponse(s);
          addMessage(reply, 'bot');
          setTimeout(showSuggestions, 800);
        }, 400);
      });
      container.appendChild(btn);
    });
    body.appendChild(container);
    body.scrollTop = body.scrollHeight;
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    // Remove suggestions
    const existing = body.querySelector('.chat-suggestions');
    if (existing) existing.remove();
    setTimeout(() => {
      const reply = findResponse(text);
      addMessage(reply, 'bot');
      if (!text.toLowerCase().includes('appointment') && !text.toLowerCase().includes('book')) {
        setTimeout(showSuggestions, 800);
      }
    }, 400);
  }

  toggle.addEventListener('click', () => {
    const isOpen = document.getElementById('chatbot').classList.toggle('open');
    if (isOpen) {
      setTimeout(() => input.focus(), 300);
      // Clear old suggestions and show fresh ones
      const old = body.querySelector('.chat-suggestions');
      if (old) old.remove();
      if (body.children.length <= 1) showSuggestions();
    }
  });

  closeBtn.addEventListener('click', () => {
    document.getElementById('chatbot').classList.remove('open');
  });

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });

  // Open chatbot if user clicks any appointment-related trigger
  window._openChatbot = function() {
    document.getElementById('chatbot').classList.add('open');
    input.focus();
  };
})();