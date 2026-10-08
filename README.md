# Tabba Heart Institute — ICT Service Desk Dashboard

A professional Service Desk Officer terminal and incident logging dashboard built for Tabba Heart Institute.

## Features

- **Live MongoDB Atlas Integration**: Real-time CRUD operations connected to MongoDB Atlas `servicedesk` database.
- **Officer Session Switcher**: Quick toggle between registered ICT Service Desk Officers.
- **Department Typeahead**: Searchable typeahead covering 109 hospital departments.
- **Microsoft Outlook Desktop Dispatch**: Zero-credential native Outlook integration for forwarding incident reports directly to on-duty officers.
- **Video Background**: Tactical dark telemetry aesthetic with HD looping background and controls.
- **Analytics & Incident Metrics**: Live status and priority counts with department breakdown.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Express, Node.js, Mongoose
- **Database**: MongoDB Atlas
- **Mail Integration**: Native Microsoft Outlook Client Handler (`mailto:`)

---

## Deployment on Vercel

1. **Push to GitHub**:
   Ensure this project is pushed to your GitHub repository:
   `https://github.com/Mursaleen-4/SERVICE-DESK-NOTEPAD`

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository: `SERVICE-DESK-NOTEPAD`.
   - Vercel will automatically detect `vercel.json` and build settings.

3. **Set Environment Variables in Vercel**:
   In the Vercel Project Setup page under **Environment Variables**, add:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string:
     `mongodb+srv://makbaloch4_db_user:mRXMjYNPZtPvNHuv@cluster0.ky1oi7v.mongodb.net/servicedesk`

4. **Deploy**:
   Click **Deploy**. Your dashboard will be live on Vercel with serverless API routes connected to MongoDB Atlas!

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   npm --prefix client install
   ```

2. Run both server and client:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` or `http://localhost:5000` in your browser.
