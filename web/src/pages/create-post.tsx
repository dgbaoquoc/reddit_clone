import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import router from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { CreatePostInput, useCreatePostMutation } from "../generated/graphql";
import { useCheckAuth } from "../ultils/useCheckAuth";

const CreatePost = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [createPost] = useCreatePostMutation();

  const initialValues = {
    title: "",
    text: "",
  };
  if (authLoading || (!authLoading && !authData?.me)) {
    return (
      <Flex alignItems="center" minH="100vh" justifyContent="center">
        <Spinner />
      </Flex>
    );
  }

  const onSubmitCreatePost = async (values: CreatePostInput) => {
    await createPost({
      variables: {
        createPostInput: values,
      },
      update: (cache, { data }) => {
        cache.modify({
          fields: {
            posts(existing) {
              //   console.log("EX", existing);

              if (data?.createPost.success && data.createPost.post) {
                // Post: new_id
                const newPostRef = cache.identify(data.createPost.post);
                // console.log("New", newPostRef);
                const newPostsAfterCreation = {
                  ...existing,
                  total: existing.total + 1,
                  paginatedPosts: [
                    { __ref: newPostRef },
                    ...existing.paginatedPosts,
                  ],
                };
              }
            },
          },
        });
      },
    });

    router.push("/");
  };
  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onSubmitCreatePost}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title"
              label="Title"
              type="text"
            />
            <Box mt={4}></Box>
            <InputField
              name="text"
              placeholder="Text"
              label="Text"
              type="textarea"
              textarea
            />

            <Flex mt={4} justifyContent="space-between">
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Create
              </Button>
              <NextLink href="/">
                <Button>Go back to homepage</Button>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default CreatePost;
