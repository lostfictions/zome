import "~/server/sourcemaps";

import apolloServer from "~/gql/server";

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({ path: "/api/graphql" });
