import { PrismaClient, DiscordUser } from "@prisma/client";

import DiscordApi from "./datasources/discord";
import B2Api from "./datasources/b2";
import photon from "~/server/photon";
import getUserId from "~/server/helpers/get-user-id";

export type Context = BaseContext & { dataSources: DataSources };

export interface BaseContext {
  photon: PrismaClient;
  user: DiscordUser | null;
}

export interface DataSources {
  discordApi: DiscordApi;
  b2Api: B2Api;
}

export const createDataSources = (): DataSources => ({
  discordApi: new DiscordApi(),
  b2Api: new B2Api(),
});

export async function createContext({
  session,
}: {
  session?: string;
}): Promise<BaseContext> {
  const userId = getUserId(session);
  let user: DiscordUser | null = null;
  if (userId) {
    user = await photon.discordUser.findOne({ where: { id: userId } });
  }

  return {
    photon,
    user,
  };
}
