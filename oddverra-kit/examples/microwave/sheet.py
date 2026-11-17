import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(d + '/f*.jpg')); n = len(fs); cols = 6 if n > 12 else 4; rows = (n + cols - 1) // cols
tw, th = 270, 480; S = Image.new('RGB', (cols * tw, rows * (th + 24)), 'white'); D = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(f).resize((tw, th)); x, y = (i % cols) * tw, (i // cols) * (th + 24); S.paste(im, (x, y + 24)); D.text((x + 6, y + 6), os.path.basename(f)[1:-4], fill='black')
S.save(out, quality=88)
