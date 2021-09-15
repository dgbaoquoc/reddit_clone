import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../ultils/useCheckAuth";

// import { registerMutation } from "../graphql-client/mutation/mutation";

const Register = () => {
  const toast = useToast();
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [registerUser, { data, error, loading }] = useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.register.user,
            },
          });
        }
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.success) {
      toast({
        title: "Welcome",
        description: response.data?.register.message,
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
          <Formik
            initialValues={{ username: "", password: "", email: "" }}
            onSubmit={onRegisterSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="username"
                  placeholder="Username"
                  label="Username"
                  type="text"
                />
                <Box mt={4}></Box>
                <InputField
                  name="email"
                  placeholder="Email"
                  label="Email"
                  type="text"
                />
                <Box mt={4}></Box>
                <InputField
                  name="password"
                  placeholder="Password"
                  label="Password"
                  type="password"
                />
                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Register;
