const api = window.NetworkWeatherApi;
const $ = (selector) => document.querySelector(selector);
const urlFrame = Number(new URLSearchParams(window.location.search).get('frame'));
const state = { frame: Number.isInteger(urlFrame) && urlFrame >= 0 && urlFrame < 13 ? urlFrame : 6, playing: false, speed: 1, layer: 'condition', audience: 'executive', reducedMotion: false, story: 0, mapZoom: 1, mapX: 0, mapY: 0, acknowledgedAlerts: new Set(), irimoWarnings: [], irimoStatus: 'loading', selectedProvince: null };
try { state.acknowledgedAlerts = new Set(JSON.parse(localStorage.getItem('network-weather-acknowledged') || '[]')); } catch { state.acknowledgedAlerts = new Set(); }
const conditions = {
  clear: { label:'CLEAR', weather:'sunny', title:'Mostly clear network conditions', detail:'Strong availability across the metro with isolated pressure building toward the evening peak.', className:'clear' },
  cloud: { label:'PARTLY CLOUDY', weather:'partly', title:'Partly cloudy network conditions', detail:'Demand is rising across key corridors. Capacity remains healthy with localized congestion risk.', className:'cloud' },
  rain: { label:'CONGESTION RAIN', weather:'rainy', title:'Congestion developing in the east', detail:'Traffic pressure is spreading into the evening peak. Prepare for a measurable latency increase.', className:'rain' },
  storm: { label:'SEVERE STORM', weather:'stormy', title:'Severe network weather', detail:'High utilization, elevated latency, and multiple incidents require immediate operational attention.', className:'storm' },
};
const stories = [
  ['Today','What is happening now?','Explain the overall condition and the top KPI drivers.'],
  ['Regional forecast','Where is pressure moving?','Follow the congestion front as it moves through the eastern corridor.'],
  ['Traffic climate','How is demand changing?','Compare utilization, latency, and throughput as the peak builds.'],
  ['Severe conditions','What needs attention?','Open warnings and connect each one to an affected area and time.'],
  ['Engineer radar','What is the technical cause?','Switch to engineering view for radio quality, handovers, and backhaul context.'],
  ['Maintenance forecast','What is planned?','Show the airport maintenance window and its expected redundancy impact.'],
];
let mapProjection = null;
const cityLabels = [];
const provinceAnchors = [];
function projectedCentroid(points) {
  let twiceArea = 0; let x = 0; let y = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index]; const [x2, y2] = points[index + 1]; const cross = x1 * y2 - x2 * y1;
    twiceArea += cross; x += (x1 + x2) * cross; y += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 0.001) return points[Math.floor(points.length / 2)] || [380, 250];
  return [x / (3 * twiceArea), y / (3 * twiceArea)];
}
const provinceKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
function projectIranBoundary(geojson) {
  const svg = document.querySelector('.iran-map');
  const coordinates = geojson.features.flatMap((feature) => feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates]);
  const rings = coordinates.flatMap((polygon) => polygon);
  const points = rings.flatMap((ring) => ring);
  const bounds = points.reduce((result, [lon, lat]) => ({ minLon: Math.min(result.minLon, lon), maxLon: Math.max(result.maxLon, lon), minLat: Math.min(result.minLat, lat), maxLat: Math.max(result.maxLat, lat) }), { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity });
  const width = 760; const height = 500; const padding = 22;
  const scale = Math.min((width - padding * 2) / (bounds.maxLon - bounds.minLon), (height - padding * 2) / (bounds.maxLat - bounds.minLat));
  const offsetX = (width - (bounds.maxLon - bounds.minLon) * scale) / 2;
  const offsetY = (height - (bounds.maxLat - bounds.minLat) * scale) / 2;
  mapProjection = ([lon, lat]) => [
    (lon - bounds.minLon) * scale + offsetX,
    (bounds.maxLat - lat) * scale + offsetY,
  ];
  svg.querySelectorAll('.iran-outline, .iran-ridge, .province-layer, .city-label-layer').forEach((node) => node.remove());
  provinceAnchors.length = 0;
  const outlineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  outlineGroup.classList.add('province-layer');
  geojson.features.forEach((feature, featureIndex) => {
    const polygons = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = polygons.flatMap((polygon) => polygon).map((ring) => `${ring.map((coordinate, index) => { const [x, y] = mapProjection(coordinate); return `${index ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`; }).join(' ')} Z`).join(' ');
    path.setAttribute('d', pathData); path.classList.add('province-shape'); path.dataset.province = feature.properties['name:en'] || feature.properties.name || `Province ${featureIndex + 1}`;
    const outerRings = polygons.map((polygon) => polygon[0]).filter(Boolean); const mainRing = outerRings.sort((a, b) => b.length - a.length)[0] || [];
    const [anchorX, anchorY] = projectedCentroid(mainRing.map(mapProjection));
    provinceAnchors.push({ name:path.dataset.province, nameFa:feature.properties.name || '', x:anchorX, y:anchorY, index:featureIndex });
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = `${path.dataset.province} province`; path.append(title); outlineGroup.append(path);
  });
  const countryOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  countryOutline.classList.add('iran-outline', 'real-boundary');
  countryOutline.setAttribute('d', rings.map((ring) => `${ring.map((coordinate, index) => { const [x, y] = mapProjection(coordinate); return `${index ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`; }).join(' ')} Z`).join(' '));
  outlineGroup.append(countryOutline); svg.prepend(outlineGroup);
  $('#map-source').textContent = 'Provinces: OSM-derived GeoJSON · © OSM';
}
function renderCityLabels(cities) {
  const svg = document.querySelector('.iran-map');
  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); layer.classList.add('city-label-layer');
  cities.forEach((city) => {
    if (!mapProjection) return;
    const [x, y] = mapProjection([city.lon, city.lat]);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g'); group.classList.add('city-label', city.capital ? 'provincial-capital' : 'major-city'); group.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', city.capital ? '3.4' : '2.2');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text'); text.setAttribute('x', city.capital ? '6' : '5'); text.setAttribute('y', city.capital ? '3' : '2.5'); text.textContent = city.name;
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = `${city.name} · ${city.fa} · ${city.province}`; group.append(title, dot, text); layer.append(group);
  });
  svg.append(layer);
}
async function loadIranBoundary() {
  try {
    const [boundaryResponse, citiesResponse] = await Promise.all([
      fetch('./data/iran-provinces.geojson'),
      fetch('./data/iran-cities.json'),
    ]);
    if (!boundaryResponse.ok || !citiesResponse.ok) throw new Error('Iran geography assets unavailable');
    const [boundary, cities] = await Promise.all([boundaryResponse.json(), citiesResponse.json()]);
    projectIranBoundary(boundary); cityLabels.length = 0; cityLabels.push(...cities); renderWeatherCards(api.getFrame(state.frame)); renderIrimoWarningMarkers();
  } catch (error) {
    $('#map-source').textContent = `Boundary: fallback · ${error.message}`;
    console.warn('Iran boundary asset unavailable; using fallback outline.', error);
  }
}
function render() {
  const frame = api.getFrame(state.frame); const condition = conditions[frame.state];
  const shareUrl = new URL(window.location.href); shareUrl.searchParams.set('frame', state.frame); window.history.replaceState({}, '', shareUrl);
  document.body.classList.toggle('reduced-motion', state.reducedMotion);
  $('#headline').textContent = condition.title; $('#headline-detail').textContent = condition.detail;
  $('#scenario-date').textContent = `Demo scenario · ${frame.time} IRST`;
  $('#condition-icon').innerHTML = weatherIcon(condition.weather); $('#condition-label').textContent = condition.label;
  $('#condition-meta').textContent = `${frame.observed ? 'Observed' : 'Forecast'} · ${frame.time} IRST`;
  $('#condition-badge').className = `condition-badge ${condition.className}`;
  $('#narrative').textContent = narrative(frame);
  const tickerAlerts = [...api.alerts, ...ruleAlerts(frame)].filter((alert) => alert.state !== 'Forecast' || state.frame >= 7);
  $('#ticker-text').textContent = tickerAlerts.map((alert) => `[${alert.severity}] ${alert.region} · ${alert.title} · ${alert.state} ${alert.time} · ${alert.impact || alert.detail} · ${alert.confidence || frame.confidence}% confidence`).join('   ✦   ') || 'No actionable telecom alerts in this frame';
  $('#broadcast-now').textContent = `${frame.observed ? 'Observed' : 'Forecast'} · ${frame.time} IRST · ${frame.state.toUpperCase()}`;
  $('#broadcast-next').textContent = `${frame.utilization > 78 ? 'Peak pressure' : 'Demand building'} · ${api.frames[Math.min(state.frame + 1, api.frames.length - 1)].time} IRST`;
  $('#broadcast-risk').textContent = frame.state === 'storm' ? 'East outage risk · Airport maintenance' : 'East interference · North congestion watch';
  $('#confidence').textContent = `Confidence ${frame.confidence}%`; $('#source-state').textContent = `Demo telemetry · ${frame.observed ? 'Observed scenario' : 'Forecast scenario'}`;
  $('#broadcast-source').textContent = state.irimoStatus === 'live' ? 'Demo telemetry · IRIMO live' : `Demo telemetry · IRIMO ${state.irimoStatus}`;
  $('#selected-time').textContent = `${frame.time} IRST`; $('#selected-state').textContent = frame.observed ? 'Observed condition' : 'Forecast condition'; $('#timeline-confidence').textContent = `Confidence ${frame.confidence}%`;
  $('#timeline').value = state.frame; renderSites(frame); renderWeatherCards(frame); renderKpis(frame); renderOperations(frame); renderAlerts(frame); renderDetails(frame); renderStories();
  $('#map-hud-time').textContent = `${frame.time} IRST · ${frame.observed ? 'Observed' : 'Forecast'}`;
  $('#map-hud-layer').textContent = `${state.layer[0].toUpperCase()}${state.layer.slice(1)}`;
  $('#map-hud-warnings').textContent = state.irimoWarnings.length ? `${state.irimoWarnings.length} IRIMO warnings` : 'IRIMO feed loading';
  const wind = frame.state === 'storm' ? ['SW', 32] : frame.state === 'rain' ? ['W', 24] : frame.state === 'cloud' ? ['NW', 17] : ['N', 11];
  ensureBroadcastWeather(); $('#map-hud-wind').textContent = `Wind ${wind[0]} ${wind[1]} km/h`;
  $('#map-canvas').dataset.weather = frame.state;
}

function renderOperations(frame) {
  const rows = api.provinceProfiles.map((profile) => api.getProvinceMetrics(profile.name, state.frame));
  const riskScore = (row) => Math.round(row.congestion * 0.58 + Math.max(0, 98 - row.coverage) * 4 + row.incidents * 10 + row.packetLoss * 4);
  const ranked = rows.map((row) => ({ ...row, riskScore: riskScore(row) })).sort((a, b) => b.riskScore - a.riskScore);
  const critical = ranked.filter((row) => row.riskScore >= 82).length;
  const watch = ranked.filter((row) => row.riskScore >= 65 && row.riskScore < 82).length;
  const healthy = Math.max(0, ranked.length - critical - watch);
  const sourceState = frame.observed ? 'observed' : 'forecast';
  $('#ops-mode').textContent = `${sourceState.toUpperCase()} · DEMO TELEMETRY`;
  $('#ops-summary').innerHTML = [
    ['Capacity review', `${critical + watch}`, critical ? 'Immediate review' : 'Within plan', critical ? 'critical' : 'healthy'],
    ['Critical provinces', `${critical}`, critical ? 'Escalate first' : 'None detected', critical ? 'critical' : 'healthy'],
    ['Watch provinces', `${watch}`, 'Monitor next frame', watch ? 'watch' : 'healthy'],
    ['Coverage floor', `${Math.min(...ranked.map((row) => row.coverage)).toFixed(1)}%`, 'Lowest province', 'watch'],
    ['Data quality', sourceState === 'observed' ? 'Complete' : 'Forecast', frame.observed ? 'Fresh demo frame' : 'Labelled forecast', frame.observed ? 'healthy' : 'watch'],
  ].map(([label, value, detail, stateName]) => `<div class="ops-stat ${stateName}"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`).join('');
  $('#ops-watchlist').innerHTML = ranked.slice(0, 6).map((row) => {
    const status = row.riskScore >= 82 ? 'critical' : row.riskScore >= 65 ? 'watch' : 'healthy';
    return `<tr class="${status}"><td><strong>${row.name}</strong><small>${row.technology}${row.maintenance !== 'No window' ? ` · ${row.maintenance}` : ''}</small></td><td>${row.trafficGbps} <small>Gbps</small></td><td><b>${row.congestion}%</b><div class="ops-meter"><i style="width:${row.congestion}%"></i></div></td><td>${row.coverage.toFixed(1)}%</td><td><span class="ops-status ${status}">${status === 'critical' ? 'REVIEW' : status === 'watch' ? 'WATCH' : 'OK'}</span></td></tr>`;
  }).join('');
  $('#ops-sources-list').innerHTML = Object.values(api.operations).map((source) => `<div class="ops-source"><span class="ops-source-dot ${source.state}"></span><div><strong>${source.label}</strong><small>${source.value} · ${source.detail}</small></div><em>${source.state === 'live' ? 'SOURCE' : source.state.toUpperCase()}</em></div>`).join('');
}
function narrative(frame) {
  if (frame.state === 'storm') return `Severe network weather is expected across the metro by ${frame.time}. Utilization reaches ${frame.utilization}%, latency rises to ${frame.latency} milliseconds, and ${frame.incidents} active incidents need attention. Confidence is ${frame.confidence}%.`;
  if (frame.state === 'rain') return `Network weather is turning rainy in the eastern corridor. Utilization is ${frame.utilization}% and latency is ${frame.latency} milliseconds. The next severe window is expected at 21:00.`;
  if (frame.state === 'cloud') return `Partly cloudy conditions are developing. Utilization is ${frame.utilization}% with ${frame.incidents} active alerts. Watch the north and east as the evening peak approaches.`;
  return `Good afternoon. Network conditions across Tehran are mostly clear. Availability is ${frame.availability}%, while demand is at ${frame.utilization}% and beginning to rise toward the evening peak.`;
}
function renderSites(frame) {
  $('#zoom-reset').textContent = `${Math.round(state.mapZoom * 100)}%`;
  const layer = $('#site-layer'); layer.innerHTML = ''; applyMapTransform(); layer.style.opacity = state.layer === 'warnings' ? '.12' : state.layer === 'condition' ? '.28' : '1';
  api.regions.forEach((region, index) => {
    const site = document.createElement('button');
    const severity = state.layer === 'traffic' || state.layer === 'congestion' ? (frame.utilization > 84 ? 'storm' : frame.utilization > 70 ? 'rain' : region.state)
      : state.layer === 'latency' ? (frame.latency > 50 ? 'storm' : frame.latency > 35 ? 'rain' : 'clear')
      : state.layer === 'incidents' ? (frame.incidents >= 6 ? 'storm' : frame.incidents >= 3 ? 'rain' : 'clear')
      : state.layer === 'maintenance' ? (region.maintenance ? 'rain' : 'clear')
      : state.layer === 'coverage' ? (region.id === 'east' && frame.state === 'storm' ? 'rain' : 'clear')
      : state.layer === 'technology' ? (region.technology === '5G' ? 'cloud' : 'clear')
      : region.state;
    site.className = `site-dot ${severity}`; site.style.left = `${region.x}%`; site.style.top = `${region.y}%`; site.style.animationDelay = `${index * 130}ms`;
    site.title = `${region.name}: ${severity} · ${region.technology}${region.maintenance ? ' · maintenance planned' : ''}`;
    site.setAttribute('aria-label', site.title); site.innerHTML = `<span></span><b>${region.sites}</b>`; site.addEventListener('click', () => selectRegion(region)); layer.append(site);
  });
  renderIrimoWarningMarkers(); $('#map-layer-label').textContent = `${state.layer[0].toUpperCase()}${state.layer.slice(1)} layer`;
}
function applyMapTransform() {
  const transform = `translate(${state.mapX}px, ${state.mapY}px) scale(${state.mapZoom})`;
  ['#site-layer', '#weather-layer', '.iran-map', '#broadcast-weather-layer'].forEach((selector) => {
    const node = $(selector); if (!node) return; node.style.transform = transform; node.style.transformOrigin = '50% 50%';
  });
}
function renderIrimoWarningMarkers() {
  const layer = $('#warning-layer'); if (!layer) return;
  layer.innerHTML = ''; layer.style.display = 'none';
  renderWeatherCards(api.getFrame(state.frame));
}
const mapLegends = {
  condition:[['clear','Sunny'],['cloud','Cloud'],['rain','Rain'],['storm','Storm']],
  warnings:[['clear','No alert'],['cloud','Yellow'],['rain','Orange'],['storm','Red']],
  coverage:[['clear','≥ 98%'],['cloud','96–98%'],['rain','93–96%'],['storm','< 93%']],
  traffic:[['clear','< 50 Gbps'],['cloud','50–90'],['rain','90–140'],['storm','> 140']],
  congestion:[['clear','< 60%'],['cloud','60–75%'],['rain','75–88%'],['storm','> 88%']],
  latency:[['clear','< 30 ms'],['cloud','30–45'],['rain','45–65'],['storm','> 65']],
  incidents:[['clear','0'],['cloud','1'],['rain','2–3'],['storm','4+']],
  maintenance:[['clear','No window'],['cloud','Planned'],['rain','In progress'],['storm','At risk']],
  technology:[['clear','5G+'],['cloud','5G'],['rain','4G/5G'],['storm','4G']],
};
function provinceLayerDisplay(metrics, warning) {
  if (state.layer === 'warnings') return warning ? { value:warning.level === 'orange' ? 'ORG' : warning.level === 'red' ? 'RED' : 'YLW', state:warning.level === 'red' ? 'stormy' : warning.level === 'orange' ? 'rainy' : 'partly', detail:`${warning.level.toUpperCase()} IRIMO alert` } : { value:'OK', state:'sunny', detail:'No mapped IRIMO alert' };
  if (state.layer === 'coverage') return { value:`${metrics.coverage}%`, state:metrics.coverage < 93 ? 'stormy' : metrics.coverage < 96 ? 'rainy' : metrics.coverage < 98 ? 'partly' : 'sunny', detail:`Population coverage ${metrics.coverage}%` };
  if (state.layer === 'traffic') return { value:`${metrics.trafficGbps}G`, state:metrics.trafficGbps > 140 ? 'stormy' : metrics.trafficGbps > 90 ? 'rainy' : metrics.trafficGbps > 50 ? 'partly' : 'sunny', detail:`Busy-hour traffic ${metrics.trafficGbps} Gbps` };
  if (state.layer === 'congestion') return { value:`${metrics.congestion}%`, state:metrics.congestion > 88 ? 'stormy' : metrics.congestion > 75 ? 'rainy' : metrics.congestion > 60 ? 'partly' : 'sunny', detail:`Cell load ${metrics.congestion}%` };
  if (state.layer === 'latency') return { value:`${metrics.latency}ms`, state:metrics.latency > 65 ? 'stormy' : metrics.latency > 45 ? 'rainy' : metrics.latency > 30 ? 'partly' : 'sunny', detail:`Round-trip latency ${metrics.latency} ms` };
  if (state.layer === 'incidents') return { value:String(metrics.incidents), state:metrics.incidents >= 4 ? 'stormy' : metrics.incidents >= 2 ? 'rainy' : metrics.incidents === 1 ? 'partly' : 'sunny', detail:`${metrics.incidents} active incident${metrics.incidents === 1 ? '' : 's'}` };
  if (state.layer === 'maintenance') return { value:metrics.maintenanceActive ? 'LIVE' : metrics.maintenance === 'No window' ? '—' : 'PLAN', state:metrics.maintenanceActive ? 'rainy' : metrics.maintenance === 'No window' ? 'sunny' : 'partly', detail:metrics.maintenanceActive ? `${metrics.maintenance} in progress` : metrics.maintenance };
  if (state.layer === 'technology') return { value:metrics.technology, state:metrics.technology === '5G+' ? 'sunny' : metrics.technology === '5G' ? 'partly' : metrics.technology === '4G/5G' ? 'rainy' : 'stormy', detail:`Primary radio layer ${metrics.technology}` };
  return { value:`${metrics.temperature}°`, state:metrics.condition, condition:metrics.condition, detail:`Illustrative weather ${metrics.temperature}°` };
}
function weatherIcon(condition) {
  const common = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
  if (condition === 'stormy') return `<svg ${common}><path d="M7.5 16.5h8.2a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.3 1.7A3.3 3.3 0 0 0 7.5 16.5Z"/><path class="accent" d="m12.7 14-2.2 4h2l-1 3 3.2-4.8h-2.1l1-2.2Z"/></svg>`;
  if (condition === 'rainy') return `<svg ${common}><path d="M7.5 15h8.2a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.3 1.7A3.3 3.3 0 0 0 7.5 15Z"/><path class="accent" d="m8 18-1 2m5-2-1 2m5-2-1 2"/></svg>`;
  if (condition === 'partly') return `<svg ${common}><circle class="accent" cx="8" cy="8" r="3"/><path d="M7.5 17h8.2a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.3 1.7A3.3 3.3 0 0 0 7.5 17Z"/></svg>`;
  return `<svg ${common}><circle cx="12" cy="12" r="4"/><path class="accent" d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>`;
}
function ensureBroadcastWeather() {
  if ($('#broadcast-weather-layer')) return;
  const windReadout = document.createElement('span'); windReadout.id = 'map-hud-wind'; windReadout.textContent = 'Wind N 11 km/h';
  $('#map-hud-warnings').before(windReadout);
  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  layer.id = 'broadcast-weather-layer'; layer.setAttribute('class', 'broadcast-weather-layer'); layer.setAttribute('viewBox', '0 0 760 500'); layer.setAttribute('preserveAspectRatio', 'none'); layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `<defs><clipPath id="iran-weather-clip"><path d="M106 148 146 126 181 132 209 112 255 119 281 100 325 112 358 96 402 111 436 105 472 127 505 132 534 157 572 175 594 207 581 233 603 261 592 292 614 317 596 349 561 354 541 384 503 391 477 421 438 411 405 435 370 423 343 403 309 414 280 392 244 397 220 369 184 356 168 322 141 301 151 270 128 237 145 208 123 181Z"/></clipPath><radialGradient id="radar-green"><stop offset="0" stop-color="#69e69e" stop-opacity=".72"/><stop offset=".55" stop-color="#2bcf9a" stop-opacity=".34"/><stop offset="1" stop-color="#2bcf9a" stop-opacity="0"/></radialGradient><radialGradient id="radar-heavy"><stop offset="0" stop-color="#ff6a65" stop-opacity=".8"/><stop offset=".3" stop-color="#ffcb55" stop-opacity=".64"/><stop offset=".68" stop-color="#43d29a" stop-opacity=".32"/><stop offset="1" stop-color="#43d29a" stop-opacity="0"/></radialGradient><marker id="wind-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#c9f7ff"/></marker></defs><g clip-path="url(#iran-weather-clip)"><ellipse class="radar-cell cell-west" cx="205" cy="235" rx="112" ry="86"/><ellipse class="radar-cell cell-east" cx="520" cy="245" rx="128" ry="108"/><ellipse class="radar-cell cell-south" cx="390" cy="390" rx="105" ry="75"/><path class="weather-front" d="M125 330 C220 272 264 325 350 259 S503 240 605 167"/><g class="wind-vectors"><path d="M135 195 C190 165 237 171 283 151"/><path d="M196 292 C257 263 315 270 367 232"/><path d="M333 353 C396 316 450 330 511 283"/><path d="M454 191 C510 170 550 183 592 153"/></g></g>`;
  $('.country-glow').after(layer);
}
function renderMapLegend() {
  const legend = mapLegends[state.layer] || mapLegends.condition; const overlay = document.querySelector('.map-overlay');
  overlay.innerHTML = `${legend.map(([kind, label]) => `<span><i class="legend-swatch ${kind}"></i>${label}</span>`).join('')}<span><i class="legend-swatch warning"></i>IRIMO alert</span><span><i class="legend-swatch site"></i>Site cluster</span>`;
}
function renderWeatherCards(frame) {
  const layer = $('#weather-layer'); if (!layer || !mapProjection || !provinceAnchors.length) return;
  ensureProvinceSelector();
  const severityRank = { yellow:1, orange:2, red:3 }; const warningsByProvince = new Map();
  state.irimoWarnings.forEach((warning) => {
    const provinces = [...(warning.location?.provinces || []).map((province) => province.name), ...(warning.location?.cities || []).map((city) => city.province)];
    provinces.forEach((province) => { const key = provinceKey(province); const current = warningsByProvince.get(key); if (!current || severityRank[warning.level] > severityRank[current.level]) warningsByProvince.set(key, warning); });
  });
  const offsets = [[0,0],[0,-26],[0,26],[-46,0],[46,0],[-42,-24],[42,-24],[-42,24],[42,24],[0,-49],[0,49],[-76,0],[76,0]];
  const placed = []; const nodes = provinceAnchors.map((province) => ({ ...province, warning:warningsByProvince.get(provinceKey(province.name)), metrics:api.getProvinceMetrics(province.name, state.frame) })).sort((a, b) => a.y - b.y);
  layer.innerHTML = '<svg class="province-leaders" viewBox="0 0 760 500" preserveAspectRatio="none" aria-hidden="true"></svg>';
  const leaders = layer.querySelector('.province-leaders');
  document.querySelectorAll('.province-shape').forEach((path) => path.classList.remove('wx-sunny','wx-partly','wx-rainy','wx-stormy','warning-yellow','warning-orange','warning-red'));
  $('#map-canvas').dataset.layer = state.layer; renderMapLegend();
  const totalTraffic = nodes.reduce((sum, province) => sum + province.metrics.trafficGbps, 0); const averageCoverage = nodes.reduce((sum, province) => sum + province.metrics.coverage, 0) / nodes.length; const congested = nodes.filter((province) => province.metrics.congestion >= 80).length; const incidents = nodes.reduce((sum, province) => sum + province.metrics.incidents, 0);
  $('#map-data-strip').innerHTML = `<span><small>National traffic</small><strong>${(totalTraffic / 1000).toFixed(2)} Tbps</strong></span><span><small>Population coverage</small><strong>${averageCoverage.toFixed(1)}%</strong></span><span><small>Congested provinces</small><strong>${congested}</strong></span><span><small>Active incidents</small><strong>${incidents}</strong></span>`;
  nodes.forEach((province, index) => {
    const metrics = province.metrics; const display = provinceLayerDisplay(metrics, province.warning); const weatherState = display.state;
    const localCandidates = offsets.map(([dx, dy]) => ({ x:Math.max(30, Math.min(730, province.x + dx)), y:Math.max(58, Math.min(454, province.y + dy)) }));
    const gridCandidates = Array.from({ length:13 }, (_, row) => Array.from({ length:13 }, (_, column) => ({ x:55 + column * 54, y:62 + row * 32 }))).flat().sort((a, b) => Math.hypot(a.x - province.x, a.y - province.y) - Math.hypot(b.x - province.x, b.y - province.y));
    const candidate = [...localCandidates, ...gridCandidates].find(({ x, y }) => placed.every((point) => Math.abs(point.x - x) > 52 || Math.abs(point.y - y) > 30)) || { x:province.x, y:province.y };
    placed.push(candidate);
    const leader = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    leader.innerHTML = `<line x1="${province.x}" y1="${province.y}" x2="${candidate.x}" y2="${candidate.y}"/><circle cx="${province.x}" cy="${province.y}" r="2.2"/>`; leaders.append(leader);
    const warningLevel = province.warning?.level; const card = document.createElement('button');
    card.className = `province-weather ${weatherState} layer-${state.layer}${warningLevel ? ` has-warning warning-${warningLevel}` : ''}`;
    card.style.left = `${candidate.x / 760 * 100}%`; card.style.top = `${candidate.y / 500 * 100}%`;
    const shortName = province.name.replace('East Azerbaijan','E Azerbaijan').replace('West Azerbaijan','W Azerbaijan').replace('Razavi Khorasan','Razavi Khor.').replace('North Khorasan','N Khorasan').replace('South Khorasan','S Khorasan').replace('Sistan and Baluchestan','Sistan').replace('Chaharmahal and Bakhtiari','Chaharmahal').replace('Kohgiluyeh and Boyer-Ahmad','Kohgiluyeh');
    card.setAttribute('aria-label', `${province.name}: ${display.detail}${province.warning && state.layer !== 'warnings' ? `, ${province.warning.level} IRIMO warning` : ''}`);
    card.title = `${province.name} · ${display.detail} · ${metrics.subscribersK}k subscribers · ${metrics.handoverSuccess}% handover success · ${metrics.packetLoss}% packet loss`;
    const glyph = state.layer === 'condition' ? weatherIcon(display.condition) : '<i class="metric-glyph" aria-hidden="true"></i>';
    const showWarningBadge = warningLevel && state.layer === 'warnings';
    card.innerHTML = `<span class="province-weather-main"><b>${escapeHtml(display.value)}</b><span class="province-weather-icon">${glyph}</span></span><small>${escapeHtml(shortName)}</small>${showWarningBadge ? `<em aria-hidden="true">!</em>` : ''}`;
    card.addEventListener('click', () => { state.selectedProvince = province.name; renderDetails(frame); document.querySelectorAll('.province-shape').forEach((path) => path.classList.toggle('selected-province', provinceKey(path.dataset.province) === provinceKey(province.name))); if (province.warning) { document.querySelector(`[data-irimo-card="${CSS.escape(province.warning.id)}"]`)?.scrollIntoView({ behavior:'smooth', block:'nearest' }); document.querySelectorAll('.irimo-warning').forEach((item) => item.classList.toggle('selected', item.dataset.irimoCard === province.warning.id)); } });
    const provincePath = [...document.querySelectorAll('.province-shape')].find((path) => provinceKey(path.dataset.province) === provinceKey(province.name));
    provincePath?.classList.add(`wx-${weatherState}`); if (warningLevel) provincePath?.classList.add(`warning-${warningLevel}`);
    layer.append(card);
  });
}
function renderKpisLegacy(frame) {
  const items = [['availability','Availability',`${frame.availability}%`,'+0.4%','good','42 seconds ago'],['utilization','Utilization',`${frame.utilization}%`,frame.utilization > 78 ? 'Peak pressure' : 'Within plan',frame.utilization > 78 ? 'warn' : 'good',frame.observed ? '42 seconds ago' : 'Forecast'],['latency','Latency',`${frame.latency} ms`,frame.latency > 45 ? 'Rising' : 'Stable',frame.latency > 45 ? 'warn' : 'good',frame.observed ? '42 seconds ago' : 'Forecast'],['throughput','Throughput',`${frame.throughput} Mbps`,'Across metro','good',frame.observed ? '42 seconds ago' : 'Forecast'],['loss','Packet loss',`${frame.loss}%`,frame.loss > 1.5 ? 'Degraded' : 'Nominal',frame.loss > 1.5 ? 'bad' : 'good',frame.observed ? '42 seconds ago' : 'Forecast'],['signal','Signal quality',`${frame.signal}/100`,frame.signal < 75 ? 'Watch edge' : 'Healthy',frame.signal < 75 ? 'warn' : 'good',frame.observed ? '42 seconds ago' : 'Forecast'],['incidents','Active incidents',`${frame.incidents}`,frame.incidents ? 'Needs review' : 'All clear',frame.incidents ? 'warn' : 'good',frame.observed ? '42 seconds ago' : 'Forecast']];
  $('#kpi-grid').innerHTML = items.map(([key,label,value,trend,kind,freshness]) => `<button class="kpi-card" data-kpi="${key}" aria-label="Focus ${label}"><span>${label}</span><strong>${value}</strong><small class="${kind}">${trend}</small><em>${freshness}</em><div class="spark ${kind}"><i></i><i></i><i></i><i></i><i></i><i></i></div></button>`).join('');
  document.querySelectorAll('[data-kpi]').forEach((card) => card.addEventListener('click', () => { state.layer = card.dataset.kpi === 'latency' ? 'latency' : card.dataset.kpi === 'utilization' ? 'traffic' : card.dataset.kpi === 'incidents' ? 'incidents' : 'condition'; document.querySelectorAll('[data-layer]').forEach((item) => item.classList.toggle('active', item.dataset.layer === state.layer)); renderSites(frame); }));
}
function renderAlertsLegacy(frame) { const active = api.alerts.filter((alert) => alert.state !== 'Forecast' || state.frame >= 7); $('#alert-count').textContent = `${Math.min(active.length, frame.incidents + 1)} active`; $('#alert-list').innerHTML = active.map((alert) => `<button class="alert-row ${alert.severity}" data-region="${alert.region}" data-time="${alert.time}"><span class="alert-icon">${alert.icon}</span><span><strong>${alert.title}</strong><small>${alert.detail} · ${alert.impact || 'Operational impact'} · ${alert.confidence || frame.confidence}% confidence</small></span><em>${alert.time}<br>${alert.state}</em></button>`).join(''); document.querySelectorAll('.alert-row').forEach((row) => row.addEventListener('click', () => { const region = api.regions.find((item) => item.id === row.dataset.region); const target = api.frames.findIndex((item) => item.time === row.dataset.time); if (target >= 0) state.frame = target; if (region) selectRegion(region); render(); })); }
function renderDetails(frame) { const region = state.selectedRegion || { name:'Metro overview', sites:12 }; const audience = state.audience; const clusters = region.id ? Array.from({ length: region.sites }, (_, index) => `${region.id.toUpperCase()}-${String(index + 1).padStart(2, '0')}`) : []; let body = audience === 'engineering' ? `<div class="detail-stat"><span>Radio quality</span><strong>${frame.signal}/100 SINR proxy</strong></div><div class="detail-stat"><span>RSRP / RSRQ</span><strong>-92 dBm / -11 dB proxy</strong></div><div class="detail-stat"><span>Interference</span><strong>${frame.state === 'storm' ? 'Severe · E-04/E-05' : 'Nominal'}</strong></div><div class="detail-stat"><span>Handovers</span><strong>${frame.utilization > 78 ? 'Watch north-east edge' : 'Stable across metro'}</strong></div><div class="detail-stat"><span>Backhaul</span><strong>${frame.latency > 50 ? 'Capacity pressure' : 'Nominal · 99.97%'}</strong></div><div class="detail-stat"><span>Latency</span><strong>${frame.latency} ms · ${frame.observed ? 'observed' : 'forecast'}</strong></div>` : audience === 'noc' ? `<div class="detail-stat"><span>Operational status</span><strong>${frame.incidents ? `${frame.incidents} incidents in scope` : 'All systems nominal'}</strong></div><div class="detail-stat"><span>Freshness</span><strong>${frame.observed ? '42 seconds ago' : 'Forecast frame'}</strong></div><div class="detail-stat"><span>Top action</span><strong>${frame.state === 'storm' ? 'Escalate severe conditions' : 'Monitor forecast edge'}</strong></div>` : `<div class="detail-stat"><span>Customer impact</span><strong>${frame.state === 'storm' ? 'High in east and north' : frame.state === 'rain' ? 'Moderate in east' : 'Low / contained'}</strong></div><div class="detail-stat"><span>Network outlook</span><strong>${frame.state === 'clear' ? 'Healthy through midday' : 'Pressure rising into peak'}</strong></div><div class="detail-stat"><span>Coverage</span><strong>${region.sites || 12} site clusters reporting</strong></div>`; $('#detail-title').textContent = region.name; $('#detail-content').innerHTML = `${body}${clusters.length ? `<div class="detail-stat cluster-stat"><span>Site / cluster detail</span><div class="cluster-list">${clusters.map((cluster) => `<button class="cluster-chip ${state.selectedSite === cluster ? 'active' : ''}" data-site="${cluster}">${cluster}</button>`).join('')}</div></div>` : ''}`; document.querySelectorAll('[data-site]').forEach((button) => button.addEventListener('click', () => { state.selectedSite = button.dataset.site; renderDetails(frame); })); }
function renderStories() { $('#story-index').textContent = `${state.story + 1} / ${stories.length}`; $('#story-list').innerHTML = stories.map((story, index) => `<button class="story-row ${index === state.story ? 'active' : ''}" data-story="${index}"><span>0${index + 1}</span><b>${story[0]}</b><small>${story[1]}</small></button>`).join(''); document.querySelectorAll('.story-row').forEach((row) => row.addEventListener('click', () => { state.story = Number(row.dataset.story); render(); })); }
function selectRegion(region) { state.selectedRegion = region; renderDetails(api.getFrame(state.frame)); document.querySelectorAll('.site-dot').forEach((dot) => dot.classList.remove('selected')); const dots = [...document.querySelectorAll('.site-dot')]; const index = api.regions.findIndex((item) => item.id === region.id); if (dots[index]) dots[index].classList.add('selected'); }
$('#timeline').addEventListener('input', (event) => { state.frame = Number(event.target.value); render(); });
$('#play-btn').addEventListener('click', () => { state.playing = !state.playing; $('#play-btn').textContent = state.playing ? '❚❚ Pause' : '▶ Play'; if (state.playing) tick(); });
function tick() { if (!state.playing) return; state.frame = state.frame >= api.frames.length - 1 ? 0 : state.frame + 1; render(); setTimeout(tick, 1300 / state.speed); }
$('#speed-select').addEventListener('change', (event) => { state.speed = Number(event.target.value); }); $('#now-btn').addEventListener('click', () => { state.frame = 6; render(); }); $('#fullscreen-btn').addEventListener('click', async () => { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); });
$('#prev-btn').addEventListener('click', () => { state.frame = Math.max(state.frame - 1, 0); render(); });
$('#plus-hour-btn').addEventListener('click', () => { state.frame = Math.min(state.frame + 1, api.frames.length - 1); render(); });
$('#next-btn').addEventListener('click', () => { state.frame = Math.min(state.frame + 1, api.frames.length - 1); render(); });
$('#tonight-btn').addEventListener('click', () => { state.frame = 9; render(); }); $('#tomorrow-btn').addEventListener('click', () => { state.frame = 12; render(); });
$('#presenter-btn').addEventListener('click', () => { const enabled = document.body.classList.toggle('presenter-mode'); $('#presenter-btn').textContent = enabled ? 'Exit presenter' : 'Presenter mode'; $('#presenter-btn').setAttribute('aria-pressed', String(enabled)); }); $('#motion-btn').addEventListener('click', () => { state.reducedMotion = !state.reducedMotion; $('#motion-btn').textContent = state.reducedMotion ? 'Enable motion' : 'Reduce motion'; $('#motion-btn').setAttribute('aria-pressed', String(state.reducedMotion)); render(); });
document.querySelectorAll('[data-layer]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-layer]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); state.layer = button.dataset.layer; render(); }));
$('#audience-select').addEventListener('change', (event) => { state.audience = event.target.value; renderDetails(api.getFrame(state.frame)); }); $('#next-story').addEventListener('click', () => { state.story = (state.story + 1) % stories.length; render(); }); $('#zoom-in').addEventListener('click', () => { state.mapZoom = Math.min(1.8, Number((state.mapZoom + 0.2).toFixed(1))); renderSites(api.getFrame(state.frame)); }); $('#zoom-out').addEventListener('click', () => { state.mapZoom = Math.max(1, Number((state.mapZoom - 0.2).toFixed(1))); renderSites(api.getFrame(state.frame)); }); $('#zoom-reset').addEventListener('click', () => { state.mapZoom = 1; renderSites(api.getFrame(state.frame)); }); const pan = (x, y) => { state.mapX += x; state.mapY += y; renderSites(api.getFrame(state.frame)); }; $('#pan-left').addEventListener('click', () => pan(-20, 0)); $('#pan-right').addEventListener('click', () => pan(20, 0)); $('#pan-up').addEventListener('click', () => pan(0, -20)); $('#pan-down').addEventListener('click', () => pan(0, 20)); $('#reset-map').addEventListener('click', () => { state.selectedRegion = null; state.mapZoom = 1; state.mapX = 0; state.mapY = 0; render(); });
render();

// Keep demo provenance visible in the KPI and province drill-down surfaces.
function renderKpis(frame) {
  const items = [['availability','Availability',`${frame.availability}%`,'+0.4%','good'],['utilization','Utilization',`${frame.utilization}%`,frame.utilization > 78 ? 'Peak pressure' : 'Within plan',frame.utilization > 78 ? 'warn' : 'good'],['latency','Latency',`${frame.latency} ms`,frame.latency > 45 ? 'Rising' : 'Stable',frame.latency > 45 ? 'warn' : 'good'],['throughput','Throughput',`${frame.throughput} Mbps`,'Across metro','good'],['loss','Packet loss',`${frame.loss}%`,frame.loss > 1.5 ? 'Degraded' : 'Nominal',frame.loss > 1.5 ? 'bad' : 'good'],['signal','Signal quality',`${frame.signal}/100`,frame.signal < 75 ? 'Watch edge' : 'Healthy',frame.signal < 75 ? 'warn' : 'good'],['incidents','Active incidents',String(frame.incidents),frame.incidents ? 'Needs review' : 'All clear',frame.incidents ? 'warn' : 'good']];
  $('#kpi-grid').innerHTML = items.map(([key,label,value,trend,kind]) => `<button class="kpi-card" data-kpi="${key}" aria-label="Focus ${label}; demo scenario ${frame.observed ? 'observed' : 'forecast'}"><span>${label}</span><strong>${value}</strong><small class="${kind}">${trend}</small><em>Demo scenario · ${frame.observed ? 'observed' : 'forecast'} frame</em><div class="spark ${kind}"><i></i><i></i><i></i><i></i><i></i><i></i></div></button>`).join('');
  document.querySelectorAll('[data-kpi]').forEach((card) => card.addEventListener('click', () => { state.layer = card.dataset.kpi === 'latency' ? 'latency' : card.dataset.kpi === 'utilization' ? 'traffic' : card.dataset.kpi === 'incidents' ? 'incidents' : 'condition'; document.querySelectorAll('[data-layer]').forEach((item) => item.classList.toggle('active', item.dataset.layer === state.layer)); renderSites(frame); renderWeatherCards(frame); }));
}

function renderDetails(frame) {
  const region = state.selectedRegion || { name:state.selectedProvince || 'Metro overview', sites:12 };
  const audience = state.audience;
  const body = audience === 'engineering'
    ? `<div class="detail-stat"><span>Radio quality</span><strong>${frame.signal}/100 · demo SINR proxy</strong></div><div class="detail-stat"><span>RSRP / RSRQ</span><strong>-92 dBm / -11 dB · demo proxy</strong></div><div class="detail-stat"><span>Interference</span><strong>${frame.state === 'storm' ? 'Severe · E-04/E-05' : 'Nominal'}</strong></div><div class="detail-stat"><span>Handovers</span><strong>${frame.utilization > 78 ? 'Watch north-east edge' : 'Stable across metro'}</strong></div><div class="detail-stat"><span>Backhaul</span><strong>${frame.latency > 50 ? 'Capacity pressure' : 'Nominal · demo 99.97%'}</strong></div>`
    : audience === 'noc'
      ? `<div class="detail-stat"><span>Operational status</span><strong>${frame.incidents ? `${frame.incidents} demo incidents in scope` : 'All systems nominal'}</strong></div><div class="detail-stat"><span>Freshness</span><strong>Demo scenario · ${frame.observed ? 'observed' : 'forecast'} frame</strong></div><div class="detail-stat"><span>Top action</span><strong>${frame.state === 'storm' ? 'Escalate severe conditions' : 'Monitor forecast edge'}</strong></div>`
      : `<div class="detail-stat"><span>Customer impact</span><strong>${frame.state === 'storm' ? 'High in east and north · illustrative' : frame.state === 'rain' ? 'Moderate in east · illustrative' : 'Low / contained · illustrative'}</strong></div><div class="detail-stat"><span>Network outlook</span><strong>${frame.state === 'clear' ? 'Healthy through midday' : 'Pressure rising into peak'}</strong></div><div class="detail-stat"><span>Coverage</span><strong>${region.sites || 12} demo site clusters reporting</strong></div>`;
  $('#detail-title').textContent = region.name;
  $('#detail-content').innerHTML = `${body}<div class="detail-stat"><span>Selected time</span><strong>${frame.time} IRST · ${frame.observed ? 'observed' : 'forecast'} demo frame</strong></div>`;
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character])); }
async function loadIrimoWarnings() {
  const list = $('#irimo-live-list'); const status = $('#irimo-feed-status');
  try {
    const response = await fetch('/api/network-weather/warnings');
    if (!response.ok) throw new Error(`IRIMO API returned ${response.status}`);
    const payload = await response.json();
    state.irimoWarnings = payload.warnings || [];
    state.irimoStatus = payload.status || 'fallback';
    $('#map-hud-warnings').textContent = `${state.irimoWarnings.length} IRIMO warnings`;
    $('#map-scope').textContent = `Iran · 31 provinces · demo telemetry · IRIMO ${state.irimoStatus} · 12 site clusters`;
    const mode = payload.status === 'live' ? 'LIVE' : payload.status === 'stale' ? 'STALE' : 'FALLBACK';
    const fetched = payload.fetchedAt ? new Date(payload.fetchedAt).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : 'time unavailable';
    status.textContent = `${mode} · ${payload.warnings.length} bulletins · fetched ${fetched}`;
    $('#broadcast-source').textContent = `Demo telemetry · IRIMO ${payload.status || 'fallback'}`;
    if (!payload.warnings.length) {
      list.innerHTML = '<div class="irimo-empty">IRIMO returned no normalized warnings. The telecom impact cards below remain available.</div>';
      return;
    }
    list.innerHTML = payload.warnings.slice(0, 6).map((warning) => { const area = warning.location?.affectedArea || 'Location details unavailable'; const locations = warning.location?.locations?.length || 0; return `<article class="irimo-warning irimo-${escapeHtml(warning.level)}" data-irimo-card="${escapeHtml(warning.id)}"><div><b>${escapeHtml(warning.levelFa)} · ${escapeHtml(warning.level.toUpperCase())}</b><strong>${escapeHtml(warning.title)}</strong><small>${warning.date ? `Date ${escapeHtml(warning.date)} · ` : ''}${locations} mapped location${locations === 1 ? '' : 's'} · Official IRIMO warning</small><em>${escapeHtml(area)}</em></div><a class="irimo-warning-link" href="${escapeHtml(warning.url)}" target="_blank" rel="noreferrer">Open ↗</a></article>`; }).join('');
    renderIrimoWarningMarkers();
  } catch (error) {
    state.irimoStatus = 'unavailable';
    $('#map-scope').textContent = 'Iran · 31 provinces · demo telemetry · IRIMO unavailable · 12 site clusters';
    $('#broadcast-source').textContent = 'Demo telemetry · IRIMO unavailable';
    status.textContent = 'ERROR · source unavailable';
    list.innerHTML = '<div class="irimo-empty">IRIMO feed unavailable. Telecom impact cards remain visible as illustrative platform data.</div>';
    console.warn('IRIMO warning feed unavailable', error);
  }
}
loadIrimoWarnings();
loadIranBoundary();
function ruleAlerts(frame) {
  const generated = [];
  if (frame.utilization >= 80) generated.push({ id:'rule-utilization-' + frame.time, groupId:'rule-utilization', severity:'warning', icon:'⚠', title:'Utilization threshold crossed', detail:'Rule: utilization is at or above 80%', region:'north', time:frame.time, state:frame.observed ? 'Observed' : 'Forecast', confidence:frame.confidence, impact:'Customer latency risk' });
  if (frame.latency >= 60) generated.push({ id:'rule-latency-' + frame.time, groupId:'rule-latency', severity:'severe', icon:'⚡', title:'Latency threshold crossed', detail:'Rule: latency is at or above 60 ms', region:'east', time:frame.time, state:frame.observed ? 'Observed' : 'Forecast', confidence:frame.confidence, impact:'Response-time degradation' });
  if (frame.incidents >= 7) generated.push({ id:'rule-incident-' + frame.time, groupId:'rule-incident', severity:'critical', icon:'✖', title:'Incident threshold crossed', detail:'Rule: seven or more active incidents', region:'east', time:frame.time, state:frame.observed ? 'Observed' : 'Forecast', confidence:frame.confidence, impact:'High customer impact' });
  return generated;
}
function renderKpis(frame) {
  const quality = (key) => key === 'throughput' && frame.time === '11:00' ? { state:'stale', label:'Stale · last known' } : key === 'signal' && frame.time === '21:00' ? { state:'stale', label:'Stale · degraded feed' } : key === 'incidents' && frame.time === '00:00' ? { state:'na', label:'Not applicable' } : { state:'healthy', label:frame.observed ? 'Demo scenario · observed' : 'Demo scenario · forecast' };
  const items = [['availability','Availability',frame.availability + '%','+0.4%','good'],['utilization','Utilization',frame.utilization + '%',frame.utilization > 78 ? 'Peak pressure' : 'Within plan',frame.utilization > 78 ? 'warn' : 'good'],['latency','Latency',frame.latency + ' ms',frame.latency > 45 ? 'Rising' : 'Stable',frame.latency > 45 ? 'warn' : 'good'],['throughput','Throughput',frame.throughput + ' Mbps','Across metro','good'],['loss','Packet loss',frame.loss + '%',frame.loss > 1.5 ? 'Degraded' : 'Nominal',frame.loss > 1.5 ? 'bad' : 'good'],['signal','Signal quality',frame.signal + '/100',frame.signal < 75 ? 'Watch edge' : 'Healthy',frame.signal < 75 ? 'warn' : 'good'],['incidents','Active incidents',String(frame.incidents),frame.incidents ? 'Needs review' : 'All clear',frame.incidents ? 'warn' : 'good']];
  $('#kpi-grid').innerHTML = items.map(([key,label,value,trend,kind]) => { const meta = quality(key); const displayValue = meta.state === 'na' ? '—' : value; const statusClass = meta.state === 'healthy' ? kind : 'data-quality-' + meta.state; return '<button class="kpi-card data-' + meta.state + '" data-kpi="' + key + '" aria-label="Focus ' + label + '; ' + meta.label + '"><span>' + label + '</span><strong>' + displayValue + '</strong><small class="' + statusClass + '">' + (meta.state === 'healthy' ? trend : meta.label) + '</small><em>' + (meta.state === 'healthy' ? `Demo scenario · ${frame.observed ? 'observed' : 'forecast'} frame` : 'Data quality flag') + '</em><div class="spark ' + kind + '"><i></i><i></i><i></i><i></i><i></i><i></i></div></button>'; }).join('');
  document.querySelectorAll('[data-kpi]').forEach((card) => card.addEventListener('click', () => { state.layer = card.dataset.kpi === 'latency' ? 'latency' : card.dataset.kpi === 'utilization' ? 'traffic' : card.dataset.kpi === 'incidents' ? 'incidents' : 'condition'; document.querySelectorAll('[data-layer]').forEach((item) => item.classList.toggle('active', item.dataset.layer === state.layer)); renderSites(frame); }));
}
function renderAlerts(frame) {
  const active = [...api.alerts, ...ruleAlerts(frame)].filter((alert) => alert.state !== 'Forecast' || state.frame >= 7);
  const groups = [...active.reduce((map, alert) => { const key = alert.groupId || alert.id; const group = map.get(key) || []; group.push(alert); map.set(key, group); return map; }, new Map()).values()];
  $('#alert-count').textContent = Math.min(active.length, frame.incidents + 1) + ' active · ' + groups.length + ' groups';
  $('#alert-list').innerHTML = groups.map((group) => { const alert = group[0]; const key = alert.groupId || alert.id; const acknowledged = state.acknowledgedAlerts.has(key); return '<div class="alert-group ' + (acknowledged ? 'acknowledged' : '') + '"><button class="alert-row ' + alert.severity + '" data-region="' + alert.region + '" data-time="' + alert.time + '"><span class="alert-icon">' + alert.icon + '</span><span><strong>' + alert.title + (group.length > 1 ? ' · ' + group.length + ' signals grouped' : '') + '</strong><small>' + group.map((item) => item.detail).join(' · ') + ' · ' + (alert.impact || 'Operational impact') + ' · ' + (alert.confidence || frame.confidence) + '% confidence</small></span><em>' + alert.time + '<br>' + (acknowledged ? 'Acknowledged' : alert.state) + '</em></button><button class="alert-ack" data-ack-group="' + key + '">' + (acknowledged ? 'Restore' : 'Acknowledge') + '</button></div>'; }).join('');
  document.querySelectorAll('.alert-row').forEach((row) => row.addEventListener('click', () => { const region = api.regions.find((item) => item.id === row.dataset.region); const target = api.frames.findIndex((item) => item.time === row.dataset.time); if (target >= 0) state.frame = target; if (region) selectRegion(region); render(); }));
  document.querySelectorAll('.alert-ack').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const key = button.dataset.ackGroup; if (state.acknowledgedAlerts.has(key)) state.acknowledgedAlerts.delete(key); else state.acknowledgedAlerts.add(key); renderAlerts(frame); }));
}
render();

function ensureProvinceSelector() {
  if ($('#province-select') || !provinceAnchors.length) return;
  const source = $('#map-source');
  if (!source?.parentElement) return;
  const select = document.createElement('select');
  select.id = 'province-select';
  select.setAttribute('aria-label', 'Find an Iran province');
  select.innerHTML = '<option value="">Find province…</option>' + provinceAnchors.map((province) => `<option value="${escapeHtml(province.name)}">${escapeHtml(province.name)}</option>`).join('');
  source.parentElement.insertBefore(select, source);
  select.addEventListener('change', () => {
    if (!select.value) return;
    state.selectedProvince = select.value;
    document.querySelectorAll('.province-shape').forEach((path) => path.classList.toggle('selected-province', provinceKey(path.dataset.province) === provinceKey(select.value)));
    renderDetails(api.getFrame(state.frame));
  });
}
function persistAcknowledgements() {
  try { localStorage.setItem('network-weather-acknowledged', JSON.stringify([...state.acknowledgedAlerts])); } catch { /* demo persistence is optional */ }
}
document.addEventListener('click', (event) => { if (event.target.closest('.alert-ack')) setTimeout(persistAcknowledgements, 0); });
function ensureAlertFilters() {
  if ($('#alert-severity-filter')) return;
  const list = $('#alert-list');
  const filters = document.createElement('div');
  filters.className = 'alert-filters';
  filters.setAttribute('aria-label', 'Operational alert filters');
  filters.innerHTML = '<label>Severity <select id="alert-severity-filter"><option value="all">All</option><option value="critical">Critical</option><option value="severe">Severe</option><option value="warning">Warning</option></select></label><label>State <select id="alert-state-filter"><option value="all">All</option><option value="Observed">Observed</option><option value="Forecast">Forecast</option><option value="Planned">Planned</option></select></label>';
  list.parentElement.insertBefore(filters, list);
  filters.querySelectorAll('select').forEach((select) => select.addEventListener('change', () => renderAlerts(api.getFrame(state.frame))));
}
function renderAlerts(frame) {
  ensureAlertFilters();
  const severity = $('#alert-severity-filter').value;
  const alertState = $('#alert-state-filter').value;
  const active = [...api.alerts, ...ruleAlerts(frame)].filter((alert) => (alert.state !== 'Forecast' || state.frame >= 7) && (severity === 'all' || alert.severity === severity) && (alertState === 'all' || alert.state === alertState));
  const groups = [...active.reduce((map, alert) => { const key = alert.groupId || alert.id; const group = map.get(key) || []; group.push(alert); map.set(key, group); return map; }, new Map()).values()];
  $('#alert-count').textContent = `${groups.length} shown · ${active.length} signals`;
  $('#alert-list').innerHTML = groups.map((group) => { const alert = group[0]; const key = alert.groupId || alert.id; const acknowledged = state.acknowledgedAlerts.has(key); return '<div class="alert-group ' + (acknowledged ? 'acknowledged' : '') + '"><button class="alert-row ' + alert.severity + '" data-region="' + alert.region + '" data-time="' + alert.time + '"><span class="alert-icon">' + alert.icon + '</span><span><strong>' + alert.title + (group.length > 1 ? ' · ' + group.length + ' signals grouped' : '') + '</strong><small>' + group.map((item) => item.detail).join(' · ') + ' · ' + (alert.impact || 'Operational impact') + ' · ' + (alert.confidence || frame.confidence) + '% confidence</small></span><em>' + alert.time + '<br>' + (acknowledged ? 'Acknowledged' : alert.state) + '</em></button><button class="alert-ack" data-ack-group="' + key + '">' + (acknowledged ? 'Restore' : 'Acknowledge') + '</button></div>'; }).join('') || '<div class="irimo-empty">No alerts match the current filters.</div>';
  document.querySelectorAll('.alert-row').forEach((row) => row.addEventListener('click', () => { const region = api.regions.find((item) => item.id === row.dataset.region); const target = api.frames.findIndex((item) => item.time === row.dataset.time); if (target >= 0) state.frame = target; if (region) selectRegion(region); render(); }));
  document.querySelectorAll('.alert-ack').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const key = button.dataset.ackGroup; if (state.acknowledgedAlerts.has(key)) state.acknowledgedAlerts.delete(key); else state.acknowledgedAlerts.add(key); renderAlerts(frame); }));
}
// Final definition intentionally lives after legacy helpers so the active renderer is unambiguous.
function renderKpis(frame) {
  const items = [['availability','Availability',`${frame.availability}%`,'+0.4%','good'],['utilization','Utilization',`${frame.utilization}%`,frame.utilization > 78 ? 'Peak pressure' : 'Within plan',frame.utilization > 78 ? 'warn' : 'good'],['latency','Latency',`${frame.latency} ms`,frame.latency > 45 ? 'Rising' : 'Stable',frame.latency > 45 ? 'warn' : 'good'],['throughput','Throughput',`${frame.throughput} Mbps`,'Across metro','good'],['loss','Packet loss',`${frame.loss}%`,frame.loss > 1.5 ? 'Degraded' : 'Nominal',frame.loss > 1.5 ? 'bad' : 'good'],['signal','Signal quality',`${frame.signal}/100`,frame.signal < 75 ? 'Watch edge' : 'Healthy',frame.signal < 75 ? 'warn' : 'good'],['incidents','Active incidents',String(frame.incidents),frame.incidents ? 'Needs review' : 'All clear',frame.incidents ? 'warn' : 'good']];
  $('#kpi-grid').innerHTML = items.map(([key,label,value,trend,kind]) => `<button class="kpi-card" data-kpi="${key}" aria-label="Focus ${label}; demo scenario ${frame.observed ? 'observed' : 'forecast'}"><span>${label}</span><strong>${value}</strong><small class="${kind}">${trend}</small><em>Demo scenario · ${frame.observed ? 'observed' : 'forecast'} frame</em><div class="spark ${kind}"><i></i><i></i><i></i><i></i><i></i><i></i></div></button>`).join('');
  document.querySelectorAll('[data-kpi]').forEach((card) => card.addEventListener('click', () => { state.layer = card.dataset.kpi === 'latency' ? 'latency' : card.dataset.kpi === 'utilization' ? 'traffic' : card.dataset.kpi === 'incidents' ? 'incidents' : 'condition'; document.querySelectorAll('[data-layer]').forEach((item) => item.classList.toggle('active', item.dataset.layer === state.layer)); renderSites(frame); renderWeatherCards(frame); }));
}
