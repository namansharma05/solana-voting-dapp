use anchor_lang::prelude::*;

#[error_code]
pub enum VoteError {
    #[msg("Invalid deadline passed")]
    InvalidDeadline,

    #[msg("Proposal count already initialized")]
    ProposalCountAlreadyInitialized,

    #[msg("Proposal count overflow")]
    ProposalCountOverflow,
}
