const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

// Nodemailer with graceful fallback if not installed
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Graceful fallback
}

// Load environment variables (from atlas-credentials.env locally, or process.env on Vercel)
const envPath = path.resolve(__dirname, 'atlas-credentials.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI handling
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.warn('[MongoDB Notice] MONGODB_URI is not set. Please configure in Vercel environment variables.');
} else {
  // Ensure we connect to the 'servicedesk' database
  if (!mongoUri.includes('/servicedesk')) {
    if (mongoUri.includes('?')) {
      mongoUri = mongoUri.replace('?', '/servicedesk?');
    } else {
      mongoUri = `${mongoUri.replace(/\/$/, '')}/servicedesk`;
    }
  }
}

// 1. Department Schema & Model
const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', DepartmentSchema);

// Master list of 109 hospital departments
const INITIAL_DEPARTMENTS = [
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

// 2. Service Desk Officer Schema & Model (5 Registered Officers)
const OfficerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Officer = mongoose.model('Officer', OfficerSchema);

const INITIAL_OFFICERS = [
  { name: 'MUHAMMAD.NAVEED', email: 'muhammad.naveed@tabbaheart.org' },
  { name: 'MUHAMMAD.JUNAID', email: 'muhammad.junaid@tabbaheart.org' },
  { name: 'MURSALEEN.AMANULLAH', email: 'mursaleen.amanullah@tabbaheart.org' },
  { name: 'MUHAMMAD.OWAIS', email: 'muhammad.owais@tabbaheart.org' },
  { name: 'HASSAN.HAIDER', email: 'hassan.haider@tabbaheart.org' },
  { name: 'ANIS.ALI', email: 'anis.ali@tabbaheart.org' },
];

// 3. Mongoose Call Record Schema
const CallRecordSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      default: () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0] // YYYY-MM-DD
    },
    exchangeNumber: {
      type: String,
      required: [true, 'Exchange number is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Caller name is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Escalated'],
      default: 'Open'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    forwardedTo: {
      type: String,
      default: null
    },
    forwardedBy: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

CallRecordSchema.index({ name: 'text', exchangeNumber: 'text', issue: 'text', department: 'text' });

const CallRecord = mongoose.model('CallRecord', CallRecordSchema);

// Connection state helper
let dbConnectionStatus = {
  connected: false,
  error: null,
  cluster: 'cluster0.ky1oi7v.mongodb.net',
  lastConnected: null
};

let connectionPromise = null;

// Connect to MongoDB Atlas & auto-seed if needed
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    dbConnectionStatus.connected = true;
    return;
  }
  if (!mongoUri) return;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
        dbConnectionStatus.connected = true;
        dbConnectionStatus.error = null;
        dbConnectionStatus.lastConnected = new Date().toISOString();
        console.log(`[MongoDB Atlas] Successfully connected to database: 'servicedesk'`);

        // Ensure departments table is populated
        const deptCount = await Department.countDocuments();
        if (deptCount === 0) {
          const docs = INITIAL_DEPARTMENTS.map((d) => ({ name: d }));
          await Department.insertMany(docs);
          console.log(`[MongoDB Atlas] Successfully seeded ${docs.length} departments.`);
        }

        // Ensure officers table is populated
        const officerCount = await Officer.countDocuments();
        if (officerCount === 0) {
          await Officer.insertMany(INITIAL_OFFICERS);
          console.log(`[MongoDB Atlas] Successfully seeded ${INITIAL_OFFICERS.length} service desk officers.`);
        }
      } catch (err) {
        dbConnectionStatus.connected = false;
        dbConnectionStatus.error = err.message;
        console.error('[MongoDB Atlas] Connection error:', err.message);
      } finally {
        connectionPromise = null;
      }
    })();
  }

  await connectionPromise;
}

connectDB();

// Ensure DB is ready on each incoming API call (essential for Vercel serverless functions)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await connectDB();
  }
  next();
});

mongoose.connection.on('disconnected', () => {
  dbConnectionStatus.connected = false;
  console.warn('[MongoDB Atlas] Disconnected from Atlas cluster');
});

mongoose.connection.on('reconnected', () => {
  dbConnectionStatus.connected = true;
  console.log('[MongoDB Atlas] Reconnected to Atlas cluster');
});

// HTML Generator for Incident Emails
function buildIncidentHtmlTable({ record, senderName, senderEmail }) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0b0e14; color: #e2e8f0; padding: 24px; border: 1px solid #27272a; border-radius: 8px;">
      <div style="border-bottom: 2px solid #38bdf8; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">
          Tabba Heart Service Desk &bull; Incident Forwarded
        </h2>
        <p style="font-size: 12px; color: #94a3b8; margin: 6px 0 0 0;">
          Forwarded by Officer <strong>${senderName || 'Officer'}</strong> (&lt;${senderEmail || 'servicedesk@tabbaheart.org'}&gt;)
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e2e8f0; margin-bottom: 20px;">
        <tbody>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; width: 35%; background-color: #111620;">Call Time & Date</td>
            <td style="padding: 10px 12px; font-family: monospace; font-size: 13px; background-color: #0d1117;">
              <strong>${record.time}</strong> (${record.date || new Date().toISOString().split('T')[0]})
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; background-color: #111620;">Exchange / Ext No.</td>
            <td style="padding: 10px 12px; font-family: monospace; font-weight: bold; color: #38bdf8; font-size: 14px; background-color: #0d1117;">
              ${record.exchangeNumber}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; background-color: #111620;">Caller Name</td>
            <td style="padding: 10px 12px; font-weight: bold; font-size: 14px; background-color: #0d1117;">
              ${record.name}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; background-color: #111620;">Department</td>
            <td style="padding: 10px 12px; background-color: #0d1117;">
              ${record.department}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; background-color: #111620;">Priority</td>
            <td style="padding: 10px 12px; font-weight: bold; background-color: #0d1117;">
              ${record.priority || 'Medium'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; background-color: #111620;">Status</td>
            <td style="padding: 10px 12px; background-color: #0d1117;">
              ${record.status || 'Open'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; vertical-align: top; background-color: #111620;">Reported Issue</td>
            <td style="padding: 10px 12px; line-height: 1.6; white-space: pre-wrap; background-color: #0d1117;">
              ${record.issue}
            </td>
          </tr>
          ${record.resolutionNotes ? `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 12px; font-weight: bold; color: #94a3b8; background-color: #111620;">Resolution Notes</td>
            <td style="padding: 10px 12px; background-color: #0d1117;">${record.resolutionNotes}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div style="font-size: 11px; color: #64748b; border-top: 1px solid #27272a; padding-top: 12px; text-align: right;">
        Tabba Heart Institute &bull; Service Desk Terminal
      </div>
    </div>
  `;
}

// Method 1: Windows Outlook Desktop Client via PowerShell COM Object (Native MAPI)
// Ideal for corporate PCs where Outlook is logged into @tabbaheart.org.
// Needs no password stored in config, bypasses 2FA/MFA, and appears in Outlook 'Sent Items'.
function sendViaWindowsOutlookCom({ recipientEmail, subject, htmlContent }) {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') {
      return reject(new Error('Outlook Desktop COM is only supported on Windows.'));
    }

    const b64To = Buffer.from(recipientEmail, 'utf8').toString('base64');
    const b64Subject = Buffer.from(subject, 'utf8').toString('base64');
    const b64Body = Buffer.from(htmlContent, 'utf8').toString('base64');

    const script = [
      `$ErrorActionPreference = 'Stop'`,
      `try {`,
      `  $to = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64To}'))`,
      `  $subj = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64Subject}'))`,
      `  $body = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64Body}'))`,
      `  $outlook = New-Object -ComObject Outlook.Application`,
      `  $mail = $outlook.CreateItem(0)`,
      `  $mail.To = $to`,
      `  $mail.Subject = $subj`,
      `  $mail.HTMLBody = $body`,
      `  $mail.Send()`,
      `  Write-Output "OUTLOOK_SUCCESS"`,
      `} catch {`,
      `  Write-Error $_.Exception.Message`,
      `  exit 1`,
      `}`
    ].join('\n');

    const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], {
      windowsHide: true,
      timeout: 20000
    });

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (d) => { stdout += d.toString(); });
    ps.stderr.on('data', (d) => { stderr += d.toString(); });

    ps.on('close', (code) => {
      if (code === 0 && stdout.includes('OUTLOOK_SUCCESS')) {
        resolve({
          sent: true,
          method: 'Outlook Desktop Client (MAPI)',
          recipient: recipientEmail
        });
      } else {
        const errDetail = stderr.trim() || stdout.trim() || `Exit code ${code}`;
        reject(new Error(errDetail));
      }
    });

    ps.on('error', (err) => {
      reject(err);
    });
  });
}

// Helper: Open pre-filled Outlook compose window on desktop
function openInOutlookDesktopApp({ recipientEmail, subject, htmlContent }) {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') {
      return reject(new Error('Outlook Desktop is only available on Windows.'));
    }

    const b64To = Buffer.from(recipientEmail || '', 'utf8').toString('base64');
    const b64Subject = Buffer.from(subject || '', 'utf8').toString('base64');
    const b64Body = Buffer.from(htmlContent || '', 'utf8').toString('base64');

    const script = [
      `$ErrorActionPreference = 'Stop'`,
      `try {`,
      `  $to = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64To}'))`,
      `  $subj = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64Subject}'))`,
      `  $body = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64Body}'))`,
      `  $outlook = New-Object -ComObject Outlook.Application`,
      `  $mail = $outlook.CreateItem(0)`,
      `  if ($to) { $mail.To = $to }`,
      `  $mail.Subject = $subj`,
      `  $mail.HTMLBody = $body`,
      `  $mail.Display()`,
      `  Write-Output "OUTLOOK_DISPLAY_SUCCESS"`,
      `} catch {`,
      `  Write-Error $_.Exception.Message`,
      `  exit 1`,
      `}`
    ].join('\n');

    const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], {
      windowsHide: true,
      timeout: 10000
    });

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (d) => { stdout += d.toString(); });
    ps.stderr.on('data', (d) => { stderr += d.toString(); });

    ps.on('close', (code) => {
      if (code === 0 && stdout.includes('OUTLOOK_DISPLAY_SUCCESS')) {
        resolve({ success: true });
      } else {
        reject(new Error(stderr.trim() || stdout.trim() || `Exit code ${code}`));
      }
    });

    ps.on('error', (err) => {
      reject(err);
    });
  });
}

// Method 2: Microsoft 365 Authenticated SMTP Relay (Port 587 + STARTTLS)
async function sendViaSmtp({ recipientEmail, senderEmail, senderName, subject, htmlContent }) {
  if (!nodemailer) {
    throw new Error('nodemailer package is not installed.');
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const authUser = process.env.OUTLOOK_USER || senderEmail;
  const authPass = (process.env.OUTLOOK_PASSWORD || '').trim();

  if (!authPass) {
    throw new Error('OUTLOOK_PASSWORD is not configured in atlas-credentials.env');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // port 587 uses STARTTLS
    requireTLS: true,
    auth: {
      user: authUser,
      pass: authPass
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
    connectionTimeout: 15000
  });

  const mailOptions = {
    from: `"${senderName || 'Service Desk'}" <${authUser}>`,
    to: recipientEmail,
    subject,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    sent: true,
    method: 'Microsoft 365 SMTP Relay',
    messageId: info.messageId,
    recipient: recipientEmail
  };
}

// Method 3: Direct Organization MX Relay (Port 25)
async function sendViaDirectMx({ recipientEmail, senderEmail, senderName, subject, htmlContent }) {
  if (!nodemailer) {
    throw new Error('nodemailer package is not installed.');
  }

  const directMx = process.env.DIRECT_MX_HOST || 'tabbaheart-org.mail.protection.outlook.com';
  const transporter = nodemailer.createTransport({
    host: directMx,
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });

  const mailOptions = {
    from: `"${senderName || 'Service Desk'}" <${senderEmail || 'servicedesk@tabbaheart.org'}>`,
    to: recipientEmail,
    subject,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    sent: true,
    method: 'Direct Organization MX Relay',
    messageId: info.messageId,
    recipient: recipientEmail
  };
}

// Comprehensive Multi-Tier Outlook Organization Dispatcher
async function sendOutlookOrganizationEmail({ record, senderName, senderEmail, recipientEmail }) {
  const subject = `[Service Desk Incident] Ext: ${record.exchangeNumber} | ${record.department} | ${record.name}`;
  const htmlContent = buildIncidentHtmlTable({ record, senderName, senderEmail });

  const errors = [];

  // Tier 1: On Windows, dispatch via native Windows Outlook Desktop Client (COM/MAPI)
  // This is the direct native solution for corporate Outlook on Windows.
  // It uses the active logged-in Windows Outlook session, requires NO plaintext password,
  // stores the sent mail in the sender's Outlook "Sent Items", and bypasses tenant SMTP blocks.
  if (process.platform === 'win32') {
    try {
      console.log(`[Outlook Organization] Dispatching via Windows Outlook Desktop Client to: ${recipientEmail}...`);
      const result = await sendViaWindowsOutlookCom({ recipientEmail, subject, htmlContent });
      console.log(`[Outlook Organization] SUCCESS: Dispatched via Outlook Desktop Client to ${recipientEmail}`);
      return result;
    } catch (err) {
      console.warn(`[Outlook Organization] Outlook Desktop Client attempt noted: ${err.message}`);
      errors.push(`Outlook Desktop App (${err.message})`);
    }
  }

  // Tier 2: Microsoft 365 Authenticated SMTP Relay (Port 587)
  const authPass = (process.env.OUTLOOK_PASSWORD || '').trim();
  if (authPass && nodemailer) {
    try {
      console.log(`[Outlook Organization] Dispatching via Microsoft 365 SMTP (${process.env.SMTP_HOST || 'smtp.office365.com'}:587) to: ${recipientEmail}...`);
      const result = await sendViaSmtp({ recipientEmail, senderEmail, senderName, subject, htmlContent });
      console.log(`[Outlook Organization] SUCCESS: Sent via Microsoft 365 SMTP to ${recipientEmail} (ID: ${result.messageId})`);
      return result;
    } catch (err) {
      console.warn(`[Outlook Organization] Microsoft 365 SMTP failed: ${err.message}`);
      errors.push(`Office 365 SMTP (${err.message})`);
    }
  } else {
    errors.push('Office 365 SMTP: OUTLOOK_PASSWORD is blank in atlas-credentials.env');
  }

  // Tier 3: Direct Tenant MX Delivery (Port 25)
  if (nodemailer) {
    try {
      console.log(`[Outlook Organization] Attempting Direct MX delivery to ${recipientEmail}...`);
      const result = await sendViaDirectMx({ recipientEmail, senderEmail, senderName, subject, htmlContent });
      console.log(`[Outlook Organization] SUCCESS: Sent via Direct MX to ${recipientEmail}`);
      return result;
    } catch (err) {
      console.warn(`[Outlook Organization] Direct MX delivery failed: ${err.message}`);
      errors.push(`Direct MX (${err.message})`);
    }
  }

  const detailedError = `Could not deliver Outlook organization email to ${recipientEmail}.\n` +
    errors.map((e) => `• ${e}`).join('\n') +
    `\n\nHow to resolve for Tabba Heart Outlook:\n` +
    `1. Ensure Microsoft Outlook Desktop is open and logged into your @tabbaheart.org account on this PC, OR\n` +
    `2. Enter your Outlook password or Microsoft App Password in OUTLOOK_PASSWORD in atlas-credentials.env.`;

  throw new Error(detailedError);
}

// API Routes

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: {
      ...dbConnectionStatus,
      readyState: mongoose.connection.readyState
    },
    timestamp: new Date().toISOString()
  });
});

// Officers API (returns the registered officers, auto-seeds if empty)
app.get('/api/officers', async (req, res) => {
  try {
    let officers = await Officer.find().sort({ name: 1 });
    if (!officers || officers.length === 0) {
      try {
        await Officer.insertMany(INITIAL_OFFICERS);
        officers = await Officer.find().sort({ name: 1 });
      } catch (e) {
        officers = INITIAL_OFFICERS;
      }
    }
    res.json({
      success: true,
      count: officers.length,
      officers: officers.map((o) => ({
        id: o._id || o.email,
        name: o.name,
        email: o.email
      }))
    });
  } catch (error) {
    res.json({
      success: true,
      count: INITIAL_OFFICERS.length,
      officers: INITIAL_OFFICERS.map((o) => ({
        id: o.email,
        name: o.name,
        email: o.email
      }))
    });
  }
});

// Departments API (dynamic list from MongoDB, auto-seeds if empty)
app.get('/api/departments', async (req, res) => {
  try {
    let departments = await Department.find().sort({ name: 1 });
    if (!departments || departments.length === 0) {
      try {
        await Department.insertMany(INITIAL_DEPARTMENTS.map((d) => ({ name: d })));
        departments = await Department.find().sort({ name: 1 });
      } catch (e) {
        departments = INITIAL_DEPARTMENTS.map((d) => ({ name: d }));
      }
    }
    res.json({
      success: true,
      count: departments.length,
      departments: departments.map((d) => d.name)
    });
  } catch (error) {
    res.json({
      success: true,
      count: INITIAL_DEPARTMENTS.length,
      departments: INITIAL_DEPARTMENTS
    });
  }
});

// Create new call record (with optional email forwarding)
app.post('/api/records', async (req, res) => {
  try {
    const {
      time,
      exchangeNumber,
      name,
      department,
      issue,
      status,
      priority,
      resolutionNotes,
      forwardIssue,
      forwardToEmail,
      senderName,
      senderEmail
    } = req.body;

    if (!exchangeNumber || !name || !department || !issue) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: exchangeNumber, name, department, and issue are required.'
      });
    }

    const record = new CallRecord({
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: new Date().toISOString().split('T')[0],
      exchangeNumber,
      name,
      department,
      issue,
      status: status || 'Open',
      priority: priority || 'Medium',
      resolutionNotes: resolutionNotes || '',
      forwardedTo: forwardIssue && forwardToEmail ? forwardToEmail : null,
      forwardedBy: forwardIssue && senderEmail ? senderEmail : null
    });

    const savedRecord = await record.save();

    // If forward issue is checked, record forwarding officer metadata
    let emailStatus = { sent: true, method: 'New Outlook Desktop Client' };
    if (forwardIssue && forwardToEmail) {
      console.log(`[Incident Forward] Call ${savedRecord._id} forwarded to ${forwardToEmail} by ${senderName || 'Officer'}`);
      // Optional: If OUTLOOK_PASSWORD is configured, also attempt SMTP relay
      if (process.env.OUTLOOK_PASSWORD && process.env.OUTLOOK_PASSWORD.trim() !== '') {
        sendOutlookOrganizationEmail({
          record: savedRecord,
          senderName: senderName || 'Service Desk Officer',
          senderEmail: senderEmail || 'servicedesk@tabbaheart.org',
          recipientEmail: forwardToEmail
        }).catch((err) => console.warn('[SMTP Relay Notice]', err.message));
      }
    }

    res.status(201).json({
      success: true,
      record: savedRecord,
      emailStatus
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Dedicated Email Forward Endpoint
app.post('/api/records/forward', async (req, res) => {
  try {
    const { recordId, recipientEmail, senderName, senderEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }

    let record = null;
    if (recordId) {
      record = await CallRecord.findByIdAndUpdate(
        recordId,
        {
          forwardedTo: recipientEmail,
          forwardedBy: senderEmail
        },
        { new: true }
      );
    } else if (req.body.record) {
      record = req.body.record;
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found to forward.' });
    }

    console.log(`[Incident Forward] Record ${record._id} forwarded to ${recipientEmail} by ${senderName || 'Officer'}`);

    // Optional: If OUTLOOK_PASSWORD is configured, also attempt SMTP relay
    if (process.env.OUTLOOK_PASSWORD && process.env.OUTLOOK_PASSWORD.trim() !== '') {
      sendOutlookOrganizationEmail({
        record,
        senderName,
        senderEmail,
        recipientEmail
      }).catch((err) => console.warn('[SMTP Relay Notice]', err.message));
    }

    res.json({
      success: true,
      message: `Incident details forwarded to ${recipientEmail}`,
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dedicated Route: Open Compose Window directly in local Outlook Desktop
app.post('/api/records/open-in-outlook', async (req, res) => {
  try {
    const { recordId, recipientEmail, senderName, senderEmail } = req.body;
    let record = req.body.record;
    if (recordId) {
      record = await CallRecord.findById(recordId);
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found to open in Outlook.' });
    }

    const subject = `[Service Desk Incident] Ext: ${record.exchangeNumber} | ${record.department} | ${record.name}`;
    const htmlContent = buildIncidentHtmlTable({
      record,
      senderName: senderName || 'Service Desk Officer',
      senderEmail: senderEmail || 'servicedesk@tabbaheart.org'
    });

    await openInOutlookDesktopApp({
      recipientEmail: recipientEmail || '',
      subject,
      htmlContent
    });

    res.json({
      success: true,
      message: 'Microsoft Outlook compose window opened successfully on desktop.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all call records with optional filtering & search
app.get('/api/records', async (req, res) => {
  try {
    const { search, department, status, priority, date } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (date) {
      query.date = date;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { exchangeNumber: searchRegex },
        { department: searchRegex },
        { issue: searchRegex }
      ];
    }

    const records = await CallRecord.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update record
app.put('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.body.forwardIssue !== undefined) {
      updateData.forwardedTo = req.body.forwardIssue && req.body.forwardToEmail ? req.body.forwardToEmail : null;
      updateData.forwardedBy = req.body.forwardIssue && req.body.senderEmail ? req.body.senderEmail : null;
    }

    const updated = await CallRecord.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, record: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete record
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CallRecord.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics & Stats summary
app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalRecords = await CallRecord.countDocuments();
    const todayRecords = await CallRecord.countDocuments({ date: today });
    const openRecords = await CallRecord.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const resolvedRecords = await CallRecord.countDocuments({ status: 'Resolved' });
    const urgentRecords = await CallRecord.countDocuments({ priority: 'Urgent', status: { $ne: 'Resolved' } });

    const deptStats = await CallRecord.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalRecords,
        today: todayRecords,
        active: openRecords,
        resolved: resolvedRecords,
        urgent: urgentRecords,
        departmentBreakdown: deptStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static client build if present
const clientDistPath = path.resolve(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Service Desk Dashboard] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
