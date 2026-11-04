import {
  PDFDocument,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  moveTo,
  lineTo,
  appendBezierCurve,
  closePath,
  clip,
  endPath,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  reportValues,
  pagePlacement,
  layoutText,
  fitImage,
} from "./report-template.js";

export async function generateReportPdf(records, loadResource) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle("SRPS Progress Report");
  const resources = new Map(),
    fonts = new Map(),
    images = new Map();
  const load = async (url, hash) => {
    const key = url + ":" + (hash || "");
    if (!resources.has(key))
      resources.set(key, Promise.resolve(loadResource(url, hash)));
    return resources.get(key);
  };
  const image = async (url, hash) => {
    const key = url + ":" + (hash || "");
    if (!images.has(key))
      images.set(
        key,
        (async () => {
          const bytes = await load(url, hash);
          return bytes[0] === 137 ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
        })(),
      );
    return images.get(key);
  };
  for (const { student, report, config, user, mapping } of records) {
    const values = reportValues(student, report, config, user);
    for (const f of Object.values(mapping.fonts))
      if (!fonts.has(f.file)) {
        const bytes = await load(f.file, f.sha256);
        fonts.set(f.file, {
          metrics: fontkit.create(bytes),
          pdf: await pdf.embedFont(bytes, {
            subset: true,
            features: { kern: false },
          }),
        });
      }
    for (const side of ["front", "back"]) {
      const spec = mapping.pages[side],
        policy = mapping.policy,
        place = pagePlacement(mapping, side);
      const page = pdf.addPage([policy.width, policy.height]);
      const px = (x) => place.x + x * place.scale,
        py = (y) => policy.height - place.y - y * place.scale;
      const bg = await image(spec.artwork, spec.sha256);
      page.drawImage(bg, {
        x: place.x,
        y: py(spec.height),
        width: spec.width * place.scale,
        height: spec.height * place.scale,
      });
      for (const f of spec.fields) {
        const value = values[f.id];
        if (f.type === "text") {
          const font = fonts.get(mapping.fonts[f.font].file);
          for (const line of layoutText(f, value, font.metrics))
            page.drawText(line.text, {
              x: px(line.x),
              y: py(line.y),
              size: line.size * place.scale,
              font: font.pdf,
              color: rgb(
                ...f.colour
                  .slice(1)
                  .match(/../g)
                  .map((x) => parseInt(x, 16) / 255),
              ),
            });
        } else if (value) {
          const img = await image(value),
            box = fitImage(f, img.width, img.height);
          page.pushOperators(pushGraphicsState());
          if (f.clip) {
            for (const [op, ...v] of f.clip) {
              const coords = v.map((n, i) =>
                i % 2 ? py(f.y + n * f.height) : px(f.x + n * f.width),
              );
              page.pushOperators(
                op === "M"
                  ? moveTo(...coords)
                  : op === "L"
                    ? lineTo(...coords)
                    : op === "C"
                      ? appendBezierCurve(...coords)
                      : closePath(),
              );
            }
            page.pushOperators(clip(), endPath());
          }
          page.drawImage(img, {
            x: px(box.x),
            y: py(box.y + box.height),
            width: box.width * place.scale,
            height: box.height * place.scale,
          });
          page.pushOperators(popGraphicsState());
        }
      }
      if (report.status !== "published")
        page.drawText(`${report.status.toUpperCase()} - NOT PUBLISHED`, {
          x: 16,
          y: 3,
          size: 7,
          font: fonts.values().next().value.pdf,
          color: rgb(0.4, 0.4, 0.4),
        });
    }
  }
  return pdf.save();
}
