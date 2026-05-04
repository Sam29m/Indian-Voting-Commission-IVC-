import { useWeb3 } from '../context/Web3Context';
import './ConnectWallet.css';

export default function ConnectWallet() {
  const { account, connecting, error, isMetaMaskInstalled, connectWallet, disconnectWallet } = useWeb3();

  if (!isMetaMaskInstalled) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="wallet-btn wallet-install"
        id="btn-install-metamask"
      >
        🦊 Install MetaMask
      </a>
    );
  }

  if (account) {
    return (
      <div className="wallet-connected" id="wallet-status">
        <div className="wallet-indicator" />
        <span className="wallet-address">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <button className="wallet-disconnect" onClick={disconnectWallet} title="Disconnect">
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      className="wallet-btn"
      onClick={connectWallet}
      disabled={connecting}
      id="btn-connect-wallet"
    >
      {connecting ? (
        <>
          <span className="wallet-spinner" />
          Connecting...
        </>
      ) : (
        <>🦊 Connect Wallet</>
      )}
    </button>
  );
}
