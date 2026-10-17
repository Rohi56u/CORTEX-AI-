const puppeteer = require('puppeteer-core');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const BASE_DIR = path.join(__dirname, '..');
const VIDEO_DIR = path.join(BASE_DIR, 'video_production', 'screen_records');
const AUDIO_DIR = path.join(BASE_DIR, 'video_production', 'english_audio');
const FFMPEG_PATH = path.join(BASE_DIR, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRecordingPipeline() {
  console.log('🚀 Starting Full Screen-Recorded Video Pipeline...');
  
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

  // Helper to mux audio and video into final segment
  function muxAudioVideo(rawVideoPath, audioPath, outputPath, duration) {
    console.log(`🎬 Muxing audio ${path.basename(audioPath)} with video into ${path.basename(outputPath)}...`);
    const args = [
      '-y',
      '-i', rawVideoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-t', String(duration),
      '-shortest',
      outputPath,
    ];
    const res = spawnSync(FFMPEG_PATH, args);
    if (res.error) console.error('Mux error:', res.error);
  }

  // ==========================================
  // PART 1: THE PROBLEM HOOK & REVEAL (42.5s)
  // ==========================================
  console.log('\n🔴 Recording Part 1: Problem Hook & CORTEX AI Reveal (43s)...');
  const part1Html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 64px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 24px; border-radius: 16px; background: rgba(76, 5, 25, 0.7); border: 1px solid rgba(244, 63, 94, 0.5); color: #fda4af; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 15px #f43f5e; animation: pulse 1.5s infinite; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 36px; }
      .card { padding: 36px; border-radius: 24px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(51, 65, 85, 0.8); backdrop-blur: 16px; }
      .icon { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 24px; }
      .glow-red { color: #f43f5e; text-shadow: 0 0 40px rgba(244, 63, 94, 0.6); }
      .glow-cyan { color: #22d3ee; text-shadow: 0 0 45px rgba(34, 211, 238, 0.7); }
      @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      .reveal-box { animation: fadeIn 1s ease-in-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  </head>
  <body>
    <div id="phase1" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="header-tag mono">
          <span class="ping"></span>
          GLOBAL E-COMMERCE CRISIS: FURNITURE RETURNS
        </div>
        <div class="mono" style="color: #cbd5e1; font-size: 15px; font-weight: 700;">INDUSTRY REPORT • $50B WASTE</div>
      </div>

      <div style="max-width: 1280px; margin: auto 0;">
        <div class="mono" style="color: #fb7185; font-weight: 700; letter-spacing: 2px; font-size: 18px; margin-bottom: 12px;">THE PROBLEM</div>
        <h1 style="font-size: 68px; font-weight: 900; line-height: 1.15; margin-bottom: 24px;">
          Why Does Buying Furniture Online Still Feel Like a <span class="glow-red">Blind Gamble?</span>
        </h1>
        <p style="color: #94a3b8; font-size: 24px; max-width: 950px; line-height: 1.5; margin-bottom: 36px;">
          Traditional 2D product photos hide spatial scale and ambient lighting differences, driving a massive <strong style="color: #f43f5e;">38.4% return rate</strong> across global retailers.
        </p>

        <div class="grid">
          <div class="card">
            <div class="icon" style="background: rgba(244, 63, 94, 0.2); border: 1px solid rgba(244, 63, 94, 0.4);">📏</div>
            <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Scale & Size Mismatch</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
              Sofas arrive too wide for doorways or block walking clearance in living rooms.
            </p>
          </div>

          <div class="card">
            <div class="icon" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4);">🎨</div>
            <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Color & Lighting Clashing</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
              Studio renders look vibrant online, but clash with real wall paints and ambient room lighting.
            </p>
          </div>

          <div class="card">
            <div class="icon" style="background: rgba(6, 182, 212, 0.2); border: 1px solid rgba(6, 182, 212, 0.4);">📦</div>
            <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Costly Return Hassle</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
              Repackaging 80kg freight, waiting days for pickup, and wasting hundreds of dollars.
            </p>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 24px;">
        <div class="mono" style="color: #64748b; font-size: 14px;">INTERNATIONAL DEMO • CORTEX AI ARCHITECTURE</div>
        <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">INTRODUCING THE SOLUTION →</div>
      </div>
    </div>
  </body>
  </html>`;

  await page.setContent(part1Html, { waitUntil: 'domcontentloaded' });
  const rawPart1 = path.join(VIDEO_DIR, 'raw_part1.mp4');
  const recorderPart1 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart1.start(rawPart1);

  // Animate through Problem for 20s, then transform into CORTEX AI Reveal
  await sleep(19000);
  await page.evaluate(() => {
    document.getElementById('phase1').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="header-tag mono" style="background: rgba(8, 47, 73, 0.7); border-color: rgba(6, 182, 212, 0.5); color: #67e8f9;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; display: inline-block;"></span>
          NEXT-GEN SPATIAL COMMERCE PLATFORM
        </div>
        <div class="mono" style="color: #22d3ee; font-size: 15px; font-weight: 700;">NEXT.JS 14 • GOOGLE GEMINI 2.5 • WEBXR</div>
      </div>

      <div style="max-width: 1280px; margin: auto 0;" class="reveal-box">
        <div class="mono" style="color: #22d3ee; font-weight: 700; letter-spacing: 2px; font-size: 18px; margin-bottom: 16px;">THE BREAKTHROUGH</div>
        <h1 style="font-size: 80px; font-weight: 900; line-height: 1.1; margin-bottom: 24px;">
          CORTEX AI<br>
          <span class="glow-cyan" style="background: linear-gradient(90deg, #22d3ee, #2dd4bf, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Spatial NeuroCommerce Engine
          </span>
        </h1>
        <p style="color: #cbd5e1; font-size: 24px; font-weight: 500; max-width: 920px; line-height: 1.6; margin-bottom: 40px;">
          The world's first multimodal spatial commerce platform. Scan your living space in 15 seconds, let Gemini detect exact room dimensions, and interact with 1:1 scale WebXR digital twins directly in your space.
        </p>

        <div style="display: flex; gap: 24px;" class="mono">
          <div style="padding: 16px 28px; border-radius: 18px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.35); color: #67e8f9; font-size: 16px; font-weight: 600;">✨ 15-Sec Multimodal Room Scan</div>
          <div style="padding: 16px 28px; border-radius: 18px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.35); color: #67e8f9; font-size: 16px; font-weight: 600;">📐 1:1 Physical Scale Digital Twins</div>
          <div style="padding: 16px 28px; border-radius: 18px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.35); color: #67e8f9; font-size: 16px; font-weight: 600;">🎙️ Conversational Voice Agent</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(51, 65, 85, 0.8); padding-top: 24px;">
        <div class="mono" style="color: #64748b; font-size: 14px;">LEAD ARCHITECT & DEVELOPER: ROHI56U (RC8908969@GMAIL.COM)</div>
        <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">ENTERING LIVE SPATIAL STUDIO ↓</div>
      </div>
    `;
  });
  await sleep(23500);

  await recorderPart1.stop();
  muxAudioVideo(rawPart1, path.join(AUDIO_DIR, 'part1_problem_intro.mp3'), path.join(VIDEO_DIR, 'final_part1.mp4'), 42.5);

  // ================================================================
  // PART 2: LIVE 3D SPATIAL STUDIO & REAL-TIME SWATCHES (28.2s)
  // ================================================================
  console.log('\n🔴 Recording Part 2: 3D Spatial Studio & Material Swatches (28.2s)...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await sleep(3500);

  const rawPart2 = path.join(VIDEO_DIR, 'raw_part2.mp4');
  const recorderPart2 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart2.start(rawPart2);

  // Smooth interaction: mouse moves, rotate 3D view, open carousel, change color swatches
  await sleep(4000);
  
  // Expand Catalog
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cat = btns.find((b) => b.textContent.includes('Catalog'));
    if (cat) cat.click();
  });
  await sleep(3000);

  // Click on color swatch 1
  await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('button[title*="apply 3D material"]'));
    if (dots.length > 0) dots[0].click();
  });
  await sleep(4000);

  // Click on color swatch 2
  await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('button[title*="apply 3D material"]'));
    if (dots.length > 1) dots[1].click();
  });
  await sleep(5000);

  // Click on color swatch 3
  await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('button[title*="apply 3D material"]'));
    if (dots.length > 2) dots[2].click();
  });
  await sleep(5000);

  // Toggle Day/Night HDRI
  await page.evaluate(() => {
    const nightBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Night'));
    if (nightBtn) nightBtn.click();
  });
  await sleep(4000);

  await page.evaluate(() => {
    const dayBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Day'));
    if (dayBtn) dayBtn.click();
  });
  await sleep(2500);

  await recorderPart2.stop();
  muxAudioVideo(rawPart2, path.join(AUDIO_DIR, 'part2_3d_studio_swatches.mp3'), path.join(VIDEO_DIR, 'final_part2.mp4'), 28.2);

  // ================================================================
  // PART 3: 15-SECOND MULTIMODAL ROOM SCANNER (28.5s)
  // ================================================================
  console.log('\n🔴 Recording Part 3: 15-Sec Room Scanner Modal (28.5s)...');
  const rawPart3 = path.join(VIDEO_DIR, 'raw_part3.mp4');
  const recorderPart3 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart3.start(rawPart3);

  // Click Scan Room button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const scan = btns.find((b) => b.textContent.includes('Scan Room') || b.textContent.includes('Rescan'));
    if (scan) scan.click();
  });
  await sleep(4000);

  // Show snapping photo
  await page.evaluate(() => {
    const snapBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Snap Photo'));
    if (snapBtn) snapBtn.click();
  });
  await sleep(3500);

  // Show 15s Video recording
  await page.evaluate(() => {
    const vidBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('15s Video'));
    if (vidBtn) vidBtn.click();
  });
  await sleep(7000);

  // Stop video recording
  await page.evaluate(() => {
    const stopBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Stop'));
    if (stopBtn) stopBtn.click();
  });
  await sleep(3000);

  // Trigger Gemini Analysis
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Analyze Space'));
    if (submitBtn) submitBtn.click();
  });
  await sleep(8000);

  await recorderPart3.stop();
  muxAudioVideo(rawPart3, path.join(AUDIO_DIR, 'part3_scanner.mp3'), path.join(VIDEO_DIR, 'final_part3.mp4'), 28.5);

  // ================================================================
  // PART 4: 3D DIMENSION RULERS & AI VOICE QUICK-QUERY (26.3s)
  // ================================================================
  console.log('\n🔴 Recording Part 4: 3D Dimension Rulers & Voice Query Bar (26.3s)...');
  // Return to 3D studio
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b3d = btns.find((b) => b.textContent.includes('3D'));
    if (b3d) b3d.click();
  });
  await sleep(1500);

  const rawPart4 = path.join(VIDEO_DIR, 'raw_part4.mp4');
  const recorderPart4 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart4.start(rawPart4);

  // Toggle 3D Rulers icon
  await page.evaluate(() => {
    const rulerBtn = document.querySelector('button[title*="Ruler"]');
    if (rulerBtn) rulerBtn.click();
  });
  await sleep(4000);

  // Type in AI Voice Query Bar character-by-character
  const queryToType = "Show modern executive chair under $600";
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Ask AI"]');
    if (input) {
      input.focus();
      input.value = "";
    }
  });

  for (let i = 0; i < queryToType.length; i++) {
    await page.evaluate((char) => {
      const input = document.querySelector('input[placeholder*="Ask AI"]');
      if (input) {
        input.value += char;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, queryToType[i]);
    await sleep(60);
  }
  await sleep(2500);

  // Submit AI Query
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await sleep(6500);

  // Snapshot export button click demo
  await page.evaluate(() => {
    const snapBtn = document.querySelector('button[title*="Snapshot"]');
    if (snapBtn) snapBtn.click();
  });
  await sleep(4500);

  await recorderPart4.stop();
  muxAudioVideo(rawPart4, path.join(AUDIO_DIR, 'part4_rulers_voice.mp3'), path.join(VIDEO_DIR, 'final_part4.mp4'), 26.3);

  // ================================================================
  // PART 5: SPATIAL BLUEPRINT HUD & AI VIRTUAL STAGING (25.3s)
  // ================================================================
  console.log('\n🔴 Recording Part 5: Placement Blueprint HUD & AI Staging (25.3s)...');
  const rawPart5 = path.join(VIDEO_DIR, 'raw_part5.mp4');
  const recorderPart5 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart5.start(rawPart5);

  // Switch to Placement Blueprint HUD
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const p = btns.find((b) => b.textContent.includes('Placement') || b.textContent.includes('Plan'));
    if (p) p.click();
  });
  await sleep(7000);

  // Switch to AI Virtual Staging mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const s = btns.find((b) => b.textContent.includes('AI Staging') || b.textContent.includes('Staging'));
    if (s) s.click();
  });
  await sleep(4000);

  // Generate AI virtual staging preview
  await page.evaluate(() => {
    const gen = document.querySelector('#generate-staging-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Generate'));
    if (gen) gen.click();
  });
  await sleep(7500);

  // Hold Before / After toggle
  await page.evaluate(() => {
    const eyeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hold for Before'));
    if (eyeBtn) eyeBtn.dispatchEvent(new MouseEvent('mousedown'));
  });
  await sleep(2500);
  await page.evaluate(() => {
    const eyeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hold for Before'));
    if (eyeBtn) eyeBtn.dispatchEvent(new MouseEvent('mouseup'));
  });
  await sleep(4000);

  await recorderPart5.stop();
  muxAudioVideo(rawPart5, path.join(AUDIO_DIR, 'part5_placement_staging.mp3'), path.join(VIDEO_DIR, 'final_part5.mp4'), 25.3);

  // ================================================================
  // PART 6: WHITE-GLOVE CHECKOUT & RECEIPT (24.1s)
  // ================================================================
  console.log('\n🔴 Recording Part 6: White-Glove Delivery Checkout & Receipt (24.1s)...');
  const rawPart6 = path.join(VIDEO_DIR, 'raw_part6.mp4');
  const recorderPart6 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart6.start(rawPart6);

  // Return to 3D and open Cart
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b3d = btns.find((b) => b.textContent.includes('3D'));
    if (b3d) b3d.click();
  });
  await sleep(1500);

  await page.evaluate(() => {
    const cartBtn = document.querySelector('button[title*="Cart"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-shopping-bag'));
    if (cartBtn) cartBtn.click();
  });
  await sleep(3500);

  // Configure White-Glove Delivery
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const del = btns.find((b) => b.textContent.includes('White-Glove Delivery'));
    if (del) del.click();
  });
  await sleep(5500);

  // Authorize & Dispatch Order
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const auth = btns.find((b) => b.textContent.includes('Authorize & Dispatch'));
    if (auth) auth.click();
  });
  await sleep(6500);

  // Close or show voucher
  await sleep(6500);

  await recorderPart6.stop();
  muxAudioVideo(rawPart6, path.join(AUDIO_DIR, 'part6_checkout.mp3'), path.join(VIDEO_DIR, 'final_part6.mp4'), 24.1);

  // ================================================================
  // PART 7: OUTRO & DEVELOPER CREDITS (16.8s)
  // ================================================================
  console.log('\n🔴 Recording Part 7: Outro & Developer Impact (16.8s)...');
  const part7Html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; width: 1920px; height: 1080px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 64px; color: #fff; position: relative; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .header-tag { display: inline-flex; align-items: center; gap: 12px; padding: 10px 24px; border-radius: 16px; background: rgba(8, 47, 73, 0.7); border: 1px solid rgba(6, 182, 212, 0.5); color: #67e8f9; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
      .ping { width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 15px #22d3ee; }
      .glow-cyan { color: #22d3ee; text-shadow: 0 0 45px rgba(34, 211, 238, 0.7); }
      .card-box { padding: 28px 48px; border-radius: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(51, 65, 85, 0.8); display: flex; align-items: center; gap: 48px; margin-top: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="header-tag mono">
        <span class="ping"></span>
        INTERNATIONAL TECH COMPETITION SUBMISSION
      </div>
      <div class="mono" style="color: #94a3b8; font-size: 14px; font-weight: 700;">NEXT-GEN SPATIAL COMMERCE</div>
    </div>

    <div style="text-align: center; max-width: 1100px; margin: auto;">
      <div style="width: 88px; height: 88px; border-radius: 28px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #22d3ee; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 28px; box-shadow: 0 0 45px rgba(34, 211, 238, 0.4);">
        ✦
      </div>
      <h1 style="font-size: 72px; font-weight: 900; line-height: 1.15; margin-bottom: 24px;">
        Experience <span class="glow-cyan" style="background: linear-gradient(90deg, #22d3ee, #2dd4bf, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">CORTEX AI</span>
      </h1>
      <p style="color: #cbd5e1; font-size: 24px; font-weight: 500; line-height: 1.6; max-width: 880px; margin: 0 auto 36px;">
        Transforming online furniture retail from guesswork into an exact spatial science with Google Gemini and WebXR.
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
      <div class="mono" style="color: #64748b; font-size: 14px;">POWERED BY NEXT.JS 14 • MODEL-VIEWER • GOOGLE GEMINI 2.5</div>
      <div class="mono" style="color: #22d3ee; font-weight: 700; font-size: 15px;">THANK YOU FOR WATCHING • 2026</div>
    </div>
  </body>
  </html>`;

  await page.setContent(part7Html, { waitUntil: 'domcontentloaded' });
  const rawPart7 = path.join(VIDEO_DIR, 'raw_part7.mp4');
  const recorderPart7 = new PuppeteerScreenRecorder(page, recordConfig);
  await recorderPart7.start(rawPart7);
  await sleep(16500);
  await recorderPart7.stop();
  muxAudioVideo(rawPart7, path.join(AUDIO_DIR, 'part7_outro.mp3'), path.join(VIDEO_DIR, 'final_part7.mp4'), 16.8);

  await browser.close();
  console.log('✅ All 7 screen-recorded segments recorded & muxed with English voiceover!');

  // ================================================================
  // CONCATENATE ALL 7 SEGMENTS INTO MASTER SHOWCASE VIDEO
  // ================================================================
  const concatTxt = path.join(VIDEO_DIR, 'master_concat.txt');
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
  console.log('🎉 MASTER SCREEN-RECORDED SHOWCASE VIDEO SUCCESSFULLY CREATED!');
}

runRecordingPipeline().catch((err) => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
