const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const now = Math.floor(Date.now() / 1000);
  const startTime = now; // starts immediately
  const endTime = now + 7 * 24 * 60 * 60; // ends in 7 days

  const candidateNames = [
    "Alexandra Chen",
    "Marcus Johnson",
    "Priya Patel",
    "David Okonkwo",
    "Sofia Rodriguez"
  ];

  const GVC = await hre.ethers.getContractFactory("GeneralVotingCommission");
  const gvc = await GVC.deploy(
    "2026 General Council Election",
    candidateNames,
    startTime,
    endTime
  );

  await gvc.waitForDeployment();
  const address = await gvc.getAddress();

  console.log(`\n✅ GeneralVotingCommission deployed to: ${address}`);
  console.log(`   Election: 2026 General Council Election`);
  console.log(`   Candidates: ${candidateNames.length}`);
  console.log(`   Start: ${new Date(startTime * 1000).toISOString()}`);
  console.log(`   End:   ${new Date(endTime * 1000).toISOString()}`);
  console.log(`\n📋 Copy this address to your .env file as CONTRACT_ADDRESS`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
