import { useState } from 'react'
import idl from "./idl/idl.json";
import { Connection, PublicKey } from "@solana/web3.js";
import InitializeTreasury from './components/InitializeTreasury';
import BuyTokens from './components/BuyTokens';
import RegisterVoter from './components/RegisterVoter';
import RegisterProposal from './components/RegisterProposal';
import Vote from './components/Vote';
import PickWinner from './components/PickWinner';
import WithdrawSol from './components/WithdrawSol';
import CloseProposal from './components/CloseProposal';
import CloseVoter from './components/CloseVoter';
import TokenBalance from './components/TokenBalance';
import VoterInfo from './components/VoterInfo';
import ProposalInfo from './components/ProposalInfo';
import AllProposals from './components/AllProposals';
import TreasuryInfo from './components/TreasuryInfo';

import './App.css'

const programID = new PublicKey("PROGRAMID");
const idlWithAddress = { ...idl, address: programID.toBase58() };

// Network configuration - switch between local and devnet
// Local: "http://127.0.0.1:8899"
// Devnet: "https://api.devnet.solana.com"

const network = "http://127.0.0.1:8899";
const connection = new Connection(network, "processed");

//getProvider function
const getProvider = () => {
  
};

function App() {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('user'); // 'user' or 'admin'

  // Connect Wallet
  const connectWallet = async () => {
    
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Solana Voting dApp</h1>
          <div className="wallet-section">
            {walletAddress && (
              <span className="wallet-address" title={walletAddress}>
                {shortenAddress(walletAddress)}
              </span>
            )}
            <button
              className="connect-btn"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? 'Connecting...' : walletAddress ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>
        {error && <p className="status-message error">{error}</p>}
      </header>

      {/* Navigation Tabs */}
      <nav className="page-nav">
        <button
          className={`nav-tab ${currentPage === 'user' ? 'active' : ''}`}
          onClick={() => setCurrentPage('user')}
        >
          🗳️ Voting
        </button>
        <button
          className={`nav-tab ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentPage('admin')}
        >
          ⚙️ Admin
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentPage === 'user' ? (
          <>
            {/* All Proposals Section - First */}
            <section className="section">
              <h2 className="section-title proposals">All Proposals</h2>
              <div className="cards-grid">
                <AllProposals walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
              </div>
            </section>

            {/* Tokens Section */}
            <section className="section">
              <h2 className="section-title tokens">Tokens</h2>
              <div className="cards-grid">
                <TokenBalance walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} connection={connection} />
                <BuyTokens walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} connection={connection} />
              </div>
            </section>

            {/* Voter Section */}
            <section className="section">
              <h2 className="section-title voter">Voter Management</h2>
              <div className="cards-grid">
                <VoterInfo walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <RegisterVoter walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <CloseVoter walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
              </div>
            </section>

            {/* Proposal Actions Section */}
            <section className="section">
              <h2 className="section-title proposals">Proposal Actions</h2>
              <div className="cards-grid">
                <RegisterProposal walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <ProposalInfo walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <Vote walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <PickWinner walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <CloseProposal walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Admin Page */}
            <section className="section">
              <h2 className="section-title admin">Admin Controls</h2>
              <p className="section-description">
                Initialize and manage the treasury. Only the authority can perform these actions.
              </p>
              <div className="cards-grid">
                <InitializeTreasury walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
                <WithdrawSol walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
              </div>
            </section>

            {/* Treasury Details on Admin Page */}
            <section className="section">
              <h2 className="section-title treasury">Treasury Details</h2>
              <div className="cards-grid">
                <TreasuryInfo walletAddress={walletAddress} idlWithAddress={idlWithAddress} getProvider={getProvider} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
