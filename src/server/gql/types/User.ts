import { objectType } from "@nexus/schema";

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("username");
    t.string("discriminator");
    t.string("avatar", { nullable: true });
  },
});
