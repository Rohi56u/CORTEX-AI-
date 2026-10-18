const puppeteer = require('puppeteer-core');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');

const FFMPEG_PATH = path.join(__dirname, '..', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');

async function testRecorder() {
  console.log('Testing PuppeteerScreenRecorder...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    ffmpeg_Path: FFMPEG_PATH,
    videoFrame: {
      width: 1920,
      height: 1080
    },
    aspectRatio: '16:9'
  });

  await recorder.start('test_live_recording.mp4');
  console.log('Recording started! Loading http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // Wait 4 seconds while 3D model rotates
  await new Promise((r) => setTimeout(r, 4000));

  await recorder.stop();
  console.log('Recording stopped!');

  await browser.close();
  console.log('Browser closed. Test successful!');
}

testRecorder().catch(console.error);
