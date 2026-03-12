import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Her konsol logunu yakala ve yazdır
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}:`, msg.text());
  });

  try {
    console.log("Navigating to login page...");
    await page.goto('http://localhost:5173/giris', { waitUntil: 'networkidle0' });

    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'admin@test.com');
    await page.type('input[type="password"]', 'admin123');
    
    console.log("Clicking submit...");
    await page.click('button[type="submit"]');

    console.log("Waiting for network idle or navigation...");
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log("Navigation timeout (or handled by SPA routes)"));
    
    // Biraz bekleyelim ki son loglar dökülsün
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("Current URL after login attempt:", page.url());
  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await browser.close();
  }
})();
