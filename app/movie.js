'use strict';

let Wit = null;
let interactive = null;
const _ = require('underscore');
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

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

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
  getMovies({context, entities}) {
    return new Promise(function(resolve, reject) {

      var location = firstEntityValue(entities, 'location');

      console.log(context, entities);


      if (location) {
        var matched = _.filter(movieData, function(movie) {
          return movie.location === location;
        });

        matched = _.map(matched, function(movie) {
          return movie.title;
        }).join(',');

        context.playedMovie = matched;
        delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.playedMovie;
      }

      return resolve(context);
    });
  },
  getRecommendedMovies({context, entities}) {
    return new Promise(function(resolve, reject) {

      var location = firstEntityValue(entities, 'location');
      var date = firstEntityValue(entities, 'datetime');

      console.log(context, entities);
      if(location)
        delete context.missingLocation;

      if(date)
        delete context.missingDate;

      if (location && date) {

        var matched = _.chain(movieData)
        .filter(function(movie) {
          return movie.location === location;
        })
        .sortBy(function(movie){
          return movie.rating;
        })
        .map(function(movie) {
          return movie.title + ' ' + movie.rating;
        })
        .value()
        .reverse()
        .join(',');

        context.recommendedMovie = matched;
      }

      if(!location) {
        context.missingLocation = true;
        delete context.recommendedMovie;
      } else if (!date) {
        context.missingDate = true;
        delete context.recommendedMovie;
      }

      return resolve(context);
    });

  },
  getReleaseDate({context, entities}) {
    return new Promise(function(resolve, reject) {
      var movieName = firstEntityValue(entities, 'search_query');

      console.log(context, entities);

      if(movieName) {
        var matched = _.chain(movieData)
        .filter(function(movie) {
          return movie.name === movieName;
        })


        context.releaseDate = "2010";
        delete context.missingMovie;

      } else {
        context.missingMovie=true;
      }
      
      return resolve(context);
    });
  },
};

const client = new Wit({accessToken, actions});
interactive(client);
