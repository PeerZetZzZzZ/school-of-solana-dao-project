// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { assert } from "chai";
// import { SolanaDaoProgram } from "../target/types/solana_dao_program";
// import {
//   airdrop, createDao, createProposal, executeProposal,
//   getDaoAddress,
//   getProposalAddress, getVoteAddress, sleep, vote,
// } from './successful-proposal.scenario';
//
// describe("Proposal tests",  () => {
//   anchor.setProvider(anchor.AnchorProvider.local("http://127.0.0.1:8899"));
//   const program = anchor.workspace.solana_dao_program as Program<SolanaDaoProgram>;
//   const alice = anchor.web3.Keypair.generate();
//   const bob = anchor.web3.Keypair.generate();
//   const treasuryAmount = new anchor.BN(100000);
//   const daoName = 'dao';
//   // now + 1 minute
//   const deadline = new anchor.BN(((new Date().getTime()) / 1000) + 60);
//   before(async () => {
//       await airdrop(anchor.getProvider().connection, alice.publicKey);
//       await airdrop(anchor.getProvider().connection, bob.publicKey);
//       const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//       await createDao(program, daoName, 'description', treasuryAmount, alice, daoAddress);
//   });
//
//   it("Throws error when proposal quantity_to_send exceeds DAO balance", async () => {
//     // given
//     const proposalDescription = "Proposal: should fail";
//     const proposalName = "Name";
//     const quantityToSend = new anchor.BN(9000000000000000);
//     const sendToPubkey = bob.publicKey;
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//     const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//
//     // when
//     let shouldFail = '';
//     try {
//       await createProposal(program, proposalDescription, proposalName, deadline, quantityToSend, sendToPubkey, alice, daoAddress, proposalAddress);
//     } catch (err) {
//       const error = anchor.AnchorError.parse(err.logs);
//       assert.strictEqual(error.error.errorCode.code, "ProposalLamportsExceedBalance");
//       shouldFail = 'Failed';
//     }
//
//     // then
//     assert.strictEqual(shouldFail, "Failed");
//   });
//
//   it("Throws error when try to execute open (active) proposal", async () => {
//     // given
//     const proposalDescription = "proprororpro";
//     const proposalName = "create this";
//     const quantityToSend = new anchor.BN(10);
//     const sendToPubkey = bob.publicKey;
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//     const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//     await createProposal(program, proposalDescription, proposalName, deadline, quantityToSend, sendToPubkey, alice, daoAddress, proposalAddress);
//
//     // when
//     let shouldFail = '';
//     try {
//       await executeProposal(program, alice, daoAddress, proposalAddress, sendToPubkey, 'Alice');
//     } catch (err) {
//       const error = anchor.AnchorError.parse(err.logs);
//       assert.strictEqual(error.error.errorCode.code, "ExecuteFailedProposalVotingActive");
//       shouldFail = 'Failed';
//     }
//
//     // then
//     assert.strictEqual(shouldFail, "Failed");
//   });
//
//   it("Throws error when try to execute already executed proposal", async () => {
//     // given
//     await airdrop(anchor.getProvider().connection, alice.publicKey);
//     const proposalDescription = "zxcvzxcv";
//     const proposalName = "asdf";
//     const quantityToSend = new anchor.BN(1);
//     const sendToPubkey = bob.publicKey;
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//     const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//     const shortDeadline = new anchor.BN(((new Date().getTime()) / 1000) + 1);
//     await createProposal(program, proposalDescription, proposalName, shortDeadline, quantityToSend, sendToPubkey, alice, daoAddress, proposalAddress);
//     const [voteAddress, voteBump] = getVoteAddress(alice.publicKey, proposalAddress, program.programId);
//     await vote(program, alice, proposalAddress, voteAddress, 'Alice');
//     await sleep(5);
//       await executeProposal(program, alice, daoAddress, proposalAddress, sendToPubkey, 'Alice');
//
//     // when
//     let shouldFail = '';
//     try {
//       await executeProposal(program, alice, daoAddress, proposalAddress, sendToPubkey, 'Alice');
//     } catch (err) {
//       const error = anchor.AnchorError.parse(err.logs);
//       assert.strictEqual(error.error.errorCode.code, "ExecuteFailedProposalIsFinished");
//       shouldFail = 'Failed';
//     }
//
//     // then
//     assert.strictEqual(shouldFail, "Failed");
//   });
//
//
// });