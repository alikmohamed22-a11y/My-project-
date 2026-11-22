# QA stills sheet at real timing: frame 0, last frame and 10 spread frames from the rendered frame dir -> scratchpad/qa_d9.jpg
import sys, os
from PIL import Image, ImageDraw
d = sys.argv[1]; OUT = '/tmp/claude-0/-home-user-My-project-/5013cad0-c1cd-5679-af03-9cd8e9e7d838/scratchpad/qa_d9.jpg'
fs = [0, 60, 120, 240, 262, 330, 385, 488, 540, 625, 660, 720, 775, 800, 845, 910]
cols = 8; tw, th = 270, 480; rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * (th + 26)), 'white'); D = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(f'{d}/f{f:04d}.jpg').resize((tw, th), Image.LANCZOS); x, y = (i % cols) * tw, (i // cols) * (th + 26)
    S.paste(im, (x, y + 26)); D.text((x + 6, y + 6), f'f{f}  {f/30:.2f}s', fill='black')
S.save(OUT, quality=88); print(OUT)
