import { FC, useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SolanaDaoProgram } from "../../utils/idl/solana_dao_program";
import solana_dao_program from "../../utils/idl/solana_dao_program.json";
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createDao, getDaoAddress, solToLamports } from '../../utils/dao-service';
import { notify } from '../../utils/notifications';

export const CreateDaoView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  setProvider(provider);
  const idlstring = JSON.stringify(solana_dao_program);
  const idlobject = JSON.parse(idlstring);

  const programId = new PublicKey(idlobject.metadata.address);
  const program = new Program<SolanaDaoProgram>(idlobject, programId, provider);

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])
  const [daoName, setDaoName] = useState(''); // Declare a state variable...
  const [daoDescription, setDaoDescription] = useState(''); // Declare a state variable...
  const [daoTreasury, setDaoTreasury] = useState(0); // Declare a state variable...
  const [createButtonEnabled, setCreateButtonEnabled] = useState(true); // Declare a state variable...

  const createDaoFunc = async () => {
    const [daoAddress] = getDaoAddress(daoName, programId);
    try {
      const dao = await program.account.dao.fetch(daoAddress);
      notify({ type: 'error', message: 'DAO already exists, choose different name.' });
    } catch (err) {
      if (daoName.trim() === '') {
        notify({ type: 'error', message: 'Incorrect or empty DAO name!' });
        return;
      }
      if (daoDescription.trim() === '') {
        notify({ type: 'error', message: 'Incorrect or empty DAO description!' });
        return;
      }
      if (daoTreasury <= 0) {
        notify({ type: 'error', message: 'Incorrect DAO treasury initial amount!' });
        return;
      }
      setCreateButtonEnabled(false);
      // if err, it doesn't exist
      const tx = await createDao(program, daoName.trim(), daoDescription.trim(), solToLamports(daoTreasury), wallet.publicKey, daoAddress);
      notify({ type: 'success', message: 'DAO created!', txid: tx.toString() });

    }
  };

  return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="md:hero mx-auto p-4">
          <div className="md:hero-content flex flex-col">
            <div className='mt-6'>
              <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                Create DAO
              </h1>
              <h5 className="text-center text-md font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                Create a DAO. Define name, description and treasury amount (will be sent from signer).
              </h5>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" action="#" method="POST">

                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                    DAO name
                  </label>
                  <div className="mt-2">
                    <input
                        value={daoName}  maxLength={32}
                        onChange={e => setDaoName(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                      DAO description
                    </label>

                  </div>
                  <div className="mt-2">
                    <input
                        value={daoDescription} onChange={e => setDaoDescription(e.target.value)}
                        maxLength={100}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                      DAO treasury (SOL)
                    </label>

                  </div>
                  <div className="mt-2">
                    <input
                        value={daoTreasury} onChange={e => setDaoTreasury(Number(e.target.value))}
                        type={'number'}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </form>
            </div>
            <button
                disabled={!createButtonEnabled}
                className="px-8 m-2 btn bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                onClick={createDaoFunc}
            >
              <span>Create DAO</span>

            </button></div>
        </div>
      </div>
  );
};
