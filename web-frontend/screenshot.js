const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORTFOLIO_DIR = 'c:\\Users\\enesk\\OneDrive\\Masaüstü\\AI Diyet uygulaması\\portfolio_images';
if (!fs.existsSync(PORTFOLIO_DIR)) {
  fs.mkdirSync(PORTFOLIO_DIR);
}

const mockData = {
  state: {
    userData: {
      gender: 'female',
      age: '28',
      height: '165',
      weight: '62',
      neck: '32',
      waist: '68',
      hip: '95',
      activityLevel: 1.725, // Çok Hareketli
      goal: 'lose',
    },
    bmr: 1450,
    tdee: 2250,
    bmi: 22.8,
    bodyFatPercentage: 24.5,
    targetCalories: 1750,
    history: [
      { date: new Date(Date.now() - 30 * 86400000).toISOString(), weight: 65.5, bodyFatPercentage: 26.0 },
      { date: new Date(Date.now() - 24 * 86400000).toISOString(), weight: 64.8, bodyFatPercentage: 25.7 },
      { date: new Date(Date.now() - 17 * 86400000).toISOString(), weight: 64.0, bodyFatPercentage: 25.4 },
      { date: new Date(Date.now() - 10 * 86400000).toISOString(), weight: 63.2, bodyFatPercentage: 25.0 },
      { date: new Date(Date.now() - 3 * 86400000).toISOString(), weight: 62.5, bodyFatPercentage: 24.7 },
      { date: new Date(Date.now()).toISOString(), weight: 62.0, bodyFatPercentage: 24.5 },
    ],
    waterGlasses: 6,
    waterGoal: 8,
    currentDietPlan: null,
    weeklyDietPlan: {
      days: [
        {
          day: 1,
          totalCalories: 1720,
          meals: [
            { meal: 'Kahvaltı', food: '2 dilim tam buğday ekmeği, 1 haşlanmış yumurta, 30g beyaz peynir, bol yeşillik ve 5 zeytin.', calories: 350 },
            { meal: 'Ara Öğün', food: '1 adet orta boy yeşil elma ve 10 çiğ badem.', calories: 150 },
            { meal: 'Öğle Yemeği', food: '150g ızgara tavuk göğsü, 4 kaşık karabuğday pilavı ve zeytinyağlı mevsim salata.', calories: 450 },
            { meal: 'Ara Öğün', food: '1 kase (150g) yarım yağlı yoğurt ve 1 çay kaşığı tarçın.', calories: 120 },
            { meal: 'Akşam Yemeği', food: '1 porsiyon (200g) zeytinyağlı taze fasulye, 1 kase cacık, 1 dilim çavdar ekmeği.', calories: 400 },
            { meal: 'Gece', food: '1 fincan papatya çayı ve 2 tam ceviz.', calories: 80 },
          ]
        },
        {
          day: 2,
          totalCalories: 1680,
          meals: [
            { meal: 'Kahvaltı', food: '3 kaşık yulaf ezmesi, 1 su bardağı laktozsuz süt, 1/2 muz ve tarçın.', calories: 320 },
            { meal: 'Ara Öğün', food: '1 fincan yeşil çay, 2 adet kuru kayısı.', calories: 90 },
            { meal: 'Öğle Yemeği', food: 'Ton balıklı (80g süzülmüş) bol yeşillikli salata (1 tatlı kaşığı zeytinyağı ile).', calories: 380 },
            { meal: 'Ara Öğün', food: '1 dilim wasa üzeri 1 tatlı kaşığı fıstık ezmesi.', calories: 140 },
            { meal: 'Akşam Yemeği', food: '4 adet ızgara ev yapımı köfte, közlenmiş biber/patlıcan, ayran.', calories: 510 },
          ]
        },
        {
          day: 3,
          totalCalories: 1750,
          meals: [
            { meal: 'Kahvaltı', food: '1 adet yumurtadan peynirli omlet, 1 dilim tam buğday ekmeği, domates/salatalık.', calories: 360 },
            { meal: 'Öğle Yemeği', food: '6 kaşık etli nohut yemeği, 3 kaşık bulgur pilavı, 1 kase yoğurt.', calories: 550 },
            { meal: 'Ara Öğün', food: '1 porsiyon taze mevsim meyvesi, 1 bardak kefir.', calories: 180 },
            { meal: 'Akşam Yemeği', food: 'Izgara somon (150g), buharda brokoli ve havuç, çeyrek limon.', calories: 480 },
            { meal: 'Gece', food: 'Yarım avuç leblebi.', calories: 100 },
          ]
        }
      ]
    },
    weeklyPlanStartDate: new Date().toISOString()
  },
  version: 0
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate((data) => {
    localStorage.setItem('ai-diet-storage', JSON.stringify(data));
  }, mockData);
  
  const routes = [
    { path: '/', name: '01_Dashboard' },
    { path: '/profile', name: '02_Profile' },
    { path: '/plan', name: '03_Diet_Plan' },
    { path: '/ai', name: '04_AI_Assistant' }
  ];
  
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500)); 
    await page.screenshot({ path: path.join(PORTFOLIO_DIR, `${route.name}.png`), fullPage: true });
    console.log(`Saved screenshot for ${route.name}`);
  }

  // Mobile screenshots
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(PORTFOLIO_DIR, `${route.name}_mobile.png`), fullPage: true });
    console.log(`Saved mobile screenshot for ${route.name}`);
  }

  await browser.close();
})();
