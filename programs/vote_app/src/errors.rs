use anchor_lang::prelude::*;

#[error_code]
pub enum VoteError {
    #[msg("Invalid deadline passed")]
    InvalidDeadline,

    #[msg("Proposal count already initialized")]
    ProposalCountAlreadyInitialized,

    #[msg("Proposal count overflow")]
    ProposalCountOverflow,

    #[msg("This proposal is already ended")]
    ProposalEnded,

    #[msg("proposal votes overflown")]
    ProposalVotesOverflow,
}
