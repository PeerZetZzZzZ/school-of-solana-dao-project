import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { SolanaDaoProgram } from "../target/types/solana_dao_program";

describe("Proposal tests",  () => {
  // anchor.setProvider(anchor.AnchorProvider.local("http://127.0.0.1:8899"));
  anchor.setProvider(anchor.AnchorProvider.local("https://api.devnet.solana.com", {commitment: 'confirmed'}));
  const program = anchor.workspace.solana_dao_program as Program<SolanaDaoProgram>;
  const alice = anchor.web3.Keypair.generate();
  const bob = anchor.web3.Keypair.generate();
  const treasuryAmount = new anchor.BN(100000);
  const daoName = 'Salary DAO';
  // now + 1 minute
  const deadline = new anchor.BN(((new Date().getTime()) / 1000) + 60);
  before(async () => {
      // await airdrop(anchor.getProvider().connection, alice.publicKey);
      // await airdrop(anchor.getProvider().connection, bob.publicKey);
      // const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
      // const daos = await program.account.dao.all();
      // const accounts = await anchor.getProvider().connection.getParsedProgramAccounts(new anchor.web3.PublicKey('SxDdnnHxfc2NmCoGrBQneWu5TmEw5qypGtoXsyQpbJZ'));
      // const res = await anchor.getProvider().connection.getSignaturesForAddress(new anchor.web3.PublicKey('SxDdnnHxfc2NmCoGrBQneWu5TmEw5qypGtoXsyQpbJZ'))
        const res2 = await anchor.getProvider().connection.getParsedTransaction('HtmVnpL6AJwqXdodXRvDmGGUYF6at1aBHAAoSHYpe1S5mtdSbYb47SB426Sx54dapo2oepBxpmkhEfJKPzjmBcR')
      // const res2 = await anchor.getProvider().connection.getAccountInfo(new anchor.web3.PublicKey('SxDdnnHxfc2NmCoGrBQneWu5TmEw5qypGtoXsyQpbJZ'), {
      //   commitment: 'finalized',
      //   minContextSlot: 303124242,
      // })
      console.log('ziomeeeeeeeeeeeeeeek daos: ', res2.transaction.message.instructions);
      // console.log('konto w slocie 308558739', res);
      // console.log('konto w slocie 303124244', res2);
      // console.log('daosy ziomeeek', daos);
      // console.log('tx', JSON.stringify(res2,null, 2));
      // await createDao(program, daoName, 'description', treasuryAmount, alice, daoAddress);
  });

  it("Throws error when proposal quantity_to_send exceeds DAO balance", async () => {
    // // given
    // const proposalDescription = "Proposal: should fail";
    // const proposalName = "Name";
    // const quantityToSend = new anchor.BN(9000000000000000);
    // const sendToPubkey = bob.publicKey;
    // const [daoAddress, bump] = getDaoAddress(daoName, program.programId);
    // const [proposalAddress, proposalBump] = getProposalAddress(proposalName, daoAddress, program.programId);
    //
    // // when
    // let shouldFail = '';
    // try {
    //   await createProposal(program, proposalDescription, proposalName, deadline, quantityToSend, sendToPubkey, alice, daoAddress, proposalAddress);
    // } catch (err) {
    //   const error = anchor.AnchorError.parse(err.logs);
    //   assert.strictEqual(error.error.errorCode.code, "ProposalLamportsExceedBalance");
    //   shouldFail = 'Failed';
    // }
    //
    // // then
    // assert.strictEqual(shouldFail, "Failed");
  });
});