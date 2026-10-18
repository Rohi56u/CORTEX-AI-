import urllib.request
import re
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

req = urllib.request.Request(
    'https://www.pexels.com/video/two-movers-lift-a-green-velvet-sofa-in-a-bright-sunny-room-7464106/',
    headers=headers
)

out_file = os.path.join(os.path.dirname(__file__), '..', 'video_production', 'problem_stock.mp4')
os.makedirs(os.path.dirname(out_file), exist_ok=True)

try:
    with urllib.request.urlopen(req, timeout=12) as response:
        content = response.read().decode('utf-8', errors='ignore')
        # Look for video files
        urls = re.findall(r'(https://[^\s"\'<>]+(?:video-files|download)[^\s"\'<>]+\.mp4[^\s"\'<>]*)', content)
        if not urls:
            urls = re.findall(r'(https://images\.pexels\.com/videos/[^\s"\'<>]+\.mp4[^\s"\'<>]*)', content)
        
        print("Found video URLs:", len(urls))
        if urls:
            target_url = urls[0]
            print("Downloading video from:", target_url)
            dl_req = urllib.request.Request(target_url, headers=headers)
            with urllib.request.urlopen(dl_req, timeout=20) as dl_resp, open(out_file, 'wb') as f:
                f.write(dl_resp.read())
            print("Successfully saved to:", out_file)
        else:
            print("No direct MP4 URL found in page HTML.")
except Exception as e:
    print("Download notice:", e)
