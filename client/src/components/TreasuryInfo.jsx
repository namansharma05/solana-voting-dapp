import React, { useState, useEffect } from 'react'
import { SEEDS } from '../constants/constants';
import { PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from '@solana/spl-token';

const TreasuryInfo = ({ walletAddress, idlWithAddress, getProvider }) => {
    const [treasuryInfo, setTreasuryInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTreasuryInfo = async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
          
        } catch (err) {
            console.error("Error fetching treasury info:", err);
            setError("Failed to fetch treasury info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (walletAddress) {
            fetchTreasuryInfo();
        }
    }, [walletAddress]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const lamportsToSol = (lamports) => {
        return (Number(lamports) / 1_000_000_000).toFixed(4);
    };

    // Convert raw token amount to tokens (6 decimals)
    const rawToTokens = (raw) => {
        return (Number(raw) / 1_000_000).toFixed(2);
    };

    if (!walletAddress) {
        return (
            <div className="card treasury-info-card">
                <h2>🏦 Treasury Information</h2>
                <p className="info-text">Connect wallet to view treasury info</p>
            </div>
        );
    }

    return (
        <div className="card treasury-info-card">
            <h2>🏦 Treasury Information</h2>

            {loading && <p className="info-text">Loading treasury info...</p>}
            {error && <p className="error-text">{error}</p>}

            {treasuryInfo && (
                <div className="treasury-details">
                    <div className={`status-badge ${treasuryInfo.isInitialized ? 'registered' : 'not-registered'}`} style={{ marginBottom: '1rem' }}>
                        {treasuryInfo.isInitialized ? '✓ Treasury Initialized' : '✗ Not Initialized'}
                    </div>

                    <div className="info-display">
                        <div className="treasury-row">
                            <span className="info-label">Treasury Config:</span>
                            <span className="info-value address-value" title={treasuryInfo.treasuryConfig}>
                                {shortenAddress(treasuryInfo.treasuryConfig)}
                                <button className="copy-btn-small" onClick={() => copyToClipboard(treasuryInfo.treasuryConfig)}>📋</button>
                            </span>
                        </div>

                        <div className="treasury-row">
                            <span className="info-label">SOL Vault:</span>
                            <span className="info-value address-value" title={treasuryInfo.solVault}>
                                {shortenAddress(treasuryInfo.solVault)}
                                <button className="copy-btn-small" onClick={() => copyToClipboard(treasuryInfo.solVault)}>📋</button>
                            </span>
                        </div>

                        <div className="treasury-row">
                            <span className="info-label">Token Mint:</span>
                            <span className="info-value address-value" title={treasuryInfo.xMint}>
                                {shortenAddress(treasuryInfo.xMint)}
                                <button className="copy-btn-small" onClick={() => copyToClipboard(treasuryInfo.xMint)}>📋</button>
                            </span>
                        </div>

                        {treasuryInfo.isInitialized && (
                            <>
                                <div className="treasury-row">
                                    <span className="info-label">Treasury Token Account:</span>
                                    <span className="info-value address-value" title={treasuryInfo.treasuryTokenAccount}>
                                        {shortenAddress(treasuryInfo.treasuryTokenAccount)}
                                        <button className="copy-btn-small" onClick={() => copyToClipboard(treasuryInfo.treasuryTokenAccount)}>📋</button>
                                    </span>
                                </div>

                                <div className="treasury-row">
                                    <span className="info-label">Authority:</span>
                                    <span className="info-value address-value" title={treasuryInfo.authority}>
                                        {shortenAddress(treasuryInfo.authority)}
                                        <button className="copy-btn-small" onClick={() => copyToClipboard(treasuryInfo.authority)}>📋</button>
                                    </span>
                                </div>

                                <div className="treasury-config-values">
                                    <div className="config-item">
                                        <span className="config-label">SOL Price</span>
                                        <span className="config-value">{lamportsToSol(treasuryInfo.solPrice)} SOL</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">Tokens Per Purchase</span>
                                        <span className="config-value">{rawToTokens(treasuryInfo.tokensPerPurchase)} Tokens</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button className="btn btn-secondary" onClick={fetchTreasuryInfo} style={{ marginTop: '1rem' }}>
                        🔄 Refresh
                    </button>
                </div>
            )}
        </div>
    );
};

export default TreasuryInfo;
