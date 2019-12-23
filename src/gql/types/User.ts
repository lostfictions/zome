import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.string("avatar", { nullable: true });
    t.string("username", { nullable: true });
  }
});
