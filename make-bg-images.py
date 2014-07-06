import string, os
from PIL import Image, ImageFont, ImageDraw

for l in string.uppercase:
    existing = os.path.join(os.path.split(__file__)[0], "coreimages", "%s.jpg" % l.lower())
    if os.path.exists(existing):
        print "not creating %s because it exists" % existing
    else:
        # draw temporary image
        img = Image.new("RGB", (1000,2000), "#aaaaff")
        draw = ImageDraw.Draw(img)
        font = ImageFont.truetype("/usr/share/fonts/truetype/droid/DroidSans.ttf", 84)
        for y in range(0,2000,86):
            draw.text((0,y), l*100, fill="#9999ff", font=font)
        img.save("thisimage.jpg")
        existing = "thisimage.jpg"
    # Now convert them all
    dest = os.path.join(os.path.split(__file__)[0], "www-core", "bgimages", "bg-%s-%s.jpg")
    for number_answered in [5,4,3,2,1,0]:
        blur = number_answered * 10
        destimg = dest % (l.lower(), number_answered)
        if number_answered == 0:
            cmd = "cp %s %s" % (existing, destimg)
        else:
            cmd = "convert %s -blur 0x%s %s" % (existing, blur, destimg)
        print cmd
        os.system(cmd)
    if os.path.exists("thisimage.jpg"):
        os.remove("thisimage.jpg")
