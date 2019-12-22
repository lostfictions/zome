import { cleanEnv, str } from "envalid";

export const {
  DISCORD_CLIENT_SECRET,
  DISCORD_CLIENT_ID,
  APP_SECRET,
  HOST
} = cleanEnv(
  process.env,
  {
    DISCORD_CLIENT_SECRET: str(),
    DISCORD_CLIENT_ID: str(),
    APP_SECRET: str(),
    HOST: str({ devDefault: "http://localhost:3000" })
  },
  { strict: true }
);
