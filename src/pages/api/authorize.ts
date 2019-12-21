// vaguely inspired by https://github.com/microauth/microauth-slack
import querystring from "querystring";
import url from "url";

import micro from "micro";
import uuid from "uuid";
import fetch from "node-fetch";
import { sign } from "jsonwebtoken";
import { cleanEnv, str } from "envalid";
import { Photon } from "@prisma/photon";

const DISCORD_URL = "https://discordapp.com";
const AUTHORIZE_URL = `${DISCORD_URL}/api/oauth2/authorize`;
const TOKEN_URL = `${DISCORD_URL}/api/oauth2/token`;
const USER_URL = `${DISCORD_URL}/api/users/@me`;

const {
  DISCORD_CLIENT_SECRET: client_secret,
  DISCORD_CLIENT_ID: client_id,
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

const scope = ["identify", "guilds"].join(" ");

const photon = new Photon();

/** From state id to redirect url */
const states = new Map<string, string>();

export default micro(async (req, res) => {
  const { query, pathname } = url.parse(req.url!);
  const parsed = querystring.parse(query!);

  const redirect_uri = `${HOST}${pathname}`;

  if (parsed.return_to) {
    const state = uuid.v4();
    states.set(state, parsed.return_to as string);
    setTimeout(() => {
      states.delete(state);
    }, 1000 * 60 * 30);

    res.statusCode = 302;
    res.setHeader(
      "Location",
      `${AUTHORIZE_URL}?${querystring.stringify({
        response_type: "code",
        prompt: "none",
        client_id,
        redirect_uri,
        scope,
        state
      })}`
    );
    return res.end();
  }

  if (!parsed.state) {
    throw new Error("Either return_to or code and state required");
  }

  const returnTo = states.get(parsed.state as string);
  if (!returnTo) {
    // TODO: might've waited on the auth screen too long, say. just redirect
    // somewhere with a better error message?
    throw new Error("Invalid state!");
  }

  states.delete(parsed.state as string);

  const code = parsed.code as string;
  if (!code) {
    throw new Error("Code is required!");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: querystring.encode({
      grant_type: "authorization_code",
      client_id,
      client_secret,
      scope,
      code,
      redirect_uri
    })
  }).then(r => r.json());

  const accessToken = response.access_token;

  if (!accessToken) {
    throw new Error("Expected access token in response!");
  }

  const account = await fetch(USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then(r => r.json());

  if (!account && account.id) {
    throw new Error("Couldn't retrieve account info!");
  }

  await photon.users.upsert({
    where: {
      id: account.id
    },
    update: {
      token: accessToken
    },
    create: {
      id: account.id,
      token: accessToken
    }
  });

  const token = sign({ userId: account.id }, APP_SECRET, {
    expiresIn: response.expires_in
  });

  return {
    token
  };

  // TODO: handle return-to url
});
