import { ApolloLink, Operation, FetchResult, Observable } from "apollo-link";
import { execute } from "graphql/execution/execute";
import { GraphQLSchema } from "graphql/type/schema";

import { schema as gqlSchema } from "../gql/schema";
import { createContext } from "../gql/context";

export function makeSchemaLink(session?: string) {
  return (new SchemaLink({
    schema: gqlSchema,
    context: createContext({ session })
  }) as unknown) as import("@apollo/client").ApolloLink; /* incompatible typings */
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

// HACK: the official SchemaLink doesn't resolve async context getters, so
// provide our own that does. See
// https://github.com/apollographql/apollo-link/issues/1208 for further context.
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
