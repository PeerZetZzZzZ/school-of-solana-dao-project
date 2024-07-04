import type { NextPage } from "next";
import Head from "next/head";
import { ProposalsView } from "../../views";

const Proposals: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>Proposals</title>
                <meta
                    name="proposals"
                    content="DAO proposals"
                />
            </Head>
            <ProposalsView />
        </div>
    );
};

export default Proposals;
