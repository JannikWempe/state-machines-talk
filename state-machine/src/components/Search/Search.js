import React from 'react';
import { Box, Center, Flex, FormControl, FormLabel, Input, Spinner, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { Patent } from '../Patent/Patent';
import { useMachine } from '@xstate/react';
import { timedSearchMaschine } from '../../machines/timed-fetch';

// min 2 chars
// debounce search
// show info to stop typing while debouncing
// show total results if success
// show time it takes if timer stopped and search success
// show loading spinner if search is loading
// show error if search fails

export const Search = ({ ...rest }) => {
  const [state, send] = useMachine(timedSearchMaschine, { devTools: true });

  const isSearchDebouncing = state.matches('search.debouncing');
  const isSearchIdle = state.matches('search.idle');
  const isSearchSearching = state.matches('search.searching');
  const isSearchSuccess = state.matches('search.success');
  const isSearchError = state.matches('search.error');

  const isTimerStopped = state.matches('timer.stopped');

  const handleSearchTermChange = (event) => {
    send('SEARCH', { searchTerm: event.target.value });
  };

  return (
    <Box {...rest}>
      <Box maxW={500} mx={'auto'}>
        <FormControl id="search">
          <FormLabel>NASA Patentsuche</FormLabel>
          <Input placeholder={'Search...'} onChange={handleSearchTermChange} autoComplete={'off'} />
        </FormControl>
        <Flex mt={2} mx={4} justifyContent={'space-between'} fontSize={'sm'} color={'gray.600'}>
          {isSearchDebouncing && <Text>stop typing to trigger search</Text>}
          {isSearchSuccess && <Text>{state.context.data.length} Suchergebnisse</Text>}
          {isSearchSuccess && isTimerStopped && (
            <Text ml={'auto'}>search took {(state.context.timer.total / 1000).toFixed(2)}s</Text>
          )}
        </Flex>
      </Box>

      {isSearchIdle && (
        <Text mt={5} textAlign={'center'} fontWeight={'bold'}>
          Do your search! Type at least two letters.
        </Text>
      )}
      {isSearchSearching && (
        <Center>
          <Spinner mt={12} thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Center>
      )}
      {isSearchError && (
        <Text mt={8} ml={4} color={'red.600'} fontSize={'lg'}>
          Es ist ein Fehler aufgetreten.
        </Text>
      )}
      {isSearchSuccess && (
        <>
          <Wrap spacing={5} mt={8}>
            {state.context.data.map((patent) => (
              <WrapItem key={patent.id}>
                <Patent
                  id={patent.id}
                  code={patent.code}
                  title={patent.title}
                  description={patent.description}
                  imageURL={patent.imageURL}
                  searchTerm={state.context.searchTerm}
                />
              </WrapItem>
            ))}
          </Wrap>
        </>
      )}
    </Box>
  );
};
