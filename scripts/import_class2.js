import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import { Student, Audit } from "../server/src/models.js";
import { validateStudent } from "../shared/engine.js";

dotenv.config();

const csvData = `Adm No,Roll No,First Name,Last Name,Class,Section,Email,Mobile,Aadhar Number,PEN Number,Gender,DOB,Caste,Category,Religion,Blood Group,Admission Date,Measurement Date,Weight,Height,House,Route List,Pickup Point,Hostel,Address,Room No,Father Name,Father Phone,Father Email,Father Occupation,Mother Name,Mother Phone,Mother Email,Mother Occupation,Discount Amt,Bank Account No,Bank Account Holder,Bank IFSC,Bank Name,Aadhaar (Doc),Birth Cert (Doc),Bank Passbook (Doc),SSSMID (Doc),Marksheet (Doc),Transfer Certificate (TC),Other Documents,RTE Status,RTE App No
658,658,JIYA,,2 nd,MARS,,9813882180,,,Female,2018-09-19,GEN,,,,,,18,113,Himalaya,54,42,,KUBJA NAGAR,,RAM NIWAS,,,,SARITA KUMARI,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
659,659,DARUN,,2 nd,VENUS,samshersangwan100411983@gmail.com,7027726651,,,Male,2018-05-20,,,,,0026-04-01,,26,125.98,,54,42,,KUBJA NAGAR,,SHAMSHER SINGH,,,,DURGA,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,
660,660,VANSHIKA,,2 nd,VENUS,soniapawriya123@gmail.com,8307617729,,,Female,2018-12-21,,,,,0026-04-01,,23.5,118.99,,82,72,,KANHRA,,VIKAS,,,,SONIA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
661,661,HAPPY,,2 nd,VENUS,,8607207237,,,Male,2018-09-07,,,,,0026-04-01,,16.5,108.94,,17,9,,BERLA,,DINESH,,,,PARVEEN KUMARI,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
662,662,PRINCE,,2 nd,MARS,sheoranankit974@gmail.com,9671693450,,,Male,2018-04-27,GEN,,,,,,24,126.99,Arawali,,,,SAMASPUR,,MANOJ KUMAR,,,,REKHA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
674,674,PARNAV SANGWAN,,2 nd,VENUS,asmitapanghal@gmail.com,9306017074,,,Male,2019-03-21,,,,,0026-04-01,,26.3,125,Nilgiri,54,42,,KUBJA NAGAR,,SUNIL KUMAR,,,,ASMITA,,,,10250,,,,,No,No,No,No,No,No,No,Non-RTE,
675,675,TANVI,,2 nd,MARS,dilbagkala@gmail.com,6378543388,,,Female,2019-05-18,STSC,,,,,,17,112,Himalaya,34,15,,DAGROLI,,DILBAG SINGH,,,,USHA RANI,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
677,677,SAAVI,,2 nd,VENUS,mamtaphogatsheorn@gmail.com,9050427640,,,Female,2019-07-21,,,,,0026-04-01,,25,122,Himalaya,33,11,,BERLA,,ANESH KUMAR,,,,MAMTA,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,
678,678,PURAV SANGWAN,,2 nd,MARS,manjudalbirsangwan@gmail.com,9991125327,,,Male,2019-09-29,GEN,,,,,,34,126,Himalaya,,,,PICHOPA KHURD,,DALBIR SINGH,,,,MANJU KUMARI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
679,679,PURVI,,2 nd,MARS,,8053212534,,,Female,2019-05-15,GEN,,,,,,20,115,Shivalik,47,34,,JHOJHU KALAN,,RAKESH KUMAR,,,,SANTOSH,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
680,680,KANIKA SHEORAN,,2 nd,VENUS,mintusheorn702@gmail.com,7027509818,,,Female,2019-04-11,,,,,0026-04-01,,23.7,123,Nilgiri,33,11,,BERLA,,RAJBIR,,,,SUNITA KUMARI,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
681,681,HAYANSH,,2 nd,VENUS,princejaat171@gmail.com,8818003780,,,Male,2019-04-14,,,,,0026-04-01,,22.5,124.91,,68,57,,RAMBAS,,PARDEEP KUMAR,,,,NEELAM,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
682,682,DIKSHANT,,2 nd,MARS,Surender1101991@gmail.com,9017702625,,,Male,2019-02-09,GEN,,,,,,25,127,Shivalik,,,,NIMAR,,SURENDER SINGH,,,,SUNITA,,,,10250,,,,,No,No,No,No,No,No,No,Non-RTE,
683,683,MOHIT RAJ,,2 nd,MARS,sachingandasho@gmail.com,7015489533,,,Male,2018-06-18,GEN,,,,,,27,127,Shivalik,49,36,,KADMA,,SACHIN,,,,MUKESH,,,,10250,,,,,No,No,No,No,No,No,No,Non-RTE,
684,684,MANAV,,2 nd,MARS,,7419072918,,,Male,2018-11-28,GEN,,,,,,15,110,Shivalik,63,52,,NIMAR,,VINOD KUMAR,,,,REENA KUMARI,,,,13650,,,,,No,No,No,No,No,No,No,Non-RTE,
685,685,YASH,,2 nd,MARS,,9671592299,,,Male,2019-03-01,GEN,,,,,,20,116,Himalaya,,,,DAGROLI,,AMAN KUMAR,,,,SUSHMA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
687,687,YASHVI,,2 nd,MARS,PnKr071@gmail.com,9797214811,,,Female,2019-01-31,STSC,,,,,,21,121,Arawali,34,15,,DAGROLI,,PANKAJ KUMAR,,,,POONAM,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
688,688,BHUMIKA,,2 nd,MARS,,9991886787,,,Female,2019-08-13,GEN,,,,,,18,112,Arawali,82,72,,KANHRA,,DEEPAK KUMAR,,,,SEEMA DEVI,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
689,689,PRITI,,2 nd,VENUS,birsana805@gmail.com,8683814321,,,Female,2019-09-01,,,,,0026-04-01,,19,119.95,Arawali,21,17,,KADMA,,PRAMJEET,,,,BIRSHANA KUMARI,,,,11800,,,,,No,No,No,No,No,No,No,Non-RTE,
690,690,SHUBHAM LAMBA,,2 nd,VENUS,sumitlamba.a@gmail.com,9813145698,,,Male,2019-11-07,,,,,0026-04-01,,23,121,Arawali,68,57,,RAMBASS,,SUMIT KUMAR,,,,BABLI SANGWAN,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
692,692,VIPIN,,2 nd,MARS,,7419210733,,,Male,2019-07-28,,,,,,,20,115,Shivalik,84,76,,BERLA,,SURESH,,,,KAMLESH,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
695,695,HARIKA,,2 nd,VENUS,Sunilsarpanch67@gmail.com,8675673000,,,Female,2019-12-15,,,,,0026-04-01,,16.5,115,,,,,KUBJA NAGAR,,SUNIL,,,,MAMTA RANI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
697,697,NISHU KUMARI,,2 nd,VENUS,anilpichopa@gmail.com,9050000299,,,Female,2020-02-21,,,,,0026-04-01,,20.5,116,,65,54,,PICHOPA KHURD,,ANIL KUMAR,,,,POONAM,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
698,698,VOKESH,,2 nd,MARS,Bijeshkumar@gmail.com,9813144690,,,Male,2018-11-24,GEN,,,,,,21,121,Nilgiri,,,,BERLA,,BIJESH,,,,SONU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
699,699,PARAV SANGWAN,,2 nd,MARS,Bijeshkumar9812@gmail.com,9813144690,,,Male,2017-11-15,GEN,,,,,,24,129,Nilgiri,,,,CHANDENI,,SOMVIR SINGH,,,,BABITA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
702,702,AARSHI,,2 nd,VENUS,dy33536@gmail.com,9050633536,,,Female,2019-11-14,,,,,0026-04-01,,21.3,119.9,,10,20,,NIHALGARH,,DEEPAK,,,,PRITI,,,,13025,,,,,No,No,No,No,No,No,No,Non-RTE,
703,703,MAHIRA,,2 nd,VENUS,sunilmalik97@gmail.com,9821080904,,,Female,2019-11-20,,,,,0026-04-01,,22,124,Nilgiri,63,52,,NIMAR,,SUNIL KUMAR,,,,RITU RANI,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,
704,704,JAYANT,,2 nd,VENUS,Jitenderkumar016940@gmail.com,8930715343,,,Male,2020-02-22,,,,,0026-04-01,,23.7,125.99,Shivalik,82,72,,KANHRA,,JITENDER KUMAR,,,,ANKITA,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
705,705,Nikki,,2 nd,MARS,sonusheoran70812@gmail.com,8816805851,,,Female,2019-12-24,GEN,,Hindu,,2025-04-01,2026-08-14,23,125,Himalaya,47,34,,Badhra,,Vikash,,,,Praveen Lata,,,,14900,,,,,No,No,No,No,No,No,No,Non-RTE,
706,706,MOKSH,,2 nd,MARS,,9306513060,,,Male,2020-02-09,STSC,,,,0026-04-01,,20,121,Arawali,34,15,,DAGROLI,,VIKASH,,,,RENU,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
707,707,HARSH,,2 nd,VENUS,sanjusangwan1996@gmail.com,9350631301,,,Male,2020-02-08,,,,,0026-04-01,,25,132.77,Himalaya,63,52,,NIMAR,,NAVEEN,,,,SANJU KUMARI,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
709,709,JIYA,,2 nd,MARS,krishandhindwal572@gmail.com,9992290361,,,Female,2019-05-23,GEN,,,,0026-04-01,,16,113,Himalaya,16,8,,BADRAI,,KRISHAN KUMAR,,,,NILAM,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
715,715,REYANSH KUMAR,,2 nd,VENUS,banti8930325285@gmail.com,8759729000,,,Male,2019-07-10,,,,,0026-04-01,,23.7,111.97,Nilgiri,19,13,,MANDHI HARIYA,,ASHISH,,,,JYOTI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
716,716,LAKSHIT,,2 nd,MARS,NVNPICHOPA@GMAIL.com,8053961679,,,Male,2019-07-25,,,,,0026-04-01,,20,116,,65,54,,PICHOPA KHURD,,NAVEEN,,,,SEEMA,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,
720,720,DINISHA,,2 nd,VENUS,vikramvijaraniya@gmail.com,9813549178,,,Female,2020-03-25,,,,,0026-04-01,,20,111.94,Nilgiri,69,58,,RUDROL,,VIKRAM SINGH,,,,SONIA,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
736,736,HITEN,,2 nd,MARS,manjetlamba3057@gmail.com,9588745984,,,Male,2017-11-11,GEN,,,,0026-04-01,,42,140,Shivalik,68,57,,RAMBASS,,MANJEET SINGH,,,,PINKI DEVI,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
769,769,NIKU,,2 nd,MARS,,8814899575,,,Male,2018-11-09,GEN,,,,0026-04-01,,21,118,Arawali,,,,BHANDWA,,DHARMENDER,,,,INDUMAYA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
827,827,MAYANK CHOUDHARY,,2 nd,MARS,,7382481759,,,Male,2020-04-04,,,,,2026-01-04,,119,20.5,Shivalik,17,9,,BERLA,,KRISHAN KUMAR,,,,PINKESH,,,,625,,,,,No,No,No,No,No,No,No,Non-RTE,
837,837,HARIDYANSHU KUMAR,,2 nd,MARS,,7404244518,,,Male,2018-11-27,BC-A,,,,0026-04-01,,26,131,Arawali,82,72,,KANHRA,,NASEEB,,,,MONIKA KUMARI,,,,625,,,,,No,No,No,No,No,No,No,Non-RTE,
840,840,VARUN,,2 nd,MARS,,9728154504,,,Male,2014-03-10,BC-A,,,,,,36,150,Shivalik,,,,BERLA,,SOMBIR,,,,MANISHA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
845,845,DHRUV,,2 nd,VENUS,,8421976275,,,Male,2018-11-12,,,,,0026-04-01,,20.7,117,Himalaya,,,,MAI KHURD,,SANDEEP,,,,RAJNI SAIN,,,,13025,,,,,No,No,No,No,No,No,No,Non-RTE,
846,846,Shikha,,2 nd,MARS,,9813052008,,,Female,2019-01-08,GEN,,,,2026-04-20,2026-08-14,24,128,Arawali,,,,Pichopa Khurd,,Sandeep Kumar,,,,Sunita Devi,,,,12400,,,,,No,No,No,No,No,No,No,Non-RTE,
847,847,Bhavishya,,2 nd,VENUS,Sharmajai103@gmail.com,7015973551,,,Male,2019-06-19,GEN,,Hindu,,,2026-08-14,23,119.19,Himalaya,,,,Berla,,Jai Bhagwan,,,,Monu,,,,8900,,,,,No,No,No,No,No,No,No,Non-RTE,
848,848,BHUMI,,2 nd,VENUS,sbsharma042@gmail.com,7015973551,,,Female,2019-09-09,,,,,0026-04-01,,18.4,115,Nilgiri,33,11,,BERLA,,SUNIL KUMAR,,,,POOJA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
849,849,KUNAL,,2 nd,VENUS,sumitsangwan9250@gmail.com,9813166808,,,Male,2019-01-20,,,,,0026-04-01,,20.1,115,Shivalik,65,54,,PICHOPA KHURD,,SUMIT,,,,SUNITA,,,,5600,,,,,No,No,No,No,No,No,No,Non-RTE,
850,850,KARTIK,,2 nd,VENUS,,9813166808,,,Male,2019-01-20,,,,,0026-04-01,,22.9,122,Shivalik,65,54,,PICHOPA KHURD,,SUMIT,,,,SUNITA,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
873,873,PURVI,,2 nd,MARS,Sk0839869483@gmail.com,9992968478,,,Female,2018-10-09,GEN,,,,,,20,121,Nilgiri,,,,NIMAR,,SURESH KUMAR,,,,SUSHILA DEVI,,,,13650,,,,,No,No,No,No,No,No,No,Non-RTE,
880,880,YASVI,,2 nd,VENUS,Sandeepc@gmail.com,8930742441,,,Female,2019-08-11,,,,,0026-04-01,,23.01,124,Arawali,,,,NAURANGA BASS RAJPUTAN,,SANDEEP KUMAR,,,,SARITA SUHAG,,,,10250,,,,,No,No,No,No,No,No,No,Non-RTE,
884,884,NIKHIL MALHAN,,2 nd,MARS,,9991515470,,,Male,2019-10-30,GEN,,,,,,20,121,Shivalik,17,9,,JHAJJAR,,VIKASH,,,,PREETI,,preetikadyan517@gmail.com,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
25201,25201,HIMANSHI,,2 nd,MARS,,9992052058,,,Female,2019-06-07,GEN,,,,,,20,125,Himalaya,84,76,,BERLA,,KANWALJEET,,,,NAVEEN KUMARI,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
25202,25202,KARTIK,,2 nd,MARS,akumarsheoranoo4@gmail.com,8053315525,,,Male,2018-07-22,GEN,,,,,,31,130,Arawali,82,72,,KANHRA,,AMIT,,,,MUNNI DEVI,,,,9625,,,,,No,No,No,No,No,No,No,Non-RTE,
25203,25203,VANSH,,2 nd,MARS,,9306855824,,,Male,2019-09-03,GEN,,,,,,22,127,Nilgiri,,,,KANHRA,,ARVIND,,,,REKHA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
25205,25205,PALVI,,2 nd,VENUS,,8675673000,,,Female,2018-08-14,,,,,0026-04-01,,20.7,127,Nilgiri,,,,KUBJA NAGAR,,SUNIL KUMAR,,,,MAMTA RANI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
25206,25206,PARI,,2 nd,VENUS,sombirphogat95@gmail.com,9050769040,,,Female,2019-08-04,,,,,0026-04-01,,21.8,122,,31,18,,DHANI KHUBI,,SOMBIR,,,,RENU,,,,9000,,,,,No,No,No,No,No,No,No,Non-RTE,
26201,26201,VICKY,,2 nd,VENUS,,9817309054,,,Male,0019-03-05,,,,,0026-04-01,,,,,,,,KADMA,,AAKASH,,,,RANI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,
26202,26202,MOXIT,,2 nd,VENUS,divyapuniya9025@gmail.com,8708354393,,,Male,2019-06-11,,,,,0026-04-01,,21,120,,81,70,,NIMAR BADESRA,,ASHVINI,,,,DIVYA,,,,10250,,,,,No,No,No,No,No,No,No,Non-RTE,
25204,,JIYA,,2 nd,VENUS,rk47546@gmail.com,9812316649,,,Female,2018-11-14,,,,,0026-04-01,,22.8,130,Himalaya,,,,KANHRA,,RAVI,,,,LALITA,,,,12650,,,,,No,No,No,No,No,No,No,Non-RTE,
25207,,KARTIK,,2 nd,VENUS,mshelpad@gmail.com,8221928860,,,Male,2018-08-08,,,,,0026-04-01,,21.2,121,,,,,BERLA,,MANJEET,,,,POOJA,,,,8850,,,,,No,No,No,No,No,No,No,Non-RTE,`;

async function main() {
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const parsedStudents = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(",").map((c) => c.trim());
    const rowObj = {};
    headers.forEach((h, idx) => {
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
    if (dob.startsWith("0019-")) {
      dob = "2019-" + dob.slice(5);
    } else if (dob.startsWith("0020-")) {
      dob = "2020-" + dob.slice(5);
    }

    let admissionDate = rowObj["Admission Date"] || "";
    if (admissionDate.startsWith("0026-")) {
      admissionDate = "2026-" + admissionDate.slice(5);
    } else if (admissionDate.startsWith("0025-")) {
      admissionDate = "2025-" + admissionDate.slice(5);
    }

    let category = rowObj["Category"] || rowObj["Caste"] || "General";
    if (category === "GEN") category = "General";
    else if (category === "STSC") category = "SC";
    else if (category === "BC-A" || category === "BC-B") category = "OBC";

    const student = {
      admissionNo: admNo,
      rollNo: rollNo,
      name: fullName,
      className: "2",
      section: section,
      house: house,
      gender: rowObj["Gender"] || "",
      category: category,
      motherName: rowObj["Mother Name"] || "",
      fatherName: rowObj["Father Name"] || "",
      dob: dob,
      address: rowObj["Address"] || "",
      mobile: rowObj["Mobile"] || "",
      email: (rowObj["Email"] || "").toLowerCase(),
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
      console.error(`Validation error on row ${i} (${admNo} - ${fullName}):`, errs);
      process.exit(1);
    }

    parsedStudents.push(student);
  }

  console.log(`Successfully parsed and validated ${parsedStudents.length} students.`);

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

  const marsCount = await Student.countDocuments({ className: "2", section: "Mars", active: true });
  const venusCount = await Student.countDocuments({ className: "2", section: "Venus", active: true });
  const totalClass2 = await Student.countDocuments({ className: "2", active: true });
  const grandTotal = await Student.countDocuments({ active: true });

  console.log(`📊 Class 2 Stats:`);
  console.log(`   - Mars section: ${marsCount} students`);
  console.log(`   - Venus section: ${venusCount} students`);
  console.log(`   - Total Class 2: ${totalClass2} students`);
  console.log(`   - Grand Total in ERP: ${grandTotal} active students`);

  // Record Audit log
  await Audit.create({
    action: "import-class2-students",
    target: "Class 2 (Mars & Venus)",
    details: `Imported ${parsedStudents.length} students into Class 2 (Mars: ${marsCount}, Venus: ${venusCount})`,
  });

  // Also create a backup XLSX workbook
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Class 2 Students");
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
  const xlsxPath = path.join(exportDir, "Class_2_Mars_Venus_Students.xlsx");
  await wb.xlsx.writeFile(xlsxPath);
  console.log(`📁 Exported XLSX backup to: ${xlsxPath}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
