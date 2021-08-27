import Head from 'next/head';
import { Button, Divider } from '@chakra-ui/react';
import { Search } from '../components/Search/Search';
import { useState } from 'react';

export default function Home() {
  const [showSearch, setShowSearch] = useState(true);
  return (
    <>
      <Head>
        <title>State Machines</title>
      </Head>
      <Button d="block" onClick={() => setShowSearch((curr) => !curr)}>
        {showSearch ? 'hide' : 'show'} search
      </Button>
      <Divider mt={3} />
      {showSearch && <Search mt={5} />}
    </>
  );
}
