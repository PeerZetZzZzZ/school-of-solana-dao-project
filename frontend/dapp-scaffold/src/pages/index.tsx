import type { NextPage } from "next";
import Head from "next/head";
import { CreateDaoView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Create DAO</title>
        <meta
          name="description"
          content="Create DAO"
        />
      </Head>
      <CreateDaoView />
    </div>
  );
};

export default Home;
