const state = {
  tabs: [{ id: crypto.randomUUID(), title: 'New Tab', url: '' }],
  activeTab: 0,
  theme: 'dark'
};

const panelData = {
  home: '<p>Welcome to VectisX. Use New Tab to start browsing.</p>',
  history: '<ul><li>GitHub</li><li>MDN</li><li>YouTube</li></ul>',
  downloads: '<ul><li>VectisX.zip · Complete</li><li>roadmap.pdf · Complete</li></ul>',
  bookmarks: '<ul><li>https://github.com</li><li>https://developer.mozilla.org</li></ul>',
  settings: `
    <p>Theme</p>
    <div class="themes">
      <button data-theme="dark">Dark</button>
      <button data-theme="light">Light</button>
      <button data-theme="blood">Blood Red</button>
    </div>
  `
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function normalizeInput(value) {
  const raw = value.trim();
  if (!raw) return '';
  const isUrl = /^https?:\/\//i.test(raw) || /^[\w.-]+\.[a-z]{2,}/i.test(raw);
  return isUrl ? (raw.startsWith('http') ? raw : `https://${raw}`) : `https://duckduckgo.com/?q=${encodeURIComponent(raw)}`;
}

function renderTabs() {
  const tabs = $('#tabs');
  tabs.innerHTML = '';
  state.tabs.forEach((tab, index) => {
    const el = document.createElement('div');
    el.className = `tab ${index === state.activeTab ? 'active' : ''}`;
    el.innerHTML = `<span>${tab.title}</span><button aria-label="Close tab">×</button>`;
    el.onclick = (e) => {
      if (e.target.tagName === 'BUTTON') return closeTab(index);
      switchTab(index);
    };
    tabs.appendChild(el);
  });
}

function updateView() {
  const tab = state.tabs[state.activeTab];
  if (!tab.url) {
    $('#newTab').style.display = 'grid';
    $('#browserFrame').classList.remove('visible');
    return;
  }
  $('#newTab').style.display = 'none';
  const frame = $('#browserFrame');
  frame.classList.add('visible');
  frame.src = tab.url;
}

function addTab() { state.tabs.push({ id: crypto.randomUUID(), title: 'New Tab', url: '' }); state.activeTab = state.tabs.length - 1; renderTabs(); updateView(); }
function closeTab(i) { if (state.tabs.length === 1) return; state.tabs.splice(i, 1); state.activeTab = Math.min(state.activeTab, state.tabs.length - 1); renderTabs(); updateView(); }
function switchTab(i) { state.activeTab = i; renderTabs(); updateView(); }

function navigate(input) {
  const url = normalizeInput(input);
  if (!url) return;
  const tab = state.tabs[state.activeTab];
  tab.url = url;
  tab.title = new URL(url).hostname.replace('www.', '');
  renderTabs();
  updateView();
}

function setPanel(name, sourceButton) {
  const panel = $('#panel');
  $('#panelTitle').textContent = name[0].toUpperCase() + name.slice(1);
  $('#panelBody').innerHTML = panelData[name] || '<p>Coming soon.</p>';
  panel.classList.add('open');
  $$('.dock-item').forEach((item) => item.classList.remove('active'));
  sourceButton?.classList.add('active');
  placeIndicator(sourceButton);
}

function placeIndicator(target) {
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const dockRect = $('.dock').getBoundingClientRect();
  $('#dockIndicator').style.top = `${rect.top - dockRect.top + (rect.height - 30) / 2}px`;
}

function bind() {
  $('#addTab').addEventListener('click', addTab);
  $('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); navigate($('#searchInput').value); });
  $$('.shortcut').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.url)));
  $$('.dock-item').forEach((item) => item.addEventListener('click', () => {
    if (item.dataset.action === 'new-tab') return addTab();
    setPanel(item.dataset.panel, item);
  }));
  $('#closePanel').addEventListener('click', () => $('#panel').classList.remove('open'));
  $('#fullBtn').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  $('#minBtn').addEventListener('click', () => $('#panel').classList.remove('open'));
  $('#closeBtn').addEventListener('click', () => window.close());
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-theme]');
    if (!t) return;
    document.documentElement.setAttribute('data-theme', t.dataset.theme);
    state.theme = t.dataset.theme;
  });
}

renderTabs();
updateView();
bind();
placeIndicator($('.dock-item.active'));
window.addEventListener('resize', () => placeIndicator($('.dock-item.active')));
