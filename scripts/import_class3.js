import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import { Student, Audit } from "../server/src/models.js";
import { validateStudent } from "../shared/engine.js";

dotenv.config();

// Raw CSV lines for Class 3
const rawRows = [
  "547,547,HIMANSHI,,3 rd,MARS,,9813080767,,,Female,2018-08-11,BC- B,,,,,,20,115,Arawali,69,58,,KANHRA,,SANDEEP KUMAR,,jalodiyaritu@gmail.com,,RITU BALA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "548,548,LAKSHYA,,3 rd,MARS,,9728506092,,,Male,2018-06-10,GEN,,,,,,31,131,Himalaya,68,57,,RAMBASS,,VIKRAM,,,,MADHU,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "549,549,DIVYA,,3 rd,MARS,,9728506092,,,Female,2018-09-25,GEN,,,,,,26,131,Nilgiri,68,57,,RAMBASS,,SANDEEP,,,,MAMTA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "550,550,YASHMEET,,3 rd,MARS,,8396823960,,,Male,2016-10-08,STSC,,,,,,23,124,Arawali,69,58,,RUDROL,,VINOD KUMAR,,manjugrewall23@gmail.com,,SUDARSHANA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "551,551,JIYA,,3 rd,VENUS,monujanghuo@gmail.com,8814990282,,,Female,2018-03-12,GEN,,,,,,20,125,Arawali,,,,KADMA,,NAVEEN KUMAR,,,,MONIKA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "552,552,DEVANSH,,3 rd,MARS,,9671110939,,,Male,2018-05-13,GEN,,,,,,21,125,Nilgiri,82,72,,KANHRA,,VIPIN KUMAR,,vpnsheoran92@gmail.com,,JYOTI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "553,553,GARVIT,,3 rd,MARS,,9416505430,,,Male,2017-11-25,GEN,,,,,,35,138,Shivalik,,,,PICHOPA KHURD,,PARVEEN KUMAR,,monusheoran189@gmail.com,,NEELAM,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "554,554,ROBIN,,3 rd,MARS,,8930231188,,,Male,2017-12-14,GEN,,,,,,32,128,Shivalik,50,37,,NIHALGARH,,DHARMENDER,,331389839@gmail.com,,SARITA,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "555,555,KHUSHPREET SINGH,,3 rd,MARS,,8816900512,,,Male,2018-07-28,GEN,,,,,,26,130,Nilgiri,84,76,,NIMAR,,NARESH KUMAR,,nkt.cdlu@gmail.com,,NEERU KUMARI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "556,556,CHAHAL CHOUDHARY,,3 rd,MARS,,8814906181,,,Female,2018-08-31,GEN,,,,,,24,128,Shivalik,33,11,,DHANI KHUBI,,KASHMIR,,ksvijarniya@gmail.com,,SUDESH,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "557,557,ANGEL,,3 rd,MARS,,8689093592,,,Female,2018-09-02,GEN,,,,,,19,130,Nilgiri,82,72,,KANHRA,,RAKESH,,sheoranrakesh1991@gmail.com,,KAVITA,,,,1300,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "559,559,KHUSHI,,3 rd,JUPITER,,9050216682,,,Female,2018-11-13,GEN,,,,,,21,120,Nilgiri,35,22,,BERLA,,NAVDEEP KUMAR,,ashasheoran012@gmail.com,,ASHA,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "561,561,MAYANK,,3 rd,MARS,,9091358824,,,Male,2018-02-18,GEN,,,,,,22,127,Himalaya,,,,DHANASARI,,MANOJ KUMAR,,thalormanoj@gmail.com,,ANITA KUMARI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "562,562,DISHU,,3 rd,MARS,,9802211597,,,Female,2017-12-25,GEN,,,,,,23,125,Arawali,63,52,,KUBJA NAGAR,,KRISHAN KUMAR,,krishanchahal599@gmail.com,,TARAWATI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "563,563,VAANI,,3 rd,MARS,,9817145677,,,Female,2018-03-24,GEN,,,,,,23,133,Arawali,40,27,,HANSAWAS,,ANIL KUMAR,,rekhasheoran480@gmai.com,,REKHA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "564,564,BHAVIKA DHILLON,,3 rd,MARS,,9050156118,,,Female,2017-12-20,GEN,,,,,,21,129,Shivalik,,,,RAMBASS,,NAVEEN KUMAR,,naveendhillon.118@gmail.com,,ANITA KUMARI,,,,10600,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "565,565,DIVYANSHI,,3 rd,JUPITER,,9671592299,,,Female,2018-11-19,GEN,,,,,,17,110,Himalaya,,,,DAGROLI,,SUNIL KUMAR,,,,SUSHIL KUMARI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "566,566,MANVEEK,,3 rd,JUPITER,,9812160770,,,Male,2018-11-30,GEN,,,,,,22,125,Shivalik,34,15,,DAGROLI,,ARVIND,,,,REKHA RANI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "567,567,SHUBHAM,,3 rd,JUPITER,,8683032011,,,Male,2018-05-21,STSC,,,,,,26,130,Arawali,,,,DAGROLI,,JAIVIR,,,,RAJWANTI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "568,568,NAINA,,3 rd,VENUS,,7988162291,,,Female,2017-05-11,GEN,,,,,,16,110,Shivalik,45,32,,JEWALI,,AMARJEET,,,,GEETA,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "569,569,JIVIKA,,3 rd,VENUS,,9306833090,,,Female,2018-05-31,GEN,,,,,,36,131,Nilgiri,54,42,,KUBJA NAGAR,,PRAVEEN KUMAR,,,,MAMTA,,,,17000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "570,570,VIDHI,,3 rd,VENUS,gauravsheoran120@gmail.com,9813408125,,,Female,2018-07-12,GEN,,,,,,23,125,Arawali,,,,BERLA,,RAKESH,,,,URMILA,,,,17000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "571,571,PARTIK,,3 rd,VENUS,Kuldeepsheoran@gmai.com,9812418577,,,Male,2017-06-03,GEN,,,,,,25,135,Arawali,,,,CHANDWAS,,KULDEEP,,,,SUMAN,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "573,573,PRINCE,,3 rd,VENUS,princeitktan63163@gmail.com,8708989023,,,Male,2017-10-29,STSC,,,,,,20,128,Shivalik,34,15,,DAGROLI,,RAVINDER KUMAR,,,,SURYANTA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "574,574,CHINTU,,3 rd,VENUS,,9053597453,,,Male,2018-07-07,GEN,,,,,,18,115,Shivalik,,,,GOPALWAS,,RANBIR,,,,ANJU LATA,,,,15700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "575,575,UTTAM LAMBA,,3 rd,VENUS,,9813145698,,,Male,2018-07-09,GEN,,,,,,25,130,Arawali,68,57,,RAMBASS,,SUMIT KUMAR,,,,BABLI SANGWAN,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "576,576,DAKSH SANGWAN,,3 rd,VENUS,,9050853642,,,Male,2018-05-21,GEN,,,,,,25,130,Arawali,34,15,,KUBJA NAGAR,,SOURABH SANGWAN,,,,POOJA KUMARI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "577,577,VISHU,,3 rd,VENUS,,9812874437,,,Female,0017-12-31,GEN,,,,,,18,115,Shivalik,63,52,,NIMAR BADESRA,,NAVEEN KUMAR,,,,SUREKHA,,,,10200,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "579,579,NAVYA,,3 rd,VENUS,ys17598@gmail.com,7014017309,,,Female,2019-02-26,GEN,,,,,,33,135,Nilgiri,17,9,,KOLINDA (JHUNJHANU),,ARVIND KUMAR,,,,SAVITA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "580,580,PRACHI,,3 rd,VENUS,,9306560958,,,Female,2018-12-28,STSC,,,,,,,,Arawali,,,,BERLA,,PARDEEP,,,,SONAM,,,,12300,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "582,582,DEVANSH SANGWAN,,3 rd,VENUS,,7027059179,,,Male,2018-09-25,GEN,,,,,,25,130,Arawali,,,,KUBJA NAGAR,,CHITRESH KUMAR,,,,MONU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "614,614,HETANSH,,3 rd,VENUS,sannyaggarwal643@gmail.com,9813610101,,,Male,2018-10-31,GEN,,,,,,38,130,Nilgiri,33,11,,BERLA,,SANDEEP KUMAR,,,,SHWETA GOEL,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "615,615,HARTVIK,,3 rd,VENUS,bhambhurekha4@gmai.com,8607498704,,,Male,2018-10-05,GEN,,,,,,19,123,Nilgiri,64,53,,NIMAR BAD.,,RAVINDER KUMAR,,,,REKHA RANI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "617,617,AARVI,,3 rd,VENUS,Sangeetashearan72@gmail.com,9812785188,,,Female,2018-09-29,GEN,,,,,,20,130,Nilgiri,,,,HUI,,SANDEEP KUMAR,,,,SANGEETA,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "618,618,CHIRAG,,3 rd,VENUS,,8307379604,,,Male,2017-11-30,BC- B,,,,,,30,135,Himalaya,58,46,,M.HARIYA,,SANDEEP KUMAR,,,,POOJA,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "619,619,PRIYANSHI,,3 rd,VENUS,narendrasinghns7755608@gmail.com,9991835162,,,Female,2018-06-20,GEN,,,,,,21,123,Shivalik,82,72,,KANHRA,,NARENDER,,,,NEELAM,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "620,620,MOHIT,,3 rd,VENUS,poojajaata3@gmail.com,9812583959,,,Male,2018-04-17,GEN,,,,,,26,130,Nilgiri,82,72,,KANHRA,,SOMBIR,,,,POOJA,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "621,621,DEVANSHI,,3 rd,VENUS,bantikala1991@gmail.com,9050775767,,,Female,2018-08-28,GEN,,,,,,23,135,Shivalik,34,15,,DAGROLI,,BANTI,,,,PUSHPA,,,,650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "623,623,NAVNEET,,3 rd,VENUS,pardeepsanguran199012@gmail.com,8816998066,,,Male,2018-01-12,GEN,,,,,,20,125,Nilgiri,54,42,,KUBJA NAGAR,,PARDEEP KUMAR,,,,MONIKA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "625,625,RITIKA,,3 rd,JUPITER,,9992171896,,,Female,2018-04-29,GEN,,,,,,20,128,Arawali,63,52,,NIMAR BAD.,,DHARMENDER,,dharmender250484@gmail.com,,TARA RANI,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "627,627,TINKESH,,3 rd,JUPITER,,8607290611,,,Male,2018-12-28,GEN,,,,0024-05-15,,22,119,Nilgiri,50,37,,KADMA,,RAJESH,,,,SUNITA,,,,15050,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "628,628,KHUSHI,,3 rd,JUPITER,,9306159558,,,Female,2018-03-14,GEN,,,,0024-05-15,,33,131,Shivalik,82,72,,KANHRA,,PRADEEP KUMAR,,,,PINKI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "629,629,YUVRAJ,,3 rd,JUPITER,,9919997865,,,Male,2019-02-05,STSC,,,,,,20,123,Arawali,,,,RASIDPURMAI,,AMIT KUMAR,,,,ARTI SAGAR,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  '630,630,HIMANSHU,,3 rd,JUPITER,,9812331171,,,Male,2016-12-16,GEN,,,,,,29,134,Himalaya,40,27,,"HANSAWAS KALAN",,SATISH,,,,MEENA KUMARI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,',
  "648,648,PARIKSHIT,,3 rd,MARS,,8307060131,,,Male,2018-05-26,OBC,,,,,,18,121,Nilgiri,49,36,,KADMA,,SHASHI,,,,KAVITA,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "650,650,NAVYA,,3 rd,JUPITER,,8053838835,,,Female,2018-01-13,BC-A,,,,,,23,125,Nilgiri,63,52,,NIMAR,,KRISHAN KUMAR,,,,POONAM,,poonamrajotia01@gmail.com,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "651,651,RISHIKA,,3 rd,MARS,,9518231272,,,Female,2019-03-22,GEN,,,,,,,,Arawali,34,15,,DAGROLI,,SOMVIR SINGH,,somvir1991singh@gmail.com,,JYOTI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "652,652,NIKHIL,,3 rd,JUPITER,,9350181498,,,Male,2019-03-25,GEN,,,,,,21,118,Shivalik,,,,MANDHI H.,,HARISH,,monukaushik111997@gamil.com,,ANAMIKA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "653,653,HIYAAN,,3 rd,MARS,,7419080890,,,Male,2019-03-17,GEN,,,,,,25,130,Himalaya,34,15,,DAGROLI,,VIRENDER,,viren792rn@gmail.com,,SHIWANI,,,,12300,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "654,654,PULKIT JAKHAR,,3 rd,JUPITER,,8930793719,,,Male,2019-03-22,GEN,,,,,,22,123,Nilgiri,82,72,,Devrala,,AMIT KUMAR,,,,ANKIT KUMARI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "668,668,HARSH,,3 rd,JUPITER,,9050090720,,,Male,2019-04-14,GEN,,,,,,26,128,Himalaya,,,,RAMBASS,,NAVEEN KUMAR,,,,POONAM,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "669,669,JATIN,,3 rd,JUPITER,,9812206796,,,Male,2016-09-26,STSC,,,,,,26,131,,58,46,,MANDHI HARIYA,,ANIL KUMAR,,,,RAJKAMAL,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "693,693,PARI,,3 rd,JUPITER,,9812620504,,,Female,2018-09-10,GEN,,,,,,23,120,Nilgiri,,,,Devrala,,DHARMBIR,,,,NISHA KUMARI,,nishaphogat3719@gmail.com,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "700,700,DEEPANSHI,,3 rd,MARS,,9991932215,,,Female,2017-12-25,GEN,,,,,,25,132,Arawali,,,,NIMAR,,SUNIL,,,,MEENU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "701,701,PRIYANSHI,,3 rd,MARS,,9991932215,,,Female,2016-09-04,GEN,,,,,,32,141,Himalaya,,,,NIMAR,,SUNIL,,,,MEENU,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "711,711,AELY,,3 rd,JUPITER,,9588733326,,,Female,2017-08-16,GEN,,,,,,22,126,Arawali,45,32,,JEWALI,,BALJEET KUMAR,,,,VARSHA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "724,724,SHIVAM,,3 rd,JUPITER,,9034917274,,,Male,2017-08-10,GEN,,,,,,24,131,Shivalik,84,76,,BERLA,,SUDESH KUMAR,,,,ANJU KUMARI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "729,729,DEEPAK,,3 rd,MARS,,9728488198,,,Male,2017-04-06,GEN,,,,,,30,140,Arawali,,,,PICHOPA,,DHILU RAM,,,,SHALU,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "737,737,BHAUMIK,,3 rd,JUPITER,,9050798115,,,Male,2017-09-29,GEN,,,,,,25,130,Nilgiri,68,57,,RAMBASS,,RAJ KUMAR,,,,NEELAM DEVI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "739,739,ARYAN LAMBA,,3 rd,JUPITER,,9588745984,,,Male,2015-12-21,GEN,,,,,,29,135,Arawali,68,57,,RAMBASS,,MANJEET SINGH,,,,PINKI DEVI,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "763,763,HANSHU,,3 rd,MARS,,9991655709,,,Male,2017-11-09,GEN,,,,,,29,128,Himalaya,16,8,,BADRAI,,SUNIL KUMAR,,,,MONU KUMARI,,,,11650,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "772,772,YASH,,3 rd,MARS,,8814899575,,,Male,2016-07-25,GEN,,,,,,23,127,Shivalik,,,,BHANDWA,,DHARMENDER,,dharmendrasheoran22@gmail.com,,INDUMAYA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "783,783,ANSHIKA YADAV,,3 rd,VENUS,arunhrsa3960@gmail.com,8814003062,,,Female,2018-05-02,BC- B,,,,,,25,128,Arawali,62,51,,NIHALGARH,,ARUN KUMAR YADAV,,,,MONIKA YADAV,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "790,790,DIVYA,,3 rd,JUPITER,,7015023648,,,Female,2018-06-08,GEN,,,,,,18,115,Arawali,,,,NIMAR,,AMIT KUMAR,,,,SONIA,,,,5400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "791,791,MAYANK,,3 rd,JUPITER,,8398900982,,,Male,2018-03-03,GEN,,,,,,19,112,Arawali,,,,Nimar,,KRISHAN KUMAR,,krishansaharan0009@gmail.com,,BEERMATI,,,,15700,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "797,797,NISHU,,3 rd,JUPITER,,8818003780,,,Female,2018-03-08,GEN,,,,,,25,129,Himalaya,68,57,,RAMBASS,,PARDEEP KUMAR,,,,NEELAM,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "871,871,SAMRIDHI SANGWAN,,3 rd,MARS,,9034033983,,,Female,2018-05-18,GEN,,,,,,22,125,Arawali,,,,PICHOPA,,VINAY SANGWAN,,ektad15@gmail.com,,EKTA,,,,5600,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "872,872,MOHIT,,3 rd,VENUS,sk0739869483@gmail.com,9992968478,,,Male,2017-03-11,GEN,,,,,,21,127,Himalaya,63,52,,NIMAR BADESRA,,SURESH KUMAR,,,,SUSHILA DEVI,,,,14400,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "25301,25301,MANSHI,,3 rd,JUPITER,,8059690209,,,Female,2019-11-27,GEN,,,,,,18,111,Arawali,45,32,,JEWALI,,SOMBIR,,,,BHATERI,,,,17000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "25302,25302,MAYANK,,3 rd,JUPITER,,9812593752,,,Male,2015-12-04,GEN,,,,,,27,137,Nilgiri,,,,ADHAMPUR,,RAVI,,,,LALITA,,,,12300,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26301,26301,HARDIK,,3 rd,JUPITER,,9728750138,,,Male,2018-05-19,GEN,,,,,,21,120,Shivalik,82,72,,KANHRA,,BIRENDER,,,,SALOCHANA,,,,11000,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26302,26302,ISHIKA,,3 rd,MARS,,7027363230,,,Female,2016-10-16,OBC,,,,,,25,124,Arawali,,,,Rudrol,,VIKAS,,vikasjangra32570@gmail.com,,LALI,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
  "26303,26303,NISHU,,3 rd,VENUS,,9992968478,,,Female,2018-07-24,GEN,,,,,,29,127,Himalaya,,,,M.HARIYA,,SOMBIR,,,,POOJA,,,,0,,,,,No,No,No,No,No,No,No,Non-RTE,",
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
    else if (section === "JUPITER") section = "Jupiter";

    let house = rowObj["House"] || "";
    if (house.toLowerCase() === "arawali") house = "Aravali";

    let dob = rowObj["DOB"] || "";
    if (dob.startsWith("0017-")) dob = "2017-" + dob.slice(5);
    else if (dob.startsWith("0018-")) dob = "2018-" + dob.slice(5);
    else if (dob.startsWith("0016-")) dob = "2016-" + dob.slice(5);
    else if (dob.startsWith("0019-")) dob = "2019-" + dob.slice(5);

    let admissionDate = rowObj["Admission Date"] || "";
    if (admissionDate.startsWith("0024-")) admissionDate = "2024-" + admissionDate.slice(5);
    else if (admissionDate.startsWith("0025-")) admissionDate = "2025-" + admissionDate.slice(5);
    else if (admissionDate.startsWith("0026-")) admissionDate = "2026-" + admissionDate.slice(5);

    let category = rowObj["Category"] || rowObj["Caste"] || "General";
    category = category.trim();
    if (category === "GEN") category = "General";
    else if (category === "STSC" || category === "SC") category = "SC";
    else if (category === "BC-A" || category === "BC-B" || category === "BC- B" || category === "OBC") category = "OBC";

    let address = rowObj["Address"] || "";
    address = address.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim();

    let email = (rowObj["Email"] || rowObj["Father Email"] || "").toLowerCase().trim();
    email = email.replace(/@gmai\.com$/, "@gmail.com").replace(/@gamil\.com$/, "@gmail.com");

    const student = {
      admissionNo: admNo,
      rollNo: rollNo,
      name: fullName,
      className: "3",
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

  console.log(`Successfully parsed and validated ${parsedStudents.length} students for Class 3.`);

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

  const marsCount = await Student.countDocuments({ className: "3", section: "Mars", active: true });
  const venusCount = await Student.countDocuments({ className: "3", section: "Venus", active: true });
  const jupiterCount = await Student.countDocuments({ className: "3", section: "Jupiter", active: true });
  const totalClass3 = await Student.countDocuments({ className: "3", active: true });
  const grandTotal = await Student.countDocuments({ active: true });

  console.log(`📊 Class 3 Stats:`);
  console.log(`   - Mars section: ${marsCount} students`);
  console.log(`   - Venus section: ${venusCount} students`);
  console.log(`   - Jupiter section: ${jupiterCount} students`);
  console.log(`   - Total Class 3: ${totalClass3} students`);
  console.log(`   - Grand Total in ERP: ${grandTotal} active students`);

  // Record Audit log
  await Audit.create({
    action: "import-class3-students",
    target: "Class 3 (Mars, Venus & Jupiter)",
    details: `Imported ${parsedStudents.length} students into Class 3 (Mars: ${marsCount}, Venus: ${venusCount}, Jupiter: ${jupiterCount})`,
  });

  // Also create a backup XLSX workbook
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Class 3 Students");
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
  const xlsxPath = path.join(exportDir, "Class_3_Mars_Venus_Jupiter_Students.xlsx");
  await wb.xlsx.writeFile(xlsxPath);
  console.log(`📁 Exported XLSX backup to: ${xlsxPath}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
