import React from 'react';
import { Box, Heading, Image, Spinner, Square, Stack, Text } from '@chakra-ui/react';
import { highlightQuery } from '../../utilities';

const dimension = '250px';

const FallbackImage = () => (
  <Square h={dimension} w={dimension} bg={'gray.100'}>
    <Spinner />
  </Square>
);

const Title = ({ children, searchTerm, ...rest }) => {
  const hasSearchTerm = !!searchTerm;

  if (hasSearchTerm) {
    return (
      <Heading as={'h3'} color={'gray.800'} fontSize={'lg'} fontWeight={'bold'} {...rest}>
        {highlightQuery(children, searchTerm)}
      </Heading>
    );
  }

  return (
    <Text color={'gray.800'} fontSize={'lg'} fontWeight={'bold'} {...rest}>
      {children}
    </Text>
  );
};

export const Patent = ({ code, title, description, imageURL, searchTerm }) => {
  return (
    <Stack isInline bg={'gray.50'} rounded={'lg'} boxShadow={'md'} overflow={'hidden'}>
      <Image src={imageURL} alt={title} boxSize="250px" objectFit="cover" fallback={<FallbackImage />} />
      <Box p={5} h={dimension}>
        <Text color={'gray.600'} fontSize={'sm'} fontWeight={'600'} letterSpacing={1}>
          {code}
        </Text>
        <Title searchTerm={searchTerm} mt={0}>
          {title}
        </Title>
        <Text mt={3} noOfLines={5} color={'gray.800'}>
          {description}
        </Text>
      </Box>
    </Stack>
  );
};
