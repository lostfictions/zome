import { ApolloServer } from "apollo-server-micro";

import { schema } from "~/gql/schema";
import { createContext } from "~/gql/context";

const apolloServer = new ApolloServer({
  schema,
  dataSources: () => ({}),
  context: createContext
});

export default apolloServer;
