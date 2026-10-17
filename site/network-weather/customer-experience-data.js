window.CustomerExperienceDemo = (() => {
  const regions = [
    { city:'Tehran', province:'Tehran', lat:35.6892, lon:51.3890, status:'good', availability:99.82, goodExperience:96, demand:73, speed:184, customers:8.7, impacted:320, weather:'Clear skies', outlook:'Normal service with a busier evening peak.' },
    { city:'Karaj', province:'Alborz', lat:35.8400, lon:50.9391, status:'busy', availability:99.21, goodExperience:87, demand:89, speed:92, customers:2.4, impacted:2140, weather:'Light wind', outlook:'Some customers may notice slower data around the evening peak.' },
    { city:'Tabriz', province:'East Azerbaijan', lat:38.0800, lon:46.2919, status:'good', availability:99.48, goodExperience:92, demand:78, speed:137, customers:1.9, impacted:380, weather:'Weather watch', outlook:'Service is good; weather may briefly affect outdoor coverage.' },
    { city:'Mashhad', province:'Razavi Khorasan', lat:36.2605, lon:59.6168, status:'excellent', availability:99.94, goodExperience:98, demand:64, speed:206, customers:3.1, impacted:0, weather:'Breezy', outlook:'A strong service day is expected across the metro.' },
    { city:'Isfahan', province:'Isfahan', lat:32.6546, lon:51.6680, status:'good', availability:99.55, goodExperience:93, demand:81, speed:128, customers:2.6, impacted:460, weather:'Dry and clear', outlook:'Good service overall with short busy periods after 18:00.' },
    { city:'Shiraz', province:'Fars', lat:29.5918, lon:52.5837, status:'limited', availability:98.16, goodExperience:74, demand:94, speed:58, customers:2.2, impacted:3240, weather:'Weather warning', outlook:'Slower data is likely in busy areas; voice service should remain available.' },
    { city:'Bandar Abbas', province:'Hormozgan', lat:27.1832, lon:56.2666, status:'busy', availability:99.08, goodExperience:84, demand:86, speed:81, customers:1.2, impacted:730, weather:'Humid and windy', outlook:'Busy-hour speeds may dip, especially near the city centre.' },
    { city:'Kerman', province:'Kerman', lat:30.2839, lon:57.0834, status:'excellent', availability:99.88, goodExperience:97, demand:67, speed:166, customers:1.1, impacted:0, weather:'Clear', outlook:'Normal voice and data service is expected.' },
  ];

  const national = {
    activeCustomers: '31.6M',
    serviceAvailability: '99.72%',
    goodExperience: '94.3%',
    areasToWatch: 3,
  };

  return { regions, national };
})();
