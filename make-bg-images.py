import string, os
from PIL import Image, ImageFont, ImageDraw

for l in string.uppercase:
    img = Image.new("RGB", (1000,2000), "#aaaaff")
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("/usr/share/fonts/truetype/droid/DroidSans.ttf", 24)
    for y in range(0,2000,26):
        draw.text((0,y), l*100, fill="#9999ff", font=font)
    img.save("background-%s.jpg" % l.lower())