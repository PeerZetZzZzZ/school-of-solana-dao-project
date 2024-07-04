import type { NextPage } from "next";
import Head from "next/head";
import { DaosView } from "../views";

const Daos: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>DAOs</title>
        <meta
          name="description"
          content="DAOs list"
        />
      </Head>
      <DaosView />
    </div>
  );
};

export default Daos;
