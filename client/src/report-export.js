import { isDemo, saveBlob } from "./api";
import mapping from "../../shared/template-mapping.json";
import { loadTemplateFonts } from "./Report";
export async function exportReportPdf(records, filename, bulk = false) {
  if (
    records.some(
      (r) => r.report.status === "published" && !r.report.templateSnapshot,
    )
  )
    throw new Error(
      "This batch contains legacy reports. Use Print / Save PDF to retain their original layout.",
    );
  let bytes;
  if (isDemo()) {
    const { generateReportPdf } = await import("../../shared/report-pdf.js");
    bytes = await generateReportPdf(
      records.map((r) => ({
        ...r,
        mapping:
          r.report.status === "published" ? r.report.templateSnapshot : mapping,
      })),
      async (url) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Cannot load ${url}`);
        return new Uint8Array(await r.arrayBuffer());
      },
    );
  } else {
    const first = records[0];
    const response = await fetch(
      bulk
        ? "/api/report-pdf/bulk"
        : `/api/report-pdf/${first.student._id}/${first.report.session}`,
      {
        method: bulk ? "POST" : "GET",
        credentials: "same-origin",
        headers: { "X-SRPS-Request": "1", "Content-Type": "application/json" },
        ...(bulk
          ? {
              body: JSON.stringify({
                studentIds: records.map((r) => r.student._id),
                session: first.report.session,
              }),
            }
          : {}),
      },
    );
    if (!response.ok) {
      const e = await response.json();
      throw new Error(e.error || e.message || "PDF export failed");
    }
    bytes = await response.arrayBuffer();
  }
  saveBlob(new Blob([bytes], { type: "application/pdf" }), filename);
}
export async function printReports() {
  await loadTemplateFonts(mapping);
  await document.fonts.ready;
  // Hidden print pages must have completed layout before invoking the browser.
  if (document.querySelector("#print-area .template-loading"))
    throw new Error("Report is still loading. Try printing again.");
  const problem = document.querySelector("#print-area .template-error");
  if (problem) throw new Error(problem.textContent);
  const urls = [...document.querySelectorAll("#print-area image")].map((el) =>
    el.getAttribute("href"),
  );
  await Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () =>
            reject(new Error("A report image could not load"));
          img.src = url;
        }),
    ),
  );
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  window.print();
}
