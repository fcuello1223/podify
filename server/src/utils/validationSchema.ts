import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import { categories } from "./audioCategories";

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

export const TokenAndIDValidation = yup.object().shape({
  token: yup.string().trim().required("Invalid Token!"),
  userId: yup
    .string()
    .transform(function (val) {
      if (this.isType(val) && isValidObjectId(val)) {
        return val;
      }

      return "";
    })
    .required("Invalid User ID!"),
});

export const UpdatePasswordSchema = yup.object().shape({
  token: yup.string().trim().required("Invalid Password!"),
  userId: yup
    .string()
    .transform(function (val) {
      if (this.isType(val) && isValidObjectId(val)) {
        return val;
      }

      return "";
    })
    .required("Invalid User ID!"),
  password: yup
    .string()
    .required("Password Is Missing!")
    .min(7, "Password Should Be At Least 7 Characters Long!")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\S]+$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
});

export const SignInValidationSchema = yup.object().shape({
  email: yup.string().required("E-Mail Is Missing!").email("Invalid E-Mail ID"),
  password: yup.string().trim().required("Password Is Missing!"),
});

export const AudioValidationSchema = yup.object().shape({
  title: yup.string().required("Title Is Missing!"),
  about: yup.string().trim().required("Password Is Missing!"),
  category: yup
    .string()
    .oneOf(categories, "Invalid Category!")
    .required("Category Is Missing!"),
});

export const NewPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title Is Missing!"),
  resId: yup.string().transform(function (val) {
    return this.isType(val) && isValidObjectId(val) ? val : "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Visibility Must Be Public or Private!")
    .required("Visibility Is Missing!"),
});

export const OldPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title Is Missing!"),
  //Validate audio id
  item: yup.string().transform(function (val) {
    return this.isType(val) && isValidObjectId(val) ? val : "";
  }),
  //Validate playlist id
  id: yup.string().transform(function (val) {
    return this.isType(val) && isValidObjectId(val) ? val : "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Visibility Must Be Public or Private!")
});
