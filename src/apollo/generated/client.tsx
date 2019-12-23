import gql from "graphql-tag";
import * as ApolloReactCommon from "@apollo/client";
import * as ApolloReactHooks from "@apollo/client";
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AuthPayload = {
  __typename?: "AuthPayload";
  token: Scalars["String"];
  user: User;
};

export type Post = {
  __typename?: "Post";
  author?: Maybe<User>;
  content?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  published: Scalars["Boolean"];
  title: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  feed: Array<Post>;
  filterPosts: Array<Post>;
  me?: Maybe<User>;
  post?: Maybe<Post>;
};

export type QueryFilterPostsArgs = {
  searchString?: Maybe<Scalars["String"]>;
};

export type QueryPostArgs = {
  id?: Maybe<Scalars["ID"]>;
};

export type User = {
  __typename?: "User";
  avatar?: Maybe<Scalars["String"]>;
  id: Scalars["String"];
  username?: Maybe<Scalars["String"]>;
};

export type FeedQueryVariables = {};

export type FeedQuery = { __typename?: "Query" } & {
  feed: Array<{ __typename?: "Post" } & Pick<Post, "title" | "content">>;
};

export type MeQueryVariables = {};

export type MeQuery = { __typename?: "Query" } & {
  me: Maybe<{ __typename?: "User" } & Pick<User, "id" | "username" | "avatar">>;
};

export const FeedDocument = gql`
  query Feed {
    feed {
      title
      content
    }
  }
`;
export function useFeedQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<FeedQuery, FeedQueryVariables>
) {
  return ApolloReactHooks.useQuery<FeedQuery, FeedQueryVariables>(
    FeedDocument,
    baseOptions
  );
}
export function useFeedLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FeedQuery,
    FeedQueryVariables
  >
) {
  return ApolloReactHooks.useLazyQuery<FeedQuery, FeedQueryVariables>(
    FeedDocument,
    baseOptions
  );
}
export type FeedQueryHookResult = ReturnType<typeof useFeedQuery>;
export type FeedLazyQueryHookResult = ReturnType<typeof useFeedLazyQuery>;
export type FeedQueryResult = ApolloReactCommon.QueryResult<
  FeedQuery,
  FeedQueryVariables
>;
export const MeDocument = gql`
  query Me {
    me {
      id
      username
      avatar
    }
  }
`;
export function useMeQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>
) {
  return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(
    MeDocument,
    baseOptions
  );
}
export function useMeLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(
    MeDocument,
    baseOptions
  );
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = ApolloReactCommon.QueryResult<
  MeQuery,
  MeQueryVariables
>;
