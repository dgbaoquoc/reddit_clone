import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import Navbar from "../components/Navbar";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import NextLink from "next/link";
import Layout from "../components/Layout";
import PostButton from "../components/PostButton";

const LIMIT_POST = 1;

const Index = () => {
  const { data, loading, error, fetchMore, networkStatus } = usePostsQuery({
    variables: {
      limit: LIMIT_POST,
    },
    //re-render when status network changed
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () =>
    fetchMore({
      variables: {
        cursor: data?.posts.cursor,
      },
    });

  return (
    <Layout>
      {loading ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Stack spacing={8}>
          {data?.posts.paginatedPosts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <Box flex={1}>
                <NextLink href={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize="x-large">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text>posted by {post.creator.username} </Text>
                <Flex align="center">
                  <Text mt={4}>{post.textSnippet}</Text>
                  <Box ml="auto">
                    <PostButton />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}

      {data?.posts.hasMore && (
        <Flex>
          <Button m="auto" my={8} isLoading={loading} onClick={loadMore}>
            load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit: LIMIT_POST,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;
