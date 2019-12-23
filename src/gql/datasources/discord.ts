import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";

import { BaseContext } from "../context";
import { User, UserGuild } from "./discord-api";

export default class DiscordApi extends RESTDataSource<BaseContext> {
  constructor(fetch?: any) {
    super(fetch);
    this.baseURL = "https://discordapp.com/api/";
  }

  willSendRequest(request: RequestOptions) {
    if (this.context.user) {
      request.headers.set("Authorization", `Bearer ${this.context.user.token}`);
    }
  }

  getMe() {
    return this.get<User>("users/@me");
  }

  getMyGuilds() {
    return this.get<UserGuild[]>("/users/@me/guilds");
  }
}
