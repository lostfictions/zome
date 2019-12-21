import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

const FeedQuery = gql`
  query FeedQuery {
    feed {
      title
      content
    }
  }
`;

const PostList = () => {
  const { data, loading, error } = useQuery(FeedQuery);

  if (loading) return <div>loading...</div>;
  if (error) {
    return (
      <div>
        error! <pre>{JSON.stringify(error)}</pre>
      </div>
    );
  }

  return (
    <div>
      {(data.feed as any[]).map((p, i) => (
        <div key={i}>
          <h1>{p.title}</h1>
          <p>{p.content}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
