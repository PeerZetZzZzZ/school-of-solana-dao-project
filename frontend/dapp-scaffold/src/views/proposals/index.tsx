// pages/[daoName]/proposals.tsx
import { useRouter } from 'next/router';
import { FC, useEffect, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN, Program, setProvider } from '@coral-xyz/anchor';
import solana_dao_program from '../../utils/idl/solana_dao_program.json';
import { PublicKey } from '@solana/web3.js';
import {
    createProposal, executeProposal,
    formatReadDaoName,
    getDaoAddress,
    getProposalAddress, getVoteAddress, lamportsToSol,
    solToLamports, vote
} from '../../utils/dao-service';
import { notify } from '../../utils/notifications';

export const ProposalsView: FC = () => {
    const router = useRouter();
    const { daoName } = router.query;

    const wallet = useWallet();
    const { connection } = useConnection();

    const provider = useMemo(() => new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions()), [connection, wallet]);
    setProvider(provider);

    const idlstring = JSON.stringify(solana_dao_program);
    const idlobject = JSON.parse(idlstring);

    const programId = new PublicKey(idlobject.metadata.address);
    const [proposals, setProposals] = useState([]);
    const [proposalsLoaded, setProposalsLoaded] = useState(false);
    const [createProposalButtonEnabled, setCreateProposalButtonEnabled] = useState(true);
    const [dao, setDao] = useState({});
    const [daoAddress, setDaoAddress] = useState('');
    const [proposalDescription, setProposalDescription] = useState('');
    const [proposalName, setProposalName] = useState('');
    const [sendToAddress, setSendToAddress] = useState('');
    const [sendToAmount, setSendToAmount] = useState(0);
    const [minutesDeadline, setMinutesDeadline] = useState(5);

    const program = useMemo(() => new Program(idlobject, programId, provider), [idlobject, programId, provider]);

    useEffect(() => {
        const fetchProposals = async (daoPubkey: PublicKey) => {
            try {
                const allProposals = await program.account.proposal.all([
                    {
                        memcmp: {
                            offset: 40, // The offset to the dao_pubkey field in the Proposal struct (consider 8 bytes for the discriminator)
                            bytes: daoPubkey.toBase58(),
                        },
                    },
                ]);
                setProposals(allProposals);
                setProposalsLoaded(true);
            } catch (err) {
                console.log('Error fetching proposals, most likely none exist', err);
            }
        };
        const [daoAddress] = getDaoAddress(decodeURI(daoName as string), programId);
        setDaoAddress(daoAddress.toBase58());
        program.account.dao.fetch(daoAddress).then((dao: any) => {
            setDao(dao);
            fetchProposals(daoAddress);
        }).catch((err) => {
            notify({ type: 'error', message: 'Reading DAO failed!' });
        });
    }, []); // Only run this effect once on mount

    const createProposalFunc = async () => {
        if (!Number.isInteger(minutesDeadline) || minutesDeadline <= 0) {
            notify({ type: 'error', message: 'Voting period minutes must be integer and positive!' });
            return;
        }
        if (proposalName.trim() === '') {
            notify({ type: 'error', message: 'Incorrect or empty name!' });
            return;
        }
        if (proposalDescription.trim() === '') {
            notify({ type: 'error', message: 'Incorrect or empty description!' });
            return;
        }
        if (dao.toString() === '{}') {
            notify({ type: 'error', message: 'Creating proposal failed, no DAO!' });
            return;
        }
        if (sendToAmount <= 0) {
            notify({ type: 'error', message: 'Incorrect send to amount!' });
            return;
        }
        if (sendToAddress.trim() === '') {
            notify({type: 'error', message: 'Incorrect receiver address!'});
            return;
        }
        const [proposalAddress] = getProposalAddress(proposalName, new PublicKey(daoAddress), programId);
        try {
            const proposal = await program.account.proposals.fetch(proposalAddress);
            notify({ type: 'error', message: 'Proposal already exists, choose different description.' });
        } catch (err) {
            // if err, it doesn't exist
            // now + 5 minutes
            const deadline = new BN(((new Date().getTime()) / 1000) + (minutesDeadline * 60));
            setCreateProposalButtonEnabled(false);
            // @ts-ignore
            const tx = await createProposal(program, proposalName.trim(), proposalDescription.trim(), deadline , solToLamports(sendToAmount), new PublicKey(sendToAddress), wallet.publicKey, new PublicKey(daoAddress), proposalAddress);
            notify({ type: 'success', message: 'Proposal created', txid: tx.toString() });

        }
    };

    const voteFunc = async (decision: boolean, proposalAddress: PublicKey) => {
        // filter votes for given user and given proposal
        const userVotes = await program.account.vote.all([{
            memcmp: {
                offset: 9, // The offset to the dao_pubkey field in the Proposal struct (consider 8 bytes for the discriminator) + 1 (for bool vote)
                bytes: proposalAddress.toBase58(),
            },
        },
            {
                memcmp: {
                    offset: 41,
                    bytes: wallet.publicKey.toBase58(),
                },
            }]);
        if (userVotes.length > 0) {
            notify({type: 'error', message: 'Voting failed - user already voted!'});
            return;
        }
        const [voteAddress] = getVoteAddress(wallet.publicKey, proposalAddress, programId);
        const tx = await vote(program, decision, wallet.publicKey, proposalAddress, voteAddress);
        const message = decision ? `Votes YES on proposal!` : `Voted NO on proposal`;
        notify({ type: 'success', message: message, txid: tx.toString() });
    }

    const executeProposalFunc = async (proposalAddress: PublicKey, receiverAddress: PublicKey, proposalAmountSol: string) => {
        const tx = await executeProposal(program, wallet.publicKey, new PublicKey(daoAddress), proposalAddress, receiverAddress);
        notify({ type: 'success', message: `Proposal executed - ${proposalAmountSol} SOL sent to ${receiverAddress.toBase58()}`, txid: tx.toString() });
    }


    const getLeftTimeSeconds = (proposal: any): number => {
        return Number(Number((new Date(Number(proposal.account.deadline * 1000)).getTime() - new Date().getTime()) / 1000).toFixed(0));
    }


    return (
        <div>
            <div className='mt-12'>
                <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                    {decodeURI(daoName as string)}
                </h1>
                <h3 className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4" >
                    Address: {daoAddress}
                </h3>
            </div>
            <div className="flex min-h-full justify-center px-6 py-12 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between w-full max-w-screen-lg">
                    <div className="md:hero mx-auto p-4 w-full lg:w-1/2">

                        <div className="md:hero-content flex flex-col">
                            <div className='mt-6'>
                                <h5 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                                    Create Proposal
                                </h5>
                                <h5 className="text-center text-md font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                                    Define proposal description, specify recipient and amount to send from DAO treasury
                                    to
                                    recipient.
                                    If proposal will be passed, transfer could be executed by anyone.
                                </h5>
                            </div>
                            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                                <form className="space-y-6" action="#" method="POST">

                                    <div>
                                        <label htmlFor="email"
                                               className="block text-sm font-medium leading-6 text-white">
                                            Name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                maxLength={32}
                                                value={proposalName}
                                                onChange={e => setProposalName(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email"
                                               className="block text-sm font-medium leading-6 text-white">
                                            Description
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                maxLength={1000}
                                                value={proposalDescription}
                                                onChange={e => setProposalDescription(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password"
                                                   className="block text-sm font-medium leading-6 text-white">
                                                Send to address
                                            </label>

                                        </div>
                                        <div className="mt-2">
                                            <input
                                                value={sendToAddress} onChange={e => setSendToAddress(e.target.value)}

                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password"
                                                   className="block text-sm font-medium leading-6 text-white">
                                                Send to amount (SOL)
                                            </label>

                                        </div>
                                        <div className="mt-2">
                                            <input
                                                value={sendToAmount}
                                                onChange={e => setSendToAmount(Number(e.target.value))}
                                                type={'number'}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password"
                                                   className="block text-sm font-medium leading-6 text-white">
                                                Voting period (minutes)
                                            </label>

                                        </div>
                                        <div className="mt-2">
                                            <input
                                                min={1}
                                                value={minutesDeadline}
                                                onChange={e => setMinutesDeadline(Number(e.target.value))}
                                                type={'number'}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <button
                                disabled={!createProposalButtonEnabled}
                                className="px-8 m-2 btn bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                onClick={createProposalFunc}
                            >
                                <span>Create proposal</span>

                            </button>
                        </div>
                    </div>
                    <div className="md:hero mx-auto p-4 w-full lg:w-1/2">
                        <div className="md:hero-content flex flex-col">
                            <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                                Existing proposals
                            </h1>

                            <div className="text-center">
                                {proposals.length === 0 ? (
                                    proposalsLoaded ?
                                        <h1 className="text-3xl text-white">No proposals yet, create first!</h1> :
                                        <h1 className="text-3xl text-white">Loading proposals, please wait...</h1>
                                ) : (
                                    <ul role="list" className="divide-y divide-gray-100">
                                        {proposals.map((proposal) => (
                                            <li key={proposal.account.description}
                                                className="flex justify-between gap-x-6 py-5">
                                                <div
                                                    className="flex w-full justify-between items-center cursor-pointer">
                                                    <div className="flex min-w-0 gap-x-4">
                                                        <div className="min-w-0 flex-auto">
                                                            <p className="text-xl font-semibold leading-8 text-white">Name: <span
                                                                className="font-bold">{formatReadDaoName(proposal.account.name)}</span>
                                                            </p>
                                                            <p className="text-sm font-semibold leading-5 text-white">Description: <span
                                                                className="font-bold">{formatReadDaoName(proposal.account.description)}</span>
                                                            </p>
                                                            <p className="text-sm font-semibold leading-8 text-white">Receiver: {proposal.account.sendToPubkey.toBase58()}</p>
                                                            <p className="text-sm font-semibold leading-5 text-white">Amount: {lamportsToSol(Number(proposal.account.quantityToSend.toString()))} SOL</p>
                                                            <p className="text-sm font-semibold leading-5 text-green-500">YES
                                                                votes: {Number(proposal.account.yesQuantity.toString())}</p>
                                                            <p className="text-sm font-semibold leading-5 text-red-500">NO
                                                                votes: {Number(proposal.account.noQuantity.toString())}</p>
                                                            <p className="text-sm font-semibold leading-8 text-white">Ends: {new Date(Number(proposal.account.deadline * 1000)).toLocaleString()}</p>
                                                            <p className="text-sm font-semibold leading-5 text-white">Time
                                                                left: {getLeftTimeSeconds(proposal) > 0 ? `${getLeftTimeSeconds(proposal)} seconds` : 'Ended'}</p>
                                                            {getLeftTimeSeconds(proposal) < 0 ? (
                                                                    ((Number(proposal.account.yesQuantity.toString()) > Number(proposal.account.noQuantity.toString())) && (Number(proposal.account.quantityToSend.toString())) > 0) ?

                                                                        (Object.keys(proposal.account.status)[0] === 'open' ?
                                                                            <button
                                                                                disabled={!createProposalButtonEnabled}
                                                                                className="px-8 m-2 btn bg-yellow-500  hover:bg-yellow-200 text-black"
                                                                                onClick={() => executeProposalFunc(proposal.publicKey, proposal.account.sendToPubkey, lamportsToSol(Number(proposal.account.quantityToSend.toString())))}
                                                                            >
                                                                                <span>EXECUTE</span>

                                                                            </button> :
                                                                            <p className="text-sm font-semibold leading-5 text-yellow-500">PROPOSAL
                                                                                EXECUTED</p>)
                                                                        : ''


                                                                ) :
                                                                <div>
                                                                    <button
                                                                        disabled={!createProposalButtonEnabled}
                                                                        className="px-8 m-2 btn bg-green-500  hover:bg-green-200 text-black"
                                                                        onClick={() => voteFunc(true, proposal.publicKey)}
                                                                    >
                                                                        <span>YES</span>

                                                                    </button>
                                                                    <button
                                                                        disabled={!createProposalButtonEnabled}
                                                                        className="px-8 m-2 btn bg-red-500  hover:bg-red-200 text-black"
                                                                        onClick={() => voteFunc(false, proposal.publicKey)}
                                                                    >
                                                                        <span>NO</span>

                                                                    </button>
                                                                </div>}

                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="md:hero mx-auto p-4">

                </div>

            </div>

        </div>
    );
};

export default ProposalsView;