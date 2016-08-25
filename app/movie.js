'use strict';

let Wit = null;
let interactive = null;
let movieData = require('../data/movies.json');

try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/basic.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('user said...', request.text);
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  getRandomMovie({context, entities}) {
    return new Promise(function(resolve, reject) {
      var movie = [Math.floor(Math.random()*movieData.length)];
      context.movie = movie;
      return resolve(context);
    });
  }
};

const client = new Wit({accessToken, actions});
interactive(client);
