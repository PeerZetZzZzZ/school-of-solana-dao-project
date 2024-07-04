import { FC, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import solana_dao_program from '../../utils/idl/solana_dao_program.json';
import { PublicKey } from '@solana/web3.js';
import { formatReadDaoName, lamportsToSol } from '../../utils/dao-service';
import Link from 'next/link';

export const DaosView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const provider = useMemo(() => new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions()), [connection, wallet]);
  setProvider(provider);

  const idlstring = JSON.stringify(solana_dao_program);
  const idlobject = JSON.parse(idlstring);

  const programId = new PublicKey(idlobject.metadata.address);
  const [daos, setDaos] = useState([]);

  const program = useMemo(() => new Program(idlobject, programId, provider), [idlobject, programId, provider]);

  useEffect(() => {
    const fetchDaos = async () => {
      try {
        console.log('Fetching DAOs once');
        const allDaos = await program.account.dao.all();
        setDaos(allDaos);
      } catch (err) {
        console.log('Error fetching daos', err);
      }
    };

    fetchDaos();
  }, []); // Only run this effect once on mount

  return (
      <div className="md:hero mx-auto p-4">
        <div className="md:hero-content flex flex-col">
          <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            DAOs
          </h1>

          <div className="text-center">
            {daos.length === 0 ? (
                <h1 className="text-3xl text-white">Loading DAOs, please wait...</h1>
            ) : (
                <ul role="list" className="divide-y divide-gray-100">
                  {daos.map((dao) => (
                      <li key={dao.account.name} className="flex justify-between gap-x-6 py-5">
                        <Link href={`/${encodeURI(formatReadDaoName(dao.account.name))}/proposals`}>
                          <div className="flex w-full justify-between items-center cursor-pointer">
                            <div className="flex min-w-0 gap-x-4 items-center">
                              <div className="min-w-0 flex-auto">
                                <p className="text-xl font-semibold leading-8 text-white">
                                  {formatReadDaoName(dao.account.name)}
                                </p>
                                <p className="text-md font-semibold leading-5 text-gray-300">
                                  {formatReadDaoName(dao.account.description)}
                                </p>
                                <p className="text-md font-semibold leading-10 text-white">
                                  Treasury: <span
                                    className="text-green-500">{lamportsToSol(Number(dao.account.treasuryAmount.toString()))} SOL</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
};
