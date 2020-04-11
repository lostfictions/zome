import { queryType } from "@nexus/schema";

export const Query = queryType({
  definition(t) {
    t.field("me", {
      type: "User",
      nullable: true,
      resolve: (_parent, _args, ctx) => {
        const { user, dataSources } = ctx;
        if (!user) return null;
        return dataSources.discordApi.getMe();
      },
    });
  },
});
