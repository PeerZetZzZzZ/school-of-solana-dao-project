// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { PublicKey } from '@solana/web3.js';
// import { assert } from "chai";
// import { SolanaDaoProgram } from "../target/types/solana_dao_program";
//
// export const DAO_SEED = "DAO_SEED"
// export const PROPOSAL_SEED = "PROPOSAL_SEED"
// export const VOTE_SEED = "VOTE_SEED"
//
// describe("Creates a DAO with treasury, then creates proposal, Alice and Bob votes YES, then execute proposal",  () => {
//   anchor.setProvider(anchor.AnchorProvider.local("http://127.0.0.1:8899"));
//   const program = anchor.workspace.solana_dao_program as Program<SolanaDaoProgram>;
//   const alice = anchor.web3.Keypair.generate();
//   const bob = anchor.web3.Keypair.generate();
//   const john = anchor.web3.Keypair.generate();
//   const daoName = "DaoName";
//   const quantityToSend = new anchor.BN(10);
//   const proposalName = "Proposal 1";
//
//   it("1. Creates a DAO and sends lamports from Alice to DAO (treasury)", async () => {
//     // given
//     await airdrop(anchor.getProvider().connection, alice.publicKey);
//     await airdrop(anchor.getProvider().connection, bob.publicKey);
//     await airdrop(anchor.getProvider().connection, john.publicKey);
//
//     const description: string = "description";
//     const treasury_amount = new anchor.BN(10000000);
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//
//     // when
//     await createDao(program, daoName, description, treasury_amount, alice, daoAddress);
//
//     //then
//     const daoData = await program.account.dao.fetch(daoAddress);
//     const utf8ByteArrayName = stringToUtf8ByteArray(daoName);
//     const paddedByteArrayName = padByteArrayWithZeroes(utf8ByteArrayName, 32);
//     assert.strictEqual(daoData.name.toString(), paddedByteArrayName.toString());
//
//     const utf8ByteArrayDescription = stringToUtf8ByteArray(description);
//     const paddedByteArrayDescription = padByteArrayWithZeroes(utf8ByteArrayDescription, 100);
//     assert.strictEqual(daoData.description.toString(), paddedByteArrayDescription.toString());
//
//     assert.strictEqual(daoData.author.toString(), alice.publicKey.toString());
//     assert.strictEqual(daoData.treasuryAmount.toString(), treasury_amount.toString());
//     assert.strictEqual(daoData.treasuryAmountAvailable.toString(), treasury_amount.toString());
//     assert.strictEqual(daoData.bump.toString(), bump.toString());
//     assert.strictEqual(daoData.descriptionLength.toString(), description.length.toString());
//     assert.strictEqual(daoData.nameLength.toString(), daoName.length.toString());
//   });
//
//   it("2. Creates a proposal", async () => {
//     // given
//     const proposalDescription = "Proposal: send 1 sol to XXX";
//     const sendToPubkey = john.publicKey;
//     // now + 2 seconds
//     const deadline = new anchor.BN(((new Date().getTime()) / 1000) + 2);
//
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//     const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//
//     //when
//     await createProposal(program, proposalDescription, proposalName, deadline, quantityToSend, sendToPubkey, alice, daoAddress, proposalAddress);
//
//       // then
//     const proposal = await program.account.proposal.fetch(proposalAddress);
//
//     const utf8ByteArrayDescription = stringToUtf8ByteArray(proposalDescription);
//     const paddedByteArrayDescription = padByteArrayWithZeroes(utf8ByteArrayDescription, 1000);
//     assert.strictEqual(proposal.description.toString(), paddedByteArrayDescription.toString());
//
//     const utf8ByteArrayName = stringToUtf8ByteArray(proposalName);
//     const paddedByteArrayName = padByteArrayWithZeroes(utf8ByteArrayName, 32);
//     assert.strictEqual(proposal.name.toString(), paddedByteArrayName.toString());
//
//     assert.strictEqual(proposal.author.toString(), alice.publicKey.toString());
//     assert.strictEqual(proposal.daoPubkey.toString(), daoAddress.toString());
//     assert.strictEqual(proposal.yesQuantity.toString(), new anchor.BN(0).toString());
//     assert.strictEqual(proposal.noQuantity.toString(), new anchor.BN(0).toString());
//     assert.strictEqual(proposal.quantityToSend.toString(), quantityToSend.toString());
//     assert.strictEqual(proposal.deadline.toString(), deadline.toString());
//     assert.strictEqual(proposal.sendToPubkey.toString(), sendToPubkey.toString());
//     assert.strictEqual(JSON.stringify(proposal.status), JSON.stringify({ open: {} }));
//
//     const dao = await program.account.dao.fetch(daoAddress);
//     assert.strictEqual(dao.treasuryAmount.toNumber() - quantityToSend.toNumber(), dao.treasuryAmountAvailable.toNumber());
//     assert.isAbove(dao.treasuryAmount.toNumber(), dao.treasuryAmountAvailable.toNumber());
//   });
//
//   it("3. Alice and Bob vote both YES on proposal", async () => {
//     // given
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//     const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//
//     // when
//     const [voteAddress, voteBump] = getVoteAddress(alice.publicKey, proposalAddress, program.programId);
//     await vote(program, alice, proposalAddress, voteAddress, 'Alice');
//     const [bobVoteAddress, bobVoteBump] = getVoteAddress(bob.publicKey, proposalAddress, program.programId);
//     await vote(program, bob, proposalAddress, bobVoteAddress, 'Bob');
//
//     // then
//     const votes = await program.account.vote.all();
//     assert.strictEqual(votes.length, 2);
//     let bobIndex = 0;
//     let aliceIndex = 1;
//     if (bob.publicKey.toString() === votes[0].account.voter.toString()) {
//       bobIndex = 0;
//       aliceIndex = 1;
//     } else {
//       bobIndex = 1;
//       aliceIndex= 0;
//     }
//       assert.strictEqual(votes[bobIndex].account.vote.toString(), 'true');
//       assert.strictEqual(votes[bobIndex].account.voter.toString(), bob.publicKey.toString());
//       assert.strictEqual(votes[aliceIndex].account.vote.toString(), 'true');
//       assert.strictEqual(votes[aliceIndex].account.voter.toString(), alice.publicKey.toString());
//
//     const proposal = await program.account.proposal.fetch(proposalAddress);
//     assert.strictEqual(proposal.yesQuantity.toString(), '2');
//     assert.strictEqual(proposal.noQuantity.toString(), '0');
//
//   });
//
//   it("4. Alice executes passed proposal", async () => {
//     // given
//     await sleep(3);
//     const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
//     const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
//
//     const proposal = await program.account.proposal.fetch(proposalAddress);
//     const sendToPubkey = proposal.sendToPubkey;
//
//     const johnBalanceBeforeExecuteProposal = await anchor.getProvider().connection.getBalance(john.publicKey);
//     const daoBalanceBeforeExecuteProposal = await anchor.getProvider().connection.getBalance(daoAddress);
//
//     //when
//     await executeProposal(program, alice, daoAddress, proposalAddress, sendToPubkey, 'Alice');
//
//     // then
//     // John has quantityToSend more
//     const johnBalanceAfterExecuteProposal = await anchor.getProvider().connection.getBalance(john.publicKey);
//     assert.strictEqual(johnBalanceBeforeExecuteProposal + quantityToSend.toNumber(), johnBalanceAfterExecuteProposal);
//
//     // DAO has quantityToSend less
//     const daoAfterExecuteProposal = await program.account.dao.fetch(daoAddress);
//     const daoBalanceAfterExecuteProposal = await anchor.getProvider().connection.getBalance(daoAddress);
//     assert.strictEqual(daoBalanceBeforeExecuteProposal - quantityToSend.toNumber(), daoBalanceAfterExecuteProposal);
//     assert.strictEqual(daoAfterExecuteProposal.treasuryAmount.toString(), daoAfterExecuteProposal.treasuryAmountAvailable.toString());
//
//     // proposal is exeucted
//     const proposalAfterExecuteProposal = await program.account.proposal.fetch(proposalAddress);
//     assert.strictEqual(JSON.stringify(proposalAfterExecuteProposal.status), JSON.stringify({ executed: {} }));
//   });
// });
//
// export async function airdrop(connection: any, address: any, amount = 10000000000) {
//   await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
// }
//
// export function stringToUtf8ByteArray(inputString: string): Uint8Array {
//   const encoder = new TextEncoder();
//   return encoder.encode(inputString);
// }
//
// export function padByteArrayWithZeroes(byteArray: Uint8Array, length: number): Uint8Array {
//   if (byteArray.length >= length) {
//     return byteArray;
//   }
//
//   const paddedArray = new Uint8Array(length);
//   paddedArray.set(byteArray, 0);
//   return paddedArray;
// }
//
// export const getDaoAddress = (name: string, programId: PublicKey): [PublicKey, number] => {
//   return PublicKey.findProgramAddressSync(
//       [
//         anchor.utils.bytes.utf8.encode(name),
//         anchor.utils.bytes.utf8.encode(DAO_SEED)
//       ], programId);
// }
//
// export const getProposalAddress = (name: string, daoAddress: PublicKey, programId: PublicKey): [PublicKey, number] => {
//   return PublicKey.findProgramAddressSync(
//       [
//         anchor.utils.bytes.utf8.encode(name),
//         daoAddress.toBuffer(),
//         anchor.utils.bytes.utf8.encode(PROPOSAL_SEED)
//       ], programId);
// }
//
// export const getVoteAddress = (creatorPubKey: PublicKey, proposalAddress: PublicKey, programId: PublicKey): [PublicKey, number] => {
//   return PublicKey.findProgramAddressSync(
//       [
//         anchor.utils.bytes.utf8.encode(VOTE_SEED),
//         proposalAddress.toBuffer(),
//         creatorPubKey.toBuffer()
//       ], programId);
// }
//
// export const sleep = (seconds: number) => {
//   return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
// };
//
// export async function createDao(program: any, daoName: string, description: string, treasury_amount, signer: any, daoAddress: PublicKey) {
//   // when
//   const tx = await program.methods.createDao(daoName, description, treasury_amount).accounts({
//     daoAuthority: signer.publicKey,
//     dao: daoAddress,
//     systemProgram: anchor.web3.SystemProgram.programId,
//   }).signers([signer]).rpc();
//   console.log("Your createDao transaction signature", tx);
// }
//
// export async function createProposal(program: any, proposalDescription: string, proposalName: string, deadline,
//                               quantityToSend, sendToPubkey: PublicKey, signer: any, daoAddress: PublicKey, proposalAddress: PublicKey) {
//     const tx = await program.methods.createProposal(proposalName, proposalDescription, deadline, quantityToSend, sendToPubkey).accounts({
//         proposalAuthority: signer.publicKey,
//         dao: daoAddress,
//         proposal: proposalAddress,
//         systemProgram: anchor.web3.SystemProgram.programId,
//     }).signers([signer]).rpc();
//     console.log("Your createProposal transaction signature", tx);
// }
//
// export async function vote(program: any, signer: any, proposalAddress: PublicKey, voteAddress: PublicKey, userName: string) {
//   // when
//   const tx = await program.methods.createVote(true).accounts({
//     voteAuthority: signer.publicKey,
//     proposal: proposalAddress,
//     vote: voteAddress,
//     systemProgram: anchor.web3.SystemProgram.programId,
//   }).signers([signer]).rpc();
//   console.log(`${userName} vote transaction signature`, tx);
// }
//
// export async function executeProposal(program: any, signer: any, daoAddress: PublicKey, proposalAddress: PublicKey, sendToPubkey, userName: string) {
//   const tx = await program.methods.executeProposal().accounts({
//     proposalAuthority: signer.publicKey,
//     dao: daoAddress,
//     proposal: proposalAddress,
//     recipient: sendToPubkey,
//     systemProgram: anchor.web3.SystemProgram.programId,
//   }).signers([signer]).rpc();
//   console.log(`${userName} executes passed proposal`, tx);
// }
