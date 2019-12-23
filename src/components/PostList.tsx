import React from "react";
import gql from "graphql-tag";

import { useFeedQuery } from "~/apollo/generated/client";

gql`
  query Feed {
    feed {
      title
      content
    }
  }
`;

const PostList = () => {
  const { data, loading, error } = useFeedQuery();

  if (loading) return <div>loading...</div>;
  if (!data || error) {
    console.warn(error);
    return (
      <div>
        error! <pre>{JSON.stringify(error)}</pre>
      </div>
    );
  }

  return (
    <div>
      {data.feed.map((p, i) => (
        <div key={i}>
          <h1>{p.title}</h1>
          <p>{p.content}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
