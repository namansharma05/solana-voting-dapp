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

} as const;

const findPda = (programId:anchor.web3.PublicKey, seeds: (Buffer | Uint8Array)[]):anchor.web3.PublicKey => {
  const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
  return pda;
}

describe("vote_app", () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.voteApp as Program<VoteApp>;

  const adminWallet = (provider.wallet as NodeWallet).payer;
  let solVaultPda: anchor.web3.PublicKey;
  let treasuryConfigPda: anchor.web3.PublicKey;
  let mintAuthorityPda: anchor.web3.PublicKey;
  let xMintPda: anchor.web3.PublicKey;

  beforeEach(() => {
    solVaultPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.SOL_VAULT)]);
    treasuryConfigPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.TREASURY_CONFIG)]);
    mintAuthorityPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.MINT_AUTHORITY)]);
    xMintPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.X_MINT)]);
  })

  it("initializes treasury!", async () => {
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

  });
});
