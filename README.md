# graphi-tracing
hapi plugin for graphi debug tracing

Display on the console timing information around the GraphQL resolver

## Usage

```js
const server = Hapi.server();
await server.register({ plugin: Graphi, options: { schema, resolvers } });
await server.register(GraphiTracing);
```

A formatted table is displayed after each GraphQL request that will look similar to the following example:

```
┌────────────┬─────────────┬─────────────┬───────────────────┬───────────────┬───────────────┐
│ Field name │ Parent Type │ Return Type │ Path              │ Duration (ns) │ Duration (ms) │
├────────────┼─────────────┼─────────────┼───────────────────┼───────────────┼───────────────┤
│ email      │ Person      │ String!     │ person - email    │ 58632         │ 0.058632      │
├────────────┼─────────────┼─────────────┼───────────────────┼───────────────┼───────────────┤
│ lastname   │ Person      │ String!     │ person - lastname │ 89550         │ 0.08955       │
├────────────┼─────────────┼─────────────┼───────────────────┼───────────────┼───────────────┤
│ person     │ Query       │ Person!     │ person            │ 5131823       │ 5.131823      │
└────────────┴─────────────┴─────────────┴───────────────────┴───────────────┴───────────────┘
```
