import "~/server/sourcemaps";

import { ApolloServer } from "apollo-server-micro";

import { schema } from "~/gql/schema";
import { createContext } from "~/gql/context";

const apolloServer = new ApolloServer({
  schema,
  context: createContext
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({ path: "/api/graphql" });
