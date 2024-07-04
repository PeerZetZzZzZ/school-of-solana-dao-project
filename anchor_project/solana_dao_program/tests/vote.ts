// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { assert } from "chai";
// import { SolanaDaoProgram } from "../target/types/solana_dao_program";
// import {
//     airdrop, createDao, createProposal,
//     getDaoAddress,
//     getProposalAddress, getVoteAddress, vote,
// } from './successful-proposal.scenario';
// import { PublicKey } from '@solana/web3.js';
//
// describe("Vote tests", () => {
//     anchor.setProvider(anchor.AnchorProvider.local("http://127.0.0.1:8899"));
//     const program = anchor.workspace.solana_dao_program as Program<SolanaDaoProgram>;
//     const alice = anchor.web3.Keypair.generate();
//     const bob = anchor.web3.Keypair.generate();
//     const quantityToSend = new anchor.BN(10);
//     const daoName = 'daooooo';
//     const daoDescription = 'descriptiooon';
//     const proposalDescription = "Proposal: should fail";
//     const proposalName = "Proposall";
//     const sendToPubkey = bob.publicKey;
//     let proposalAddress: PublicKey;
//     // now + 60 seconds
//     const deadline = new anchor.BN(((new Date().getTime()) / 1000) + 60);
//     before(async () => {
//         await airdrop(anchor.getProvider().connection, alice.publicKey);
//         await airdrop(anchor.getProvider().connection, bob.publicKey);
//         const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//         await createDao(program, daoName, daoDescription, quantityToSend, alice, daoAddress);
//
//         const [newProposalAddress, proposalBump] = await getProposalAddress(proposalName, daoAddress, program.programId);
//         await createProposal(program, proposalDescription, proposalName, deadline, quantityToSend, sendToPubkey, alice, daoAddress, newProposalAddress);
//         proposalAddress = newProposalAddress;
//     });
//
//     it("Throws error when proposal does not exist", async () => {
//         // given
//         const proposalName = "not existing proposal";
//         const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//         const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//         const [voteAddress, voteBump] = getVoteAddress(alice.publicKey, proposalAddress, program.programId);
//
//         let shouldFail = '';
//         try {
//             await vote(program, alice, proposalAddress, voteAddress, 'Alice');
//         } catch (err) {
//             const error = anchor.AnchorError.parse(err.logs);
//             assert.strictEqual(error.error.errorCode.code, "AccountNotInitialized");
//             shouldFail = 'Failed';
//         }
//
//         // then
//         assert.strictEqual(shouldFail, "Failed");
//     });
//
//     it("Throws error when already voted on proposal", async () => {
//         // given
//         const [voteAddress, voteBump] = getVoteAddress(alice.publicKey, proposalAddress, program.programId);
//
//         //  when
//         await vote(program, alice, proposalAddress, voteAddress, 'Alice');
//         let shouldFail = '';
//         try {
//             await vote(program, alice, proposalAddress, voteAddress, 'Alice');
//         } catch (err) {
//             shouldFail = 'Failed';
//         }
//
//         // then
//         assert.strictEqual(shouldFail, "Failed");
//     });
// });