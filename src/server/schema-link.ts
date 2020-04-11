import { ApolloLink, Operation, FetchResult, Observable } from "apollo-link";
import { execute } from "graphql/execution/execute";

import { schema as gqlSchema } from "./gql/schema";
import { createContext, createDataSources } from "./gql/context";

import { GraphQLSchema } from "graphql/type/schema";
import { DataSource } from "apollo-datasource";

// HACK: the official SchemaLink has a number of shortcomings -- it doesn't
// resolve async context getters, and doesn't merge in Apollo Server datasources
// (arguably not its job, but stll a problem). so provide our own Link that
// does. See https://github.com/apollographql/apollo-link/issues/1208 for
// further context.

export function makeSchemaLink(session?: string) {
  const context = createContext({ session }).then(ctx => {
    const dataSources = createDataSources();
    for (const ds of Object.values(dataSources) as DataSource[]) {
      const p = ds.initialize?.({ context: ctx, cache: undefined as any });
      if (p) {
        p.catch(e => {
          console.error(e);
        });
      }
    }
    return { ...ctx, dataSources };
  });

  const schemaLink = new SchemaLink({
    schema: gqlSchema,
    context
  });

  return (schemaLink as unknown) as import("@apollo/client").ApolloLink; /* incompatible typings */
}

type ResolverContextFunction = (operation: Operation) => Record<string, any>;

interface Options {
  /**
   * The schema to generate responses from.
   */
  schema: GraphQLSchema;

  /**
   * The root value to use when generating responses.
   */
  rootValue?: any;

  /**
   * A context to provide to resolvers declared within the schema.
   */
  context?: ResolverContextFunction | Record<string, any>;
}

export class SchemaLink extends ApolloLink {
  public schema: GraphQLSchema;
  public rootValue: any;
  public context: ResolverContextFunction | any;

  constructor({ schema, rootValue, context }: Options) {
    super();

    this.schema = schema;
    this.rootValue = rootValue;
    this.context = context;
  }

  async _execute(operation: Operation) {
    const contextValue = await (typeof this.context === "function"
      ? this.context(operation)
      : this.context);

    return execute(
      this.schema,
      operation.query,
      this.rootValue,
      contextValue,
      operation.variables,
      operation.operationName
    );
  }

  public request(operation: Operation): Observable<FetchResult> | null {
    return new Observable(observer => {
      Promise.resolve(this._execute(operation))
        .then(data => {
          if (!observer.closed) {
            observer.next(data);
            observer.complete();
          }
        })
        .catch(error => {
          if (!observer.closed) {
            observer.error(error);
          }
        });
    });
  }
}
