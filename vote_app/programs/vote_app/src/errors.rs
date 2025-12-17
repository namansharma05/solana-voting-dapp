use anchor_lang::prelude::*;

#[error_code]
pub enum VoteError {
    #[msg("Deadline must be a future timestamp")]
    InvalidDeadline,
    
    #[msg("Proposal counter has already been initialized")]
    ProposalCounterAlreadyInitialized,

    #[msg("Maximum proposal limit reached")]
    ProposalCounterOverflow,

    #[msg("Voting period has ended for this proposal")]
    ProposalEnded,

    #[msg("Vote count overflow - maximum votes exceeded")]
    ProposalVotesOverflow,

    #[msg("Cannot declare winner while voting is still active")]
    VotingStillActive,

    #[msg("No votes have been cast for this proposal")]
    NoVotesCast,

    #[msg("You are not authorized to perform this action")]
    UnauthorizedAccess,
    
    #[msg("Token mint does not match the expected mint")]
    TokenMintMismatch,

    #[msg("Voter has already voted on this proposal")]
    VoterAlreadyVoted,

    #[msg("Token account is not owned by the expected wallet")]
    InvalidTokenAccountOwner,

    #[msg("Provided mint account is invalid")]
    InvalidMint,
}