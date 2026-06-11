import os
from PIL import Image

src_path = "/Users/metintuncgenc/.gemini/antigravity/brain/4e9b3513-fd20-4dc0-8f03-550fecfefc34/app_logo_two_full_1781002366389.png"
img = Image.open(src_path)

# Legacy launcher icon sizes
legacy_sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192
}

# Adaptive foreground icon sizes
adaptive_sizes = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432
}

# Target directory
res_dir = "/Users/metintuncgenc/Documents/aramabul-android/android/app/src/main/res"

# Generate legacy icons
print("Generating legacy launcher icons (ic_launcher.png)...")
for density, size in legacy_sizes.items():
    out_dir = os.path.join(res_dir, f"mipmap-{density}")
    os.makedirs(out_dir, exist_ok=True)
    out_img = img.resize((size, size), Image.Resampling.LANCZOS)
    out_img.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")
    print(f"  Saved mipmap-{density}/ic_launcher.png ({size}x{size})")

# Generate adaptive foreground icons with padding (safe zone)
print("Generating adaptive foreground launcher icons (ic_launcher_foreground.png)...")
for density, size in adaptive_sizes.items():
    out_dir = os.path.join(res_dir, f"mipmap-{density}")
    os.makedirs(out_dir, exist_ok=True)
    # Scale center content to 70% of total size to keep it within the adaptive safe zone
    content_size = int(size * 0.70)
    content_img = img.resize((content_size, content_size), Image.Resampling.LANCZOS)
    # Create padded background image of full size using white color (255, 255, 255)
    padded_img = Image.new("RGB", (size, size), (255, 255, 255))
    # Paste centered
    offset = (size - content_size) // 2
    padded_img.paste(content_img, (offset, offset))
    padded_img.save(os.path.join(out_dir, "ic_launcher_foreground.png"), "PNG")
    print(f"  Saved mipmap-{density}/ic_launcher_foreground.png ({size}x{size})")

# Also generate logoNew.png in assets/ (used for splash loader screen in Flutter)
print("Generating logoNew.png...")
assets_logo_path = "/Users/metintuncgenc/Documents/aramabul-android/assets/logoNew.png"
logo_new = img.resize((512, 512), Image.Resampling.LANCZOS)
logo_new.save(assets_logo_path, "PNG")
print(f"  Saved assets/logoNew.png (512x512)")

# And ic_launcher-playstore.png in android/app/src/main/
print("Generating ic_launcher-playstore.png...")
playstore_logo_path = "/Users/metintuncgenc/Documents/aramabul-android/android/app/src/main/ic_launcher-playstore.png"
logo_playstore = img.resize((512, 512), Image.Resampling.LANCZOS)
logo_playstore.save(playstore_logo_path, "PNG")
print(f"  Saved android/app/src/main/ic_launcher-playstore.png (512x512)")

print("All icons successfully generated and saved as PNG!")
