import { useApolloClient } from "@apollo/client";
import { Box, Flex, Heading, Link } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogOutMutation, useMeQuery } from "../generated/graphql";

const Navbar = () => {
  const apolloClient = useApolloClient();
  const { data, loading, error } = useMeQuery();

  const [logout, { loading: logoutFetching }] = useLogOutMutation();
  let body = null;
  if (loading) {
    //loading
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Heading>Reddit</Heading>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default Navbar;
