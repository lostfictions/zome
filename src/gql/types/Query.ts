import { idArg, queryType, stringArg } from "nexus";

export const Query = queryType({
  definition(t) {
    t.field("me", {
      type: "User",
      nullable: true,
      resolve: async (_parent, _args, ctx) => {
        const { user, dataSources } = ctx;
        if (!user) return null;

        const discordUser = await dataSources.discordApi.getMe();

        const { username, avatar } = discordUser;

        return {
          ...user,
          username,
          avatar
        };
      }
    });

    t.list.field("feed", {
      type: "Post",
      resolve: (_parent, _args, ctx) => {
        return ctx.photon.posts.findMany({
          where: { published: true }
        });
      }
    });

    t.list.field("filterPosts", {
      type: "Post",
      args: {
        searchString: stringArg({ nullable: true })
      },
      resolve: (_parent, { searchString }, ctx) => {
        return ctx.photon.posts.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchString
                }
              },
              {
                content: {
                  contains: searchString
                }
              }
            ]
          }
        });
      }
    });

    t.field("post", {
      type: "Post",
      nullable: true,
      args: { id: idArg() },
      resolve: (_parent, { id }, ctx) => {
        return ctx.photon.posts.findOne({
          where: {
            id
          }
        });
      }
    });
  }
});
