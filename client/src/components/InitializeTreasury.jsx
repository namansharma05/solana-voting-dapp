import React from 'react'
import { SEEDS } from '../constants/constants';
import { PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { useState } from 'react';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const InitializeTreasury = ({ walletAddress, idlWithAddress, getProvider }) => {
    const [solPrice, setSolPrice] = useState('');
    const [tokensPerPurchase, setTokensPerPurchase] = useState('');

    // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
    const solToLamports = (sol) => {
        return Math.floor(Number(sol) * 1_000_000_000);
    };

    // Convert tokens to raw amount (6 decimals)
    const tokensToRaw = (tokens) => {
        return Math.floor(Number(tokens) * 1_000_000);
    };

    const initializeTreasury = async () => {
       
    }
    return (
        <div className="card">
            <h2>🏦 Initialize Treasury</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                initializeTreasury();
            }}>
                <input type="number" step="0.001" placeholder="SOL Price (e.g., 1 for 1 SOL)" value={solPrice} onChange={(e) => setSolPrice(e.target.value)} />
                <input type="number" step="0.01" placeholder="Tokens Per Purchase (e.g., 1000)" value={tokensPerPurchase} onChange={(e) => setTokensPerPurchase(e.target.value)} />
                <button type="submit">Initialize Treasury</button>
            </form>
        </div>
    )
}

export default InitializeTreasury;
