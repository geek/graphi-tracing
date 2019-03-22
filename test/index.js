'use strict';

const Code = require('code');
const Graphi = require('graphi');
const Hapi = require('hapi');
const Lab = require('lab');
const GraphiTracing = require('../');


// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;


it('will track graphi timing information', async () => {
  const schema = `
    type Person {
      firstname: String!
      lastname: String!
      email: String!
    }
    type Query {
      person(firstname: String!): Person!
    }
  `;

  const getPerson = function (args, request) {
    expect(args.firstname).to.equal('billy');
    expect(request.path).to.equal('/graphql');
    return { firstname: '', lastname: 'jean', email: 'what' };
  };

  const resolvers = {
    person: getPerson
  };

  const server = Hapi.server();
  await server.register({ plugin: Graphi, options: { schema, resolvers } });
  await server.register(GraphiTracing);
  await server.initialize();

  let output = '';
  const originalStdout = process.stdout.write;
  process.stdout.write = (data) => {
    output += data.toString();
  };

  const payload = { query: 'query { person(firstname: "billy") { lastname, email } }' };
  const res = await server.inject({ method: 'POST', url: '/graphql', payload });
  process.stdout.write = originalStdout;

  expect(output).to.include('Duration');
  expect(output).to.include('person - email');
  expect(output).to.include('person - lastname');
  expect(output).to.include('Query');
  expect(res.statusCode).to.equal(200);
  expect(res.result.data.person.lastname).to.equal('jean');
});

it('will not show a blank table when there are no requests', async () => {
  const schema = `
    type Person {
      firstname: String!
      lastname: String!
      email: String!
    }
    type Query {
      person(firstname: String!): Person!
    }
  `;

  const getPerson = function (args, request) {
    expect(args.firstname).to.equal('billy');
    expect(request.path).to.equal('/graphql');
    return { firstname: '', lastname: 'jean', email: 'what' };
  };

  const resolvers = {
    person: getPerson
  };

  let output = '';
  const originalStdout = process.stdout.write;
  process.stdout.write = (data) => {
    output += data.toString();
  };

  const server = Hapi.server();
  await server.register({ plugin: Graphi, options: { schema, resolvers } });
  await server.register(GraphiTracing);
  await server.initialize();

  const payload = { query: 'query { person(firstname: "billy") { lastname, email } }' };
  const res = await server.inject({ method: 'POST', url: '/graphql', payload });
  process.stdout.write = originalStdout;

  expect(output).to.include('Duration');
  expect(output).to.include('person - email');
  expect(output).to.include('person - lastname');
  expect(output).to.include('Query');
  expect(res.statusCode).to.equal(200);
  expect(res.result.data.person.lastname).to.equal('jean');

  // Clear "the terminal"
  output = '';

  // When /graphiql is requested, it POST to the server a query requesting the "IntrospectionQuery"
  const payload2 = { query: '{ __schema { queryType { name } } }' };
  const res2 = await server.inject({ method: 'POST', url: '/graphql', payload: payload2 });
  process.stdout.write = originalStdout;

  expect(output).to.not.include('Duration');
  expect(output).to.not.include('person - email');
  expect(output).to.not.include('Query');
  expect(res2.statusCode).to.equal(200);
});
