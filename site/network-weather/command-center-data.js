window.CommandCenterMock = (() => {
  const sources = [
    { id:'ldp', name:'LDP', domain:'RRC · TRP · allocations', state:'mock', freshness:'Mock · 2 min', detail:'Schema modeled on LDP PW dashboard' },
    { id:'txtopoli', name:'TxTopoli', domain:'Inventory · fiber · microwave', state:'mock', freshness:'Mock · 5 min', detail:'Schema modeled on topology and data-quality APIs' },
    { id:'monres', name:'MonRes', domain:'Core PS · CS · IP · wireless', state:'mock', freshness:'Mock · 15 min', detail:'Schema modeled on CTO resource reports' },
    { id:'ehs', name:'EHS', domain:'Incidents · audits · PPE', state:'mock', freshness:'Mock · 1 h', detail:'Schema modeled on EHS operational records' },
    { id:'weather', name:'Weather fusion', domain:'Open-Meteo · WeatherAPI.com', state:'live', freshness:'Provider snapshot', detail:'Only non-mock operational domain' },
    { id:'irimo', name:'IRIMO', domain:'Official warning bulletins', state:'live', freshness:'Official snapshot', detail:'Parsed province and city warnings' },
  ];

  const sites = [
    { id:'DEMO-THR-AZ-014', city:'Tehran', province:'Tehran', lat:35.7216, lon:51.3347, technology:'5G / LTE', vendor:'Huawei', state:'watch', availability:99.72, rrc:{ fdd:78, tdd:83, nr:69 }, trpMbps:842, subscribers:18420, impacted:620, complaints:18, tx:{ type:'Fiber ring', utilization:72, protection:'Protected', alarm:'Clear', distanceKm:18.4, lossDb:2.1 }, core:'THR-vUGW-01', coreLoad:74, ehs:{ score:91, open:1, ppe:98, audit:'Pass with action' }, weatherExposure:'IRIMO yellow · wind 2 km/h', action:'Balance TDD carriers before evening peak' },
    { id:'DEMO-THR-MRD-022', city:'Karaj', province:'Alborz', lat:35.8061, lon:50.9324, technology:'LTE', vendor:'Huawei', state:'critical', availability:98.91, rrc:{ fdd:91, tdd:88, nr:0 }, trpMbps:611, subscribers:13280, impacted:2140, complaints:43, tx:{ type:'Microwave', utilization:92, protection:'1+0', alarm:'High BER', distanceKm:31.7, lossDb:5.8 }, core:'THR-UPCC-02', coreLoad:86, ehs:{ score:84, open:2, ppe:94, audit:'Corrective action' }, weatherExposure:'No mapped warning · NW wind 1 km/h', action:'Reroute traffic and inspect microwave path' },
    { id:'DEMO-TBZ-NT-009', city:'Tabriz', province:'East Azerbaijan', lat:38.0712, lon:46.2874, technology:'5G / LTE', vendor:'Huawei', state:'watch', availability:99.31, rrc:{ fdd:74, tdd:81, nr:76 }, trpMbps:528, subscribers:9760, impacted:380, complaints:9, tx:{ type:'Fiber', utilization:67, protection:'Protected', alarm:'Clear', distanceKm:22.6, lossDb:1.7 }, core:'TBZ-vUGW-01', coreLoad:69, ehs:{ score:88, open:1, ppe:97, audit:'Pass with action' }, weatherExposure:'IRIMO orange · NW wind 1 km/h', action:'Weather watch and verify backup power' },
    { id:'DEMO-MHD-RZ-031', city:'Mashhad', province:'Razavi Khorasan', lat:36.2817, lon:59.6036, technology:'5G / LTE', vendor:'Huawei', state:'healthy', availability:99.94, rrc:{ fdd:61, tdd:66, nr:58 }, trpMbps:766, subscribers:16740, impacted:0, complaints:4, tx:{ type:'Fiber ring', utilization:54, protection:'Protected', alarm:'Clear', distanceKm:15.2, lossDb:1.3 }, core:'MHD-UPCF-01', coreLoad:57, ehs:{ score:96, open:0, ppe:100, audit:'Pass' }, weatherExposure:'IRIMO yellow · NE wind 4 km/h', action:'No action · continue observation' },
    { id:'DEMO-ISF-CT-018', city:'Isfahan', province:'Isfahan', lat:32.6678, lon:51.6512, technology:'LTE', vendor:'Huawei', state:'watch', availability:99.48, rrc:{ fdd:82, tdd:79, nr:0 }, trpMbps:574, subscribers:11290, impacted:460, complaints:12, tx:{ type:'Microwave ring', utilization:81, protection:'1+1', alarm:'Minor', distanceKm:27.9, lossDb:3.6 }, core:'ISF-MSC-01', coreLoad:71, ehs:{ score:89, open:1, ppe:96, audit:'Pass with action' }, weatherExposure:'IRIMO yellow · W wind 2 km/h', action:'Watch RRC allocation and TX utilization' },
    { id:'DEMO-SHZ-FR-011', city:'Shiraz', province:'Fars', lat:29.6034, lon:52.5358, technology:'5G / LTE', vendor:'Huawei', state:'critical', availability:97.86, rrc:{ fdd:94, tdd:92, nr:84 }, trpMbps:903, subscribers:14860, impacted:3240, complaints:67, tx:{ type:'Fiber', utilization:88, protection:'Degraded', alarm:'LOS protection', distanceKm:41.2, lossDb:4.9 }, core:'SHZ-SGS-01', coreLoad:89, ehs:{ score:79, open:3, ppe:91, audit:'Fail' }, weatherExposure:'IRIMO orange · S wind 3 km/h', action:'Open incident bridge · restore protection path' },
    { id:'DEMO-BND-HR-007', city:'Bandar Abbas', province:'Hormozgan', lat:27.2054, lon:56.2869, technology:'LTE', vendor:'Huawei', state:'watch', availability:99.08, rrc:{ fdd:79, tdd:86, nr:0 }, trpMbps:447, subscribers:7840, impacted:730, complaints:21, tx:{ type:'Microwave', utilization:84, protection:'1+0', alarm:'Fading risk', distanceKm:38.5, lossDb:6.2 }, core:'BND-MGW-01', coreLoad:73, ehs:{ score:86, open:2, ppe:95, audit:'Corrective action' }, weatherExposure:'IRIMO yellow · E wind 3 km/h', action:'Prepare fading mitigation and field standby' },
    { id:'DEMO-KRM-KR-016', city:'Kerman', province:'Kerman', lat:30.2924, lon:57.0831, technology:'5G / LTE', vendor:'Huawei', state:'healthy', availability:99.88, rrc:{ fdd:64, tdd:71, nr:63 }, trpMbps:492, subscribers:8160, impacted:0, complaints:5, tx:{ type:'Fiber', utilization:59, protection:'Protected', alarm:'Clear', distanceKm:29.1, lossDb:2.4 }, core:'KRM-vUSN-01', coreLoad:62, ehs:{ score:94, open:0, ppe:99, audit:'Pass' }, weatherExposure:'IRIMO yellow · local provider point unavailable', action:'No action · monitor warning evolution' },
  ];

  const links = [
    { from:'DEMO-THR-AZ-014', to:'DEMO-THR-MRD-022', type:'Fiber', capacity:'100G', utilization:72, state:'healthy' },
    { from:'DEMO-THR-AZ-014', to:'DEMO-ISF-CT-018', type:'DWDM', capacity:'200G', utilization:64, state:'healthy' },
    { from:'DEMO-THR-AZ-014', to:'DEMO-TBZ-NT-009', type:'DWDM', capacity:'100G', utilization:79, state:'watch' },
    { from:'DEMO-THR-AZ-014', to:'DEMO-MHD-RZ-031', type:'DWDM', capacity:'200G', utilization:58, state:'healthy' },
    { from:'DEMO-ISF-CT-018', to:'DEMO-SHZ-FR-011', type:'Fiber', capacity:'100G', utilization:88, state:'critical' },
    { from:'DEMO-SHZ-FR-011', to:'DEMO-BND-HR-007', type:'Microwave', capacity:'20G', utilization:91, state:'critical' },
    { from:'DEMO-ISF-CT-018', to:'DEMO-KRM-KR-016', type:'Fiber', capacity:'100G', utilization:61, state:'healthy' },
    { from:'DEMO-KRM-KR-016', to:'DEMO-BND-HR-007', type:'Microwave', capacity:'20G', utilization:77, state:'watch' },
  ];

  const coreNodes = [
    { name:'THR-UPCC-02', domain:'Core PS', role:'Policy & charging', load:86, cpu:79, subscribers:12.4, state:'critical', metric:'License 88%' },
    { name:'SHZ-SGS-01', domain:'Core CS', role:'SGs / fallback', load:89, cpu:73, subscribers:4.8, state:'critical', metric:'SGs license 91%' },
    { name:'MHD-UPCF-01', domain:'Core PS', role:'5G policy', load:57, cpu:48, subscribers:6.1, state:'healthy', metric:'License 62%' },
    { name:'ISF-MSC-01', domain:'Core CS', role:'MSC / trunk', load:71, cpu:66, subscribers:3.7, state:'watch', metric:'BICC 74%' },
    { name:'THR-IPGW-03', domain:'IP', role:'National gateway', load:77, cpu:58, subscribers:18.2, state:'watch', metric:'Physical link 81%' },
    { name:'IMS-SCSCF-01', domain:'Wireless / IMS', role:'S-CSCF', load:68, cpu:64, subscribers:8.9, state:'healthy', metric:'Registered 71%' },
  ];

  const national = {
    subscribers: 42.8, activeSubscribers: 31.6, impactedSubscribers: 7.57,
    sites: 18420, onAir: 18293, criticalSites: 2, watchSites: 4,
    rrcUtilization: 78.4, trpGbps: 5163, txLinks: 28740, protectedLinks: 93.7,
    corePeak: 89, ehsScore: 88.4, openEhsActions: 10,
  };

  return { sources, sites, links, coreNodes, national };
})();
