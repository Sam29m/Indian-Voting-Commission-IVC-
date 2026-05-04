// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GeneralVotingCommission
 * @dev A decentralized voting smart contract for tamper-proof elections.
 * Each deployment represents one election with a fixed set of candidates
 * and a voting time window enforced on-chain.
 */
contract GeneralVotingCommission {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public admin;
    string public electionTitle;
    uint256 public electionStart;
    uint256 public electionEnd;
    uint256 public candidateCount;
    uint256 public totalVotes;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);
    event ElectionCreated(string title, uint256 candidateCount, uint256 startTime, uint256 endTime);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionActive() {
        require(block.timestamp >= electionStart, "Election has not started yet");
        require(block.timestamp <= electionEnd, "Election has ended");
        _;
    }

    /**
     * @dev Creates a new election with the given candidates and time window.
     * @param _title The title of the election
     * @param _candidateNames Array of candidate names
     * @param _startTime Unix timestamp for election start
     * @param _endTime Unix timestamp for election end
     */
    constructor(
        string memory _title,
        string[] memory _candidateNames,
        uint256 _startTime,
        uint256 _endTime
    ) {
        require(_candidateNames.length > 0, "Must have at least one candidate");
        require(_endTime > _startTime, "End time must be after start time");

        admin = msg.sender;
        electionTitle = _title;
        electionStart = _startTime;
        electionEnd = _endTime;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidateCount++;
            candidates[candidateCount] = Candidate(candidateCount, _candidateNames[i], 0);
        }

        emit ElectionCreated(_title, candidateCount, _startTime, _endTime);
    }

    /**
     * @dev Cast a vote for a candidate. One vote per address.
     * @param _candidateId The ID of the candidate to vote for (1-indexed)
     */
    function vote(uint256 _candidateId) external electionActive {
        require(!hasVoted[msg.sender], "You have already voted in this election");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    /**
     * @dev Get candidate details by ID.
     */
    function getCandidate(uint256 _candidateId) external view returns (uint256, string memory, uint256) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    /**
     * @dev Get all candidates and their vote counts.
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        return allCandidates;
    }

    /**
     * @dev Check if a specific address has voted.
     */
    function hasUserVoted(address _voter) external view returns (bool) {
        return hasVoted[_voter];
    }

    /**
     * @dev Check if the election is currently active.
     */
    function isActive() external view returns (bool) {
        return block.timestamp >= electionStart && block.timestamp <= electionEnd;
    }

    /**
     * @dev Get election info.
     */
    function getElectionInfo() external view returns (
        string memory title,
        uint256 start,
        uint256 end,
        uint256 numCandidates,
        uint256 votes,
        bool active
    ) {
        return (
            electionTitle,
            electionStart,
            electionEnd,
            candidateCount,
            totalVotes,
            block.timestamp >= electionStart && block.timestamp <= electionEnd
        );
    }
}
