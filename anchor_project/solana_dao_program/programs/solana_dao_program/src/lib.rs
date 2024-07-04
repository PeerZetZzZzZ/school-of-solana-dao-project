use anchor_lang::prelude::*;

use crate::instructions::*;

pub mod instructions;
pub mod states;
pub mod errors;
declare_id!("SxDdnnHxfc2NmCoGrBQneWu5TmEw5qypGtoXsyQpbJZ");

#[program]
pub mod solana_dao_program {
    use super::*;

    pub fn create_dao(ctx: Context<CreateDao>, name: String, description: String, treasury_amount: u64) -> Result<()> {
        return create_dao_fn(ctx, name, description, treasury_amount);
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, name: String, description: String, deadline: u64, quantity_to_send: u64, send_to_pubkey: Pubkey) -> Result<()> {
        return create_proposal_fn(ctx, name, description, deadline, quantity_to_send, send_to_pubkey);
    }

    pub fn create_vote(ctx: Context<CreateVote>, vote: bool) -> Result<()> {
        return vote_fn(ctx, vote);
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        return execute_proposal_fn(ctx);
    }
}
