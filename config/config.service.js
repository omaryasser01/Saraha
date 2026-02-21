import dotenv from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV;

let envPaths = {
  development: ".env.development",
  production: ".env.production",
};

dotenv.config({ path: resolve(`config/${envPaths[NODE_ENV]}`) });

export const Port = +process.env.Port;

export const SaltRounds = process.env.SaltRounds;

export const DB_URi = process.env.DB_URi;

export const Secret_key = process.env.secret_key;

export const Audience = process.env.audience;

export const User = process.env.user;

export const Pass = process.env.pass;
