const path = require('path');
const dotenv = require('dotenv');

// Load atlas-credentials.env
const envConfig = dotenv.config({ path: path.resolve(__dirname, 'atlas-credentials.env') });
if (envConfig.error) {
  console.error("Error loading atlas-credentials.env:", envConfig.error);
}

const { MongoClient, ServerApiVersion } = require('mongodb');

let uri = process.env.MONGODB_URI;
console.log("Testing connection with URI:", uri ? uri.replace(/:([^@]+)@/, ':****@') : "Undefined");

if (!uri) {
  console.error("No MONGODB_URI found in atlas-credentials.env");
  process.exit(1);
}

// Ensure retryWrites and w=majority or appName
if (!uri.includes('appName=')) {
  uri = uri.includes('?') ? `${uri}&appName=Cluster0` : `${uri}/?appName=Cluster0`;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 8000
});

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("SUCCESS: Pinged MongoDB Atlas successfully! Connected to cluster.");
    
    // Check if servicedesk database exists or can be used
    const db = client.db("servicedesk");
    const collections = await db.listCollections().toArray();
    console.log("Collections in 'servicedesk' database:", collections.map(c => c.name));
  } catch (err) {
    console.error("FAILED to connect to MongoDB Atlas:", err.message);
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error("Hint: Check Atlas username/password.");
    } else if (err.message.includes('whitelisted') || err.message.includes('IP')) {
      console.error("Hint: Current IP address might need to be whitelisted in MongoDB Atlas Network Access.");
    }
  } finally {
    await client.close();
  }
}

run();
