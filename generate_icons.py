import os
from PIL import Image

src_path = "/Users/metintuncgenc/Pictures/logo.png"
img = Image.open(src_path).convert("RGBA")
logo_scale = 0.80
adaptive_foreground_scale = 0.56


def fit_on_canvas(image, size, scale, background=(255, 255, 255, 0)):
    """Place the logo on a square canvas with visual padding."""
    canvas = Image.new("RGBA", (size, size), background)
    content_size = int(size * scale)
    content_img = image.resize((content_size, content_size), Image.Resampling.LANCZOS)
    offset = (size - content_size) // 2
    canvas.paste(content_img, (offset, offset), content_img)
    return canvas

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

# iOS icon sizes
ios_icons = {
    "Icon-App-20x20@1x.png": 20,
    "Icon-App-20x20@2x.png": 40,
    "Icon-App-20x20@3x.png": 60,
    "Icon-App-29x29@1x.png": 29,
    "Icon-App-29x29@2x.png": 58,
    "Icon-App-29x29@3x.png": 87,
    "Icon-App-40x40@1x.png": 40,
    "Icon-App-40x40@2x.png": 80,
    "Icon-App-40x40@3x.png": 120,
    "Icon-App-60x60@2x.png": 120,
    "Icon-App-60x60@3x.png": 180,
    "Icon-App-76x76@1x.png": 76,
    "Icon-App-76x76@2x.png": 152,
    "Icon-App-83.5x83.5@2x.png": 167,
    "Icon-App-1024x1024@1x.png": 1024
}

# Target directories
res_dir = "/Users/metintuncgenc/Documents/aramabul-android/android/app/src/main/res"
ios_dir = "/Users/metintuncgenc/Documents/aramabul-android/ios/Runner/Assets.xcassets/AppIcon.appiconset"

# Generate legacy icons
print("Generating legacy launcher icons (ic_launcher.png)...")
for density, size in legacy_sizes.items():
    out_dir = os.path.join(res_dir, f"mipmap-{density}")
    os.makedirs(out_dir, exist_ok=True)
    out_img = fit_on_canvas(img, size, logo_scale)
    out_img.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")
    print(f"  Saved mipmap-{density}/ic_launcher.png ({size}x{size})")

# Generate adaptive foreground icons with padding (safe zone)
print("Generating adaptive foreground launcher icons (ic_launcher_foreground.png)...")
for density, size in adaptive_sizes.items():
    out_dir = os.path.join(res_dir, f"mipmap-{density}")
    os.makedirs(out_dir, exist_ok=True)
    padded_img = fit_on_canvas(img, size, adaptive_foreground_scale)
    padded_img.save(os.path.join(out_dir, "ic_launcher_foreground.png"), "PNG")
    print(f"  Saved mipmap-{density}/ic_launcher_foreground.png ({size}x{size})")

# Generate iOS AppIcon images
print("Generating iOS AppIcons...")
os.makedirs(ios_dir, exist_ok=True)
for filename, size in ios_icons.items():
    out_img = fit_on_canvas(img, size, logo_scale, background=(255, 255, 255, 255))
    out_img.save(os.path.join(ios_dir, filename), "PNG")
    print(f"  Saved AppIcon.appiconset/{filename} ({size}x{size})")

# Generate ic_launcher-playstore.png in android/app/src/main/
print("Generating ic_launcher-playstore.png...")
playstore_logo_path = "/Users/metintuncgenc/Documents/aramabul-android/android/app/src/main/ic_launcher-playstore.png"
logo_playstore = fit_on_canvas(img, 512, logo_scale, background=(255, 255, 255, 255))
logo_playstore.save(playstore_logo_path, "PNG")
print(f"  Saved android/app/src/main/ic_launcher-playstore.png (512x512)")

print("All Android and iOS icons successfully generated!")
