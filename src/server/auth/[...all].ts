import { auth } from "@/lib/auth";
import { defineHandler } from "nitro/deps/h3";

export default defineHandler((event) => {
  return auth.handler(event.req);
});
