import os
import sys
import subprocess
from gtts import gTTS

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(BASE_DIR, "video_production", "english_audio")
os.makedirs(AUDIO_DIR, exist_ok=True)
FFMPEG = os.path.join(BASE_DIR, "node_modules", "@ffmpeg-installer", "win32-x64", "ffmpeg.exe")

VOICEOVER_SEGMENTS = [
    {
        "id": "part1_problem_intro",
        "text": (
            "Have you ever ordered furniture online, only to have it delivered and realize it doesn't fit your living room? "
            "Or the color completely clashes with your walls? "
            "This is the fifty billion dollar furniture dilemma. Traditional e-commerce forces customers to guess scale from flat two-D photos, "
            "leading to a massive thirty-eight percent return rate. "
            "Meet CORTEX AI. The world's first multimodal spatial commerce platform, powered by Google Gemini and WebXR. "
            "It analyzes your room in fifteen seconds and visualizes one-to-one scale digital twins directly in your space."
        ),
    },
    {
        "id": "part2_3d_studio_swatches",
        "text": (
            "When customers open CORTEX AI, they step into our interactive Three-D Spatial Studio. "
            "Every piece is an accurate, one-to-one scale digital twin with physically based rendering. "
            "Shoppers can rotate and inspect materials from any angle, toggle studio lighting between daylight and warm evening, "
            "and click through live material swatches to customize fabrics and finishes in real time."
        ),
    },
    {
        "id": "part3_scanner",
        "text": (
            "With our fifteen-second room scanner, spatial intelligence takes over. "
            "Using live camera passthrough or video capture, Google Gemini analyzes room geometry, wall colors, and ambient lighting conditions. "
            "Shoppers can even speak naturally: 'Find a velvet sofa that fits this two-point-five meter wall', "
            "fusing multimodal vision and voice into an instant recommendation."
        ),
    },
    {
        "id": "part4_rulers_voice",
        "text": (
            "To eliminate measurement anxiety, built-in Three-D Dimension Rulers display real-time clearance hotspots for width, depth, and height. "
            "And with our conversational AI Quick-Query bar, customers can ask for pieces by style, clearance, or budget constraint. "
            "CORTEX AI filters the catalog and places the matching piece with zero latency."
        ),
    },
    {
        "id": "part5_placement_staging",
        "text": (
            "For architectural confidence, the Placement Blueprint overlays a holographic CAD clearance grid ensuring walking perimeters remain clear. "
            "And in AI Virtual Staging mode, Gemini generates a photorealistic perspective render of the room with calibrated shadows, "
            "letting customers visualize the finished interior before making a purchase."
        ),
    },
    {
        "id": "part6_checkout",
        "text": (
            "Finally, our seamless White-Glove checkout bridges the digital twin to the physical home. "
            "Customers configure in-room placement, elevator access, and delivery windows. "
            "The order generates a verified courier dispatch voucher synced to the customer's spatial blueprint. "
            "No sizing surprises, zero return friction."
        ),
    },
    {
        "id": "part7_outro",
        "text": (
            "CORTEX AI transforms online furniture retail from guesswork into an exact spatial science. "
            "A modern, one hundred percent production-ready platform, architected and built by Rohi56u. "
            "Thank you for watching."
        ),
    },
]

def get_audio_duration(file_path):
    cmd = [FFMPEG, "-i", file_path]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in result.stderr.splitlines():
        if "Duration:" in line:
            time_str = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = time_str.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 15.0

print("🎙️ Generating International-Standard English Audio Clips...")
durations = {}

for seg in VOICEOVER_SEGMENTS:
    seg_id = seg["id"]
    out_file = os.path.join(AUDIO_DIR, f"{seg_id}.mp3")
    tts = gTTS(text=seg["text"], lang="en", tld="com", slow=False)
    tts.save(out_file)
    dur = get_audio_duration(out_file)
    durations[seg_id] = dur
    print(f"✅ {seg_id}: {dur:.2f}s")

with open(os.path.join(AUDIO_DIR, "durations.json"), "w") as f:
    import json
    json.dump(durations, f, indent=2)

print("\n🎉 All English voiceover tracks generated and calibrated!")
