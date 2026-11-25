import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import { Student, Audit } from "../server/src/models.js";
import { validateStudent } from "../shared/engine.js";

dotenv.config();

const rawRows = [
  "5,5,KARTIK,POONIA,5 th,VENUS,,9671843537,,,Male,2015-11-29,GEN,,,,2026-08-26,2026-08-26,24,127,Shivalik,84,76,,BERLA,,Pradeep,,pooniakartik007@gmail.com,,Seema,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "16,16,MAYANK,,5 th,VENUS,,9813641632,,,Male,2016-07-08,GEN,,Hindu,,2021-10-09,2026-08-14,27,127,Himalaya,,,,Berla,,MUKESH KUMAR,,mukeshsheoran9815@gmail.com,,PREETI,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "266,266,MOKSHITA,,5 th,VENUS,,8307636876,,,Female,2016-07-08,OBC,,,,2026-04-01,,26,132,Shivalik,,,,DAGROLI,,VIKAS KUMAR,,khushi09022013@gmail.com,,ANITA,,,,15150,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "278,278,RIDAM,,5 th,VENUS,,9466908670,,,Female,2016-09-06,GEN,,,,2026-04-01,,25,129,Arawali,,,,BERLA,,PARDEEP KUMAR,,pardeepkumar3518@gmail.com,,SARITA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "280,280,RAKSHIT SANGWAN,,5 th,MARS,monuchitresh49@gmail.com,7027059179,,,Male,2016-10-04,GEN,,,,,,25,135,Shivalik,,,,KUBJA NAGAR,,CHITRESH KUMAR,,,,MONU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "281,281,SIDDHARTH,,5 th,MARS,sonisheoran5466@gmail.com,9813315880,,,Male,2015-06-07,GEN,,,,,,31,140,Nilgiri,57,45,,M.HARIYA,,SUKHVENDER,,,,MONIKA,,,,17400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "282,282,ARPIT SANGWAN,,5 th,VENUS,,9050853642,,,Male,2016-02-08,GEN,,,,,,39,153,Himalaya,54,42,,K.NAGAR,,SATPAL SINGH,,nirmala9050853642@gmail.com,,NIRMALA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "283,283,SMAYRA RANA,,5 th,VENUS,,8059555966,,,Female,2015-12-28,GEN,,,,,,46,140,Shivalik,21,17,,DADRI,,SATYADEEP RANA,,monikadadri01250@gmail.com,,MONIKA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "284,284,HUNNY KADYAN,,5 th,VENUS,,9643582644,,,Male,2016-08-01,GEN,,,,,,21,130,Nilgiri,34,15,,DAGROLI,,SURENDER,,kavitapoonia078@gmail.com,,KAVITA,,,,13650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "285,285,VINSHU,,5 th,VENUS,,9812922450,,,Female,2016-08-26,GEN,,,,,,28,145,Shivalik,50,37,,KADMA,,NARENDER KUMAR,,narenderthalor32@gmail.com,,LAKSHMI DEVI,,,,11750,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "286,286,DIVYANSH,,5 th,VENUS,,9728837438,,,Male,2015-08-05,GEN,,,,,,58,145,Arawali,64,53,,N.BADESRA,,YOGESH KUMAR,,yogeshbhambhu14@gmail.com,,POONAM,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "287,287,DIKSHA,,5 th,VENUS,,9671003133,,,Female,2016-12-08,GEN,,,,,,24,135,Arawali,,,,SAMASPUR,,MANOJ KUMAR,,sheoranankit974@gmail.com,,REKHA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "290,290,ANUJ,,5 th,VENUS,,9812433700,,,Male,2016-09-19,GEN,,,,,,34,137,Arawali,,,,BERLA,,SATYAWAN,,sheoransatywan3@gmail.com,,BABITA,,,,11750,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "292,292,RUPESH,,5 th,VENUS,,9671480545,,,Male,2016-11-28,GEN,,,,,,,,Shivalik,21,17,,DHANASRI,,RAMKISHAN,,,,BIMLA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "293,293,NIRVI,,5 th,VENUS,,8818070938,,,Female,2017-05-13,GEN,,,,,,28,125,Arawali,,,,DHANI KHUBI,,PAWAN KUMAR,,neerajjakhar38@gmail.com,,NEERAJ KUMARI,,,,15900,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "295,295,HIMANSHU,,5 th,MARS,jabsangwanberla@gmail.com,9050099640,,,Male,2016-03-19,GEN,,,,,,24,125,Arawali,33,11,,BERLA,,SUKHBIR,,,,KAVITA,,,,12600,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "300,300,DAKSH,,5 th,MARS,Sataywan101091@gmail.com,9728187128,,,Male,2016-10-15,BC- B,,,,0026-04-01,,44,148,Himalaya,58,46,,M.HARIYA,,SATAYAWAN,,,,SANJU,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "360,360,DAKSH,,5 th,MARS,,9813313006,,,Male,2016-10-24,GEN,,,,,,27,134,Himalaya,31,18,,DHANI KHUBI,,PAWAN,,,,NIDHI,,,,14000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "364,364,SUMIT,,5 th,MARS,sandeepdhindhwal0@gmail.com,7027298070,,,Male,2017-01-03,GEN,,,,0026-04-01,,47,141,Arawali,,,,BADRAI,,SANDEEP,,,,SUMAN KUMARI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "378,378,HAPPY,,5 th,MARS,ypritam667@gmail.com,9671266204,,,Male,2016-06-09,BC- B,,,,,,28,136,Arawali,10,20,,NIHALGARH,,PRITAM,,,,REENA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "394,394,ANSH KUMAR,,5 th,VENUS,,9728301323,,,Male,2016-05-18,GEN,,,,,,28,136,Nilgiri,16,8,,BADRAI,,NAVEEN KUMAR,,anshk2467@gmail.com,,ROSHANI DEVI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "426,426,SONU,,5 th,MARS,sonujaat03813@gmail.com,9306169134,,,Male,2017-01-07,GEN,,,,,,33,133,Nilgiri,,,,KANHRA,,SANJAY,,,,MUNA DEVI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "434,434,TANISHQ,,5 th,MARS,skasw9996@gmail.com,9991663028,,,Male,2017-02-18,GEN,,,,,,31,140,Himalaya,58,46,,M.HARIYA,,SANDEEP KUMAR,,,,RAKESH KUMARI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "504,504,SURYAKANT,,5 th,MARS,rakeshsangwan31385@gmail.com,9813431385,,,Male,2013-11-13,GEN,,,,2026-04-01,,32,152,,,,,PICHOPA KHURD,,RAKESH KR.,,,,BIMLA,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "532,532,RIHAN,,5 th,MARS,bijeshkumar98123@gmail.com,9812305006,,,Male,2014-08-30,GEN,,,,,,153,44,Shivalik,,,,BERLA,,DINESH,,,,SONU KUMARI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "602,602,VARSHA,,5 th,VENUS,,8059476349,,,Female,2017-09-09,STSC,,,,,,19,120,Himalaya,,,,DAGROLI,,SUNIL KUMAR,,sunilkumar784082@gmail.com,,POONAM,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "666,666,ABHI,,5 th,MARS,abhiitkan123@gmail.com,9812384260,,,Male,2017-08-28,STSC,,,,,,23,122,Himalaya,,,,DAGROLI,,DEEPAK KUMAR,,,,PRIYANKA KUMARI,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "725,725,BHAVISHYA,,5 th,VENUS,,9306017074,,,Female,2015-07-30,GEN,,,,,,39,142,Himalaya,54,42,,KUBJA NAGAR,,SUNIL KUMAR,,asmitapanghal@gmail.com,,ASMITA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "752,752,RITIKA,,5 th,VENUS,,8816805851,,,Female,2015-07-24,GEN,,,,,,40,144,Shivalik,47,34,,BADHRA,,VIKASH,,sonusheoran70812@gmail.com,,PARVEEN LATA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "766,766,SNAYA CHOUDHARY,,5 th,VENUS,,8814906181,,,Female,2016-09-15,GEN,,,,,,30,138,Shivalik,33,11,,DHANI KHUBI,,KASHMIR,,,,SUDESH,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "796,796,HIMANSHU,,5 th,MARS,sandeepk87703@gmail.com,8198988897,,,Male,2014-11-12,GEN,,,,,,24,125,Himalaya,49,36,,KADMA,,SANDEEP,,,,SARITA,,,,15150,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "854,854,MUSHKAN,,5 th,VENUS,,8607207237,,,Female,2016-04-20,GEN,,,,,,25,123,Arawali,17,9,,BERLA,,DINESH,,dk2153869@gmail.com,,PARVEEN KUMARI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "856,856,HARSHIT,,5 th,MARS,gyanilakhwan49@gmail.com,8421976275,,,Male,2016-08-02,BC-A,,,,,,37,139,Nilgiri,,,,MAI KHURD,,SANDEEP,,,,RAJNI SAIN,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "858,858,DEVANSH,,5 th,MARS,kuldeepkumar32580@gmail.com,9812321266,,,Male,2017-01-14,GEN,,,,,,41,138,Nilgiri,16,8,,BADRAI,,KULDEEP KUMAR,,,,ARCHANA,,,,12500,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "859,859,VANSH,,5 th,MARS,ekpremi123@gmail.com,9728331125,,,Male,2016-02-16,STSC,,,,,,33,134,Himalaya,34,15,,DAGROLI,,DEVENDER KUMAR,,,,RENU,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "860,860,YASH,,5 th,MARS,bhartimachingcenter@gmail.com,8059690209,,,Male,2015-06-03,GEN,,,,,,23,127,Himalaya,45,32,,JEWALI,,SOMVIR,,,,BHATERI DEVI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "861,861,GAURAV,,5 th,MARS,,8059690209,,,Male,2016-10-12,GEN,,,,,,26,134,Himalaya,45,32,,JEWALI,,SOMVIR,,,,BHATERI DEVI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26501,26501,SANCHIT,,5 th,MARS,poonamsheoran749@gmail.com,9991724344,,,Male,2016-04-05,GEN,,,,,,32,139,Himalaya,16,8,,BERLA,,SANJU,,,,POONAM,,,,11750,,,,,No,No,No,No,No,No,No,Non-RTE,",
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
    if (admissionDate.startsWith("0026-")) {
      admissionDate = "2026-" + admissionDate.slice(5);
    }

    let category = rowObj["Category"] || rowObj["Caste"] || "General";
    category = category.trim();
    if (category === "GEN") category = "General";
    else if (category === "STSC" || category === "SC") category = "SC";
    else if (category === "BC-A" || category === "BC-B" || category === "BC- B" || category === "OBC") category = "OBC";

    let address = (rowObj["Address"] || "").trim();

    let email = (rowObj["Email"] || rowObj["Father Email"] || "").toLowerCase().trim();
    email = email
      .replace(/@gmai\.com$/, "@gmail.com")
      .replace(/@gamil\.com$/, "@gmail.com");

    const student = {
      admissionNo: admNo,
      rollNo: rollNo,
      name: fullName,
      className: "5",
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

  console.log(`Successfully parsed and validated ${parsedStudents.length} students for Class 5.`);

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

  const marsCount = await Student.countDocuments({ className: "5", section: "Mars", active: true });
  const venusCount = await Student.countDocuments({ className: "5", section: "Venus", active: true });
  const totalClass5 = await Student.countDocuments({ className: "5", active: true });
  const grandTotal = await Student.countDocuments({ active: true });

  console.log(`📊 Class 5 Stats:`);
  console.log(`   - Mars section: ${marsCount} students`);
  console.log(`   - Venus section: ${venusCount} students`);
  console.log(`   - Total Class 5: ${totalClass5} students`);
  console.log(`   - Grand Total in ERP: ${grandTotal} active students`);

  // Record Audit log
  await Audit.create({
    action: "import-class5-students",
    target: "Class 5 (Mars & Venus)",
    details: `Imported ${parsedStudents.length} students into Class 5 (Mars: ${marsCount}, Venus: ${venusCount})`,
  });

  // Also create a backup XLSX workbook
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Class 5 Students");
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
  const xlsxPath = path.join(exportDir, "Class_5_Mars_Venus_Students.xlsx");
  await wb.xlsx.writeFile(xlsxPath);
  console.log(`📁 Exported XLSX backup to: ${xlsxPath}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
