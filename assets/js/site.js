/* ==========================================================================
   jessicaorienta.com.br — comportamento das páginas gerais (início, e-books, 404)
   As configurações (WhatsApp, links) ficam em assets/js/site-config.js
   ========================================================================== */
(function(){
  const SITE = window.SITE || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => matchMedia('(max-width: 899px)').matches;
  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} };

  /* Ao abrir os arquivos direto do computador (sem servidor), links de pasta
     como "ebooks/do-tema-a-defesa/" precisam de "index.html" no fim. */
  if (location.protocol === 'file:') {
    $$('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (!/^[a-z]+:|^#|^\//i.test(h) && h.endsWith('/')) a.setAttribute('href', h + 'index.html');
    });
  }

  /* Aviso rápido */
  const toastEl = $('#toast'); let toastTimer;
  function toast(msg){
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  /* Links vindos da configuração: data-link="instagram" | "threads" | "mentoriaListaEspera" */
  $$('[data-link]').forEach(a => {
    const url = SITE[a.dataset.link];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* WhatsApp com mensagem pronta: data-wa="ebook" | "mentoria" | "outro" | "geral" */
  const WA_BASE = 'Olá, Jéssica! Vim pelo site jessicaorienta.com.br.';
  const waMsgs = {
    geral:    WA_BASE + ' Gostaria de tirar uma dúvida.',
    ebook:    WA_BASE + ' Tenho uma dúvida sobre o e-book "Do Tema à Defesa".',
    mentoria: WA_BASE + ' Gostaria de saber mais sobre a mentoria.',
    outro:    WA_BASE + ' Tenho uma dúvida: '
  };
  const waDigits = String(SITE.whatsapp || '').replace(/\D/g, '');
  $$('[data-wa]').forEach(a => {
    if (!waDigits) return;
    a.href = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent(waMsgs[a.dataset.wa] || waMsgs.geral);
    a.rel = 'noopener';
    if (!isMobile()) a.target = '_blank';
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-wa]');
    if (!a) return;
    buzz();
    if (!waDigits) { e.preventDefault(); toast('O número do WhatsApp ainda não foi configurado.'); }
  });
  $$('[data-wa-hours]').forEach(p => { if (SITE.whatsappHours) { p.textContent = 'Atendimento: ' + SITE.whatsappHours; p.hidden = false; } });

  /* Cabeçalho ganha sombra ao rolar */
  const head = $('.site-head');

  /* Livros que giram com a rolagem (mesmo movimento da página do e-book) */
  const books = $$('.book-scene');
  function updateBooks(){
    if (reduceMotion) return;
    const vh = innerHeight;
    books.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const ry = 32 - 52 * p;
      el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      el.style.setProperty('--rx', (2 + 7 * p).toFixed(2) + 'deg');
      el.style.setProperty('--rz', (-2 + 3 * p).toFixed(2) + 'deg');
      el.style.setProperty('--ty', (24 * (0.5 - p)).toFixed(1) + 'px');
      el.style.setProperty('--sh', (1 - Math.min(.35, Math.abs(ry) / 90)).toFixed(3));
      el.style.setProperty('--so', (0.75 + 0.25 * (1 - Math.min(1, Math.abs(ry) / 32))).toFixed(3));
    });
  }

  let ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      if (head) head.classList.toggle('scrolled', scrollY > 8);
      updateBooks();
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Ano no rodapé */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
