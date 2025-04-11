import * as yup from "yup";

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name Is Missing!")
    .min(3, "Name Is Too Short!")
    .max(15, "Name Is Too Long!"),
  email: yup
    .string()
    .required("E-Mail Is Missing!")
    .email("Invalid E-Mail Address!"),
  password: yup
    .string()
    .required("Password Is Missing!")
    .min(7, "Password Should Be At Least 7 Characters Long!")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\S]+$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
});

