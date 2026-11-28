import {
  PDFDocument,
  rgb,
  degrees,
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
  scholasticHeaderOverlays,
} from "./report-template.js";

async function generateQrPngBytes(text) {
  if (typeof window === "undefined") {
    const QRCode = (await import("qrcode")).default || (await import("qrcode"));
    return await QRCode.toBuffer(text, { type: "png", width: 180, margin: 1 });
  } else {
    const QRCode = (await import("qrcode")).default || (await import("qrcode"));
    const dataUrl = await QRCode.toDataURL(text, { width: 180, margin: 1 });
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}

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
  for (const record of records) {
    const { student, report, config, user, mapping, verificationUrl } = record;
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
    for (const side of Object.keys(mapping.pages)) {
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
      if (side === "front") {
        const hdrFont = fonts.get(mapping.fonts["700"].file);
        const bgCol = rgb(7 / 255, 61 / 255, 90 / 255);
        const txtCol = rgb(1, 1, 1);
        for (const cell of scholasticHeaderOverlays(config)) {
          page.drawRectangle({
            x: px(cell.x),
            y: py(cell.y + cell.height),
            width: cell.width * place.scale,
            height: cell.height * place.scale,
            color: bgCol,
          });
          const fSize = cell.fontSize * place.scale;
          const cy = cell.y + cell.height / 2;
          const w1 = hdrFont.pdf.widthOfTextAtSize(cell.line1, fSize);
          const w2 = hdrFont.pdf.widthOfTextAtSize(cell.line2, fSize);
          const cx = px(cell.x + cell.width / 2);
          page.drawText(cell.line1, {
            x: cx - w1 / 2,
            y: py(cy - 3),
            size: fSize,
            font: hdrFont.pdf,
            color: txtCol,
          });
          page.drawText(cell.line2, {
            x: cx - w2 / 2,
            y: py(cy + cell.fontSize - 1),
            size: fSize,
            font: hdrFont.pdf,
            color: txtCol,
          });
        }
      }
      for (const f of spec.fields) {
        const value = values[f.id];
        if (f.type === "text") {
          const fontKey =
            f.id === "remarks" &&
            config?.handwritingFont &&
            mapping.fonts[config.handwritingFont]
              ? config.handwritingFont
              : f.font;
          const font = fonts.get(mapping.fonts[fontKey].file);
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
              ...(typeof f.rotate === "number" ? { rotate: degrees(f.rotate) } : {}),
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
      const vUrl = verificationUrl || report.verificationUrl;
      if (vUrl && report.status === "published") {
        try {
          const qrBytes = await generateQrPngBytes(vUrl);
          const qrImg = await pdf.embedPng(qrBytes);
          const qrSize = 68 * place.scale;
          const qrX = px(875);
          const qrY = py(1335 + 68);
          page.drawImage(qrImg, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });
          const font = fonts.values().next().value.pdf;
          page.drawText("Scan to verify", {
            x: qrX + 5 * place.scale,
            y: qrY - 8 * place.scale,
            size: 6.5 * place.scale,
            font,
            color: rgb(0.25, 0.25, 0.25),
          });
        } catch (e) {
          console.error("QR code embedding failed:", e.message);
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
