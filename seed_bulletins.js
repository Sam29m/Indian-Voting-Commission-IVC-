const mongoose = require('mongoose');
const Bulletin = require('./backend/shared/models/Bulletin');
require('dotenv').config({ path: './backend/.env' });

const seedBulletins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indian-voting-commission');
    
    const bulletins = [
      {
        title: "National Election 2026: Schedule Released",
        content: "The official schedule for the upcoming national general elections has been finalized. Voting will begin on June 15th.",
        category: "news",
        severity: "medium"
      },
      {
        title: "New Security Layer: Triple-Lock Auth",
        content: "IVC has implemented Triple-Lock authentication for all voters. Please ensure your Aadhaar and Face descriptors are up to date.",
        category: "info",
        severity: "low"
      },
      {
        title: "Service Interruption Alert",
        content: "Scheduled maintenance on the voting portal on May 5th from 02:00 AM to 04:00 AM IST.",
        category: "alert",
        severity: "high"
      }
    ];

    await Bulletin.deleteMany({});
    await Bulletin.insertMany(bulletins);
    console.log('✅ Bulletins seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedBulletins();
