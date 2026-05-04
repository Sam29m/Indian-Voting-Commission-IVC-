const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Election = require('./models/Election');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/general-voting-commission';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Election.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gvc.org',
      password: 'admin123',
      role: 'admin',
      walletAddress: '',
    });
    console.log('Created admin user: admin@gvc.org / admin123');

    // Create voter users
    const voter1 = await User.create({
      name: 'Alice Voter',
      email: 'alice@example.com',
      password: 'voter123',
      role: 'voter',
    });

    const voter2 = await User.create({
      name: 'Bob Voter',
      email: 'bob@example.com',
      password: 'voter123',
      role: 'voter',
    });
    console.log('Created voter users: alice@example.com, bob@example.com (password: voter123)');

    // Create sample elections
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    await Election.create({
      title: '2026 General Council Election',
      description: 'Vote for the next General Council representatives. This election determines the leadership direction for the next 4 years. All registered voters with verified wallets are eligible to participate.',
      candidates: [
        { name: 'Alexandra Chen', party: 'Progressive Alliance' },
        { name: 'Marcus Johnson', party: 'Unity Coalition' },
        { name: 'Priya Patel', party: 'Reform Party' },
        { name: 'David Okonkwo', party: 'Citizens Front' },
        { name: 'Sofia Rodriguez', party: 'Independent' },
      ],
      startDate: now,
      endDate: oneWeekLater,
      contractAddress: '',
      createdBy: admin._id,
    });

    await Election.create({
      title: 'Community Budget Proposal Vote',
      description: 'Decide how the community development budget should be allocated for the upcoming fiscal year. Choose between the proposed allocation plans.',
      candidates: [
        { name: 'Plan A: Infrastructure Focus', party: 'Budget Committee' },
        { name: 'Plan B: Education Priority', party: 'Budget Committee' },
        { name: 'Plan C: Balanced Approach', party: 'Budget Committee' },
      ],
      startDate: twoDaysLater,
      endDate: new Date(twoDaysLater.getTime() + 5 * 24 * 60 * 60 * 1000),
      contractAddress: '',
      createdBy: admin._id,
    });

    await Election.create({
      title: 'Board of Directors Election 2025',
      description: 'Annual election for the Board of Directors. This election has concluded and results are final.',
      candidates: [
        { name: 'James Wright', party: 'Development League' },
        { name: 'Maria Santos', party: 'Innovation Party' },
        { name: 'Chen Wei', party: 'Stability First' },
      ],
      startDate: oneWeekAgo,
      endDate: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      contractAddress: '',
      createdBy: admin._id,
    });

    console.log('Created 3 sample elections (active, upcoming, completed)');
    console.log('\n✅ Database seeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
