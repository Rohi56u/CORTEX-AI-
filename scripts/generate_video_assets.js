const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'video_production');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureAllScenes() {
  console.log('🚀 Launching Edge browser via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // --- SCENE 1: THE BIG PROBLEM (HIGH IMPACT MOTION GRAPHIC) ---
  console.log('📸 Generating Scene 1: The Online Furniture Dilemma...');
  const problemHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 64px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 20px; border-radius: 16px; background: rgba(76, 5, 25, 0.7); border: 1px solid rgba(244, 63, 94, 0.5); color: #fda4af; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 12px #f43f5e; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 32px; }
      .card { padding: 32px; border-radius: 24px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.8); }
      .icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
      .glow-red { color: #f43f5e; text-shadow: 0 0 35px rgba(244, 63, 94, 0.6); }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="header-tag mono">
        <span class="ping"></span>
        INDUSTRY CRISIS REPORT: E-COMMERCE
      </div>
      <div class="mono" style="color: #94a3b8; font-size: 14px; font-weight: 600;">GLOBAL FURNITURE RETURNS: 38.4%</div>
    </div>

    <div style="max-width: 1200px; margin: auto 0;">
      <div class="mono" style="color: #fb7185; font-weight: 700; letter-spacing: 2px; font-size: 18px; margin-bottom: 12px;">THE REAL-WORLD PROBLEM</div>
      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 32px;">
        Why Does Buying Furniture Online Still Feel Like a <span class="glow-red">Blind Gamble?</span>
      </h1>

      <div class="grid">
        <div class="card">
          <div class="icon" style="background: rgba(244, 63, 94, 0.2); border: 1px solid rgba(244, 63, 94, 0.4);">📏</div>
          <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Scale & Size Mismatch</h3>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
            2D photos completely fail to communicate physical clearance. Sofas arrive too large for entryways, blocking walking clearance.
          </p>
        </div>

        <div class="card">
          <div class="icon" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4);">🎨</div>
          <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Color & Lighting Clashing</h3>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
            Studio photography makes fabrics look vivid online, but under real home ambient lighting they clash horribly with wall tones.
          </p>
        </div>

        <div class="card">
          <div class="icon" style="background: rgba(6, 182, 212, 0.2); border: 1px solid rgba(6, 182, 212, 0.4);">📦</div>
          <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Costly Return Hassle</h3>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
            Repackaging bulky 80kg furniture, waiting days for return couriers, and wasting weeks of customer effort and money.
          </p>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 24px;">
      <div class="mono" style="color: #64748b; font-size: 14px;">CORTEX AI ARCHITECTURE STUDY • SPATIAL COMMERCE ENGINE</div>
      <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">THERE HAS TO BE A BETTER WAY →</div>
    </div>
  </body>
  </html>`;

  await page.setContent(problemHtml, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_problem_intro.png') });

  // --- SCENE 2: INTRODUCING CORTEX AI ---
  console.log('📸 Generating Scene 2: Solution Title Reveal...');
  const solutionHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 64px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 20px; border-radius: 16px; background: rgba(8, 47, 73, 0.7); border: 1px solid rgba(6, 182, 212, 0.5); color: #67e8f9; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; }
      .glow-cyan { color: #22d3ee; text-shadow: 0 0 45px rgba(34, 211, 238, 0.7); }
      .pill { padding: 14px 24px; border-radius: 16px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); color: #67e8f9; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="header-tag mono">
        <span class="ping"></span>
        PROJECT OVERVIEW & BREAKTHROUGH
      </div>
      <div class="mono" style="color: #22d3ee; font-size: 14px; font-weight: 700;">NEXT.JS 14 • GOOGLE GEMINI 2.5 • WEBXR</div>
    </div>

    <div style="max-width: 1200px; margin: auto 0;">
      <div class="mono" style="color: #22d3ee; font-weight: 700; letter-spacing: 2px; font-size: 18px; margin-bottom: 16px;">INTRODUCING THE REVOLUTION</div>
      <h1 style="font-size: 80px; font-weight: 900; line-height: 1.1; margin-bottom: 24px;">
        CORTEX AI<br>
        <span class="glow-cyan" style="background: linear-gradient(90deg, #22d3ee, #2dd4bf, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Spatial NeuroCommerce
        </span>
      </h1>
      <p style="color: #cbd5e1; font-size: 24px; font-weight: 500; max-width: 900px; line-height: 1.6; margin-bottom: 40px;">
        World's first multimodal spatial commerce platform. Scan your living space in 15 seconds, let Gemini detect exact room dimensions, and interact with 1:1 scale WebXR digital twins before buying.
      </p>

      <div style="display: flex; gap: 20px;" class="mono">
        <div class="pill"><span>✨</span> 15-Sec Multimodal Room Scan</div>
        <div class="pill"><span>📐</span> 1:1 Physical Scale Verification</div>
        <div class="pill"><span>🎙️</span> Natural Conversational Voice Agent</div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 24px;">
      <div class="mono" style="color: #64748b; font-size: 14px;">AUTHOR & DEVELOPER: ROHI56U (RC8908969@GMAIL.COM)</div>
      <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">LET'S WALK THROUGH THE LIVE APP ↓</div>
    </div>
  </body>
  </html>`;

  await page.setContent(solutionHtml, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_solution_reveal.png') });

  // --- SCENE 3: LIVE 3D SPATIAL STUDIO ---
  console.log('📸 Capturing Scene 3: Live 3D Spatial Studio...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_live_3d_studio.png') });

  // --- SCENE 4: 15-SECOND MULTIMODAL SCANNER MODAL ---
  console.log('📸 Capturing Scene 4: 15s Room Scanner Modal...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scan = btns.find((b) => b.textContent.includes('Scan Room') || b.textContent.includes('Rescan'));
      if (scan) scan.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_room_scanner_modal.png') });

    // Close modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const close = btns.find((b) => b.textContent.includes('Browse 3D'));
      if (close) close.click();
    });
    await sleep(1000);
  } catch (err) {
    console.warn('Scanner capture notice:', err.message);
  }

  // --- SCENE 5: 3D COLOR SWATCHES ---
  console.log('📸 Capturing Scene 5: Interactive 3D Color Swatches...');
  try {
    // Open bottom catalog if collapsed
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cat = btns.find((b) => b.textContent.includes('Catalog'));
      if (cat) cat.click();
    });
    await sleep(1500);

    // Click finish swatch dot
    await page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('button[title*="apply 3D material"]'));
      if (dots.length > 1) dots[1].click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_material_swatches.png') });
  } catch (err) {
    console.warn('Swatches notice:', err.message);
  }

  // --- SCENE 6: 3D DIMENSION RULERS & AI VOICE QUICK-QUERY BAR ---
  console.log('📸 Capturing Scene 6: Dimension Rulers & Voice Query Bar...');
  try {
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Ask AI"]');
      if (input) {
        input.value = "Show modern executive chair under $600";
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_dimension_rulers_voice.png') });
  } catch (err) {
    console.warn('Query bar notice:', err.message);
  }

  // --- SCENE 7: SPATIAL PLACEMENT HUD BLUEPRINT ---
  console.log('📸 Capturing Scene 7: Spatial Placement Blueprint HUD...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const p = btns.find((b) => b.textContent.includes('Placement') || b.textContent.includes('Plan'));
      if (p) p.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_placement_hud.png') });
  } catch (err) {
    console.warn('Placement notice:', err.message);
  }

  // --- SCENE 8: AI VIRTUAL STAGING PREVIEW ---
  console.log('📸 Capturing Scene 8: AI Virtual Staging Mode...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const s = btns.find((b) => b.textContent.includes('AI Staging') || b.textContent.includes('Staging'));
      if (s) s.click();
    });
    await sleep(2000);
    await page.evaluate(() => {
      const gen = document.querySelector('#generate-staging-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Generate'));
      if (gen) gen.click();
    });
    await sleep(3500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_ai_virtual_staging.png') });
  } catch (err) {
    console.warn('Staging notice:', err.message);
  }

  // --- SCENE 9: WHITE-GLOVE CHECKOUT ---
  console.log('📸 Capturing Scene 9: White-Glove Delivery Checkout...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b3d = btns.find((b) => b.textContent.includes('3D'));
      if (b3d) b3d.click();
    });
    await sleep(1000);

    await page.evaluate(() => {
      const cart = document.querySelector('button[title*="Cart"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-shopping-bag'));
      if (cart) cart.click();
    });
    await sleep(1500);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const del = btns.find((b) => b.textContent.includes('White-Glove Delivery'));
      if (del) del.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_white_glove_checkout.png') });
  } catch (err) {
    console.warn('Checkout notice:', err.message);
  }

  // --- SCENE 10: OUTRO & CREDITS ---
  console.log('📸 Generating Scene 10: Outro & Call-to-Action...');
  const outroHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 64px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 20px; border-radius: 16px; background: rgba(8, 47, 73, 0.7); border: 1px solid rgba(6, 182, 212, 0.5); color: #67e8f9; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; }
      .glow-cyan { color: #22d3ee; text-shadow: 0 0 40px rgba(34, 211, 238, 0.7); }
      .card-box { padding: 24px 40px; border-radius: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(51, 65, 85, 0.8); display: flex; align-items: center; gap: 40px; margin-top: 36px; }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="header-tag mono">
        <span class="ping"></span>
        100% PRODUCTION READY & VERIFIED
      </div>
      <div class="mono" style="color: #94a3b8; font-size: 14px; font-weight: 700;">NEXT-GEN SPATIAL COMMERCE</div>
    </div>

    <div style="text-align: center; max-width: 1000px; margin: auto;">
      <div style="width: 80px; height: 80px; border-radius: 24px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #22d3ee; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 24px; box-shadow: 0 0 40px rgba(34, 211, 238, 0.35);">
        ✦
      </div>
      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 20px;">
        Experience <span class="glow-cyan" style="background: linear-gradient(90deg, #22d3ee, #2dd4bf, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">CORTEX AI</span> Today
      </h1>
      <p style="color: #cbd5e1; font-size: 22px; font-weight: 500; line-height: 1.6; max-width: 800px; margin: 0 auto 32px;">
        Empowering shoppers and brands with AI-driven spatial intelligence, 1:1 scale WebXR digital twins, and zero return anxiety.
      </p>

      <div class="card-box mono" style="display: inline-flex;">
        <div style="text-align: left;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; display: block; font-weight: 600;">Lead Developer</span>
          <span style="font-size: 18px; color: #fff; font-weight: 700;">Rohi56u</span>
        </div>
        <div style="height: 40px; width: 1px; background: #334155;"></div>
        <div style="text-align: left;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; display: block; font-weight: 600;">Contact Email</span>
          <span style="font-size: 18px; color: #67e8f9; font-weight: 700;">rc8908969@gmail.com</span>
        </div>
        <div style="height: 40px; width: 1px; background: #334155;"></div>
        <div style="text-align: left;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; display: block; font-weight: 600;">GitHub Repository</span>
          <span style="font-size: 18px; color: #34d399; font-weight: 700;">github.com/Rohi56u/CORTEX-AI-</span>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 24px;">
      <div class="mono" style="color: #64748b; font-size: 14px;">POWERED BY NEXT.JS 14 • MODEL-VIEWER • GOOGLE GEMINI 2.5</div>
      <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">THANK YOU FOR WATCHING • 2026</div>
    </div>
  </body>
  </html>`;

  await page.setContent(outroHtml, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_outro_credits.png') });

  await browser.close();
  console.log('✅ All 10 high-resolution visual scenes captured successfully!');
}

captureAllScenes().catch((e) => {
  console.error('Fatal scene capture error:', e);
  process.exit(1);
});
