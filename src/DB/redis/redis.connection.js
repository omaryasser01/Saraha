import { createClient } from "redis";
import { Redis_Url } from "../../../config/config.service.js";

export const redis_client = createClient({
  url: Redis_Url,
});

export const connectRedis = async () => {
  await redis_client
    .connect()
    .then(() => console.log("connected to redis successfully"))
    .catch((err) => console.log("error connecting to redis", err));
};
