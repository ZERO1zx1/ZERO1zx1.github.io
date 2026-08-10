const GITHUB_USER = 'ZERO1zx1';
const EMAIL = 'hotaruhoshi24@gmail.com';
const FALLBACK_REPOS = [
  ['summer_course_2026','JavaScript'],['discord-bot','Python'],['ZERO1zx1.github.io','HTML'],
  ['Website','Python'],['trivia-quiz-V1','Python'],['manus-mini-skill',null],
  ['gurtendev','Python'],['trivia-quiz-test','Python'],['ZERO1zx1',null],
  ['Gurten-LGC',null,'old files'],['mdku-zvil','Python'],['isaku-V2-','Python']
].map(([name, language, description], index) => ({ name, language, description: description || null, html_url: `https://github.com/${GITHUB_USER}/${name}`, stargazers_count: 0, updated_at: new Date(Date.now() - index * 86400000).toISOString() }));
const state = { repos: FALLBACK_REPOS, language: 'all', query: '' };

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const formatDate = date => new Intl.DateTimeFormat('mn-MN', { year: 'numeric', month: 'short' }).format(new Date(date));

function projectCard(repo, index) {
  const description = repo.description || 'Энэ төслийн тайлбар удахгүй нэмэгдэнэ.';
  return `<a class="project-card" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(repo.name)} төслийг GitHub дээр нээх">
    <div class="project-card-top"><span class="project-number">${String(index + 1).padStart(2, '0')}</span><span class="project-arrow">↗</span></div>
    <h3>${escapeHtml(repo.name)}</h3><p>${escapeHtml(description)}</p>
    <div class="project-meta">${repo.language ? `<span class="language">${escapeHtml(repo.language)}</span>` : ''}<span>★ ${repo.stargazers_count}</span><span>${formatDate(repo.updated_at)}</span></div>
  </a>`;
}

function renderProjects() {
  const query = state.query.toLowerCase();
  const repos = state.repos.filter(repo => (state.language === 'all' || repo.language === state.language) && `${repo.name} ${repo.description || ''}`.toLowerCase().includes(query));
  $('#projectGrid').innerHTML = repos.length ? repos.map(projectCard).join('') : '<div class="empty-state"><p>Тохирох төсөл олдсонгүй.</p></div>';
  $('#projectResult').textContent = `${repos.length} төсөл харагдаж байна`;
}

function renderFilters() {
  const counts = state.repos.reduce((all, repo) => repo.language ? { ...all, [repo.language]: (all[repo.language] || 0) + 1 } : all, {});
  const languages = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([language]) => language);
  $('#languageFilters').innerHTML = ['all', ...languages].map(language => `<button class="${language === 'all' ? 'active' : ''}" data-language="${escapeHtml(language)}">${language === 'all' ? 'Бүгд' : escapeHtml(language)}</button>`).join('');
}

async function loadGitHub() {
  try {
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { signal: AbortSignal.timeout(7000) }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`, { signal: AbortSignal.timeout(7000) })
    ]);
    if (!profileResponse.ok || !reposResponse.ok) throw new Error('GitHub API response failed');
    const profile = await profileResponse.json();
    state.repos = (await reposResponse.json()).filter(repo => !repo.fork).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    $('#repoCount').textContent = profile.public_repos ?? state.repos.length;
    $('#starCount').textContent = state.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    $('#followerCount').textContent = profile.followers ?? 0;
    renderFilters(); renderProjects();
  } catch (error) {
    console.error(error);
    renderFilters(); renderProjects();
  }
}

$('#projectSearch').addEventListener('input', event => { state.query = event.target.value; renderProjects(); });
$('#languageFilters').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  state.language = button.dataset.language;
  document.querySelectorAll('#languageFilters button').forEach(item => item.classList.toggle('active', item === button));
  renderProjects();
});

const root = document.documentElement;
const themeButton = $('#themeToggle');
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') root.classList.add('light');
function updateThemeButton() { const light = root.classList.contains('light'); themeButton.textContent = light ? '☀' : '☾'; themeButton.setAttribute('aria-label', light ? 'Харанхуй горимд шилжих' : 'Цайвар горимд шилжих'); }
themeButton.addEventListener('click', () => { root.classList.toggle('light'); localStorage.setItem('portfolio-theme', root.classList.contains('light') ? 'light' : 'dark'); updateThemeButton(); });
updateThemeButton();

$('#copyEmail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(EMAIL); } catch { const area = document.createElement('textarea'); area.value = EMAIL; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove(); }
  $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2200);
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible')), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
$('#year').textContent = new Date().getFullYear();
function updateTime() { $('#localTime').textContent = new Intl.DateTimeFormat('mn-MN', { timeZone: 'Asia/Ulaanbaatar', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); }
$('#repoCount').textContent = FALLBACK_REPOS.length;
$('#starCount').textContent = '0'; $('#followerCount').textContent = '—';
renderFilters(); renderProjects();
updateTime(); setInterval(updateTime, 60000); loadGitHub();
