import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

// ABI for GeneralVotingCommission contract — only the functions we use
const CONTRACT_ABI = [
  "function vote(uint256 _candidateId) external",
  "function getCandidate(uint256 _candidateId) external view returns (uint256, string, uint256)",
  "function getAllCandidates() external view returns (tuple(uint256 id, string name, uint256 voteCount)[])",
  "function hasUserVoted(address _voter) external view returns (bool)",
  "function isActive() external view returns (bool)",
  "function getElectionInfo() external view returns (string title, uint256 start, uint256 end, uint256 numCandidates, uint256 votes, bool active)",
  "function totalVotes() external view returns (uint256)",
  "function candidateCount() external view returns (uint256)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp)",
];

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isMetaMaskInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('Please install MetaMask to use this application');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const browserSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(browserSigner);
      setChainId(Number(network.chainId));
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  const getContract = useCallback(
    (contractAddress) => {
      if (!signer || !contractAddress) return null;
      return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    },
    [signer]
  );

  const getReadOnlyContract = useCallback(
    (contractAddress) => {
      if (!provider || !contractAddress) return null;
      return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    },
    [provider]
  );

  // Listen for account and chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(Number(newChainId));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, disconnectWallet]);

  // Auto-connect if previously connected
  useEffect(() => {
    if (!isMetaMaskInstalled) return;
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0) connectWallet();
      })
      .catch(() => {});
  }, [isMetaMaskInstalled, connectWallet]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        connecting,
        error,
        isMetaMaskInstalled,
        connectWallet,
        disconnectWallet,
        getContract,
        getReadOnlyContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};
