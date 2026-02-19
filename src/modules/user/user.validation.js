import Joi from "joi";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }).required(),

  Query: Joi.object({
    x: Joi.string().required(),
  }).required(),
};
