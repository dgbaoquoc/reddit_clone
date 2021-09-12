import { FormControl, Button, Box } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { RegisterInput, useRegisterMutation } from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";

// import { registerMutation } from "../graphql-client/mutation/mutation";

const Register = () => {
  const router = useRouter();
  const [registerUser, { data, error, loading }] = useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.success) {
      router.push("/");
    }
  };
  return (
    <Wrapper>
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
