import { Box, Flex, Heading, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <Box bg="tan" p={4}>
      <Flex maxW={800} justifyContent="space-between" mx="auto" align="center">
        <Heading>Reddit</Heading>
        <Box>
          <NextLink href="/login">
            <Link mr={2}>Login</Link>
          </NextLink>
          <NextLink href="/register">
            <Link>Register</Link>
          </NextLink>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
