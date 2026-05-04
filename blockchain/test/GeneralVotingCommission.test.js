const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GeneralVotingCommission", function () {
  let gvc;
  let admin, voter1, voter2, voter3;
  let startTime, endTime;

  beforeEach(async function () {
    [admin, voter1, voter2, voter3] = await ethers.getSigners();

    const now = Math.floor(Date.now() / 1000);
    startTime = now - 60; // started 1 minute ago
    endTime = now + 3600; // ends in 1 hour

    const GVC = await ethers.getContractFactory("GeneralVotingCommission");
    gvc = await GVC.deploy(
      "Test Election",
      ["Alice", "Bob", "Charlie"],
      startTime,
      endTime
    );
    await gvc.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct admin", async function () {
      expect(await gvc.admin()).to.equal(admin.address);
    });

    it("should set the correct election title", async function () {
      expect(await gvc.electionTitle()).to.equal("Test Election");
    });

    it("should register all candidates", async function () {
      expect(await gvc.candidateCount()).to.equal(3);

      const candidate1 = await gvc.getCandidate(1);
      expect(candidate1[1]).to.equal("Alice");

      const candidate2 = await gvc.getCandidate(2);
      expect(candidate2[1]).to.equal("Bob");

      const candidate3 = await gvc.getCandidate(3);
      expect(candidate3[1]).to.equal("Charlie");
    });

    it("should start with zero votes", async function () {
      expect(await gvc.totalVotes()).to.equal(0);
    });

    it("should reject empty candidate list", async function () {
      const GVC = await ethers.getContractFactory("GeneralVotingCommission");
      await expect(
        GVC.deploy("Empty", [], startTime, endTime)
      ).to.be.revertedWith("Must have at least one candidate");
    });

    it("should reject invalid time window", async function () {
      const GVC = await ethers.getContractFactory("GeneralVotingCommission");
      await expect(
        GVC.deploy("Invalid", ["A"], endTime, startTime)
      ).to.be.revertedWith("End time must be after start time");
    });
  });

  describe("Voting", function () {
    it("should allow a user to vote", async function () {
      await gvc.connect(voter1).vote(1);
      const candidate = await gvc.getCandidate(1);
      expect(candidate[2]).to.equal(1); // voteCount
      expect(await gvc.totalVotes()).to.equal(1);
    });

    it("should mark voter as having voted", async function () {
      await gvc.connect(voter1).vote(2);
      expect(await gvc.hasUserVoted(voter1.address)).to.be.true;
    });

    it("should emit VoteCast event", async function () {
      await expect(gvc.connect(voter1).vote(1))
        .to.emit(gvc, "VoteCast");
    });

    it("should prevent double voting", async function () {
      await gvc.connect(voter1).vote(1);
      await expect(gvc.connect(voter1).vote(2)).to.be.revertedWith(
        "You have already voted in this election"
      );
    });

    it("should reject invalid candidate ID (0)", async function () {
      await expect(gvc.connect(voter1).vote(0)).to.be.revertedWith(
        "Invalid candidate ID"
      );
    });

    it("should reject invalid candidate ID (too high)", async function () {
      await expect(gvc.connect(voter1).vote(99)).to.be.revertedWith(
        "Invalid candidate ID"
      );
    });

    it("should allow multiple voters to vote for different candidates", async function () {
      await gvc.connect(voter1).vote(1);
      await gvc.connect(voter2).vote(2);
      await gvc.connect(voter3).vote(1);

      const candidate1 = await gvc.getCandidate(1);
      const candidate2 = await gvc.getCandidate(2);

      expect(candidate1[2]).to.equal(2);
      expect(candidate2[2]).to.equal(1);
      expect(await gvc.totalVotes()).to.equal(3);
    });
  });

  describe("Results", function () {
    it("should return all candidates via getAllCandidates", async function () {
      await gvc.connect(voter1).vote(1);
      await gvc.connect(voter2).vote(3);

      const all = await gvc.getAllCandidates();
      expect(all.length).to.equal(3);
      expect(all[0].name).to.equal("Alice");
      expect(all[0].voteCount).to.equal(1);
      expect(all[2].name).to.equal("Charlie");
      expect(all[2].voteCount).to.equal(1);
    });

    it("should return election info", async function () {
      const info = await gvc.getElectionInfo();
      expect(info.title).to.equal("Test Election");
      expect(info.numCandidates).to.equal(3);
      expect(info.active).to.be.true;
    });
  });

  describe("Election timing", function () {
    it("should report active during election", async function () {
      expect(await gvc.isActive()).to.be.true;
    });
  });

  // Helper to get the current block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
