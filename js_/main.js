/* ------------------------------------------
   IDIOMA — troca PT / EN
------------------------------------------ */
function setLang(lang) {
  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });
  document.querySelectorAll('.lang-toggle button').forEach((btn, i) => {
    btn.classList.toggle('active',
      (lang === 'pt' && i === 0) || (lang === 'en' && i === 1)
    );
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}

/* ------------------------------------------
   SKILLS — dados: nome, site, logo (SimpleIcons CDN)
------------------------------------------ */
const SKILLS = {
  'Python':     { url: 'https://python.org',                                logo: 'https://cdn.simpleicons.org/python' },
  'Node.js':    { url: 'https://nodejs.org',                                logo: 'https://cdn.simpleicons.org/nodedotjs' },
  'REST APIs':  { url: 'https://restfulapi.net',                            logo: 'https://cdn.simpleicons.org/fastapi' },
  'HTML':       { url: 'https://developer.mozilla.org/docs/Web/HTML',       logo: 'https://cdn.simpleicons.org/html5' },
  'CSS':        { url: 'https://developer.mozilla.org/docs/Web/CSS',        logo: 'https://cdn.simpleicons.org/css3' },
  'JavaScript': { url: 'https://developer.mozilla.org/docs/Web/JavaScript', logo: 'https://cdn.simpleicons.org/javascript' },
  'Git':        { url: 'https://git-scm.com',                               logo: 'https://cdn.simpleicons.org/git' },
  'GitHub':     { url: 'https://github.com',                                logo: 'https://cdn.simpleicons.org/github' },
  'Linux':      { url: 'https://kernel.org',                                logo: 'https://cdn.simpleicons.org/linux' },
  'MySQL':      { url: 'https://mysql.com',                                 logo: 'https://cdn.simpleicons.org/mysql' },
  'PostgreSQL': { url: 'https://postgresql.org',                            logo: 'https://cdn.simpleicons.org/postgresql' },
  'SQLite':     { url: 'https://sqlite.org',                                logo: 'https://cdn.simpleicons.org/sqlite' },
  'Unity':      { url: 'https://unity.com',                                 logo: 'https://cdn.simpleicons.org/unity' },
  'C#':         { url: 'https://dotnet.microsoft.com/languages/csharp',     logo: 'https://cdn.simpleicons.org/csharp' },
  'Godot':      { url: 'https://godotengine.org',                           logo: 'https://cdn.simpleicons.org/godotengine' },
  'Excel':      { url: 'https://microsoft.com/excel',                       logo: 'https://cdn.simpleicons.org/microsoftexcel' },
  'Power BI':   { url: 'https://powerbi.microsoft.com',                     logo: 'https://cdn.simpleicons.org/powerbi' },
  'Pandas':     { url: 'https://pandas.pydata.org',                         logo: 'https://cdn.simpleicons.org/pandas' },
};

/* ------------------------------------------
   SKILLS — logica do tooltip (balao)
------------------------------------------ */
let activeTooltip = null;

function buildTooltip(skill, data) {
  const tip = document.createElement('div');
  tip.className = 'skill-tooltip';
  tip.innerHTML = `
    <img src="${data.logo}/ffffff" alt="${skill}" onerror="this.style.display='none'" />
    <span class="skill-tooltip-name">${skill}</span>
    <a href="${data.url}" target="_blank" rel="noopener" class="skill-tooltip-link">Visitar site</a>
  `;
  return tip;
}

function closeTooltip() {
  if (activeTooltip) {
    activeTooltip.classList.remove('visible');
    setTimeout(() => activeTooltip?.remove(), 200);
    activeTooltip = null;
  }
}

function toggleTooltip(tag, skill) {
  if (activeTooltip && tag.contains(activeTooltip)) { closeTooltip(); return; }
  closeTooltip();
  const data = SKILLS[skill];
  if (!data) return;
  const tip = buildTooltip(skill, data);
  tag.style.position = 'relative';
  tag.appendChild(tip);
  activeTooltip = tip;
  requestAnimationFrame(() => tip.classList.add('visible'));
}

/* ------------------------------------------
   SCROLL FADE — todo elemento com a classe
   .fade-on-scroll some conforme sobe e
   ultrapassa o topo da viewport.
   A nav fica fixada e nunca some.
------------------------------------------ */
(function initScrollFade() {
  const elements = document.querySelectorAll(
    'section, .section-divider, footer'
  );

  function update() {
    const navH = document.querySelector('nav').offsetHeight;

    elements.forEach(el => {
      const rect    = el.getBoundingClientRect();
      const elBot   = rect.bottom;   /* borda inferior do elemento */
      const fadeZone = 220;          /* px antes de sumir completamente */

      /* Quando a borda inferior do elemento chega perto do topo da nav */
      const ratio = elBot / (navH + fadeZone);
      const opacity = Math.min(1, Math.max(0, ratio - 0.1));

      el.style.opacity   = opacity;
      /* Leve translateY pra dar sensacao de fumaça subindo */
      const drift = (1 - opacity) * -18;
      el.style.transform = `translateY(${drift}px)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ------------------------------------------
  GITHUB COMMITS — soma automaticamente
  todos os repos publicos do usuario.
  Troque 'msantt' pelo seu username.
------------------------------------------ */
async function fetchGitHubCommits(username) {
  const el = document.getElementById('commit-count');
  try {
    const res   = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await res.json();
    if (!Array.isArray(repos)) { el.textContent = '-'; return; }

    let total = 0;

    await Promise.all(repos.map(async (repo) => {
      try {
        const r    = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`);
        const link = r.headers.get('Link');

        if (link) {
          /* GitHub usa Link header pra paginacao — pega o numero da ultima pagina */
          const match = link.match(/page=(\d+)>; rel="last"/);
          if (match) total += parseInt(match[1]);
        } else {
          const data = await r.json();
          if (Array.isArray(data)) total += data.length;
        }
      } catch { /* repo sem commits ou privado — ignora */ }
    }));

    el.textContent = total > 0 ? total.toLocaleString() : '-';
  } catch {
    el.textContent = '-';
  }
}

fetchGitHubCommits('msantt');

/* ------------------------------------------
   INIT — ativa tooltip nas skill tags
------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.skill-tag').forEach(tag => {
    const skill = tag.textContent.trim();
    if (!SKILLS[skill]) return;

    tag.classList.add('skill-tag--clickable');
    tag.setAttribute('role', 'button');
    tag.setAttribute('tabindex', '0');

    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTooltip(tag, skill);
    });

    tag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggleTooltip(tag, skill);
    });
  });

  /* Clique fora fecha o tooltip */
  document.addEventListener('click', closeTooltip);
});
