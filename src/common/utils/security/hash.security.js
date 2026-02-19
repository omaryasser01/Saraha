import { hashSync, compareSync } from "bcrypt";

export const hash = ({
  plainText,
  saltRounds = process.env.saltRounds,
} = {}) => {
  return hashSync(plainText, Number(saltRounds));
};

export const compare = ({ plainText, cipherText } = {}) => {
  return compareSync(plainText, cipherText);
};
