import "~/server/sourcemaps";

import querystring from "querystring";

import uuid from "uuid";
import fetch from "node-fetch";
import { sign } from "jsonwebtoken";
import cookie from "cookie";

import photon from "~/server/photon";
import handler from "~/server/handler";
import {
  DISCORD_CLIENT_SECRET as client_secret,
  DISCORD_CLIENT_ID as client_id,
  APP_SECRET,
  HOST
} from "~/server/env";

import { NextApiResponse } from "next";

const DISCORD_URL = "https://discordapp.com";
const AUTHORIZE_URL = `${DISCORD_URL}/api/oauth2/authorize`;
const TOKEN_URL = `${DISCORD_URL}/api/oauth2/token`;
const USER_URL = `${DISCORD_URL}/api/users/@me`;

const scope = ["identify", "guilds"].join(" ");

/** From state id to the url we return to on successful auth */
const states = new Map<string, string>();

/**
 * The oauth redirect uri is always the route we're currently on, which we
 * determine once and then cache.
 */
let redirect_uri: string = null as any;

export default handler(async function login(req, res) {
  const { searchParams, pathname } = new URL(req.url!, HOST);
  if (!redirect_uri) redirect_uri = `${HOST}${pathname}`;

  // TODO: verify already logged in?

  const state = searchParams.get("state");
  if (state) {
    const code = searchParams.get("code");
    if (!code) {
      throw new Error("Both search and code are required to complete auth!");
    }
    return completeAuth(res, state, code);
  }

  const returnTo = searchParams.get("return_to") || req.headers.referer;
  return redirectAuthorize(res, returnTo);
});

function redirectAuthorize(res: NextApiResponse, returnTo?: string) {
  let finalReturn = "/";
  if (returnTo) {
    // Disallow open redirect. If we need to get fancy later we can whitelist
    // specific routes.
    const { origin, pathname } = new URL(returnTo, HOST);
    if (origin !== HOST) {
      console.warn(`return_to origin doesn't match: "${returnTo}"`);
    } else {
      finalReturn = pathname;
    }
  }

  const state = uuid.v4();
  states.set(state, finalReturn);
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
  res.end();
  return;
}

async function completeAuth(res: NextApiResponse, state: string, code: string) {
  const returnTo = states.get(state);
  if (!returnTo) {
    // TODO: might've waited on the auth screen too long, say. just redirect
    // somewhere with a better error message?
    throw new Error("Invalid state!");
  }

  states.delete(state);

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
    throw new Error("Expected access token in response to auth grant request!");
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

  const jwt = sign(account.id, APP_SECRET);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", jwt, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    })
  );
  res.statusCode = 302;
  res.setHeader("Location", returnTo);
  res.end();
  return;
}
