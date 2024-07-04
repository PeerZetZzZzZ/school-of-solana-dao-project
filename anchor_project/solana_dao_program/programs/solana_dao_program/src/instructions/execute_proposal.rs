use anchor_lang::prelude::*;

use crate::errors::DaoError;
use crate::states::*;

pub fn execute_proposal_fn(
    ctx: Context<ExecuteProposal>
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let dao = &mut ctx.accounts.dao;

    require!(matches!(proposal.status, ProposalStatus::Open), DaoError::ExecuteFailedProposalIsFinished);

    let now_ts = Clock::get().unwrap().unix_timestamp;
    // require proposal finished
    require!(now_ts.unsigned_abs() > proposal.deadline, DaoError::ExecuteFailedProposalVotingActive);

    // if there is proposal quantity to send
    if proposal.quantity_to_send > 0 {
        if proposal.yes_quantity > proposal.no_quantity {
            // proposal accepted - execute proposal send from DAO to recipient
            dao.sub_lamports(proposal.quantity_to_send)?;
            ctx.accounts.recipient.add_lamports(proposal.quantity_to_send)?;

            dao.treasury_amount = dao.treasury_amount_available;
        } else {
            // proposal rejected - increase DAO treasury available funds
            dao.treasury_amount += proposal.quantity_to_send;
            dao.treasury_amount_available = dao.treasury_amount;
        }
    }

    proposal.status = ProposalStatus::Executed;

    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            dao.name[..dao.name_length as usize].as_ref(),
            DAO_SEED.as_bytes()
        ],
        bump = dao.bump)]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        seeds = [
            proposal.name[..proposal.name_length as usize].as_ref(),
            proposal.dao_pubkey.as_ref(),
            PROPOSAL_SEED.as_bytes()
        ],
        bump = proposal.bump)]
    pub proposal: Account<'info, Proposal>,

    #[account(mut, address = proposal.send_to_pubkey)]
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
