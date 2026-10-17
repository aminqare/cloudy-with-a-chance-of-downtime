(() => {
  const data = window.CustomerExperienceDemo;
  if (!data) return;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);
  const labels = { excellent:'Great', good:'Good', busy:'Busy', limited:'Limited' };
  const modeLabels = { weather:'Live weather', experience:'Customer experience', demand:'Demand', speed:'Speed' };
  const customerState = { mode:'weather', selected:'Tehran' };

  function renderPulse() {
    const target = $('#customer-pulse');
    if (!target) return;
    const cards = [
      ['People connected', data.national.activeCustomers, 'Active customers in this demo', 'good'],
      ['Service available', data.national.serviceAvailability, 'National mobile availability', 'excellent'],
      ['Good experience', data.national.goodExperience, 'Customers with normal service', 'good'],
      ['Areas to watch', data.national.areasToWatch, 'Busy or weather-exposed today', 'busy'],
    ];
    target.innerHTML = cards.map(([label, value, detail, status]) => `<article class="customer-pulse-card ${status}"><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`).join('');
  }

  function statusFor(region, mode) {
    if (mode === 'demand') return region.demand >= 90 ? 'limited' : region.demand >= 82 ? 'busy' : region.demand >= 70 ? 'good' : 'excellent';
    if (mode === 'speed') return region.speed < 70 ? 'limited' : region.speed < 110 ? 'busy' : region.speed < 170 ? 'good' : 'excellent';
    return region.status;
  }

  function metricFor(region, mode) {
    if (mode === 'demand') return `${region.demand}%`;
    if (mode === 'speed') return `${region.speed}`;
    return `${region.goodExperience}%`;
  }

  function renderDetail(city = customerState.selected) {
    const region = data.regions.find((item) => item.city === city) || data.regions[0];
    customerState.selected = region.city;
    const status = statusFor(region, customerState.mode === 'weather' ? 'experience' : customerState.mode);
    const title = $('#customer-region-title');
    const badge = $('#customer-region-badge');
    const detail = $('#customer-region-detail');
    if (title) title.textContent = `${region.city} · ${region.province}`;
    if (badge) { badge.className = `experience-badge ${status}`; badge.textContent = labels[status].toUpperCase(); }
    if (detail) detail.innerHTML = `<p class="region-outlook">${region.outlook}</p><div class="region-metrics"><span><b>${region.goodExperience}%</b><small>good experience</small></span><span><b>${region.speed} Mbps</b><small>typical demo speed</small></span><span><b>${region.demand}%</b><small>radio demand</small></span><span><b>${region.availability}%</b><small>availability</small></span></div><div class="region-weather"><i>☀</i><span><b>${region.weather}</b><small>${region.impacted ? `${formatNumber(region.impacted)} people may notice a change` : 'No meaningful customer impact expected'}</small></span></div><details><summary>Network terms</summary><p>Demand is modeled from RRC occupancy. Speed is modeled from TRP traffic. Both are sanitized demonstration values inspired by LDP—not live customer records.</p></details>`;
    $$('.experience-marker').forEach((marker) => marker.classList.toggle('selected', marker.dataset.city === region.city));
    $$('.outlook-row').forEach((row) => row.classList.toggle('selected', row.dataset.city === region.city));
  }

  function renderOutlook() {
    const target = $('#regional-outlook-list');
    if (!target) return;
    target.innerHTML = [...data.regions].sort((a, b) => a.goodExperience - b.goodExperience).map((region) => `<button class="outlook-row ${region.status}" data-city="${region.city}"><span class="outlook-place"><i></i><b>${region.city}</b><small>${region.outlook}</small></span><span><b>${region.goodExperience}%</b><small>good experience</small></span><span><b>${region.speed} Mbps</b><small>typical speed</small></span><em>${labels[region.status]}</em></button>`).join('');
    $$('.outlook-row').forEach((row) => row.addEventListener('click', () => renderDetail(row.dataset.city)));
  }

  function renderMap() {
    if (typeof mapProjection !== 'function') return false;
    const layer = $('#customer-experience-layer');
    const canvas = $('#map-canvas');
    if (!layer || !canvas) return false;
    const visible = customerState.mode !== 'weather';
    canvas.classList.toggle('customer-overlay-active', visible);
    layer.style.display = visible ? 'block' : 'none';
    if (!visible) {
      $('#map-layer-label').textContent = 'Live weather layer';
      return true;
    }
    layer.innerHTML = data.regions.map((region) => {
      const [x, y] = mapProjection([region.lon, region.lat]);
      const status = statusFor(region, customerState.mode);
      const metric = metricFor(region, customerState.mode);
      const unit = customerState.mode === 'speed' ? '<small>Mbps</small>' : '';
      return `<button class="experience-marker ${status}" style="left:${x / 760 * 100}%;top:${y / 500 * 100}%" data-city="${region.city}" aria-label="${region.city}: ${modeLabels[customerState.mode]} ${metric}"><span>${metric}${unit}</span><b>${region.city}</b></button>`;
    }).join('');
    $$('.experience-marker').forEach((marker) => marker.addEventListener('click', () => renderDetail(marker.dataset.city)));
    $('#map-layer-label').textContent = `${modeLabels[customerState.mode]} · sanitized demo`;
    const hud = $('#map-hud-layer');
    if (hud) hud.textContent = modeLabels[customerState.mode];
    renderDetail();
    return true;
  }

  function bindControls() {
    $$('[data-experience-layer]').forEach((button) => button.addEventListener('click', () => {
      customerState.mode = button.dataset.experienceLayer;
      $$('[data-experience-layer]').forEach((item) => item.classList.toggle('active', item === button));
      renderMap();
    }));
  }

  renderPulse();
  renderOutlook();
  bindControls();
  renderDetail();
  let attempts = 0;
  const timer = setInterval(() => { attempts += 1; if (renderMap() || attempts > 40) clearInterval(timer); }, 180);
})();
