import urllib.request
import re
import os

req = urllib.request.Request(
    'https://pixabay.com/videos/living-room-apartment-interior-home-110594/',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
)

out_file = os.path.join(os.path.dirname(__file__), '..', 'public', 'video', 'stock_living_room.mp4')
os.makedirs(os.path.dirname(out_file), exist_ok=True)

try:
    with urllib.request.urlopen(req, timeout=12) as response:
        html = response.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'(https://cdn\.pixabay\.com/video/[^"\'\s]+\.mp4)', html)
        print("Found video links:", len(matches))
        if matches:
            video_url = matches[0]
            print("Downloading video:", video_url)
            v_req = urllib.request.Request(video_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(v_req, timeout=15) as vr, open(out_file, 'wb') as vf:
                vf.write(vr.read())
            print("Successfully saved to:", out_file)
        else:
            print("No video link found in HTML.")
except Exception as e:
    print("Fetch error:", e)
