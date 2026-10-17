import os
import sys
import subprocess
import json
from gtts import gTTS

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_DIR = os.path.join(BASE_DIR, "video_production")
FFMPEG = os.path.join(BASE_DIR, "node_modules", "@ffmpeg-installer", "win32-x64", "ffmpeg.exe")

SCENES = [
    {
        "id": "01",
        "image": "01_problem_intro.png",
        "text": "Kya aapne kabhi online furniture order kiya hai aur delivery ke baad pata chala ki sofa room mein fit hi nahi aa raha? Flat photos se clearance ka andaza lagana impossible hota hai, jisse 38 percent orders return ho jate hain.",
        "lang": "hi",
        "title": "THE PROBLEM: 38% RETURNS IN E-COMMERCE"
    },
    {
        "id": "02",
        "image": "02_solution_reveal.png",
        "text": "Lekin ab is problem ka ultimate solution hai — CORTEX AI, yaani NeuroCommerce! Ye world ka pehla aisa Spatial E-Commerce platform hai jo Google Gemini aur WebXR ko fuse karke aapke room ko 15 seconds mein analyze karta hai.",
        "lang": "hi",
        "title": "INTRODUCING CORTEX AI SPATIAL ENGINE"
    },
    {
        "id": "03",
        "image": "03_live_3d_studio.png",
        "text": "Website kholte hi aapko milta hai interactive 3D Spatial Studio, jahan har furniture piece ka 1:1 scale digital twin 360 degree angle par rotate aur inspect kiya ja sakta hai.",
        "lang": "hi",
        "title": "FEATURE 1: 3D WEBXR SPATIAL STUDIO"
    },
    {
        "id": "04",
        "image": "04_room_scanner_modal.png",
        "text": "Bas Scan Room par tap karo! CORTEX AI camera passthrough aur sweeping laser scanner se aapke room ke dimensions, deewaron ke colors aur ambient lighting ko realtime mein detect kar leta hai.",
        "lang": "hi",
        "title": "FEATURE 2: 15-SEC MULTIMODAL GEMINI SCAN"
    },
    {
        "id": "05",
        "image": "05_material_swatches.png",
        "text": "Customization ke liye isme dynamic color swatches hain. Niche kisi bhi finish par click karte hi 3D model ka PBR material color instantly change ho jata hai.",
        "lang": "hi",
        "title": "FEATURE 3: REAL-TIME 3D COLOR SWATCHES"
    },
    {
        "id": "06",
        "image": "06_dimension_rulers_voice.png",
        "text": "Isme built-in 3D Dimension Rulers hain jo exact width, depth aur height hotspots dikhate hain. Saath hi AI Voice Bar se aap natural voice mein command de sakte ho, aur AI turant piece place kar deta hai.",
        "lang": "hi",
        "title": "FEATURE 4: 3D DIMENSION RULERS & VOICE AGENT"
    },
    {
        "id": "07",
        "image": "07_placement_hud.png",
        "text": "Placement Blueprint mode mein aapko holographic CAD layout milta hai jo walkway aur clearance guarantee karta hai, taaki furniture room mein bilkul perfect fit ho.",
        "lang": "hi",
        "title": "FEATURE 5: SPATIAL CLEARANCE BLUEPRINT HUD"
    },
    {
        "id": "08",
        "image": "08_ai_virtual_staging.png",
        "text": "AI Virtual Staging mode mein Gemini aapke room ko photorealistically stage kar deta hai, architectural floor grid aur contact shadows ke sath — taaki khareedne se pehle hi aap real look dekh sako!",
        "lang": "hi",
        "title": "FEATURE 6: AI VIRTUAL STAGING PREVIEW"
    },
    {
        "id": "09",
        "image": "09_white_glove_checkout.png",
        "text": "Aur checkout par milta hai White-Glove In-Room Delivery! Room placement aur floor instructions configure karo aur direct confirmed courier dispatch receipt pao.",
        "lang": "hi",
        "title": "FEATURE 7: WHITE-GLOVE CHECKOUT & RECEIPT"
    },
    {
        "id": "10",
        "image": "10_outro_credits.png",
        "text": "CORTEX AI — The Future of Spatial Commerce. Developed by Rohi56u. A modern, 100 percent production ready platform. Thank you for watching!",
        "lang": "en",
        "title": "CORTEX AI • DEVELOPED BY ROHI56U"
    }
]

def get_audio_duration(file_path):
    cmd = [
        FFMPEG, "-i", file_path
    ]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in result.stderr.splitlines():
        if "Duration:" in line:
            time_str = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = time_str.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 8.0

def main():
    print("🎬 Starting CORTEX AI Video Production Pipeline...")
    os.makedirs(VIDEO_DIR, exist_ok=True)
    
    segment_files = []

    for idx, scene in enumerate(SCENES, 1):
        scene_id = scene["id"]
        img_name = scene["image"]
        img_path = os.path.join(VIDEO_DIR, img_name)
        audio_path = os.path.join(VIDEO_DIR, f"audio_{scene_id}.mp3")
        segment_path = os.path.join(VIDEO_DIR, f"segment_{scene_id}.mp4")

        # Fallback if specific capture file missing
        if not os.path.exists(img_path):
            img_path = os.path.join(VIDEO_DIR, "03_live_3d_studio.png")

        print(f"\n🎙️ [Scene {idx}/{len(SCENES)}] Generating natural voiceover: {scene['title']}...")
        if not os.path.exists(audio_path):
            tts = gTTS(text=scene["text"], lang=scene["lang"], slow=False)
            tts.save(audio_path)

        duration = get_audio_duration(audio_path) + 1.2 # extra breathing room
        print(f"⏱️ Audio duration: {duration:.2f}s")

        print(f"🎞️ Compiling segment {scene_id} at 1920x1080...")
        # Smooth Ken Burns slow zoom (zoompan filter) with audio sync
        zoom_filter = (
            f"scale=1920:1080:force_original_aspect_ratio=decrease,"
            f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2,"
            f"zoompan=z='min(zoom+0.0006,1.05)':d={int(duration*30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30"
        )

        cmd = [
            FFMPEG, "-y",
            "-loop", "1",
            "-i", img_path,
            "-i", audio_path,
            "-vf", zoom_filter,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-t", str(duration),
            "-shortest",
            segment_path
        ]

        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        segment_files.append(segment_path)
        print(f"✅ Segment {scene_id} generated successfully!")

    # Combine all segments into final MP4 video
    concat_txt_path = os.path.join(VIDEO_DIR, "concat_list.txt")
    with open(concat_txt_path, "w", encoding="utf-8") as f:
        for seg in segment_files:
            norm_path = seg.replace("\\", "/")
            f.write(f"file '{norm_path}'\n")

    final_output = os.path.join(VIDEO_DIR, "cortex_ai_showcase_video.mp4")
    print(f"\n🚀 Merging all segments into final video: {final_output}...")
    concat_cmd = [
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt_path,
        "-c", "copy",
        final_output
    ]
    subprocess.run(concat_cmd, check=True)
    
    file_size_mb = os.path.getsize(final_output) / (1024 * 1024)
    total_dur = get_audio_duration(final_output)
    print(f"\n🎉 VIDEO PRODUCTION COMPLETE!")
    print(f"📍 Output file: {final_output}")
    print(f"📦 Size: {file_size_mb:.2f} MB")
    print(f"⏱️ Total Length: {total_dur:.1f} seconds (~{total_dur/60:.1f} minutes)")

if __name__ == "__main__":
    main()
