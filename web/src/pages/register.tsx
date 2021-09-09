import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Form, Formik } from "formik";

const Register = () => {
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values }) => (
        <Form>
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              id="username"
              placeholder="Username"
              value={values.username}
            ></Input>
          </FormControl>
        </Form>
      )}
    </Formik>
  );
};

export default Register;
