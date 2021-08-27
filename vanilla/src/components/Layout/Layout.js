import React from 'react';
import { Container } from '@chakra-ui/react';

export const Layout = ({ children }) => {
  return (
    <Container as={'main'} mt={8} maxW={1200} w={'90vw'}>
      {children}
    </Container>
  );
};
