import { emailEnum } from "../../common/enum/user.enum.js";
import { redis_client } from "./redis.connection.js";

export const otp_key = ({ email, subject = emailEnum.confirmEmail }) => {
  return `otp::${email}::${subject}`;
};

export const otp_count = ({ email }) => {
  return `${otp_key({ email })}::count`;
};

export const block_otp = ({ email }) => {
  return `${otp_key({ email })}::block`;
};

export const setValue = async ({ key, value, ttl }) => {
  try {
    const data = typeof value == "string" ? value : JSON.stringify(value);
    return ttl
      ? await redis_client.set(key, data, { EX: ttl })
      : await redis_client.set(key, data);
  } catch (error) {
    console.log(error, "failed to set");
  }
};

export const update = async ({ key, value, ttl }) => {
  try {
    if (!(await redis_client.exists(key))) return 0;
    return await setValue({ key, value, ttl });
  } catch (error) {
    console.log(error, "failed to update");
  }
};

export const get = async (key) => {
  try {
    try {
      return JSON.parse(await redis_client.get(key));
    } catch (error) {
      return await redis_client.get(key);
    }
  } catch (error) {
    console.log(error, "failed to get");
  }
};

export const ttl = async (key) => {
  try {
    return await redis_client.ttl(key);
  } catch (error) {
    console.log(error, "failed to get ttl");
  }
};

export const exists = async (key) => {
  try {
    return await redis_client.exists(key);
  } catch (error) {
    console.log(error, "failed to check existence");
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    return await redis_client.expire(key, ttl);
  } catch (error) {
    console.log(error, "failed to SET expire");
  }
};

export const deleteKey = async (key) => {
  try {
    if (!key.length) return 0;
    return await redis_client.del(key);
  } catch (error) {
    console.log(error, "failed to delete key");
  }
};

export const keys = async (pattern) => {
  try {
    return await redis_client.keys(`${pattern}*`);
  } catch (error) {
    console.log(error, "failed to get keys");
  }
};

export const increment = async (key) => {
  try {
    return await redis_client.incr(key);
  } catch (error) {
    console.log(error, "failed to increment");
  }
};
