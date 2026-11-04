"""Render the sample PDF and compare it to the supplied filled references."""
import json
from pathlib import Path
import fitz
from PIL import Image,ImageChops,ImageEnhance
root=Path(__file__).resolve().parents[1]
out=root/'output/pdf'
m=json.loads((root/'shared/template-mapping.json').read_text())
doc=fitz.open(out/'srps-sample.pdf')
for n,side in enumerate(['front','back']):
 spec=m['pages'][side];p=m['policy'];scale=min((p['width']-2*p['margin'])/spec['width'],(p['height']-2*p['margin'])/spec['height']);x=(p['width']-spec['width']*scale)/2;y=(p['height']-spec['height']*scale)/2
 pix=doc[n].get_pixmap(matrix=fitz.Matrix(1/scale,1/scale),clip=fitz.Rect(x,y,x+spec['width']*scale,y+spec['height']*scale),alpha=False)
 image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples).crop((0,0,spec['width'],spec['height']))
 image.save(out/f'generated-{side}.png')
 ref=Image.open(root/f'client/public/reference-{side}.png').convert('RGB')
 assert ref.size==image.size,(side,ref.size,image.size)
 Image.blend(ref,image,.5).save(out/f'overlay-{side}.png')
 ImageEnhance.Contrast(ImageChops.difference(ref,image)).enhance(3).save(out/f'difference-{side}.png')
 print(side,doc[n].rect,'selectable characters:',len(doc[n].get_text()))
html='''<!doctype html><meta charset="utf-8"><title>SRPS template comparison</title><style>body{font:16px system-ui;max-width:1100px;margin:24px auto;background:#eee}img{width:100%;display:block}.pair{position:relative}.pair img+img{position:absolute;inset:0}section{margin:30px 0}details{margin:20px 0}</style><h1>SRPS template comparison</h1><p>The approved blanks are unchanged. Fonts are an approximation. Reference differences include contact/affiliation details, table positions, signatures, class/section and the corrected Social Science total. Differences are not solely alignment errors. No pixel-identical match is claimed.</p>'''
for side in ['front','back']:
 # Comparison source copied solely to the QA output directory.
 ref=Image.open(root/f'client/public/reference-{side}.png');ref.save(out/f'reference-{side}.png')
 html+=f'''<section><h2>{side.title()}</h2><label>Generated opacity <input type="range" min="0" max="1" step="0.01" value="0.5" oninput="document.getElementById('{side}').style.opacity=this.value"></label><div class="pair"><img src="reference-{side}.png"><img id="{side}" src="generated-{side}.png" style="opacity:.5"></div><details><summary>Difference image (3× contrast)</summary><img src="difference-{side}.png"></details></section>'''
(out/'comparison.html').write_text(html)
