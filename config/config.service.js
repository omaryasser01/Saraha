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

export const DB_URi_online = process.env.DB_URi_online;

export const Access_Secret_key = process.env.access_Secret_key;

export const Refresh_Secret_key = process.env.refresh_Secret_key;

export const Audience = process.env.audience;

export const User = process.env.user;

export const Pass = process.env.pass;

export const Prefix = process.env.prefix;

export const Redis_Url = process.env.Redis_Url;

export const white_list = process.env.white_list.split(",") || [];
