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

// 5 Service Desk Officers (Capitalized names before @)
const OFFICERS = [
  { name: 'MUHAMMAD.NAVEED', email: 'muhammad.naveed@tabbaheart.org' },
  { name: 'MUHAMMAD.JUNAID', email: 'muhammad.junaid@tabbaheart.org' },
  { name: 'MURSALEEN.AMANULLAH', email: 'mursaleen.amanullah@tabbaheart.org' },
  { name: 'MUHAMMAD.OWAIS', email: 'muhammad.owais@tabbaheart.org' },
  { name: 'HASSAN.HAIDER', email: 'hassan.haider@tabbaheart.org' },
  { name: 'ANIS.ALI', email: 'anis.ali@tabbaheart.org' },
];

const OfficerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);

const Officer = mongoose.model('Officer', OfficerSchema);

async function run() {
  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Database] Connected to "servicedesk" cluster.');

    // Clear previous officers table and re-seed
    await Officer.deleteMany({});
    console.log('[Cleanup] Cleared old officers collection.');

    const result = await Officer.insertMany(OFFICERS);
    console.log(`[Success] Successfully saved ${result.length} Service Desk Officers into 'officers' table:\n`);
    result.forEach((off, idx) => {
      console.log(`  ${idx + 1}. NAME: ${off.name.padEnd(22)} | EMAIL: ${off.email}`);
    });
    console.log('\n[Complete] Officers table is ready.');
  } catch (err) {
    console.error('[Error] Seeding officers failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Database] Disconnected cleanly.');
  }
}

run();
