import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import { generalRules } from "../../common/utils/generalRules.validation.js";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().required(),
    email: generalRules.email.required(),
    password: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("password")).required(),
    age: Joi.number().required(),
    gender: Joi.string()
      .valid(...Object.values(genderEnum))
      .required(),
    phone: Joi.string().required(),
    //provider: Joi.string().required(),
  }).required(),

  query: Joi.object({
    //x: Joi.string().required(),
  }).required(),

  file: generalRules.file.required().messages({
    "any.required": "file is required",
  }),

  files: Joi.array()
    .max(2)
    .items(generalRules.file.required())
    .required()
    .messages({
      "any.required": "attachments are required",
    }),

  files: Joi.object({
    attachment: Joi.array()
      .max(1)
      .items(generalRules.file.required())
      .required()
      .messages({
        "any.required": "attachment is required",
      }),
    attachments: Joi.array()
      .max(3)
      .items(generalRules.file.required())
      .required()
      .messages({
        "any.required": "attachments are required",
      }),
  }).required(),
};

export const signInschema = {
  body: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).required(),
};

export const shareProfileschema = {
  params: Joi.object({
    id: generalRules.id.required(),
  }).required(),
};

export const updateUserSchema = {
  body: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    gender: Joi.string().valid(...Object.values(genderEnum)),
    phone: Joi.string(),
  }).required(),
};

export const updatePassSchema = {
  body: Joi.object({
    newPass: Joi.string().required(),
    oldPass: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("newPass")).required(),
  }).required(),
};

export const verifyOTPSchema = {
  body: Joi.object({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).required(),
  }).required(),
};

export const resetPassSchema = {
  body: Joi.object({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).required(),
    newPass: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("newPass")).required(),
  }).required(),
};
