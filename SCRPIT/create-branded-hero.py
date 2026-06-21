from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
hero_path = ROOT / "ASSETS" / "images" / "hero.jpg"
logo_path = ROOT / "ASSETS" / "logo" / "logo.png"
out_path = ROOT / "ASSETS" / "images" / "hero-ae-connect-branded.jpg"

hero = Image.open(hero_path).convert("RGBA")
logo = Image.open(logo_path).convert("RGBA")

# Remove the logo's white box so it looks like a real wall sign.
pixels = logo.getdata()
transparent = []
for r, g, b, a in pixels:
    if r > 235 and g > 235 and b > 235:
        transparent.append((255, 255, 255, 0))
    else:
        transparent.append((r, g, b, a))
logo.putdata(transparent)

hero_w, hero_h = hero.size
logo_w = int(hero_w * 0.16)
logo_h = int(logo_w * logo.height / logo.width)
logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

sign_pad = int(logo_w * 0.12)
sign_w = logo_w + sign_pad * 2
sign_h = logo_h + sign_pad * 2

sign = Image.new("RGBA", (sign_w, sign_h), (255, 248, 238, 196))
mask = Image.new("L", (sign_w, sign_h), 0)
mask_draw = Image.new("RGBA", (sign_w, sign_h), (255, 255, 255, 0))

# Rounded background without requiring ImageDraw rounded_rectangle fallback.
from PIL import ImageDraw
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle((0, 0, sign_w - 1, sign_h - 1), radius=28, fill=255)
sign.putalpha(mask)

shadow = Image.new("RGBA", (sign_w + 60, sign_h + 60), (0, 0, 0, 0))
shadow_mask = Image.new("L", (sign_w, sign_h), 0)
shadow_draw = ImageDraw.Draw(shadow_mask)
shadow_draw.rounded_rectangle((0, 0, sign_w - 1, sign_h - 1), radius=28, fill=155)
shadow.paste((7, 27, 51, 95), (30, 30), shadow_mask)
shadow = shadow.filter(ImageFilter.GaussianBlur(18))

sign.paste(logo, (sign_pad, sign_pad), logo)

# Place the sign on the bright wall behind the students, high enough to read as background branding.
x = int(hero_w * 0.42)
y = int(hero_h * 0.035)
hero.alpha_composite(shadow, (x - 30, y - 30))
hero.alpha_composite(sign, (x, y))

# Add a subtle warm wall reflection so the sign blends into the existing scene.
overlay = Image.new("RGBA", hero.size, (255, 214, 160, 0))
overlay_draw = ImageDraw.Draw(overlay)
overlay_draw.ellipse(
    (x - 80, y - 60, x + sign_w + 120, y + sign_h + 120),
    fill=(255, 214, 160, 22),
)
hero = Image.alpha_composite(hero, overlay)

hero.convert("RGB").save(out_path, quality=94, optimize=True)
print(out_path)
