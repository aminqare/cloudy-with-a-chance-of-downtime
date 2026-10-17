(() => {
  const data = window.CommandCenterMock;
  if (!data) return;
  const q = (selector) => document.querySelector(selector);
  const qa = (selector) => [...document.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);
  const ccState = { domain:'overview', selectedSite:data.sites[0].id, siteLayer:'weather' };

  function sourceRibbon() {
    const target = q('#source-ribbon'); if (!target) return;
    target.innerHTML = data.sources.map((source) => `<button class="source-node ${source.state}" data-source="${source.id}" title="${esc(source.detail)}"><i></i><span><b>${esc(source.name)}</b><small>${esc(source.domain)}</small></span><em>${esc(source.freshness)}</em></button>`).join('');
  }

  function executivePulse() {
    const n = data.national; const target = q('#executive-pulse'); if (!target) return;
    const cards = [
      ['National sites', formatNumber(n.sites), `${formatNumber(n.onAir)} on air`, 'healthy'],
      ['Active subscribers', `${n.activeSubscribers}M`, `${n.subscribers}M registered`, 'healthy'],
      ['RRC occupancy', `${n.rrcUtilization}%`, 'FDD · TDD · 5G aggregate', 'watch'],
      ['TRP traffic', `${(n.trpGbps / 1000).toFixed(2)} Tbps`, 'Busy-hour mock load', 'healthy'],
      ['TX protection', `${n.protectedLinks}%`, `${formatNumber(n.txLinks)} links`, 'watch'],
      ['Core peak', `${n.corePeak}%`, 'SHZ-SGS-01', 'critical'],
      ['Subscribers at risk', `${n.impactedSubscribers}K`, 'Correlated across domains', 'critical'],
      ['EHS readiness', `${n.ehsScore}%`, `${n.openEhsActions} open actions`, 'watch'],
    ];
    target.innerHTML = cards.map(([label,value,detail,status], index) => `<article class="pulse-card ${status}" style="--delay:${index * 45}ms"><span>${label}</span><strong>${value}</strong><small>${detail}</small><div class="pulse-line"><i></i></div><em>MOCK</em></article>`).join('');
  }

  function hotspotList() {
    const target = q('#hotspot-list'); if (!target) return;
    const sites = [...data.sites].sort((a,b) => b.impacted - a.impacted).slice(0,5);
    target.innerHTML = sites.map((site,index) => `<button class="hotspot-row ${site.state}" data-select-site="${site.id}"><span class="hotspot-rank">0${index + 1}</span><span><b>${site.city}</b><small>${site.id} · ${site.action}</small></span><strong>${formatNumber(site.impacted)}<small> impacted</small></strong><i>${site.state.toUpperCase()}</i></button>`).join('');
  }

  function topologySvg() {
    const target = q('#topology-mini'); if (!target) return;
    const positions = { 'THR-UPCC-02':[92,54], 'SHZ-SGS-01':[234,167], 'MHD-UPCF-01':[314,55], 'ISF-MSC-01':[183,111], 'THR-IPGW-03':[92,167], 'IMS-SCSCF-01':[314,167] };
    const edges = [['THR-UPCC-02','ISF-MSC-01','watch'],['THR-UPCC-02','MHD-UPCF-01','healthy'],['ISF-MSC-01','SHZ-SGS-01','critical'],['ISF-MSC-01','THR-IPGW-03','healthy'],['MHD-UPCF-01','IMS-SCSCF-01','healthy'],['SHZ-SGS-01','IMS-SCSCF-01','watch']];
    const edgeMarkup = edges.map(([from,to,state]) => { const a=positions[from], b=positions[to]; return `<line class="topology-edge ${state}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`; }).join('');
    const nodeMarkup = data.coreNodes.map((node) => { const [x,y]=positions[node.name]; return `<g class="topology-node ${node.state}" transform="translate(${x} ${y})" data-core-node="${node.name}"><circle r="23"/><circle class="node-orbit" r="29"/><text y="-2">${Math.round(node.load)}%</text><text class="node-label" y="39">${node.name}</text></g>`; }).join('');
    target.innerHTML = `<svg viewBox="0 0 405 220" role="img" aria-label="Mock cross-domain core topology">${edgeMarkup}${nodeMarkup}</svg>`;
  }

  function domainPanel() {
    const target = q('#domain-panel'); if (!target) return;
    const content = {
      overview: () => `<div class="domain-summary-grid"><section><span>Radio capacity</span><b>78.4%</b><small>LDP mock aggregate</small></section><section><span>Transport exposure</span><b>2 links</b><small>TxTopoli critical paths</small></section><section><span>Core headroom</span><b>11%</b><small>MonRes limiting node</small></section><section><span>Safety actions</span><b>10</b><small>EHS mock open items</small></section></div><div class="fusion-narrative"><i></i><p><b>Command recommendation:</b> restore the Shiraz–Bandar Abbas protection path first. It intersects high RRC occupancy, the highest core load, 3.24K impacted subscribers, an IRIMO orange warning and an EHS failed audit.</p></div>`,
      ran: () => table('LDP · mock RRC/TRP', ['Site','FDD RRC','TDD RRC','5G RRC','TRP'], data.sites.map(s => [s.id,`${s.rrc.fdd}%`,`${s.rrc.tdd}%`,s.rrc.nr ? `${s.rrc.nr}%`:'—',`${s.trpMbps} Mbps`]), 83),
      subscribers: () => table('Cross-domain subscriber impact · mock', ['Site','Active','Impacted','Complaints','Core anchor'], data.sites.map(s => [s.city,formatNumber(s.subscribers),formatNumber(s.impacted),s.complaints,s.core]), 1800),
      tx: () => `<div class="link-board">${data.links.map(link => `<button class="link-row ${link.state}" data-select-site="${link.from}"><span><b>${link.from.replace('DEMO-','')}</b><i>→</i><b>${link.to.replace('DEMO-','')}</b></span><em>${link.type} · ${link.capacity}</em><strong>${link.utilization}%</strong><div><i style="width:${link.utilization}%"></i></div></button>`).join('')}</div>`,
      core: () => `<div class="core-board">${data.coreNodes.map(node => `<article class="core-row ${node.state}"><div><b>${node.name}</b><small>${node.domain} · ${node.role}</small></div><span><i style="--value:${node.load}%"></i><em>${node.load}% load</em></span><span><i style="--value:${node.cpu}%"></i><em>${node.cpu}% CPU</em></span><strong>${node.metric}</strong></article>`).join('')}</div>`,
      ehs: () => table('EHS · mock site readiness', ['Site','Score','Open actions','PPE','Latest audit'], data.sites.map(s => [s.id,`${s.ehs.score}%`,s.ehs.open,`${s.ehs.ppe}%`,s.ehs.audit]), 3),
    };
    target.innerHTML = (content[ccState.domain] || content.overview)();
    qa('[data-domain]').forEach(button => button.classList.toggle('active', button.dataset.domain === ccState.domain));
    bindSiteButtons();
  }

  function table(label, headers, rows, threshold) {
    return `<div class="domain-table-wrap"><div class="domain-table-title"><b>${label}</b><span>Sanitized demonstration dataset</span></div><table class="domain-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell,index) => { const numeric=parseFloat(String(cell).replace(/,/g,'')); const hot=index>0 && Number.isFinite(numeric) && numeric>=threshold; return `<td class="${hot?'hot':''}">${esc(cell)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function siteInspector(siteId, scroll = false) {
    const site = data.sites.find(item => item.id === siteId) || data.sites[0]; ccState.selectedSite = site.id;
    const target = q('#asset-inspector'); if (!target) return;
    target.innerHTML = `<div class="asset-identity"><span class="asset-state ${site.state}">${site.state.toUpperCase()}</span><div><small>SANITIZED DIGITAL TWIN</small><h3>${site.id}</h3><p>${site.city}, ${site.province} · ${site.lat.toFixed(4)}, ${site.lon.toFixed(4)} · synthetic coordinates</p></div></div><div class="asset-grid"><section><span>Radio / LDP</span><b>${site.technology}</b><small>RRC FDD ${site.rrc.fdd}% · TDD ${site.rrc.tdd}% · 5G ${site.rrc.nr || '—'}%</small><em>TRP ${site.trpMbps} Mbps</em></section><section><span>Subscribers</span><b>${formatNumber(site.subscribers)}</b><small>${formatNumber(site.impacted)} potentially impacted</small><em>${site.complaints} complaints</em></section><section><span>TX / TxTopoli</span><b>${site.tx.type}</b><small>${site.tx.utilization}% · ${site.tx.protection}</small><em>${site.tx.alarm} · ${site.tx.distanceKm} km · ${site.tx.lossDb} dB</em></section><section><span>Core / MonRes</span><b>${site.core}</b><small>${site.coreLoad}% resource load</small><em>Mapped dependency · mock</em></section><section><span>EHS</span><b>${site.ehs.score}%</b><small>${site.ehs.open} open actions · PPE ${site.ehs.ppe}%</small><em>${site.ehs.audit}</em></section><section><span>Weather exposure</span><b>${site.weatherExposure.split(' · ')[0]}</b><small>${site.weatherExposure.split(' · ').slice(1).join(' · ') || 'Provider-backed conditions'}</small><em>Only live-data domain</em></section></div><div class="asset-action"><span>RECOMMENDED ACTION</span><strong>${site.action}</strong><button type="button" data-focus-map="${site.id}">Locate on map ↗</button></div>`;
    qa('[data-select-site]').forEach(button => button.classList.toggle('selected', button.dataset.selectSite === site.id));
    qa('.fusion-site').forEach(button => button.classList.toggle('selected', button.dataset.siteId === site.id));
    q('#site-search').value = site.id;
    q('[data-focus-map]')?.addEventListener('click', () => q('#map-canvas')?.scrollIntoView({ behavior:'smooth', block:'center' }));
    if (scroll) target.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  function bindSiteButtons() {
    qa('[data-select-site]').forEach(button => button.addEventListener('click', () => siteInspector(button.dataset.selectSite, true)));
  }

  function renderMapAssets() {
    if (typeof mapProjection !== 'function') return false;
    const canvas = q('#map-canvas'); if (!canvas) return false;
    let linkSvg = q('#fusion-link-layer');
    if (!linkSvg) { linkSvg = document.createElementNS('http://www.w3.org/2000/svg','svg'); linkSvg.id='fusion-link-layer'; linkSvg.setAttribute('viewBox','0 0 760 500'); linkSvg.setAttribute('preserveAspectRatio','none'); canvas.append(linkSvg); }
    let siteLayer = q('#fusion-site-layer');
    if (!siteLayer) { siteLayer=document.createElement('div'); siteLayer.id='fusion-site-layer'; canvas.append(siteLayer); }
    const digitalTwinVisible = ccState.siteLayer !== 'weather';
    canvas.classList.toggle('fusion-overlay-active', digitalTwinVisible);
    linkSvg.style.display = digitalTwinVisible ? 'block' : 'none';
    siteLayer.style.display = digitalTwinVisible ? 'block' : 'none';
    linkSvg.innerHTML = data.links.map((link,index) => { const from=data.sites.find(s=>s.id===link.from), to=data.sites.find(s=>s.id===link.to); const a=mapProjection([from.lon,from.lat]), b=mapProjection([to.lon,to.lat]); return `<line class="fusion-map-link ${link.state}" style="--link-delay:-${index*.42}s" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"><title>${esc(link.type)} ${esc(link.capacity)} · ${link.utilization}% mock utilization</title></line>`; }).join('');
    const capitals = typeof cityLabels !== 'undefined' ? cityLabels.filter(city => city.capital).slice(0,31) : [];
    const constellation = capitals.flatMap((city,index) => [-1,1].map((side,pointIndex) => { const [x,y]=mapProjection([city.lon + side*(.07 + (index%3)*.018),city.lat + (pointIndex ? -.045 : .055)]); return `<i class="micro-site ${index%7===0?'watch':''}" style="left:${x/760*100}%;top:${y/500*100}%" title="MOCK-${esc(city.province).replace(/[^A-Za-z0-9]/g,'').slice(0,6).toUpperCase()}-${String(pointIndex+1).padStart(2,'0')} · synthetic location"></i>`; })).join('');
    siteLayer.innerHTML = constellation + data.sites.map(site => { const [x,y]=mapProjection([site.lon,site.lat]); const metric=ccState.siteLayer==='rrc'?`${Math.max(site.rrc.fdd,site.rrc.tdd,site.rrc.nr)}%`:ccState.siteLayer==='subscribers'?`${(site.subscribers/1000).toFixed(1)}K`:ccState.siteLayer==='tx'?`${site.tx.utilization}%`:ccState.siteLayer==='ehs'?`${site.ehs.score}%`:site.state==='critical'?'!':site.state==='watch'?'▲':'✓'; return `<button class="fusion-site ${site.state}" style="left:${x/760*100}%;top:${y/500*100}%" data-site-id="${site.id}" title="${site.id} · ${site.city} · ${metric} · MOCK"><i></i><b>${metric}</b><small>${site.city}</small></button>`; }).join('');
    const hud = q('#map-hud-wind');
    if (hud) hud.textContent = digitalTwinVisible ? `Digital twin · ${capitals.length * 2} mock sites · ${data.links.length} TX links` : `Wind observations · ${state.weatherConditions?.stations?.length || 0} stations`;
    qa('.fusion-site').forEach(button => button.addEventListener('click', () => siteInspector(button.dataset.siteId, true)));
    siteInspector(ccState.selectedSite);
    return true;
  }

  function controls() {
    qa('[data-domain]').forEach(button => button.addEventListener('click', () => { ccState.domain=button.dataset.domain; domainPanel(); }));
    qa('[data-site-layer]').forEach(button => button.addEventListener('click', () => { ccState.siteLayer=button.dataset.siteLayer; qa('[data-site-layer]').forEach(item=>item.classList.toggle('active',item===button)); renderMapAssets(); }));
    q('#site-search')?.addEventListener('input', event => { const value=event.target.value.toLowerCase(); const match=data.sites.find(site => `${site.id} ${site.city} ${site.province}`.toLowerCase().includes(value)); if (match) siteInspector(match.id); });
    q('#site-search')?.addEventListener('change', event => { const match=data.sites.find(site => site.id === event.target.value); if (match) siteInspector(match.id, true); });
  }

  sourceRibbon(); executivePulse(); hotspotList(); topologySvg(); domainPanel(); controls(); siteInspector(ccState.selectedSite); bindSiteButtons();
  let attempts=0; const mapTimer=setInterval(() => { attempts += 1; if (renderMapAssets() || attempts > 30) clearInterval(mapTimer); }, 180);
})();
