use anchor_lang::prelude::*;

use crate::errors::DaoError;
use crate::states::*;

pub fn vote_fn(
    ctx: Context<CreateVote>,
    // true = yes, false = no
    vote: bool,
) -> Result<()> {
    let now_ts = Clock::get().unwrap().unix_timestamp;

    // require proposal is valid
    require!(now_ts.unsigned_abs() <= ctx.accounts.proposal.deadline, DaoError::ProposalExpired);

    let initialized_vote = &mut ctx.accounts.vote;
    initialized_vote.vote = vote;
    initialized_vote.voter = ctx.accounts.vote_authority.key();
    if initialized_vote.vote {
        ctx.accounts.proposal.yes_quantity += 1;
    } else {
        ctx.accounts.proposal.no_quantity += 1;
    }
    initialized_vote.proposal_pubkey = ctx.accounts.proposal.key();
    Ok(())
}

#[derive(Accounts)]
pub struct CreateVote<'info> {
    #[account(mut)]
    pub vote_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            proposal.name[..proposal.name_length as usize].as_ref(),
            proposal.dao_pubkey.as_ref(),
            PROPOSAL_SEED.as_bytes()
        ],
        bump = proposal.bump)]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = vote_authority,
        space = 8 + Vote::LEN,
        seeds = [
            VOTE_SEED.as_bytes(),
            proposal.key().as_ref(),
            vote_authority.key().as_ref()
        ],
        bump)]
    pub vote: Account<'info, Vote>,
    pub system_program: Program<'info, System>,
}
