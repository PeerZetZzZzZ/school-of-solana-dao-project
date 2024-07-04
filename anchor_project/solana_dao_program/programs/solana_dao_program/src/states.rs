use anchor_lang::{account, AnchorDeserialize, AnchorSerialize};
use anchor_lang::prelude::Pubkey;
use crate::instructions::{DAO_DESCRIPTION_LENGTH, DAO_NAME_LENGTH, PROPOSAL_DESCRIPTION_LENGTH, PROPOSAL_NAME_LENGTH};
use anchor_lang::prelude::*;

pub const DAO_SEED: &str = "DAO_SEED";
pub const PROPOSAL_SEED: &str = "PROPOSAL_SEED";
pub const VOTE_SEED: &str = "VOTE_SEED";
pub const DAO_TREASURY_SEED: &str = "DAO_TREASURY_SEED";

#[account]
pub struct Dao {
    pub author: Pubkey,
    pub name: [u8; DAO_NAME_LENGTH],
    pub name_length: u8,
    pub description: [u8; DAO_DESCRIPTION_LENGTH],
    pub description_length: u8,
    // lamports
    pub treasury_amount: u64,
    // lamports decreased by active proposals
    pub treasury_amount_available: u64,
    pub bump: u8,
}

impl Dao {
    pub const LEN: usize = 32 + DAO_NAME_LENGTH + 1 + DAO_DESCRIPTION_LENGTH + 1 + 8 + 8 + 1;
}

#[account]
pub struct Proposal {
    pub author: Pubkey,
    pub dao_pubkey: Pubkey,
    pub description: [u8; PROPOSAL_DESCRIPTION_LENGTH],
    pub description_length: u16,
    pub name: [u8; PROPOSAL_NAME_LENGTH],
    pub name_length: u8,
    pub yes_quantity: u64,
    pub no_quantity: u64,
    pub status: ProposalStatus,
    pub quantity_to_send: u64,
    pub send_to_pubkey: Pubkey,
    pub deadline: u64,
    pub bump: u8
}

impl Proposal {
    pub const LEN: usize = 32 + 32 + PROPOSAL_DESCRIPTION_LENGTH + 16 + 8 + 8 + 24 + 8 + 32 + 8 + 1 + PROPOSAL_NAME_LENGTH + 8;
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum ProposalStatus {
    Open,
    Executed,
}

#[account]
pub struct Vote {
    // true = yes, false = no
    pub vote: bool,
    pub proposal_pubkey: Pubkey,
    pub voter: Pubkey,
}

impl Vote {
    pub const LEN: usize = 32 + 1 + 32;
}
