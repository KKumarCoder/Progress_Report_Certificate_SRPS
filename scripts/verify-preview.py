"""Compare the browser SVG preview with PDF rasterization at matching A4 size."""
from pathlib import Path
import fitz
from PIL import Image, ImageChops, ImageStat
root=Path(__file__).resolve().parents[1]/'output/pdf'
doc=fitz.open(root/'srps-sample.pdf')
for n,side in enumerate(['front','back']):
 preview=Image.open(root/f'preview-{side}.png').convert('RGB')
 page=doc[n]
 # Both surfaces contain the same proportional A4 fit. Only raster grids differ.
 scale=min(794/page.rect.width,1123/page.rect.height)
 pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False)
 pdf=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
 canvas=Image.new('RGB',preview.size,'white');canvas.paste(pdf,(0,0))
 diff=ImageChops.difference(preview,canvas)
 diff.save(root/f'preview-pdf-difference-{side}.png')
 print(side,'mean channel difference / 255:',round(sum(ImageStat.Stat(diff).mean)/3,3))
 # Different rasterizers/rounding cause edge differences; large deviations fail.
 assert sum(ImageStat.Stat(diff).mean)/3 < 12, 'Preview/PDF visual parity needs review'
