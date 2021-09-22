import { FormControl, Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { values } from "lodash";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword = () => {
  const [complete, setComplete] = useState(false);
  const initialValues = {
    email: "",
  };

  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper size="small">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          console.log(values);
          await forgotPassword({
            variables: values,
          });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              if an account with that email exists, we cant sent you an email
            </Box>
          ) : (
            <Form>
              <FormControl>
                <InputField
                  name="email"
                  placeholder="Email"
                  label="Email"
                  type="email"
                />
                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Reset password
                </Button>
              </FormControl>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
