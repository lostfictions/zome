import { ApolloServer } from "apollo-server-micro";

import { schema } from "~/gql/schema";
import { createContext, createDataSources } from "~/gql/context";

import { NextApiRequest } from "next";

const apolloServer = new ApolloServer({
  schema,
  dataSources: createDataSources as () => { [source: string]: any },
  context: ({ req }: { req: NextApiRequest }) =>
    createContext({ session: req.cookies.session })
});

export default apolloServer;
