use anchor_lang::prelude::*;


#[error_code]
pub enum DaoError {
    NameTooLong,
    DescriptionTooLong,
    ProposalLamportsExceedBalance,
    ProposalDescriptionTooLong,
    ProposalNameTooLong,
    ProposalExpired,
    ExecuteFailedProposalVotingActive,
    ExecuteFailedProposalIsFinished
}
