var after = require('after');

/**
 * GamesController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
 var GamesController = {};

/**
 * Action blueprints:
 *    `/games/common`
 *
 * get common games of list of users, return as JSON for now
 */
 GamesController.common = function (req, res) {
  var user_ids = [];
  if (typeof req.params.ids === 'undefined') {
    user_ids = req.query.users.split(',').map(function(id) { return id.trim(); });
  } else {
    user_ids = req.params.ids.split(',');
  }
  user_ids = user_ids.filter(function(str) { return str !== '' && str !== null && typeof str !== 'undefined'; });
  getCommonGames(user_ids.length, res, null, user_ids);
};

GamesController.group = function (req, res) {
  var group_id;
  if (typeof req.params.group_name === 'undefined') {
    group_id = req.query.group_name.trim();
  } else {
    group_id = req.params.group_name;
  }
  console.info('Group ID: ' + group_id);
  SteamService.getGroupMembers(group_id, getCommonGames.bind(null, 4, res));
};

function getCommonGames(limit, res, err, user_ids) {
  if (err) {
    finish(res, err);
  } else {
    SteamService.getCommonGames(user_ids, limit, listGames.bind(null, res));
  }
}

function listGames(res, err, game_ids) {
  if (err) {
    finish(res, err);
  } else {
    var games = [];
    var next = after(game_ids.length, finish.bind(null, res));
    game_ids.forEach(function(game_id) {
      SteamService.getGame(game_id, function(err, game) {
        games.push(game);
        next(err, games);
      });
    });
  }
}

function finish(res, err, games) {
  if (err) {
    res.view('500', {errors: err});
  } else {
    var names = res.req.query.users || res.req.query.group_name;
    games.sort(function(a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
    res.view('games/common', { games: games, names: names } );
  }
  console.log('All done!');
}


/**
 * Overrides for the settings in `config/controllers.js`
 * (specific to GamesController)
 */
 GamesController._config = {};
 module.exports = GamesController;
