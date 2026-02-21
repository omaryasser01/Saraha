import { hashSync, compareSync } from "bcrypt";
import { SaltRounds } from "../../../../config/config.service.js";

export const hash = ({ plainText, saltRounds = SaltRounds } = {}) => {
  return hashSync(plainText, Number(saltRounds));
};

export const compare = ({ plainText, cipherText } = {}) => {
  return compareSync(plainText, cipherText);
};
