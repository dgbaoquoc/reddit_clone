import { FormControl } from "@chakra-ui/form-control";
import { Box, Button, Flex, Link, toast, useToast } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../../generated/graphql";
import { mapFieldErrors } from "../../helpers/mapFieldErrors";
import NextLink from "next/link";

const ChangePassword = () => {
  const toast = useToast();
  const router = useRouter();

  const [tokenError, setTokenError] = useState("");
  const [changePassword] = useChangePasswordMutation();
  const initialValues = {
    newPassword: "",
  };
  return (
    <Wrapper>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token:
                typeof router.query.token === "string"
                  ? router.query.token
                  : "",
            },
            update(cache, { data }) {
              if (data?.changePassword.success) {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    me: data?.changePassword.user,
                  },
                });
              }
            },
          });

          console.log(response);

          if (response.data?.changePassword.errors) {
            const errorMap: any = mapFieldErrors(
              response.data.changePassword.errors
            );
            console.log(errorMap);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }

            setErrors(errorMap);
          } else if (response.data?.changePassword.success) {
            //worked
            toast({
              title: "Welcome",
              description: response.data?.changePassword.message,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="newPassword"
                placeholder="New password"
                label="New password"
                type="password"
              />
              {tokenError ? (
                <Flex>
                  <Box mr={2} style={{ color: "red" }}>
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>click here to get a new one</Link>
                  </NextLink>
                </Flex>
              ) : null}
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;
