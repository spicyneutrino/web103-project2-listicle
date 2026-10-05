const content = document.querySelector('#content');
const status = document.querySelector('#status');
const form = document.querySelector('#search-form');
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let controller;
async function request(url) {
  controller?.abort();
  controller = new AbortController();
  content.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading protocols…';
  content.replaceChildren();
  try {
    const response = await fetch(url, {signal: controller.signal});
    if (response.status === 404) {
      status.textContent = '404 — Protocol not found';
      content.innerHTML = '<a href="/">Back to all protocols</a>';
      return;
    }
    if (!response.ok) throw new Error('Request failed');
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') return;
    status.textContent = 'Unable to load protocols. Please try again.';
    const retry = document.createElement('button');
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => location.reload());
    content.append(retry);
  } finally { content.setAttribute('aria-busy', 'false'); }
}
async function list() {
  const params = new URLSearchParams(new FormData(form));
  const data = await request('/api/protocols?' + params);
  if (!data) return;
  const items = Array.isArray(data) ? data : data.protocols;
  status.textContent = items.length ? `${items.length} protocol${items.length === 1 ? '' : 's'} found` : 'No protocols match. Try another search or reset the filters.';
  content.className = 'protocol-grid';
  content.innerHTML = items.map(p => `<a class="protocol-card" href="/protocols/${encodeURIComponent(p.slug)}"><article><img src="${escapeHTML(p.image)}" alt="" width="120" height="90"><h2>${escapeHTML(p.name)}</h2><p class="chips"><span class="chip">${escapeHTML(p.layer)}</span><span class="chip">${escapeHTML(p.ports)}</span></p><p>${escapeHTML(p.purpose)}</p><span class="read-more">Explore protocol →</span></article></a>`).join('');
}
async function detail(slug) {
  document.querySelector('#search-section').hidden = true;
  document.querySelector('hgroup').hidden = true;
  const data = await request('/api/protocols/' + encodeURIComponent(slug));
  if (!data) return;
  const p = data.protocol || data;
  const fullName = p.fullName || p.full_name;
  const useCases = p.useCases || p.use_cases;
  document.title = p.name + ' — Network Protocol Explorer';
  status.textContent = '';
  content.innerHTML = `<a href="/">← Back to all protocols</a><article class="detail"><img src="${escapeHTML(p.image)}" alt="" width="200" height="150"><h1>${escapeHTML(p.name)}</h1><p><em>${escapeHTML(fullName)}</em></p><p class="chips"><span class="chip">Layer: ${escapeHTML(p.layer)}</span><span class="chip">Transport: ${escapeHTML(p.transport)}</span><span class="chip">Ports: ${escapeHTML(p.ports)}</span></p><p><strong>Purpose:</strong> ${escapeHTML(p.purpose)}</p><p>${escapeHTML(p.description)}</p><h2>Use cases</h2><ul>${useCases.map(u => `<li>${escapeHTML(u)}</li>`).join('')}</ul><h2>Example</h2><p>${escapeHTML(p.example)}</p></article>`;
}
form.addEventListener('submit', event => { event.preventDefault(); list(); });
form.addEventListener('reset', () => setTimeout(list, 0));
if (location.pathname === '/') list();
else if (/^\/protocols\/[^/]+$/.test(location.pathname)) detail(decodeURIComponent(location.pathname.split('/')[2]));
else { document.querySelector('#search-section').hidden = true; status.textContent = '404 — Page not found'; content.innerHTML = '<a href="/">Back to all protocols</a>'; }
