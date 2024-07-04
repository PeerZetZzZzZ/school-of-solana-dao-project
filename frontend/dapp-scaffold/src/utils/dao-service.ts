import { PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";

export const DAO_SEED = "DAO_SEED";
export const PROPOSAL_SEED = "PROPOSAL_SEED";
export const VOTE_SEED = "VOTE_SEED";

export async function createDao(program: any, daoName: string, description: string, treasury_amount: number, signerPublicKey: PublicKey, daoAddress: PublicKey) {
    // when
    const tx = await program.methods.createDao(daoName, description, new anchor.BN(treasury_amount)).accounts({
        daoAuthority: signerPublicKey,
        dao: daoAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    console.log("Your createDao transaction signature", tx);
    return tx;
}

export async function createProposal(program: any, proposalName: string, proposalDescription: string, deadline,
                                     quantityToSend: number, sendToPubkey: PublicKey, signerPublicKey: PublicKey, daoAddress: PublicKey, proposalAddress: PublicKey) {
    const tx = await program.methods.createProposal(proposalName, proposalDescription, deadline, new anchor.BN(quantityToSend), sendToPubkey).accounts({
        proposalAuthority: signerPublicKey,
        dao: daoAddress,
        proposal: proposalAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    console.log("Your createProposal transaction signature", tx);
    return tx;
}

export async function vote(program: any, vote: boolean, signerPublicKey: PublicKey, proposalAddress: PublicKey, voteAddress: PublicKey) {
    // when
    return await program.methods.createVote(vote).accounts({
        voteAuthority: signerPublicKey,
        proposal: proposalAddress,
        vote: voteAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
}

export async function executeProposal(program: any, signerPublicKey: PublicKey, daoAddress: PublicKey, proposalAddress: PublicKey, sendToPubkey: PublicKey) {
    return await program.methods.executeProposal().accounts({
        proposalAuthority: signerPublicKey,
        dao: daoAddress,
        proposal: proposalAddress,
        recipient: sendToPubkey,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
}

export const getDaoAddress = (name: string, programId: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode(name),
            anchor.utils.bytes.utf8.encode(DAO_SEED)
        ], programId);
}

export const getProposalAddress = (name: string, daoAddress: PublicKey, programId: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode(name),
            daoAddress.toBuffer(),
            anchor.utils.bytes.utf8.encode(PROPOSAL_SEED)
        ], programId);
}

export const getVoteAddress = (creatorPubKey: PublicKey, proposalAddress: PublicKey, programId: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode(VOTE_SEED),
            proposalAddress.toBuffer(),
            creatorPubKey.toBuffer()
        ], programId);
}

export function solToLamports(sol: number): number {
    const LAMPORTS_PER_SOL = 1_000_000_000;
    return sol * LAMPORTS_PER_SOL;
}

export function lamportsToSol(lamports: number): string {
    const LAMPORTS_PER_SOL = 1_000_000_000;
    return (lamports / LAMPORTS_PER_SOL).toString();
}


export const formatReadDaoName = (name: Uint8Array) => {
    // Find the index of the first zero byte (0x00) in the Uint8Array
    const zeroIndex = name.findIndex(byte => byte === 0);

    // Slice the array up to the first zero byte or use the entire array if no zero byte is found
    const validName = zeroIndex === -1 ? name : name.slice(0, zeroIndex);
    const encoder = new TextDecoder('utf8');
    const a = encoder.decode(new Uint8Array(validName).buffer);
    return a;
}
