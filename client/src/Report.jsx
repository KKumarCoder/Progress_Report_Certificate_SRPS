import React, { useEffect, useId, useState } from "react";
import fontkit from "@pdf-lib/fontkit";
import Loader from "./Loader";
import defaultMapping from "../../shared/template-mapping.json";
import {
  reportValues,
  pagePlacement,
  layoutText,
  clipPath,
  scholasticHeaderOverlays,
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
    return (
      <div className="template-loading">
        <Loader size={80} text="Loading report fonts…" />
      </div>
    );
  const pageKey = mapping.pages[side] ? side : Object.keys(mapping.pages)[0] || "front";
  const page = mapping.pages[pageKey],
    place = pagePlacement(mapping, pageKey);
  let values, elements;
  try {
    values = reportValues(student, report, config, user);
    elements = page.fields.map((f) => {
      if (f.type === "text") {
        const fontKey =
          f.id === "remarks" &&
          config?.handwritingFont &&
          mapping.fonts[config.handwritingFont]
            ? config.handwritingFont
            : f.font;
        const fontDef = mapping.fonts[fontKey] || mapping.fonts[f.font];
        const fontMetrics = fonts[fontKey] || fonts[f.font];
        return (
          <g key={f.id} data-field={f.id}>
            {layoutText(f, values[f.id], fontMetrics).map((line, i) => (
              <text
                key={i}
                x={line.x}
                y={line.y}
                fontFamily={fontDef.family}
                fontSize={line.size}
                fill={f.colour}
                transform={
                  typeof f.rotate === "number"
                    ? `rotate(${f.rotate}, ${line.x}, ${line.y})`
                    : undefined
                }
                style={{ fontKerning: "none", fontVariantLigatures: "none" }}
              >
                {line.text}
              </text>
            ))}
          </g>
        );
      }
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
          {pageKey === "front" &&
            scholasticHeaderOverlays(config).map((cell) => {
              const cx = cell.x + cell.width / 2;
              const cy = cell.y + cell.height / 2;
              return (
                <g key={cell.id} data-header={cell.id}>
                  <rect
                    x={cell.x}
                    y={cell.y}
                    width={cell.width}
                    height={cell.height}
                    fill="#073d5a"
                  />
                  <text
                    x={cx}
                    y={cy - 3}
                    textAnchor="middle"
                    fontFamily={mapping.fonts["700"]?.family || "sans-serif"}
                    fontSize={cell.fontSize}
                    fill="#ffffff"
                  >
                    {cell.line1}
                  </text>
                  <text
                    x={cx}
                    y={cy + cell.fontSize - 1}
                    textAnchor="middle"
                    fontFamily={mapping.fonts["700"]?.family || "sans-serif"}
                    fontSize={cell.fontSize}
                    fill="#ffffff"
                  >
                    {cell.line2}
                  </text>
                </g>
              );
            })}
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
                x={875}
                y={1335}
                width={68}
                height={68}
                preserveAspectRatio="xMidYMid meet"
              />
              <text
                x={875}
                y={1412}
                fontFamily={mapping.fonts["400"]?.family || "sans-serif"}
                fontSize="9"
                fill="#666"
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
