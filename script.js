let allData = [];
  let likes = {};

  // ── API change handler ──
  function onApiChange() {
    const api = document.getElementById('apiSelect').value;
    document.getElementById('categoryFilter').style.display =
      api === 'jokes' ? 'block' : 'none';
    document.getElementById('cards').innerHTML = '';
    document.getElementById('statsText').textContent = 'Select an API and click Fetch.';
    allData = [];
  }

  // ── Main fetch ──
  async function fetchData() {
    const api = document.getElementById('apiSelect').value;
    const limit = parseInt(document.getElementById('limitSelect').value);
    const btn = document.getElementById('fetchBtn');

    btn.disabled = true;
    btn.textContent = 'Loading…';
    showSkeletons(6);

    try {
      if (api === 'jokes')     await fetchJokes(limit);
      if (api === 'catfacts')  await fetchCatFacts(limit);

      filterCards();
      showToast(`✓ Loaded ${allData.length} items`);
    } catch (err) {
      showError(err.message);
    }

    btn.disabled = false;
    btn.textContent = 'Fetch';
  }

  // ── Jokes ──
  async function fetchJokes(limit) {
    const category = document.getElementById('categoryFilter').value || 'Any';
    const url = `https://v2.jokeapi.dev/joke/${category}?safe-mode&type=twopart&amount=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Jokes API error: ${res.status}`);
    const data = await res.json();

    // API returns object if amount=1, array if >1
    const jokes = data.jokes || [data];
    allData = jokes.map((j, i) => ({
      id: i,
      tag: j.category,
      title: j.setup,
      body: j.delivery,
    }));
  }

  // ── Cat Facts ──
  async function fetchCatFacts(limit) {
    const url = `https://catfact.ninja/facts?max_length=300&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Cat Facts API error: ${res.status}`);
    const data = await res.json();
    allData = (data.data || []).map((f, i) => ({
      id: i,
      tag: 'Cat Fact',
      title: `Fact #${i + 1}`,
      body: f.fact,
    }));
  }

  // ── Render ──
  function renderCards(items) {
    const container = document.getElementById('cards');
    container.innerHTML = '';

    if (!items.length) {
      container.innerHTML = `<div class="empty"><div class="ico">🔍</div><p>No results found.</p></div>`;
      document.getElementById('statsText').innerHTML = `Showing <strong>0</strong> results`;
      return;
    }

    document.getElementById('statsText').innerHTML =
      `Showing <strong>${items.length}</strong> of <strong>${allData.length}</strong> items`;

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.animationDelay = `${Math.min(idx * 35, 350)}ms`;
      card.innerHTML = `
        <div class="card-tag">${item.tag}</div>
        <div class="card-title">${item.title}</div>
        <div class="card-body">${item.body}</div>
        <div class="card-footer">
          <span class="read-btn">View full →</span>
          <button class="like-btn ${likes[item.id] ? 'liked' : ''}"
            onclick="toggleLike(event, ${item.id})">
            ${likes[item.id] ? '♥' : '♡'}
          </button>
        </div>`;
      card.addEventListener('click', () => openModal(item));
      container.appendChild(card);
    });
  }

  // ── Filter / Search ──
  function filterCards() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = q
      ? allData.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.body.toLowerCase().includes(q))
      : allData;
    renderCards(filtered);
  }

  // ── Like ──
  function toggleLike(e, id) {
    e.stopPropagation();
    likes[id] = !likes[id];
    filterCards();
  }

  // ── Modal ──
  function openModal(item) {
    document.getElementById('modalTag').textContent = item.tag;
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalBody').textContent = item.body;
    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(e) {
    if (e.target === document.getElementById('modal')) closeModalDirect();
  }

  function closeModalDirect() {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModalDirect();
  });

  // ── Skeletons ──
  function showSkeletons(n) {
    const container = document.getElementById('cards');
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      container.innerHTML += `
        <div class="skeleton">
          <div class="sk" style="height:10px;width:30%"></div>
          <div class="sk" style="height:14px;width:80%;margin-top:6px"></div>
          <div class="sk" style="height:14px;width:60%"></div>
          <div class="sk" style="height:11px;width:90%;margin-top:8px"></div>
          <div class="sk" style="height:11px;width:75%"></div>
        </div>`;
    }
  }

  // ── Error ──
  function showError(msg) {
    document.getElementById('cards').innerHTML = `
      <div class="empty">
        <div class="ico">⚠️</div>
        <p style="color:#ef4444;font-weight:600">Failed to fetch</p>
        <p style="margin-top:6px">${msg}</p>
      </div>`;
  }

  // ── Toast ──
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }