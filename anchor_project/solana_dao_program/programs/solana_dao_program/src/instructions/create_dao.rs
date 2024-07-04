use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

use crate::errors::DaoError;
use crate::states::*;

pub const DAO_NAME_LENGTH: usize = 32;
pub const DAO_DESCRIPTION_LENGTH: usize = 100;

pub fn create_dao_fn(
    ctx: Context<CreateDao>,
    name: String,
    description: String,
    treasury_amount: u64,
) -> Result<()> {
    let initialized_dao = &mut ctx.accounts.dao;

    require!(
        name.as_bytes().len() <= DAO_NAME_LENGTH,
        DaoError::NameTooLong
    );

    require!(
        description.as_bytes().len() <= DAO_DESCRIPTION_LENGTH,
        DaoError::DescriptionTooLong
    );

    // Create the transfer instruction of sol to dao treasury
    let transfer_instruction = system_instruction::transfer(ctx.accounts.dao_authority.key, &initialized_dao.key(), treasury_amount);

    // Invoke the transfer instruction
    anchor_lang::solana_program::program::invoke_signed(
        &transfer_instruction,
        &[
            ctx.accounts.dao_authority.to_account_info(),
            initialized_dao.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[],
    )?;

    let mut name_data = [0u8; DAO_NAME_LENGTH];
    name_data[..name.as_bytes().len()].copy_from_slice(name.as_bytes());
    initialized_dao.name = name_data;
    initialized_dao.name_length = name.as_bytes().len() as u8;

    let mut description_data = [0u8; DAO_DESCRIPTION_LENGTH];
    description_data[..description.as_bytes().len()].copy_from_slice(description.as_bytes());
    initialized_dao.description = description_data;
    initialized_dao.description_length = description.as_bytes().len() as u8;

    initialized_dao.bump = ctx.bumps.dao;
    initialized_dao.author = ctx.accounts.dao_authority.to_account_info().key();
    initialized_dao.treasury_amount = treasury_amount;
    initialized_dao.treasury_amount_available = treasury_amount;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateDao<'info> {
    #[account(mut)]
    pub dao_authority: Signer<'info>,

    #[account(
        init,
        payer = dao_authority,
        space = 8 + Dao::LEN,
        seeds = [
            name.as_bytes(),
            DAO_SEED.as_bytes()
        ],
        bump)]
    pub dao: Account<'info, Dao>,

    pub system_program: Program<'info, System>,
}
