const app = require('./app');
const connectDB = require('./database/connection');

// Auto-seed if database is empty
async function autoSeed() {
  try {
    const Election = require('./shared/models/Election');
    const User = require('./shared/models/User');
    const AuditLog = require('./shared/models/AuditLog');
    const electionCount = await Election.countDocuments();
    const userCount = await User.countDocuments();
    
    if (electionCount > 0 && userCount > 0) return;

    console.log('📦 Empty database — seeding IVC demo data...');

    const admin = await User.create({
      name: 'Rajesh Kumar', email: 'admin@ivc.gov.in', password: 'admin123',
      role: 'admin', phone: '9876543210', aadhaarNumber: '234567890123', aadhaarVerified: true, constituency: 'National',
    });

    const voter1 = await User.create({
      name: 'Priya Sharma', email: 'priya@example.com', password: 'voter123',
      role: 'voter', phone: '9876543211', aadhaarNumber: '345678901234', aadhaarVerified: true, constituency: 'Mumbai North',
    });

    const voter2 = await User.create({
      name: 'Amit Patel', email: 'amit@example.com', password: 'voter123',
      role: 'voter', phone: '9876543212', aadhaarNumber: '456789012345', aadhaarVerified: true, constituency: 'Delhi East',
    });

    const candidate1 = await User.create({
      name: 'Sunita Devi', email: 'sunita@example.com', password: 'candidate123',
      role: 'candidate', phone: '9876543213', party: 'Bharatiya Janata Party', constituency: 'National',
      aadhaarNumber: '567890123456', aadhaarVerified: true, manifesto: 'Development and progress for all citizens',
    });

    const candidate2 = await User.create({
      name: 'Rahul Verma', email: 'rahul@example.com', password: 'candidate123',
      role: 'candidate', phone: '9876543214', party: 'Indian National Congress', constituency: 'National',
      aadhaarNumber: '678901234567', aadhaarVerified: true, manifesto: 'Social justice and equality',
    });

    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    await Election.create({
      title: '2026 Lok Sabha General Election',
      description: 'Vote for your representative in the 18th Lok Sabha. This election determines the direction of the nation for the next 5 years.',
      type: 'general', constituency: 'National', status: 'active',
      candidates: [
        { userId: candidate1._id, name: 'Sunita Devi', party: 'Bharatiya Janata Party', symbol: '🪷', manifesto: 'Development and progress', voteCount: 0 },
        { userId: candidate2._id, name: 'Rahul Verma', party: 'Indian National Congress', symbol: '✋', manifesto: 'Social justice and equality', voteCount: 0 },
        { name: 'Arvind Singh', party: 'Aam Aadmi Party', symbol: '🧹', manifesto: 'Clean governance', voteCount: 0 },
        { name: 'Mamata Banerjee Jr.', party: 'All India Trinamool Congress', symbol: '🌸', manifesto: 'Regional empowerment', voteCount: 0 },
        { name: 'Kiran Reddy', party: 'Independent', symbol: '🏛️', manifesto: 'Independent voice for the people', voteCount: 0 },
      ],
      startDate: now, endDate: weekLater, createdBy: admin._id,
    });

    await Election.create({
      title: 'Maharashtra State Assembly Election',
      description: 'Elect your representatives for the Maharashtra Vidhan Sabha.',
      type: 'state', constituency: 'Maharashtra', status: 'scheduled',
      candidates: [
        { name: 'Devendra Patil', party: 'Bharatiya Janata Party', symbol: '🪷', manifesto: 'Maharashtra development' },
        { name: 'Uddhav Joshi', party: 'Shiv Sena', symbol: '🏹', manifesto: 'Marathi pride' },
        { name: 'Sharad Deshmukh', party: 'Nationalist Congress Party', symbol: '⏰', manifesto: 'Progressive Maharashtra' },
      ],
      startDate: twoDays, endDate: new Date(twoDays.getTime() + 5 * 24 * 60 * 60 * 1000), createdBy: admin._id,
    });

    await Election.create({
      title: 'Delhi Municipal Corporation Election 2025',
      description: 'Past election for Delhi MCD. Results are final.',
      type: 'local', constituency: 'Delhi', status: 'completed',
      candidates: [
        { name: 'Manoj Tiwari', party: 'Bharatiya Janata Party', symbol: '🪷', voteCount: 1245 },
        { name: 'Atishi Singh', party: 'Aam Aadmi Party', symbol: '🧹', voteCount: 1189 },
        { name: 'Ajay Maken', party: 'Indian National Congress', symbol: '✋', voteCount: 756 },
      ],
      startDate: weekAgo, endDate: new Date(weekAgo.getTime() + 3 * 24 * 60 * 60 * 1000), createdBy: admin._id,
    });

    await AuditLog.log({ action: 'SYSTEM_EVENT', details: 'IVC Platform initialized with demo data', severity: 'info' });
    console.log('✅ Seeded: 3 elections, 5 users');
    console.log('   Admin:     admin@ivc.gov.in / admin123');
    console.log('   Voter:     priya@example.com / voter123');
    console.log('   Voter:     amit@example.com / voter123');
    console.log('   Candidate: sunita@example.com / candidate123');
    console.log('   Candidate: rahul@example.com / candidate123\n');
  } catch (error) {
    console.error('❌ Seeding failed, but starting server anyway:', error);
  }
}

const PORT = process.env.PORT || 5005;

connectDB().then(async () => {
  await autoSeed();
  const server = app.listen(PORT, () => {
    console.log(`\n🗳️  Indian Voting Commission API v2.0 (Service Architecture)`);
    console.log(`   Status:     Operational`);
    console.log(`   Port:       ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Running on: http://localhost:${PORT}\n`);
  });
});
