const puppeteer = require('puppeteer-core');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const BASE_DIR = path.join(__dirname, '..');
const VIDEO_DIR = path.join(BASE_DIR, 'video_production', 'fast_records');
const AUDIO_DIR = path.join(BASE_DIR, 'video_production', 'natural_audio');
const FFMPEG_PATH = path.join(BASE_DIR, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFastDemoPipeline() {
  console.log('🚀 Starting Fast, High-Paced Screen Recording Pipeline...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const recordConfig = {
    fps: 30,
    ffmpeg_Path: FFMPEG_PATH,
    videoFrame: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
  };

  function mux(rawVideo, audioFile, output, dur) {
    console.log(`🎬 Muxing ${path.basename(audioFile)} -> ${path.basename(output)} (${dur}s)...`);
    const args = [
      '-y',
      '-i', rawVideo,
      '-i', audioFile,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-t', String(dur),
      '-shortest',
      output,
    ];
    spawnSync(FFMPEG_PATH, args);
  }

  // ==========================================
  // PART 1: SHORT PROBLEM HOOK & REVEAL (22.0s)
  // ==========================================
  console.log('\n🔴 Recording Part 1: Fast Problem Hook & Reveal (22.0s)...');
  const part1Html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 60px 80px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 24px; border-radius: 16px; background: rgba(76, 5, 25, 0.7); border: 1px solid rgba(244, 63, 94, 0.5); color: #fda4af; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 15px #f43f5e; }
      .glow-red { color: #f43f5e; text-shadow: 0 0 40px rgba(244, 63, 94, 0.6); }
      .glow-cyan { color: #22d3ee; text-shadow: 0 0 45px rgba(34, 211, 238, 0.7); }
      .sim-box { width: 440px; height: 320px; border-radius: 24px; background: #0f172a; border: 1px solid #334155; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .measure-tape { width: 80%; height: 8px; background: repeating-linear-gradient(90deg, #f59e0b, #f59e0b 8px, #000 8px, #000 12px); border-radius: 4px; position: relative; animation: stretch 2s infinite alternate; }
      @keyframes stretch { 0% { width: 50%; } 100% { width: 90%; } }
      .badge-reject { position: absolute; bottom: 20px; background: rgba(244, 63, 94, 0.2); border: 1px solid #f43f5e; color: #fda4af; padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div id="container" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="header-tag mono">
          <span class="ping"></span>
          GLOBAL E-COMMERCE PROBLEM: 38.4% RETURNS
        </div>
        <div class="mono" style="color: #94a3b8; font-size: 15px; font-weight: 700;">$50 BILLION ANNUAL INDUSTRY LOSS</div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; gap: 60px;">
        <div style="max-width: 900px;">
          <div class="mono" style="color: #fb7185; font-weight: 700; letter-spacing: 2px; font-size: 16px; margin-bottom: 12px;">THE PROBLEM</div>
          <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 20px;">
            Buying Furniture Online is Still a <span class="glow-red">Blind Gamble</span>
          </h1>
          <p style="color: #94a3b8; font-size: 22px; line-height: 1.5; margin-bottom: 30px;">
            Flat 2D photos completely fail to communicate physical clearance and home ambient lighting, causing 38% of orders to be returned.
          </p>

          <div style="display: flex; gap: 20px;" class="mono text-sm">
            <div style="padding: 16px 24px; border-radius: 18px; background: rgba(15, 23, 42, 0.9); border: 1px solid #334155;">
              <span style="color: #f43f5e; font-weight: bold; font-size: 18px;">❌ Scale Mismatch</span>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Sofas arrive too big for doorways</p>
            </div>
            <div style="padding: 16px 24px; border-radius: 18px; background: rgba(15, 23, 42, 0.9); border: 1px solid #334155;">
              <span style="color: #f59e0b; font-weight: bold; font-size: 18px;">❌ Color Clashing</span>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Studio renders clash with wall paint</p>
            </div>
          </div>
        </div>

        <!-- Animated Delivery & Measuring Dilemma Widget -->
        <div class="sim-box">
          <div style="font-size: 64px; margin-bottom: 16px;">🛋️ ↔️ 🚪</div>
          <div class="measure-tape"></div>
          <div class="badge-reject mono">❌ FAILED: 2.4m Sofa > 2.0m Doorway</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 20px;">
        <div class="mono" style="color: #64748b; font-size: 14px;">INTERNATIONAL COMPETITION DEMO</div>
        <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">ENTER CORTEX AI →</div>
      </div>
    </div>
  </body>
  </html>`;

  await page.setContent(part1Html, { waitUntil: 'domcontentloaded' });
  const rawPart1 = path.join(VIDEO_DIR, 'raw_part1.mp4');
  const recorderPart1 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart1.start(rawPart1);

  // Play problem for 10s, then transform into CORTEX AI Reveal for 12s
  await sleep(10000);
  await page.evaluate(() => {
    document.getElementById('container').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="header-tag mono" style="background: rgba(8, 47, 73, 0.7); border-color: rgba(6, 182, 212, 0.5); color: #67e8f9;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; display: inline-block;"></span>
          SPATIAL NEUROCOMMERCE ENGINE
        </div>
        <div class="mono" style="color: #22d3ee; font-size: 15px; font-weight: 700;">NEXT.JS 14 • MULTIMODAL SPATIAL AI • WEBXR</div>
      </div>

      <div style="max-width: 1100px; margin: auto 0;">
        <div class="mono" style="color: #22d3ee; font-weight: 700; letter-spacing: 2px; font-size: 16px; margin-bottom: 12px;">THE SOLUTION</div>
        <h1 style="font-size: 76px; font-weight: 900; line-height: 1.1; margin-bottom: 20px;">
          Meet <span class="glow-cyan" style="background: linear-gradient(90deg, #22d3ee, #2dd4bf, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">CORTEX AI</span>
        </h1>
        <p style="color: #cbd5e1; font-size: 24px; line-height: 1.5; margin-bottom: 32px;">
          The world's first multimodal spatial commerce platform. Scan your living space in 15 seconds, and place 1:1 scale digital twins directly in your room.
        </p>

        <div style="display: flex; gap: 20px;" class="mono text-sm">
          <div style="padding: 14px 24px; border-radius: 16px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.35); color: #67e8f9; font-weight: 600;">✨ 15-Sec Multimodal Scan</div>
          <div style="padding: 14px 24px; border-radius: 16px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.35); color: #67e8f9; font-weight: 600;">📐 1:1 Scale Digital Twins</div>
          <div style="padding: 14px 24px; border-radius: 16px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.35); color: #67e8f9; font-weight: 600;">🎙️ Conversational Voice Agent</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 20px;">
        <div class="mono" style="color: #64748b; font-size: 14px;">LEAD ARCHITECT & DEVELOPER: ROHI56U</div>
        <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">ENTERING 3D SPATIAL STUDIO ↓</div>
      </div>
    `;
  });
  await sleep(12000);

  await recorderPart1.stop();
  mux(rawPart1, path.join(AUDIO_DIR, 'part1_problem_reveal.mp3'), path.join(VIDEO_DIR, 'final_part1.mp4'), 22.0);

  // ================================================================
  // PART 2: LIVE 3D SPATIAL STUDIO & MATERIAL SWATCHES (15.0s)
  // ================================================================
  console.log('\n🔴 Recording Part 2: 3D Spatial Studio & Material Swatches (15.0s)...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  const rawPart2 = path.join(VIDEO_DIR, 'raw_part2.mp4');
  const recorderPart2 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart2.start(rawPart2);

  // Rotate & expand catalog
  await sleep(2000);
  await page.evaluate(() => {
    const cat = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Catalog'));
    if (cat) cat.click();
  });
  await sleep(2500);

  // Click Swatch 1 (Emerald)
  await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('button[title*="apply 3D material"]'));
    if (dots.length > 0) dots[0].click();
  });
  await sleep(3000);

  // Click Swatch 2 (Desert Ochre)
  await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('button[title*="apply 3D material"]'));
    if (dots.length > 1) dots[1].click();
  });
  await sleep(3500);

  // Toggle Lighting to Night
  await page.evaluate(() => {
    const night = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Night'));
    if (night) night.click();
  });
  await sleep(2500);

  // Toggle Lighting to Day
  await page.evaluate(() => {
    const day = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Day'));
    if (day) day.click();
  });
  await sleep(1500);

  await recorderPart2.stop();
  mux(rawPart2, path.join(AUDIO_DIR, 'part2_3d_studio_swatches.mp3'), path.join(VIDEO_DIR, 'final_part2.mp4'), 15.0);

  // ================================================================
  // PART 3: 15-SEC ROOM SCANNER MODAL (15.0s)
  // ================================================================
  console.log('\n🔴 Recording Part 3: 15-Sec Room Scanner Modal (15.0s)...');
  const rawPart3 = path.join(VIDEO_DIR, 'raw_part3.mp4');
  const recorderPart3 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart3.start(rawPart3);

  // Open Scanner Modal
  await page.evaluate(() => {
    const scan = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Scan Room') || b.textContent.includes('Rescan'));
    if (scan) scan.click();
  });
  await sleep(3500);

  // Snap Photo
  await page.evaluate(() => {
    const snap = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Snap Photo'));
    if (snap) snap.click();
  });
  await sleep(3000);

  // 15s Video Sweep
  await page.evaluate(() => {
    const vid = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('15s Video'));
    if (vid) vid.click();
  });
  await sleep(4000);

  // Submit Analysis
  await page.evaluate(() => {
    const sub = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Analyze Space'));
    if (sub) sub.click();
  });
  await sleep(4500);

  await recorderPart3.stop();
  mux(rawPart3, path.join(AUDIO_DIR, 'part3_scanner.mp3'), path.join(VIDEO_DIR, 'final_part3.mp4'), 15.0);

  // ================================================================
  // PART 4: 3D DIMENSION RULERS & VOICE QUERY (14.6s)
  // ================================================================
  console.log('\n🔴 Recording Part 4: 3D Dimension Rulers & Voice Query (14.6s)...');
  await page.evaluate(() => {
    const b3d = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('3D'));
    if (b3d) b3d.click();
  });
  await sleep(1500);

  const rawPart4 = path.join(VIDEO_DIR, 'raw_part4.mp4');
  const recorderPart4 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart4.start(rawPart4);

  // Toggle Rulers Hotspot
  await page.evaluate(() => {
    const ruler = document.querySelector('button[title*="Ruler"]');
    if (ruler) ruler.click();
  });
  await sleep(3000);

  // Quick type in AI query bar
  const query = "Modern executive chair under $600";
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Ask AI"]');
    if (input) {
      input.focus();
      input.value = "";
    }
  });

  for (let i = 0; i < query.length; i++) {
    await page.evaluate((c) => {
      const input = document.querySelector('input[placeholder*="Ask AI"]');
      if (input) {
        input.value += c;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, query[i]);
    await sleep(40);
  }
  await sleep(1500);

  // Send Query
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await sleep(5500);

  await recorderPart4.stop();
  mux(rawPart4, path.join(AUDIO_DIR, 'part4_rulers_voice.mp3'), path.join(VIDEO_DIR, 'final_part4.mp4'), 14.6);

  // ================================================================
  // PART 5: PLACEMENT BLUEPRINT & AI STAGING (16.0s)
  // ================================================================
  console.log('\n🔴 Recording Part 5: Placement Blueprint & AI Staging (16.0s)...');
  const rawPart5 = path.join(VIDEO_DIR, 'raw_part5.mp4');
  const recorderPart5 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart5.start(rawPart5);

  // Switch to Placement Blueprint HUD
  await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Placement') || b.textContent.includes('Plan'));
    if (p) p.click();
  });
  await sleep(5000);

  // Switch to AI Staging mode
  await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('AI Staging') || b.textContent.includes('Staging'));
    if (s) s.click();
  });
  await sleep(3000);

  // Click Generate Staging
  await page.evaluate(() => {
    const gen = document.querySelector('#generate-staging-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Generate'));
    if (gen) gen.click();
  });
  await sleep(4500);

  // Quick toggle hold before
  await page.evaluate(() => {
    const eye = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hold for Before'));
    if (eye) eye.dispatchEvent(new MouseEvent('mousedown'));
  });
  await sleep(1500);
  await page.evaluate(() => {
    const eye = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hold for Before'));
    if (eye) eye.dispatchEvent(new MouseEvent('mouseup'));
  });
  await sleep(2000);

  await recorderPart5.stop();
  mux(rawPart5, path.join(AUDIO_DIR, 'part5_placement_staging.mp3'), path.join(VIDEO_DIR, 'final_part5.mp4'), 16.0);

  // ================================================================
  // PART 6: WHITE-GLOVE DELIVERY CHECKOUT (14.1s)
  // ================================================================
  console.log('\n🔴 Recording Part 6: White-Glove Delivery Checkout (14.1s)...');
  const rawPart6 = path.join(VIDEO_DIR, 'raw_part6.mp4');
  const recorderPart6 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart6.start(rawPart6);

  // Return to 3D & Open Cart
  await page.evaluate(() => {
    const b3d = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('3D'));
    if (b3d) b3d.click();
  });
  await sleep(1000);

  await page.evaluate(() => {
    const cart = document.querySelector('button[title*="Cart"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-shopping-bag'));
    if (cart) cart.click();
  });
  await sleep(2500);

  // Configure White-Glove
  await page.evaluate(() => {
    const del = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('White-Glove Delivery'));
    if (del) del.click();
  });
  await sleep(3500);

  // Complete Order
  await page.evaluate(() => {
    const auth = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Authorize & Dispatch'));
    if (auth) auth.click();
  });
  await sleep(7000);

  await recorderPart6.stop();
  mux(rawPart6, path.join(AUDIO_DIR, 'part6_checkout.mp3'), path.join(VIDEO_DIR, 'final_part6.mp4'), 14.1);

  // ================================================================
  // PART 7: OUTRO (NO EMAIL/URL SPOKEN, CLEAN CARDS) (16.2s)
  // ================================================================
  console.log('\n🔴 Recording Part 7: Clean Outro (16.2s)...');
  const part7Html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 64px 80px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 24px; border-radius: 16px; background: rgba(8, 47, 73, 0.7); border: 1px solid rgba(6, 182, 212, 0.5); color: #67e8f9; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; }
      .glow-cyan { color: #22d3ee; text-shadow: 0 0 45px rgba(34, 211, 238, 0.7); }
      .card-box { padding: 28px 48px; border-radius: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(51, 65, 85, 0.8); display: flex; align-items: center; gap: 48px; margin-top: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="header-tag mono">
        <span class="ping"></span>
        INTERNATIONAL TECH COMPETITION SUBMISSION
      </div>
      <div class="mono" style="color: #94a3b8; font-size: 15px; font-weight: 700;">NEXT-GEN SPATIAL COMMERCE</div>
    </div>

    <div style="text-align: center; max-width: 1100px; margin: auto;">
      <div style="width: 88px; height: 88px; border-radius: 28px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #22d3ee; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; box-shadow: 0 0 45px rgba(34, 211, 238, 0.4);">
        ✦
      </div>
      <h1 style="font-size: 72px; font-weight: 900; line-height: 1.15; margin-bottom: 20px;">
        Experience <span class="glow-cyan" style="background: linear-gradient(90deg, #22d3ee, #2dd4bf, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">CORTEX AI</span>
      </h1>
      <p style="color: #cbd5e1; font-size: 24px; font-weight: 500; line-height: 1.6; max-width: 880px; margin: 0 auto 28px;">
        Transforming online furniture retail from guesswork into an exact spatial science with Multimodal AI and WebXR.
      </p>

      <div class="card-box mono" style="display: inline-flex;">
        <div style="text-align: left;">
          <span style="font-size: 13px; color: #64748b; text-transform: uppercase; display: block; font-weight: 700;">Lead Architect & Developer</span>
          <span style="font-size: 20px; color: #fff; font-weight: 800;">Rohi56u</span>
        </div>
        <div style="height: 48px; width: 1px; background: #334155;"></div>
        <div style="text-align: left;">
          <span style="font-size: 13px; color: #64748b; text-transform: uppercase; display: block; font-weight: 700;">Contact Email</span>
          <span style="font-size: 20px; color: #67e8f9; font-weight: 800;">rc8908969@gmail.com</span>
        </div>
        <div style="height: 48px; width: 1px; background: #334155;"></div>
        <div style="text-align: left;">
          <span style="font-size: 13px; color: #64748b; text-transform: uppercase; display: block; font-weight: 700;">GitHub Repository</span>
          <span style="font-size: 20px; color: #34d399; font-weight: 800;">github.com/Rohi56u/CORTEX-AI-</span>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 24px;">
      <div class="mono" style="color: #64748b; font-size: 14px;">POWERED BY NEXT.JS 14 • MODEL-VIEWER • MULTIMODAL SPATIAL AI</div>
      <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">THANK YOU FOR WATCHING • 2026</div>
    </div>
  </body>
  </html>`;

  await page.setContent(part7Html, { waitUntil: 'domcontentloaded' });
  const rawPart7 = path.join(VIDEO_DIR, 'raw_part7.mp4');
  const recorderPart7 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart7.start(rawPart7);
  await sleep(16000);
  await recorderPart7.stop();
  mux(rawPart7, path.join(AUDIO_DIR, 'part7_outro.mp3'), path.join(VIDEO_DIR, 'final_part7.mp4'), 16.2);

  await browser.close();
  console.log('✅ All 7 screen-recorded segments recorded & muxed with ultra-natural voiceover!');

  // ================================================================
  // CONCATENATE ALL 7 SEGMENTS INTO MASTER SHOWCASE VIDEO
  // ================================================================
  const concatTxt = path.join(VIDEO_DIR, 'fast_concat.txt');
  const finalSegments = [
    path.join(VIDEO_DIR, 'final_part1.mp4'),
    path.join(VIDEO_DIR, 'final_part2.mp4'),
    path.join(VIDEO_DIR, 'final_part3.mp4'),
    path.join(VIDEO_DIR, 'final_part4.mp4'),
    path.join(VIDEO_DIR, 'final_part5.mp4'),
    path.join(VIDEO_DIR, 'final_part6.mp4'),
    path.join(VIDEO_DIR, 'final_part7.mp4'),
  ];

  fs.writeFileSync(concatTxt, finalSegments.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const masterVideoPath = path.join(BASE_DIR, 'public', 'video', 'cortex_ai_master_showcase.mp4');
  console.log(`\n🚀 Merging 7 segments into Master Showcase: ${masterVideoPath}...`);

  const mergeArgs = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatTxt,
    '-c', 'copy',
    masterVideoPath,
  ];

  spawnSync(FFMPEG_PATH, mergeArgs);
  console.log('🎉 PERFECT 2m 25s SHOWCASE VIDEO CREATED WITH ULTRA-NATURAL VOICE!');
}

runFastDemoPipeline().catch((err) => {
  console.error('Fatal fast demo error:', err);
  process.exit(1);
});
