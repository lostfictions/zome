import { cleanEnv, str, makeValidator } from "envalid";

const strSet = makeValidator<Set<string>>(x => {
  const arr = JSON.parse(x);
  if (!Array.isArray(arr)) throw new Error("Must be an array!");
  if (!arr.every(v => typeof v === "string")) {
    throw new Error("Must be array of strings");
  }
  return new Set<string>(arr);
});

export const {
  DISCORD_CLIENT_SECRET,
  DISCORD_CLIENT_ID,
  APP_SECRET,
  WHITELISTED_GUILDS,
  HOST
} = cleanEnv(
  process.env,
  {
    DISCORD_CLIENT_SECRET: str(),
    DISCORD_CLIENT_ID: str(),
    APP_SECRET: str(),
    WHITELISTED_GUILDS: strSet(),
    HOST: str({ devDefault: "http://localhost:3000" })
  },
  { strict: true }
);
