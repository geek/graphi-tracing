'use strict';

const Graphql = require('graphql');
const Table = require('cli-table');
const Package = require('../package.json');


exports.register = function (server, options) {
  server.dependency('graphi');

  server.events.on('preFieldResolver', preFieldResolver);
  server.events.on('postFieldResolver', postFieldResolver);

  server.ext({
    type: 'onPostHandler',
    method: function (request, h) {
      if (request.path !== server.plugins.graphi.settings.graphqlPath) {
        return h.continue;
      }

      printTable();

      return h.continue;
    }
  })
};

exports.pkg = Package;

let tracingResults = [];

function printTable () {
  const table = new Table({
    head: ['Field name', 'Parent Type', 'Return Type', 'Path', 'Duration (ns)', 'Duration (ms)']
  });

  tracingResults
    .sort((a, b) => {
      return a.duration - b.duration;
    })
    .forEach((tracingResolver) => {
      table.push([
        tracingResolver.fieldName,
        tracingResolver.parentType,
        tracingResolver.returnType,
        tracingResolver.path.join(' - '),
        tracingResolver.duration,
        tracingResolver.duration / 1e6
      ]);
    });

  if (tracingResults.length > 0) {
    console.log(table.toString());
  }

  tracingResults = [];
}

function preFieldResolver ({ source, args, contextValue, info }) {
  info._tracing = {
    path: [...Graphql.responsePathAsArray(info.path)],
    startTime: duration(process.hrtime())
  };
}

function postFieldResolver ({ source, args, contextValue, info, result }) {
  const endTime = duration(process.hrtime());

  tracingResults.push({
    path: info._tracing.path,
    duration: endTime - info._tracing.startTime,
    fieldName: info.fieldName,
    parentType: info.parentType,
    returnType: info.returnType
  });
}

function duration (hrtime) {
  return hrtime[0] * 1e9 + hrtime[1];
}
