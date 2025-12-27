import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VoteApp } from "../target/types/vote_app";

import { expect } from "chai";
import {
  getOrCreateAssociatedTokenAccount,
  getAccount
} from "@solana/spl-token";
import  NodeWallet  from "@project-serum/anchor/dist/cjs/nodewallet.js";

const SEEDS = {
  SOL_VAULT: "sol_vault",
  TREASURY_CONFIG: "treasury_config",
  MINT_AUTHORITY: "mint_authority",
  X_MINT: "x_mint",
  VOTER: "voter",
  PROPOSAL_COUNTER: "proposal_counter",
  PROPOSAL: "proposal",
} as const;

const PROPOSAL_ID = 1;

const findPda = (programId:anchor.web3.PublicKey, seeds: (Buffer | Uint8Array)[]):anchor.web3.PublicKey => {
  const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
  return pda;
}

const airDropSol = async(connection: anchor.web3.Connection, publicKey: anchor.web3.PublicKey, sol: number) => {
  const signature = await connection.requestAirdrop(publicKey, sol);
  await connection.confirmTransaction(signature, "confirmed")
}

const getBlockTime = async(connection:anchor.web3.Connection): Promise<number> => {
  const slot = await connection.getSlot();
  const blockTime = await connection.getBlockTime(slot);
  if(blockTime === null) {
    throw new Error("Failed to fetch the block time");
  }
  return blockTime;
}

describe("solana Voting DApp", () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;

  const program = anchor.workspace.voteApp as Program<VoteApp>;

  const adminWallet = (provider.wallet as NodeWallet).payer;

  let proposalCreatorWallet = new anchor.web3.Keypair();
  
  let voterWallet = new anchor.web3.Keypair();
  
  let solVaultPda: anchor.web3.PublicKey;
  let treasuryConfigPda: anchor.web3.PublicKey;
  let mintAuthorityPda: anchor.web3.PublicKey;
  let xMintPda: anchor.web3.PublicKey;
  let voterPda: anchor.web3.PublicKey;
  let proposalCounterPda: anchor.web3.PublicKey;
  let proposalPda: anchor.web3.PublicKey;
  
  let treasuryTokenAccount: anchor.web3.PublicKey;
  let proposalCreatorTokenAccount: anchor.web3.PublicKey;
  let voterTokenAccount: anchor.web3.PublicKey;

  const createTokenAccounts = async () => {
    console.log("Initilization of token account");
    treasuryTokenAccount = (await (getOrCreateAssociatedTokenAccount(connection, adminWallet, xMintPda, adminWallet.publicKey))).address;
    proposalCreatorTokenAccount = (await (getOrCreateAssociatedTokenAccount(connection, proposalCreatorWallet, xMintPda, proposalCreatorWallet.publicKey))).address;
    voterTokenAccount = (await getOrCreateAssociatedTokenAccount(connection, voterWallet, xMintPda, voterWallet.publicKey)).address;
  }

  beforeEach(async() => {
    solVaultPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.SOL_VAULT)]);
    
    treasuryConfigPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.TREASURY_CONFIG)]);
    
    mintAuthorityPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.MINT_AUTHORITY)]);
    
    xMintPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.X_MINT)]);
    
    voterPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.VOTER), voterWallet.publicKey.toBuffer()]);

    proposalCounterPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.PROPOSAL_COUNTER)]);

    proposalPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.PROPOSAL),Buffer.from([PROPOSAL_ID])]);

    console.log("Transfering sol tokens....");
    await airDropSol(connection, proposalCreatorWallet.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await airDropSol(connection, voterWallet.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    console.log("Transfer of SOL successfull");
  })
  
  describe("1. Initilization", () => {
    it("1.1 initializes treasury!", async () => {
      const solPrice = new anchor.BN(1000_000_000);
      const tokensPerPurchase = new anchor.BN(1000_000_000);
  
      console.log("Treasury Config PDA: ",treasuryConfigPda);
  
      const tx = await program.methods.initializeTreasury(solPrice, tokensPerPurchase).accounts({
        authority: adminWallet.publicKey,
      }).rpc();
      
      const treasuryAccountData = await program.account.treasuryConfig.fetch(treasuryConfigPda);
      
      expect(treasuryAccountData.solPrice.toNumber()).to.equal(solPrice.toNumber());
      console.log("Sol Price: ", solPrice.toNumber());
      
      expect(treasuryAccountData.tokensPerPurchase.toNumber()).to.equal(tokensPerPurchase.toNumber());
      console.log("Tokens Per Purchase: ", tokensPerPurchase.toNumber());
  
      expect(treasuryAccountData.authority.toBase58()).to.equal(adminWallet.publicKey.toBase58());
      console.log("Treasury Account authority address: ", treasuryAccountData.authority.toBase58());
  
      expect(treasuryAccountData.xMint.toBase58()).to.equal(xMintPda.toBase58());
      console.log("Treasury Account X_Mint address: ", treasuryAccountData.xMint.toBase58());
  
      await createTokenAccounts();
    });
  })

  describe("2. Buy Tokens", () => {
    it("2.1 buy tokens for proposal creator!", async() => {
      const tokenBalanceBefore = (await getAccount(connection, proposalCreatorTokenAccount)).amount;
      await program.methods.buyTokens().accounts({
        buyer: proposalCreatorWallet.publicKey,
        treasuryTokenAccount: treasuryTokenAccount,
        buyerTokenAccount: proposalCreatorTokenAccount,
        xMint: xMintPda,
      }).signers([proposalCreatorWallet]).rpc();
      const tokenBalanceAfter = (await getAccount(connection, proposalCreatorTokenAccount)).amount;
      expect(tokenBalanceAfter-tokenBalanceBefore).to.equal(BigInt(1000_000_000));
    });

    it("2.2 buy tokens for voter!", async() => {
      const tokenBalanceBefore = (await getAccount(connection, voterTokenAccount)).amount;
      await program.methods.buyTokens().accounts({
        buyer: voterWallet.publicKey,
        treasuryTokenAccount: treasuryTokenAccount,
        buyerTokenAccount: voterTokenAccount,
        xMint: xMintPda,
      }).signers([voterWallet]).rpc();
      const tokenBalanceAfter = (await getAccount(connection, voterTokenAccount)).amount;
      expect(tokenBalanceAfter-tokenBalanceBefore).to.equal(BigInt(1000_000_000));
    });
  });

  describe("3. Voter", () => {
    it("3.1 registers voter!", async() => {
      await program.methods.registerVoter().accounts({
        authority: voterWallet.publicKey,
      }).signers([voterWallet]).rpc();

      const voterAccountData = await program.account.voter.fetch(voterPda);
      expect(voterAccountData.voterId.toBase58()).to.equal(voterWallet.publicKey.toBase58());
    });
  });

  describe("4. Proposal", async() => {
    it("4.1 registers proposals!", async() => {
      const currentBlockTime = await getBlockTime(connection);
      const deadlineTime = new anchor.BN(currentBlockTime + 10);
      const proposalInfo = "Build a layer 2 solution";
      const stakeAmount = new anchor.BN(1000);
      await program.methods.registerProposal(proposalInfo, deadlineTime, stakeAmount).accounts({
        authority: proposalCreatorWallet.publicKey,
        proposalTokenAccount: proposalCreatorTokenAccount,
        proposalCounterAccount: proposalCounterPda,
        treasuryTokenAccount: treasuryTokenAccount,
        xMint: xMintPda,
      }).signers([proposalCreatorWallet]).rpc();

      const proposalAccountData = await program.account.proposal.fetch(proposalPda);
      const proposalCounterAccountData = await program.account.proposalCounter.fetch(proposalCounterPda);

      expect(proposalCounterAccountData.proposalCount).to.equal(2);
      expect(proposalAccountData.authority.toBase58()).to.equal(proposalCreatorWallet.publicKey.toBase58());
      expect(proposalAccountData.deadline.toString()).to.equal(deadlineTime.toString());
      expect(proposalAccountData.numberOfVotes).to.equal(0);
      expect(proposalAccountData.proposalId).to.equal(1);
      expect(proposalAccountData.proposalInfo).to.equal("Build a layer 2 solution");
    });
  });

  describe("5. Casting Vote", () => {
    it("5.1 casts Vote!", async() => {
      const stakeAmount = new anchor.BN(1000);
      await program.methods.proposalToVote(PROPOSAL_ID, stakeAmount).accounts({
        authority: voterWallet.publicKey,
        voterTokenAccount: voterTokenAccount,
        treasuryTokenAccount: treasuryTokenAccount,
        xMint: xMintPda,
      }).signers([voterWallet]).rpc();

    });
  });
});

