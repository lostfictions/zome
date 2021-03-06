import { nexusPrismaPlugin } from "nexus-prisma";
import { makeSchema } from "@nexus/schema";

import * as types from "./types";

export const schema = makeSchema({
  shouldGenerateArtifacts: Boolean(process.env["GEN_NEXUS"]),
  types,
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + "/generated/schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
  typegenAutoConfig: {
    sources: [
      {
        source: "@prisma/client",
        alias: "photon",
      },
      {
        source: require.resolve("./context"),
        alias: "Context",
      },
    ],
    contextType: "Context.Context",
  },
});
