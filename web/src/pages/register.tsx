import { useMutation } from "@apollo/client";
import { FormControl, Button, Box } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { RegisterInput, useRegisterMutation } from "../generated/graphql";

// import { registerMutation } from "../graphql-client/mutation/mutation";

const Register = () => {
  const [registerUser, { data, error, loading }] = useRegisterMutation();

  const onRegisterSubmit = async (values: RegisterInput) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
    });

    console.log(JSON.stringify(response));
  };
  return (
    <Wrapper>
      {error && <p>Failed to register</p>}
      {data && data.register.success && (
        <p>Register success {JSON.stringify(data.register)}</p>
      )}
      <Formik
        initialValues={{ username: "", password: "", email: "" }}
        onSubmit={onRegisterSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
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
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
