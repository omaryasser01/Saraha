import { EventEmitter } from "node:events";
export const emailEventEmitter = new EventEmitter();

emailEventEmitter.on("sendOTP", async (fn) => {
  await fn();
});
