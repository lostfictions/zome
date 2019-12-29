import "~/server/sourcemaps";

import apolloServer from "~/server/gql/apollo-server";

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({ path: "/api/graphql" });
