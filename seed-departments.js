const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load MongoDB credentials
dotenv.config({ path: path.resolve(__dirname, 'atlas-credentials.env') });

let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Error: MONGODB_URI not found in atlas-credentials.env');
  process.exit(1);
}

if (!mongoUri.includes('/servicedesk')) {
  if (mongoUri.includes('?')) {
    mongoUri = mongoUri.replace('?', '/servicedesk?');
  } else {
    mongoUri = `${mongoUri.replace(/\/$/, '')}/servicedesk`;
  }
}

const DEPARTMENTS = [
  "ATF - Accounts",
  "Accommodation Services",
  "Admin Secretariat",
  "Administration",
  "Allied Health Sciences",
  "Ambulatory Services",
  "Anesthesia",
  "Bio-Medical",
  "C.S.S.D.",
  "CCU",
  "CME committee",
  "CT Surgery & Anesthesia",
  "Cardiac Anesthesia",
  "Cardiac Cath Lab",
  "Cardiac Emergency",
  "Cardiac Perfusion",
  "Cardiology",
  "Cardiology (ER)",
  "Cardiothoracic Surgery",
  "Cath Lab",
  "Clinical Administration",
  "Clinical Laboratory",
  "Clinical Research",
  "Clinical Research CTS",
  "Clinical Research Cardiology",
  "Clinical Research Project",
  "Clinical Secretariat",
  "Collection Unit - (GI)",
  "Collection Unit - (GJ)",
  "Communication",
  "Community Pharmacy",
  "Contact Centre",
  "DHA (Clinic)",
  "DeparmentT01",
  "Diabetic & Endocr. Serv.",
  "Diagnostic Services",
  "Diagnostics Services",
  "EP & Arrhythmia Services",
  "Echo Lab",
  "Echocardioghraphy",
  "Elite/Special Squad",
  "Emergency Room",
  "Facility Mgt. & Eng. Services",
  "Filter & Consultant Clinic",
  "Finance and Accounts",
  "General Ward",
  "H.I.M.S.",
  "HDU",
  "Human Resource",
  "I.C.T",
  "Infection Control",
  "Inpatient Administration & Other Services",
  "Inpatient Consultation Services",
  "Intensive Care Unit",
  "Intensive Care Unit - II",
  "Internal Audit",
  "Lab Collection Unit",
  "Laboratory",
  "Laboratory (Obsolete)",
  "Laundry",
  "Library",
  "LuckyOne Diagnostic Services",
  "M.I.S.",
  "Marketing & Outreach Serv.",
  "Med. Prof. Services",
  "Medical & Clinical",
  "Medical & Clinical Affairs",
  "Medical Prof. Services",
  "Medical Records",
  "Medical Services",
  "Non Invasive Cardiology",
  "Nuclear",
  "Nuclear Cardiology",
  "Nursing (CCU)",
  "Nursing Education Services",
  "Nursing Secretariat",
  "Nursing Services",
  "Operation Room",
  "Other General Procedures",
  "Outreach Marketing",
  "Outreach Medical Centre (GJ)",
  "Outreach Services / OP-DHA-Clinics",
  "Oxygen, Vent & Other Services",
  "P.B.S.D.",
  "Patient Relation",
  "Patient Safety & QAD",
  "Patient Welfare Department",
  "Pharmacy Services",
  "Physiology",
  "Prev. Card & Rehab",
  "Private - I",
  "Private - II",
  "Quality Assurance THI",
  "Radiology",
  "Safety and Security",
  "School of Nursing",
  "Step Down Unit",
  "Supply Chain Management",
  "Support Services",
  "Surgery",
  "THI Medical Centre - DHA",
  "THI Medical Centre - Doctor Lane HYD.",
  "THI Medical Centre - HYD.",
  "THI Medical Centre - KE",
  "THI Medical Centre - Malir Cantt.",
  "THI Medical Centre - North Karachi",
  "THI Medical Centre - North Nazimabad",
  "THI Medical Centre - Quetta",
  "TKI Diagnostic Services",
  "Transport Services",
  "Warehouse",
  "Welfare / Coordination"
];

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', DepartmentSchema);

// Call Record Schema for removing test data
const CallRecordSchema = new mongoose.Schema({}, { strict: false });
const CallRecord = mongoose.model('CallRecord', CallRecordSchema);

async function run() {
  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Database] Connected to "servicedesk" successfully.');

    // 1. Remove all test data from call records
    const deleteRecordsResult = await CallRecord.deleteMany({});
    console.log(`[Cleanup] Removed ${deleteRecordsResult.deletedCount} test call record(s).`);

    // 2. Clear existing departments collection and seed fresh list
    await Department.deleteMany({});
    console.log('[Cleanup] Cleared old departments collection.');

    const docsToInsert = DEPARTMENTS.map((deptName) => ({ name: deptName }));
    const insertResult = await Department.insertMany(docsToInsert);
    console.log(`[Success] Successfully saved ${insertResult.length} departments into 'departments' table!`);

    console.log('\n--- First 10 Saved Departments Sample ---');
    insertResult.slice(0, 10).forEach((d, idx) => {
      console.log(`  ${idx + 1}. ${d.name}`);
    });
    console.log(`  ... and ${insertResult.length - 10} more.\n`);
  } catch (err) {
    console.error('[Error] Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Database] Disconnected cleanly.');
  }
}

run();
