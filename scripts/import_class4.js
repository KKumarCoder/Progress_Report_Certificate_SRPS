import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import { Student, Audit } from "../server/src/models.js";
import { validateStudent } from "../shared/engine.js";

dotenv.config();

const rawRows = [
  "427,427,VAISHNAVI,,4 th,MARS,,9991449789,,,Female,2017-10-27,STSC,,,,,,23,135,Himalaya,34,15,,DAGROLI,,VIKASH,,,,RENU,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "428,428,RISHIKA,,4 th,MARS,,9350622570,,,Female,2017-03-14,STSC,,,,,,31,130,Shivalik,34,15,,DAGROLI,,RINKU KUMAR KALA,,monikakala771@gmail.com,,MONIKA,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "430,430,NISHU,,4 th,MARS,,8130523852,,,Female,2017-09-25,GEN,,,,,,25,135,Arawali,82,72,,KANHRA,,DALBIR SINGH,,,,ANJU DEVI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "431,431,GARVEET,,4 th,MARS,,9812318266,,,Male,2017-06-14,GEN,,,,,,26,126,Arawali,58,46,,M.HARIYA,,RINKU,,Rinkududi1989@gmail.com,,KAVITA,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "495,495,PRINCE,,4 th,MARS,,9306833090,,,Male,2016-11-24,GEN,,,,,,38,135,Shivalik,54,42,,KUBJANAGAR,,PARVEEN KUMAR,,,,MAMTA,,,,17200,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "496,496,NANCY,,4 th,MARS,,9812273888,,,Female,2017-11-20,GEN,,,,,,23,122,Arawali,,,,JEWALI,,RAJESH KUMAR,,,,MONIKA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "514,514,VIRAT,,4 th,MARS,,8930581595,,,Male,2016-11-15,GEN,,,,,,24,127.98,Shivalik,72,61,,SISWALA,,ANTRAM,,mukuldalal506@gmail.com,,POOJA,,,,11500,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "515,515,AARUSHI,,4 th,MARS,,9728542308,,,Female,2017-11-15,GEN,,,,,,30,139,Arawali,69,58,,RUDROL,,SURENDER SINGH,,Vijarniya@gmail.com,,MANJEET KAUR,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "517,517,GURMEET,,4 th,MARS,,9817804760,,,Male,2017-03-24,GEN,,,,,,34,138,Nilgiri,82,72,,KANHRA,,MANJEET SINGH,,,,MANJU KUMARI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "518,518,LAKSHITA,,4 th,VENUS,dirsana805@gmail.com,9306427774,,,Female,2017-12-02,GEN,,,,,,26,128,Arawali,21,17,,KADMA,,PRAMJEET,,,,BIRSHANA KUMARI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "519,519,DHEERAJ ASSIWAL,,4 th,MARS,,9991517299,,,Male,2018-01-16,STSC,,,,,,25,138,Nilgiri,33,11,,BERLA,,SANDEEP KUMAR,,,,SANGITA,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "522,522,YASHIKA,,4 th,MARS,,8814845200,,,Female,2017-10-24,GEN,,,,,,25,128,Arawali,,,,KANHRA,,VIRENDER,,,,MONIKA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "524,524,PARGYA,,4 th,MARS,,9992424340,,,Female,2018-01-07,GEN,,,,,,24,128,Himalaya,4,21,,DHANSHRI,,SUKHENDER,,sukhethalor711@gmail.com,,SONIA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "525,525,DIKSHA,,4 th,VENUS,yogeshsheoran999@gmail.com,9813842143,,,Female,2016-09-17,GEN,,,,,,29,138,Arawali,,,,BERLA,,YOGESH,,,,MEENA,,,,6600,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "526,526,RIDHI,,4 th,VENUS,sundeepkmr19@gmail.com,9050461993,,,Female,2017-07-29,BC-A,,,,,,26,128,Arawali,34,15,,DAGROLI,,SUNDEEP KUMAR,,,,POONAM,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "530,530,YUG BIJARANIYA,,4 th,VENUS,induphogat49@gmail.com,9813557399,,,Male,2017-10-27,GEN,,,,,,23,123,Shivalik,69,58,,RUDROL,,AMIT KUMAR,,,,INDU,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "531,531,CHARU,,4 th,VENUS,ravinderkadian57@gmail.com,9728055701,,,Female,2017-04-25,GEN,,,,,,29,132,Arawali,34,15,,DAGROLI,,RAVINDER KUMAR,,,,SAROJ,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "533,533,SIDDARTH,,4 th,MARS,,8199991076,,,Male,2017-09-05,GEN,,,,,,30,140,Himalaya,,,,TIKAN KALA,,SUKHENDER,,phogatsidhu7@gmail.com,,PRIYANKA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "534,534,RIYA ASSIWAL,,4 th,VENUS,sonamkhana04@gmail.com,9306560958,,,Female,2017-04-12,STSC,,,,,,,,Shivalik,,,,BERLA,,PARDEEP KUMAR,,,,SONAM,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "535,535,ANMOL,,4 th,VENUS,monikadhindwal4@gmail.com,9581425328,,,Male,2016-10-06,GEN,,,,,,30,134,Nilgiri,16,8,,BADRAI,,ANIL KUMAR,,,,MONIKA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "544,544,INDU,,4 th,VENUS,vipinkumar37461@gmaip.com,9991927733,,,Female,2016-10-11,GEN,,,,,,27,135,Arawali,84,76,,BERLA,,SURESH,,,,KAMLESH,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "581,581,HIMANSHU,,4 th,MARS,,8059058229,,,Male,2016-12-08,BC-A,,,,,,22,125,Shivalik,,,,KADMA,,RAJNESH,,,,PUSHPA,,,,15800,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "605,605,NAIRA,,4 th,VENUS,rinkulala089@gmail.com,8053340909,,,Female,2018-01-13,GEN,,,,,,24,122,Nilgiri,33,11,,BERLA,,RINKU KUMAR,,,,SONU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "606,606,YUGAM,,4 th,VENUS,kulvirsheoran4@gmail.com,9813549727,,,Male,2016-11-04,GEN,,,,,,25,132,Nilgiri,17,9,,BERLA,,KULVIR,,,,KAVITA,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "611,611,BHARTI,,4 th,VENUS,sachingandash0@gmail.com,8708075409,,,Female,2016-09-12,GEN,,,,,,32,138,Nilgiri,49,36,,KADMA,,SACHIN,,,,MUKESH,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "632,632,NEERAJ KUMAR,,4 th,VENUS,,9053597453,,,Male,2017-07-05,GEN,,,,,,22,123,Shivalik,,,,GOPALWAS,,RANBIR,,,,ANJU LATA,,,,15800,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "655,655,MAANVI DHILLON,,4 th,VENUS,seemadhillon064@gma8l.com,9817121717,,,Female,2018-03-01,GEN,,,,,,25,128,Shivalik,68,57,,RAMBASS,,AMIT KUMAR DHILLON,,,,SEEMA RANI,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "694,694,MANPREET SHEORAN,,4 th,VENUS,anitashearan1038@gmail.com,8816089486,,,Male,2018-03-03,GEN,,,,,,26,130.01,Shivalik,82,72,,KANHRA,,MANISH KUMAR,,,,ANITA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "765,765,PRIYANSHU,,4 th,MARS,,8059553252,,,Male,2016-08-06,GEN,,,,,,33,138,Himalaya,16,8,,BADRAI,,RANBIR SINGH,,ranbirsinghbadrai@gmail.com,,MONIKA,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "771,771,VIDHI,,4 th,MARS,,7988841153,,,Female,2016-02-15,GEN,,,,,,38,143,Shivalik,,,,ADAMPUR,,ANIL,,,,MONI RANI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "775,775,DEEPANSHI,,4 th,MARS,,9813230345,,,Female,2018-03-19,GEN,,,,,,24,122,Arawali,54,42,,PICHOPA KHURD,,DINESH KUMAR,,monikamonika14353@gmail.com,,MONIKA,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "841,841,JATIN,,4 th,MARS,,9812618378,,,Male,2017-09-08,GEN,,,,,,23,125,Shivalik,14,6,,BHANDWA,,RAJ SINGH,,rajsinghraju533@gmail.com,,MONIKA KUMARI,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "852,852,DIMPAL,,4 th,VENUS,reyansheoran82@gmail.com,9728300682,,,Female,2017-10-14,GEN,,,,,,28,131,Shivalik,19,13,,CHANDWAS,,VIKASH KUMAR,,,,MANJU DEVI,,,,1400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "875,875,GUNJAN KUMARI,,4 th,MARS,,9829183284,,,Female,2016-12-12,GEN,,,,,,31,131,Shivalik,82,72,,KANHRA,,RAJESH KUMAR,,surenderpoonia46@gmail.com,,REENA,,,,300,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "876,876,YASH KUMAR,,4 th,VENUS,msheoran236@gmail.com,9812619400,,,Male,2017-09-01,GEN,,,,,,33,132,Nilgiri,82,72,,KANHRA,,SUNIL KUMAR,,,,MONIKA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "877,877,NITUL,,4 th,VENUS,kumarpardeep25621@gmail.com,9812619400,,,Male,2018-02-09,GEN,,,,,,27,126.99,Nilgiri,82,72,,KANHRA,,PARDEEP KUMAR,,,,ANITA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "23401,23401,SEJAL,,4 th,VENUS,parveen9813990015@gmail.com,9813990015,,,Female,2017-09-16,GEN,,,,,,28,127,Arawali,35,22,,BERLA,,PRAVEEN,,,,BINDU,,,,11700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26402,26402,MIKUL,,4 th,VENUS,karmvir1982jangra@gmail.com,9996825480,,,Male,2016-09-01,OBC,,,,,,28,132.99,Arawali,69,58,,RUDROL,,KARMVIR,,,,MANISHA,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26403,26403,ANKUSH,,4 th,MARS,,8059439172,,,Male,2017-06-01,STSC,,,,,,22,130,Nilgiri,,,,NANDHA,,VIKRAM,,ronakkumar80594@gmail.com,,REKHA,,,,8000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26404,26404,Rajat,,4 th,VENUS,,8930495682,,,Male,2017-04-25,GEN,,,,2026-09-16,2026-09-16,,,Nilgiri,,,,BERLA,,YADVENDER,,,,NITU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
];

const headerCols = [
  "Adm No", "Roll No", "First Name", "Last Name", "Class", "Section", "Email", "Mobile",
  "Aadhar Number", "PEN Number", "Gender", "DOB", "Caste", "Category", "Religion", "Blood Group",
  "Admission Date", "Measurement Date", "Weight", "Height", "House", "Route List", "Pickup Point",
  "Hostel", "Address", "Room No", "Father Name", "Father Phone", "Father Email", "Father Occupation",
  "Mother Name", "Mother Phone", "Mother Email", "Mother Occupation", "Discount Amt",
  "Bank Account No", "Bank Account Holder", "Bank IFSC", "Bank Name", "Aadhaar (Doc)",
  "Birth Cert (Doc)", "Bank Passbook (Doc)", "SSSMID (Doc)", "Marksheet (Doc)",
  "Transfer Certificate (TC)", "Other Documents", "RTE Status", "RTE App No"
];

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  const parsedStudents = [];

  for (let i = 0; i < rawRows.length; i++) {
    const cols = parseCsvLine(rawRows[i]);
    const rowObj = {};
    headerCols.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? "";
    });

    const admNo = rowObj["Adm No"];
    const rollNo = rowObj["Roll No"] || admNo;
    const firstName = rowObj["First Name"];
    const lastName = rowObj["Last Name"];
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    let section = (rowObj["Section"] || "").toUpperCase();
    if (section === "MARS") section = "Mars";
    else if (section === "VENUS") section = "Venus";

    let house = rowObj["House"] || "";
    if (house.toLowerCase() === "arawali") house = "Aravali";

    let dob = rowObj["DOB"] || "";

    let admissionDate = rowObj["Admission Date"] || "";

    let category = rowObj["Category"] || rowObj["Caste"] || "General";
    category = category.trim();
    if (category === "GEN") category = "General";
    else if (category === "STSC" || category === "SC") category = "SC";
    else if (category === "BC-A" || category === "BC-B" || category === "OBC") category = "OBC";

    let address = (rowObj["Address"] || "").trim();

    let email = (rowObj["Email"] || rowObj["Father Email"] || "").toLowerCase().trim();
    email = email
      .replace(/@gmaip\.com$/, "@gmail.com")
      .replace(/@gma8l\.com$/, "@gmail.com")
      .replace(/@gmai\.com$/, "@gmail.com")
      .replace(/@gamil\.com$/, "@gmail.com");

    const student = {
      admissionNo: admNo,
      rollNo: rollNo,
      name: fullName,
      className: "4",
      section: section,
      house: house,
      gender: rowObj["Gender"] || "",
      category: category,
      motherName: rowObj["Mother Name"] || "",
      fatherName: rowObj["Father Name"] || "",
      dob: dob,
      address: address,
      mobile: rowObj["Mobile"] || "",
      email: email,
      admissionDate: admissionDate,
      active: true,
    };

    const errs = validateStudent(student);
    if (
      student.email &&
      !/^[^\s@]{1,100}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(student.email)
    ) {
      errs.push("Invalid email: " + student.email);
    }

    if (errs.length > 0) {
      console.error(`Validation error on row ${i + 1} (${admNo} - ${fullName}):`, errs);
      process.exit(1);
    }

    parsedStudents.push(student);
  }

  console.log(`Successfully parsed and validated ${parsedStudents.length} students for Class 4.`);

  // Connect to Database
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not found in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const stu of parsedStudents) {
    const existing = await Student.findOne({ admissionNo: stu.admissionNo });
    if (existing) {
      await Student.updateOne({ admissionNo: stu.admissionNo }, { $set: stu });
      updatedCount++;
    } else {
      await Student.create(stu);
      insertedCount++;
    }
  }

  console.log(`✅ Import finished: ${insertedCount} inserted, ${updatedCount} updated.`);

  const marsCount = await Student.countDocuments({ className: "4", section: "Mars", active: true });
  const venusCount = await Student.countDocuments({ className: "4", section: "Venus", active: true });
  const totalClass4 = await Student.countDocuments({ className: "4", active: true });
  const grandTotal = await Student.countDocuments({ active: true });

  console.log(`📊 Class 4 Stats:`);
  console.log(`   - Mars section: ${marsCount} students`);
  console.log(`   - Venus section: ${venusCount} students`);
  console.log(`   - Total Class 4: ${totalClass4} students`);
  console.log(`   - Grand Total in ERP: ${grandTotal} active students`);

  // Record Audit log
  await Audit.create({
    action: "import-class4-students",
    target: "Class 4 (Mars & Venus)",
    details: `Imported ${parsedStudents.length} students into Class 4 (Mars: ${marsCount}, Venus: ${venusCount})`,
  });

  // Also create a backup XLSX workbook
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Class 4 Students");
  ws.columns = [
    { header: "Admission No", key: "admissionNo", width: 15 },
    { header: "Roll No", key: "rollNo", width: 12 },
    { header: "Student Name", key: "name", width: 24 },
    { header: "Class", key: "className", width: 10 },
    { header: "Section", key: "section", width: 12 },
    { header: "Gender", key: "gender", width: 12 },
    { header: "DOB", key: "dob", width: 14 },
    { header: "House", key: "house", width: 15 },
    { header: "Category", key: "category", width: 14 },
    { header: "Father Name", key: "fatherName", width: 24 },
    { header: "Mother Name", key: "motherName", width: 24 },
    { header: "Mobile", key: "mobile", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Address", key: "address", width: 25 },
    { header: "Admission Date", key: "admissionDate", width: 16 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0284C7" },
  };

  parsedStudents.forEach((stu) => {
    ws.addRow(stu);
  });

  const exportDir = path.resolve("./server/uploads");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  const xlsxPath = path.join(exportDir, "Class_4_Mars_Venus_Students.xlsx");
  await wb.xlsx.writeFile(xlsxPath);
  console.log(`📁 Exported XLSX backup to: ${xlsxPath}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
