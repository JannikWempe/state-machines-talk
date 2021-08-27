import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, Flex, FormControl, FormLabel, Input, Spinner, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { Patent } from '../Patent/Patent';
import { useDebounce } from 'react-use';
import { fetchPatents } from '../../lib/nasa-client';

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 500;

// min 2 chars
// debounce search
// show info to stop typing while debouncing
// show total results if success
// show time it takes if timer stopped and search success
// show loading spinner if search is loading
// show error if search fails

export const Search = ({ ...rest }) => {
  // --- search
  const [patents, setPatents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const isSearchDebouncing = searchTerm !== debouncedSearchTerm;
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    DEBOUNCE_MS,
    [searchTerm],
  );
  const hasMinSearchTermLength = searchTerm.length >= MIN_LENGTH;
  const hasMinDebouncedSearchTermLength = debouncedSearchTerm.length >= MIN_LENGTH;

  // --- timer
  const [timer, setTimer] = useState(0);
  const startTimerRef = useRef(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!hasMinDebouncedSearchTermLength) return;

    const controller = new AbortController();

    const fetch = async () => {
      setIsLoading(true);
      setIsError(false);

      setIsTimerRunning(true);
      startTimerRef.current = Date.now();

      try {
        const response = await fetchPatents(debouncedSearchTerm, { signal: controller.signal });
        setPatents(response);
      } catch (e) {
        const isAborted = e?.name === 'AbortError';
        if (!isAborted) {
          setPatents([]);
          setIsError(true);
        }
      } finally {
        setIsLoading(false);

        setTimer(Date.now() - startTimerRef.current);
        startTimerRef.current = null;
        setIsTimerRunning(false);
      }
    };

    fetch();
    return () => {
      controller.abort();
    };
  }, [debouncedSearchTerm]);

  return (
    <Box {...rest}>
      <Box maxW={500} mx={'auto'}>
        <FormControl id="search">
          <FormLabel>NASA Patentsuche</FormLabel>
          <Input
            placeholder={'Search...'}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            autoComplete={'off'}
          />
        </FormControl>
        <Flex mt={2} mx={4} justifyContent={'space-between'} fontSize={'sm'} color={'gray.600'}>
          {isSearchDebouncing && hasMinSearchTermLength && <Text>stop typing to trigger search</Text>}
          {!isLoading && !isError && !isSearchDebouncing && hasMinDebouncedSearchTermLength && (
            <Text>{patents.length} Suchergebnisse</Text>
          )}
          {!isLoading && !isError && !isSearchDebouncing && hasMinDebouncedSearchTermLength && !isTimerRunning && (
            <Text ml={'auto'}>search took {(timer / 1000).toFixed(2)}s</Text>
          )}
        </Flex>
      </Box>

      {!isLoading && !isError && !hasMinSearchTermLength && (
        <Text mt={5} textAlign={'center'} fontWeight={'bold'}>
          Do your search! Type at least two letters.
        </Text>
      )}
      {isLoading && (
        <Center>
          <Spinner mt={12} thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Center>
      )}
      {isError && (
        <Text mt={8} ml={4} color={'red.600'} fontSize={'lg'}>
          Es ist ein Fehler aufgetreten.
        </Text>
      )}
      {!isLoading && !isError && hasMinDebouncedSearchTermLength && (
        <>
          <Wrap spacing={5} mt={8}>
            {patents.map((patent) => (
              <WrapItem key={patent.id}>
                <Patent
                  id={patent.id}
                  code={patent.code}
                  title={patent.title}
                  description={patent.description}
                  imageURL={patent.imageURL}
                  searchTerm={searchTerm}
                />
              </WrapItem>
            ))}
          </Wrap>
        </>
      )}
    </Box>
  );
};
