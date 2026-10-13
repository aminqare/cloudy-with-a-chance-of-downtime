/* Placeholder API adapter. Replace fixture frames with an NMS/OSS client without changing the UI contract. */
window.NetworkWeatherApi = (() => {
  const schemaVersion = 1;
  const regions = [
    { id: 'north', name: 'Northern ridge', x: 67, y: 22, state: 'cloud', sites: 3, technology: '4G/5G', maintenance: false },
    { id: 'central', name: 'Central core', x: 48, y: 47, state: 'clear', sites: 3, technology: '4G/5G', maintenance: false },
    { id: 'east', name: 'Eastern corridor', x: 79, y: 51, state: 'rain', sites: 2, technology: '5G', maintenance: false },
    { id: 'west', name: 'Western gateway', x: 23, y: 51, state: 'clear', sites: 2, technology: '4G/5G', maintenance: false },
    { id: 'south', name: 'Southern belt', x: 48, y: 78, state: 'clear', sites: 1, technology: '4G', maintenance: false },
    { id: 'airport', name: 'Airport corridor', x: 24, y: 80, state: 'cloud', sites: 1, technology: '4G/5G', maintenance: true },
  ];
  const frames = [
    ['06:00','clear',97.9,41,24,128,0.4,88,1,98], ['07:00','clear',98.1,45,25,134,0.3,89,1,98], ['08:00','clear',98.2,49,26,140,0.3,88,1,97],
    ['09:00','clear',98.5,52,27,146,0.2,87,0,97], ['10:00','clear',98.7,55,27,151,0.2,88,0,97], ['11:00','cloud',98.4,59,29,155,0.3,86,1,96],
    ['14:00','clear',98.8,63,28,158,0.2,87,1,96], ['15:00','cloud',98.2,67,32,162,0.4,84,2,93], ['16:00','cloud',97.8,72,36,166,0.6,82,2,91],
    ['18:00','rain',96.9,81,44,151,1.1,78,4,86], ['21:00','storm',94.8,91,68,118,2.7,69,7,78], ['23:00','cloud',96.4,76,49,139,1.4,76,3,82], ['00:00','clear',97.5,58,33,147,0.6,83,1,86]
  ].map((f, index) => ({ time: f[0], state: f[1], availability: f[2], utilization: f[3], latency: f[4], throughput: f[5], loss: f[6], signal: f[7], incidents: f[8], confidence: f[9], observed: index <= 6 }));
  const provinceProfiles = [
    ['Tehran',184,98.9,'5G+','Fiber upgrade'],['Alborz',72,98.4,'5G','No window'],['Qom',38,97.8,'4G/5G','Power test'],['Markazi',34,97.1,'4G/5G','No window'],['Gilan',49,96.8,'4G/5G','Microwave tune'],['Mazandaran',58,97.3,'5G','No window'],['Golestan',32,96.1,'4G/5G','No window'],['Razavi Khorasan',104,98.2,'5G+','Core routing'],['North Khorasan',21,95.7,'4G','Battery audit'],['South Khorasan',18,95.2,'4G','No window'],['Semnan',25,96.4,'4G/5G','No window'],['Chaharmahal and Bakhtiari',19,94.8,'4G','Backhaul work'],['Isfahan',92,98.3,'5G+','No window'],['Yazd',37,97.6,'5G','Cooling check'],['Kerman',61,96.9,'4G/5G','No window'],['Hormozgan',56,95.8,'5G','Fiber splice'],['Bushehr',41,96.2,'4G/5G','No window'],['Fars',88,97.9,'5G+','No window'],['Khuzestan',76,96.6,'5G','Power resilience'],['Lorestan',29,95.9,'4G/5G','No window'],['Ilam',17,94.9,'4G','Microwave work'],['Kermanshah',43,96.7,'4G/5G','No window'],['Kurdistan',31,95.5,'4G/5G','No window'],['Hamadan',33,96.8,'4G/5G','Site modernization'],['Zanjan',28,97.2,'5G','No window'],['East Azerbaijan',81,98.1,'5G+','No window'],['West Azerbaijan',54,96.5,'5G','Border backhaul'],['Ardabil',26,96.3,'4G/5G','No window'],['Qazvin',39,97.7,'5G','No window'],['Sistan and Baluchestan',46,93.9,'4G','Satellite backup'],['Kohgiluyeh and Boyer-Ahmad',16,94.6,'4G','Generator test'],
  ].map(([name, baseTraffic, baseCoverage, technology, maintenance], index) => ({ name, baseTraffic, baseCoverage, technology, maintenance, seed:index + 3 }));
  function getProvinceMetrics(name, frameIndex) {
    const frame = frames[Math.max(0, Math.min(frameIndex, frames.length - 1))];
    const profile = provinceProfiles.find((item) => item.name === name) || { name, baseTraffic:30, baseCoverage:96, technology:'4G/5G', maintenance:'No window', seed:11 };
    const demand = frame.utilization / 63; const wave = ((profile.seed * 7 + frameIndex * 5) % 11) - 5;
    const trafficGbps = Math.max(8, Math.round(profile.baseTraffic * demand + wave));
    const congestion = Math.max(18, Math.min(99, Math.round(frame.utilization * .72 + (profile.seed * 13 % 30) + (profile.baseTraffic > 80 ? 6 : 0))));
    const latency = Math.max(16, Math.round(frame.latency * (.72 + (profile.seed % 6) * .055) + Math.max(0, congestion - 80) * .7));
    const coverage = Math.max(88.4, Math.min(99.8, Number((profile.baseCoverage - Math.max(0, frame.incidents - 2) * .22 + (profile.seed % 3) * .08).toFixed(1))));
    const incidents = ((profile.seed * 5 + frameIndex * 3) % 13 < frame.incidents ? 1 : 0) + (frame.incidents >= 6 && profile.seed % 11 === 0 ? 1 : 0);
    const temperature = Math.round(17 + (profile.seed * 3 % 13) + (frameIndex - 6) * .16);
    const condition = frame.state === 'storm' && profile.seed % 4 < 2 ? 'stormy' : frame.state === 'rain' && profile.seed % 3 !== 1 ? 'rainy' : profile.seed % 5 === 1 ? 'partly' : 'sunny';
    return { ...profile, trafficGbps, congestion, latency, coverage, incidents, temperature, condition, maintenanceActive:profile.maintenance !== 'No window' && (frameIndex + profile.seed) % 4 === 0, subscribersK:Math.round(profile.baseTraffic * 11.8), handoverSuccess:Number((99.4 - incidents * .45 - Math.max(0, congestion - 82) * .025).toFixed(2)), packetLoss:Number((frame.loss * (.55 + profile.seed % 5 * .11)).toFixed(2)), energyLoad:Math.min(99, Math.round(48 + congestion * .42 + profile.seed % 8)) };
  }
  const alerts = [
    { id:'a1', severity:'warning', weatherLevel:'yellow', weatherLevelFa:'هشدار زرد', icon:'⚠', title:'North ridge congestion watch', detail:'Utilization forecast to exceed 80% at 18:00', region:'north', time:'18:00', state:'Forecast', confidence:86, impact:'Customer latency risk' },
    { id:'a2', severity:'severe', weatherLevel:'orange', weatherLevelFa:'هشدار نارنجی', icon:'⚡', title:'Eastern corridor interference', detail:'SINR deterioration on 5G sectors E-04 and E-05', region:'east', time:'Now', state:'Observed', confidence:96, impact:'Radio quality degradation' },
    { id:'a3', groupId:'airport-maintenance', severity:'info', icon:'◷', title:'Planned maintenance · airport', detail:'Backhaul maintenance window may reduce redundancy', region:'airport', time:'21:00', state:'Planned', confidence:100, impact:'Redundancy reduced' },
    { id:'a4', severity:'critical', weatherLevel:'red', weatherLevelFa:'هشدار قرمز', icon:'✖', title:'East cluster site outage', detail:'E-05 unavailable; customer impact high in eastern corridor', region:'east', time:'21:00', state:'Forecast' },
    { id:'a5', severity:'severe', weatherLevel:'orange', weatherLevelFa:'هشدار نارنجی', icon:'⚡', title:'West backhaul interference', detail:'Microwave link quality reduced on the western gateway', region:'west', time:'18:00', state:'Forecast' },
    { id:'a6', groupId:'airport-maintenance', severity:'warning', weatherLevel:'yellow', weatherLevelFa:'هشدار زرد', icon:'♨', title:'Airport power resilience watch', detail:'Backup power test overlaps with maintenance window', region:'airport', time:'21:00', state:'Planned' },
  ];
  return { schemaVersion, regions, frames, alerts, provinceProfiles, getProvinceMetrics, getFrame(index) { return frames[Math.max(0, Math.min(index, frames.length - 1))]; } };
})();
