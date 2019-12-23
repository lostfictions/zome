import React, { ComponentType } from "react";
import { NextPage, NextPageContext } from "next";
import Head from "next/head";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink
} from "@apollo/client";

/** In the browser, there's no need to recreate the client on every request, */
let cachedApolloClient: ApolloClient<unknown> | null = null;

type WithApolloProps =
  | {
      // Apollo SSR prepass
      phase: "prepass";
      apolloClient: ApolloClient<unknown>;
    }
  | {
      // Next SSR
      phase: "ssr";
      session?: string;
      apolloState: unknown;
    }
  | {
      // Client-side (first load or after init)
      phase: "client";
      apolloState?: unknown;
    };

export function withApollo<P, IP>(
  PageComponent: NextPage<P, IP>,
  { ssr = true } = {}
) {
  const WithApollo = ({
    pageProps,
    ...props
  }: { pageProps: P } & WithApolloProps) => {
    // console.log(props.phase);
    const client = (() => {
      switch (props.phase) {
        case "prepass":
          return props.apolloClient;
        case "ssr":
          return getApolloClient(props.session, props.apolloState);
        case "client":
          return getApolloClient(undefined, props.apolloState);
        default: {
          const p: never = props;
          throw new Error(`unexpected state: ${p}`);
        }
      }
    })();

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";

    if (displayName === "App") {
      console.warn("This withApollo HOC only works with PageComponents.");
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (
      ctx: NextPageContext & { apolloClient: ApolloClient<unknown> }
    ): Promise<{ pageProps: P } & WithApolloProps> => {
      const { AppTree } = ctx as {
        AppTree: ComponentType<{
          pageProps: { pageProps: unknown } & WithApolloProps;
        }>;
      };

      let session: string | undefined;
      if (typeof window === "undefined") {
        const cookie = await import("cookie");
        if (ctx.req && ctx.req.headers.cookie) {
          session = cookie.parse(ctx.req.headers.cookie).session;
        }
      }

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProps`.
      // TODO: evaluate whether this is needed
      const apolloClient = (ctx.apolloClient = getApolloClient(session));

      // Run wrapped getInitialProps methods
      let pageProps: any;
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      let phase: "ssr" | "client" = "client";
      // Only on the server:
      if (typeof window === "undefined") {
        phase = "ssr";
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return { pageProps } as any;
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import("@apollo/react-ssr");
            await getDataFromTree(
              <AppTree
                pageProps={{
                  pageProps,
                  phase: "prepass",
                  apolloClient
                }}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind();
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      // console.log(apolloState);

      return phase === "client"
        ? {
            phase,
            pageProps,
            apolloState
          }
        : {
            phase,
            session,
            pageProps,
            apolloState
          };
    };
  }

  return WithApollo;
}

/**
 * Always creates a new Apollo client on the server;
 * creates or reuses Apollo client in the browser.
 */
function getApolloClient(session?: string, initialState?: unknown) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    const {
      SchemaLink
    } = require("apollo-link-schema") as typeof import("apollo-link-schema");
    const {
      schema
    } = require("../gql/schema") as typeof import("../gql/schema");
    const {
      createContext
    } = require("../gql/context") as typeof import("../gql/context");

    return new ApolloClient({
      ssrMode: true,
      link: new SchemaLink({
        schema,
        context: createContext({ session })
      }) as any /* bad typings */,
      cache: new InMemoryCache().restore(initialState as any)
      // ssrForceFetchDelay: 100
    });
  }

  // Reuse client on the client-side
  if (!cachedApolloClient) {
    cachedApolloClient = new ApolloClient({
      link: new HttpLink({
        uri: "/api/graphql",
        credentials: "same-origin"
      }),
      cache: new InMemoryCache().restore(initialState as any)
      // ssrForceFetchDelay: 100
    });
  }

  return cachedApolloClient;
}
