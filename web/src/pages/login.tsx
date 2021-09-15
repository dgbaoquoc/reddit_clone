import { Box, Button, Flex, Link, Spinner, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../ultils/useCheckAuth";
import NextLink from "next/link";

// import { registerMutation } from "../graphql-client/mutation/mutation";

const Login = () => {
  const toast = useToast();
  const router = useRouter();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValues: LoginInput = {
    usernameOrEmail: "",
    password: "",
  };

  const [loginUser, { loading, data, error }] = useLoginMutation();
  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.login.user,
            },
          });
        }
      },
    });

    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else if (response.data?.login.success) {
      toast({
        title: "Welcome",
        description: response.data?.login.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <Flex alignItems="center" minH="100vh" justifyContent="center">
          <Spinner />
        </Flex>
      ) : (
        <Wrapper>
          <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  placeholder="Username or Email"
                  label="Username or Email"
                  type="text"
                />
                <Box mt={4}></Box>
                <InputField
                  name="password"
                  placeholder="Password"
                  label="Password"
                  type="password"
                />
                <Flex mt={2} align="flex-end">
                  <NextLink href="/forgot-password">
                    <Link ml="auto">forgot password?</Link>
                  </NextLink>
                </Flex>
                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Login;
