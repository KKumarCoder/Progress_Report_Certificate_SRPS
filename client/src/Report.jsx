import React, { useEffect, useId, useState } from "react";
import fontkit from "@pdf-lib/fontkit";
import defaultMapping from "../../shared/template-mapping.json";
import {
  reportValues,
  pagePlacement,
  layoutText,
  clipPath,
} from "../../shared/report-template.js";
import LegacyReport from "./LegacyReport";
export { Shield } from "./LegacyReport";
const fontsCache = new Map();
export async function loadTemplateFonts(mapping) {
  const entries = await Promise.all(
    Object.entries(mapping.fonts).map(async ([id, f]) => {
      if (!fontsCache.has(f.file))
        fontsCache.set(
          f.file,
          (async () => {
            const response = await fetch(f.file);
            if (!response.ok) throw new Error(`Font unavailable: ${f.file}`);
            const bytes = await response.arrayBuffer();
            const font = new FontFace(f.family, bytes);
            await font.load();
            document.fonts.add(font);
            return fontkit.create(new Uint8Array(bytes));
          })(),
        );
      return [id, await fontsCache.get(f.file)];
    }),
  );
  return Object.fromEntries(entries);
}
export default function ReportPage(props) {
  const {
    side = "front",
    student,
    report,
    config,
    user,
    id,
    calibration,
    onSelect,
    selected,
    mapping: override,
  } = props;
  const mapping =
    report.status === "published"
      ? report.templateSnapshot
      : override || defaultMapping;
  const [fonts, setFonts] = useState(null),
    [error, setError] = useState(""),
    [qrDataUrl, setQrDataUrl] = useState("");
  const vUrl = props.verificationUrl || report.verificationUrl;
  useEffect(() => {
    let active = true;
    if (report.status === "published" && vUrl) {
      import("qrcode")
        .then((m) => m.default || m)
        .then((QRCode) => QRCode.toDataURL(vUrl, { width: 180, margin: 1 }))
        .then((url) => {
          if (active) setQrDataUrl(url);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [report.status, vUrl]);
  const uid = useId().replaceAll(":", "");
  useEffect(() => {
    let active = true;
    setFonts(null);
    setError("");
    if (mapping)
      loadTemplateFonts(mapping)
        .then((f) => {
          if (active) setFonts(f);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [mapping]);
  if (!mapping) return <LegacyReport {...props} />;
  if (error)
    return (
      <div role="alert" className="template-error">
        {error}
      </div>
    );
  if (!fonts)
    return <div className="template-loading">Loading report fonts…</div>;
  const page = mapping.pages[side],
    place = pagePlacement(mapping, side);
  let values, elements;
  try {
    values = reportValues(student, report, config, user);
    elements = page.fields.map((f) => {
      if (f.type === "text")
        return (
          <g key={f.id} data-field={f.id}>
            {layoutText(f, values[f.id], fonts[f.font]).map((line, i) => (
              <text
                key={i}
                x={line.x}
                y={line.y}
                fontFamily={mapping.fonts[f.font].family}
                fontSize={line.size}
                fill={f.colour}
                style={{ fontKerning: "none", fontVariantLigatures: "none" }}
              >
                {line.text}
              </text>
            ))}
          </g>
        );
      return values[f.id] ? (
        <g key={f.id} data-field={f.id}>
          {f.clip && (
            <defs>
              <clipPath id={uid + f.id}>
                <path d={clipPath(f)} />
              </clipPath>
            </defs>
          )}
          <image
            href={values[f.id]}
            x={f.x}
            y={f.y}
            width={f.width}
            height={f.height}
            preserveAspectRatio={
              f.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"
            }
            clipPath={f.clip ? `url(#${uid + f.id})` : undefined}
          />
        </g>
      ) : null;
    });
  } catch (e) {
    return (
      <div role="alert" className="template-error">
        {e.message}
      </div>
    );
  }
  return (
    <article
      id={id}
      className="artwork-report"
      data-report-page
      data-template-version={mapping.templateVersion}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${mapping.policy.width} ${mapping.policy.height}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={`${side} progress report`}
      >
        <svg
          x={place.x}
          y={place.y}
          width={page.width * place.scale}
          height={page.height * place.scale}
          viewBox={`0 0 ${page.width} ${page.height}`}
        >
          <image
            href={page.artwork}
            width={page.width}
            height={page.height}
            preserveAspectRatio="xMidYMid meet"
          />
          {elements}
          {calibration &&
            user?.role === "admin" &&
            report.status !== "published" &&
            page.fields.map((f) => (
              <g
                key={f.id}
                onClick={() => onSelect(f.id)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={f.x}
                  y={f.y}
                  width={f.width}
                  height={f.height}
                  fill={selected === f.id ? "#ffb70033" : "transparent"}
                  stroke={selected === f.id ? "#cc4400" : "#d000cc"}
                  strokeWidth="1.5"
                />
                <text x={f.x} y={f.y - 2} fontSize="10" fill="#a00099">
                  {f.id}
                </text>
              </g>
            ))}
          {report.status === "published" && qrDataUrl && (
            <g data-field="qrVerification">
              <image
                href={qrDataUrl}
                x={side === "front" ? 486 : 468}
                y={side === "front" ? 1276 : 1362}
                width={side === "front" ? 76 : 82}
                height={side === "front" ? 76 : 82}
                preserveAspectRatio="xMidYMid meet"
              />
              <text
                x={(side === "front" ? 486 : 468) + 6}
                y={
                  (side === "front" ? 1276 : 1362) +
                  (side === "front" ? 76 : 82) +
                  12
                }
                fontFamily={mapping.fonts["400"]?.family || "sans-serif"}
                fontSize="11"
                fill="#444"
              >
                Scan to verify
              </text>
            </g>
          )}
        </svg>
        {report.status !== "published" && (
          <text
            x="16"
            y={mapping.policy.height - 3}
            fontFamily={mapping.fonts["400"].family}
            fontSize="7"
            fill="#666"
          >
            {report.status.toUpperCase()} - NOT PUBLISHED
          </text>
        )}
      </svg>
    </article>
  );
}
