import React from "react";
import * as Icons from "lucide-react";
import { calculate, grade } from "../../shared/engine.js";
const Icon = ({ name, ...props }) => {
  const C = Icons[name] || Icons.BookOpen;
  return <C {...props} />;
};
export function Shield({ children, className = "" }) {
  return (
    <div className={"shield " + className}>
      <div className="shield-inner">{children}</div>
    </div>
  );
}
function Watermark() {
  return (
    <svg className="watermark" viewBox="0 0 400 520" aria-hidden="true">
      <path
        d="M193 30C190 165 17 224 178 337C65 199 179 188 193 30ZM215 70C344 202 135 267 211 337C119 290 197 194 215 70ZM271 165C370 276 289 325 229 337C190 294 278 251 271 165Z"
        fill="currentColor"
      />
      <path
        d="M40 365Q120 336 200 378Q282 336 360 365L372 453Q281 425 200 468Q120 425 28 453Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
      <path
        d="M200 378V468M43 424Q120 399 194 439M207 439Q285 398 355 424"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
      />
    </svg>
  );
}
function Header({ config, back = false }) {
  return (
    <>
      <div className="report-contact">
        <span>
          <Icons.Phone size={15} />
          {config.phone}
          <br />
          {config.phone2}
        </span>
        <img
          className="report-logo"
          src={config.logo || "/school-logo.jpg"}
          alt="School crest"
        />
        <span>
          <Icons.Globe size={15} />
          {config.website}
          <br />
          <Icons.Mail size={15} />
          {config.email}
        </span>
      </div>
      <h1>{config.schoolName}</h1>
      <h3>{config.address}</h3>
      <div className="affiliation">CBSE AFFILIATED SCHOOL</div>
      {!back && (
        <p className="affiliation-small">
          (Recognised &amp; Affiliated to C.B.S.E., New Delhi vide Affiliation
          No. {config.affiliation})
        </p>
      )}
    </>
  );
}
function Signatures({ report, config, user }) {
  const own = user?.role === "teacher" ? user.signature : "";
  return (
    <div className="report-signatures">
      <div>
        {report.teacherSignature || own ? (
          <img
            src={report.teacherSignature || own}
            alt="Class teacher signature"
          />
        ) : (
          <div className="signature-placeholder" />
        )}
        <span>Class Teacher</span>
      </div>
      <div className="medal">
        <span>★</span>
        <i />
      </div>
      <div>
        {config.principalSignature ? (
          <img src={config.principalSignature} alt="Principal signature" />
        ) : (
          <div className="signature-placeholder" />
        )}
        <span>Principal</span>
      </div>
    </div>
  );
}
export default function ReportPage({
  side = "front",
  student,
  report,
  config,
  user,
  id,
}) {
  const calc = calculate(report.marks, config),
    s =
      report.status === "published" && report.studentSnapshot
        ? report.studentSnapshot
        : student;
  return (
    <article id={id} className={"report-page " + side} data-report-page>
      <div className="top-sweep" />
      <div className="bottom-sweep" />
      <div className="report-inner">
        <Header config={config} back={side === "back"} />
        {side === "front" ? (
          <>
            <div className="flourish">❧</div>
            <h2 className="progress-title">Progress Report</h2>
            <div className="session-ribbon">
              ◆ &nbsp; SESSION: {report.session} &nbsp; ◆
            </div>
            <div className="student-block">
              <Watermark />
              <div className="student-lines">
                <div className="info-row">
                  <Icon name="GraduationCap" />
                  <strong>Class</strong>
                  <span>
                    : &nbsp; {s.className} - {s.section}
                  </span>
                  <b>Admn. No.</b>
                  <span>: &nbsp; {s.admissionNo}</span>
                </div>
                <div className="info-row">
                  <Icon name="UserRound" />
                  <strong>Name of Student</strong>
                  <span>: &nbsp; {s.name}</span>
                  <b>House</b>
                  <span>: &nbsp; {s.house || "—"}</span>
                </div>
                {[
                  ["Mother’s Name", s.motherName, "UserRound"],
                  ["Father’s Name", s.fatherName, "UserRound"],
                  [
                    "Date of Birth",
                    s.dob
                      ? new Date(s.dob + "T12:00:00")
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .replaceAll(" ", "-")
                      : "—",
                    "CalendarDays",
                  ],
                  ["Address", s.address, "MapPin"],
                  ["Mob. No.", s.mobile, "Phone"],
                ].map(([label, value, icon]) => (
                  <div className="info-row wide" key={label}>
                    <Icon name={icon} />
                    <strong>{label}</strong>
                    <span>: &nbsp; {value || "—"}</span>
                  </div>
                ))}
              </div>
              <Shield className="student-portrait">
                {s.photo ? (
                  <img src={s.photo} alt={s.name} />
                ) : s._id === "demo-student" ? (
                  <div className="reference-portrait">
                    <img
                      src="/reference-front.png"
                      alt="Sample student portrait"
                    />
                  </div>
                ) : (
                  <div className="empty-portrait">
                    <Icons.UserRound size={54} />
                    <span>Student photo</span>
                  </div>
                )}
              </Shield>
            </div>
            <div className="result-line">
              <b>RESULT</b>
              <div>
                {calc.result === "PASS" ? (
                  <>
                    <em>Congratulations</em>
                    <span>Passed &amp; Promoted to Higher Class</span>
                  </>
                ) : calc.result === "INCOMPLETE" ? (
                  "Assessment in progress"
                ) : (
                  "Needs Improvement"
                )}
              </div>
            </div>
            <div className="result-line">
              <b>REMARKS</b>
              <div>{report.remarks || "—"}</div>
            </div>
            <div className="grading">
              <h4>GRADING SCALE FOR SCHOLASTIC AREAS</h4>
              <p>Grades are awarded on a 8 Point Grading Scale as follows:</p>
              <table>
                <tbody>
                  <tr>
                    <th>Marks Range</th>
                    {[
                      "91–100",
                      "81–90",
                      "71–80",
                      "61–70",
                      "51–60",
                      "41–50",
                      "33–40",
                      "32 & below",
                    ].map((x) => (
                      <td key={x}>{x}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Grade</th>
                    {[
                      "A1",
                      "A2",
                      "B1",
                      "B2",
                      "C1",
                      "C2",
                      "D",
                      "E (Failed)",
                    ].map((x) => (
                      <td key={x}>{x}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h2 className="report-section">SCHOLASTIC AREAS</h2>
            <div className="tables-wrap">
              <Watermark />
              {["term1", "term2"].map((term, i) => (
                <section className="marks-panel" key={term}>
                  <h4>
                    TERM - {i === 0 ? "I" : "II"} (
                    {config.components.reduce((a, c) => a + c.max, 0)} MARKS)
                  </h4>
                  <table>
                    <thead>
                      <tr>
                        <th>SUBJECTS</th>
                        {config.components.map((c) => (
                          <th key={c.id}>
                            {c.label.toUpperCase()}
                            <br />({c.max} MARKS)
                          </th>
                        ))}
                        <th>
                          MARKS OBTAINED
                          <br />
                          (100 MARKS)
                        </th>
                        <th>GRADE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.terms[term].map((s) => (
                        <tr key={s.id}>
                          <td>
                            <Icon name={s.icon} />
                            <b>{s.name}</b>
                          </td>
                          {config.components.map((c) => (
                            <td key={c.id}>
                              {report.marks?.[term]?.[s.id]?.[c.id] ?? "—"}
                            </td>
                          ))}
                          <td>{s.total ?? "—"}</td>
                          <td>{s.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
            <div className="report-summary">
              <div>
                <Icons.CirclePercent />
                <p>
                  PERCENTAGE
                  <strong>
                    {calc.percentage === null
                      ? "—"
                      : calc.percentage.toFixed(2) + "%"}
                  </strong>
                </p>
              </div>
              <div>
                <Icons.Calculator />
                <p>
                  GRAND TOTAL <small>({calc.maximum})</small>
                  <strong>{calc.complete ? calc.total : "—"}</strong>
                </p>
              </div>
              <div>
                <Icons.Award />
                <p>
                  RESULT
                  <strong className={calc.result === "PASS" ? "" : "smaller"}>
                    {calc.result}
                  </strong>
                </p>
              </div>
            </div>
            <section className="activities">
              <h4>
                CO-SCHOLASTIC AREAS{" "}
                <small>(ON A 3 POINT (A-C) GRADING SCALE)</small>
              </h4>
              <table>
                <thead>
                  <tr>
                    <th>ACTIVITIES</th>
                    <th>TERM - I GRADE</th>
                    <th>TERM - II GRADE</th>
                  </tr>
                </thead>
                <tbody>
                  {config.activities.map((a, i) => (
                    <tr key={a}>
                      <td>
                        <Icon
                          name={
                            [
                              "Wrench",
                              "Palette",
                              "Activity",
                              "ShieldCheck",
                              "Laptop",
                            ][i]
                          }
                        />
                        {a}
                      </td>
                      <td>{report.co?.[a]?.term1 || "—"}</td>
                      <td>{report.co?.[a]?.term2 || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
        <Signatures report={report} config={config} user={user} />
        {report.status !== "published" && (
          <div className="draft-watermark">
            {report.status.toUpperCase()} · NOT PUBLISHED
          </div>
        )}
      </div>
    </article>
  );
}
