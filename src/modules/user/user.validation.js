import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().required().email(),
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
};

export const signInschema = {
  body: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).required(),
};
