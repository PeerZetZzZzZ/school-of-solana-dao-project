use anchor_lang::prelude::*;

use crate::errors::DaoError;
use crate::states::*;

pub const PROPOSAL_DESCRIPTION_LENGTH: usize = 1000;
pub const PROPOSAL_NAME_LENGTH: usize = 32;

pub fn create_proposal_fn(
    ctx: Context<CreateProposal>,
    name: String,
    description: String,
    deadline: u64,
    quantity_to_send: u64,
    send_to_pubkey: Pubkey,
) -> Result<()> {
    let initialized_proposal = &mut ctx.accounts.proposal;

    require!(
        description.as_bytes().len() <= PROPOSAL_DESCRIPTION_LENGTH,
        DaoError::ProposalDescriptionTooLong
    );
    require!(
        name.as_bytes().len() <= PROPOSAL_NAME_LENGTH,
        DaoError::ProposalNameTooLong
    );
    let dao = &mut ctx.accounts.dao;

    // proposal lamports must not exceed DAO balance
    require!(
        dao.treasury_amount_available >= quantity_to_send,
        DaoError::ProposalLamportsExceedBalance
    );

    let mut description_data = [0u8; PROPOSAL_DESCRIPTION_LENGTH];
    description_data[..description.as_bytes().len()].copy_from_slice(description.as_bytes());
    initialized_proposal.description = description_data;
    initialized_proposal.description_length = description.as_bytes().len() as u16;

    let mut name_data = [0u8; PROPOSAL_NAME_LENGTH];
    name_data[..name.as_bytes().len()].copy_from_slice(name.as_bytes());
    initialized_proposal.name = name_data;
    initialized_proposal.name_length = name.as_bytes().len() as u8;

    initialized_proposal.author = ctx.accounts.proposal_authority.to_account_info().key();
    initialized_proposal.dao_pubkey = dao.to_account_info().key();
    initialized_proposal.no_quantity = 0;
    initialized_proposal.yes_quantity = 0;
    initialized_proposal.deadline = deadline;
    initialized_proposal.bump = ctx.bumps.proposal;
    initialized_proposal.quantity_to_send = quantity_to_send;
    initialized_proposal.send_to_pubkey = send_to_pubkey;
    initialized_proposal.status = ProposalStatus::Open;

    // decrease amount available for treasury
    dao.treasury_amount_available -= quantity_to_send;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateProposal<'info> {

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
        init,
        payer = proposal_authority,
        space = 8 + Proposal::LEN,
        seeds = [
            name.as_bytes(),
            dao.key().as_ref(),
            PROPOSAL_SEED.as_bytes()
        ],
        bump)]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}
