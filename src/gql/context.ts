import { Photon, User } from "@prisma/photon";

import DiscordApi from "./datasources/discord";
import photon from "~/server/photon";
import getUserId from "~/server/helpers/get-user-id";

export type Context = BaseContext & { dataSources: DataSources };

export interface BaseContext {
  photon: Photon;
  user: User | null;
}

export interface DataSources {
  discordApi: DiscordApi;
}

export const createDataSources = (): DataSources => ({
  discordApi: new DiscordApi()
});

export async function createContext({
  session
}: {
  session?: string;
}): Promise<BaseContext> {
  const userId = getUserId(session);
  let user: User | null = null;
  if (userId) {
    user = await photon.users.findOne({ where: { id: userId } });
  }

  return {
    photon,
    user
  };
}
