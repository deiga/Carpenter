var after = require('after');
const SteamService = require('../services/SteamService');

var GamesController = {};

GamesController.common = function (req, res) {
  var userIds = [];
  if (typeof req.params.ids === 'undefined') {
    userIds = req.query.users.split(',').map((id) => { return id.trim(); });
  } else {
    userIds = req.params.ids.split(',');
  }
  userIds = userIds.filter((str) => { return !!str; });
  getCommonGames(userIds.length, res, null, userIds);
};

GamesController.group = function (req, res) {
  var groupId;
  if (typeof req.params.group_name === 'undefined') {
    groupId = req.query.group_name.trim();
  } else {
    groupId = req.params.group_name;
  }
  console.info('Group ID: ' + groupId);
  SteamService.getGroupMembers(groupId, getCommonGames.bind(null, 4, res));
};

function getCommonGames(limit, res, err, userIds) {
  if (err) {
    return error(res, err);
  }
  SteamService.getCommonGames(userIds, limit, listGames.bind(null, res));
}

function listGames(res, err, gameEntries) {
  let gameIds = [];
  if (Array.isArray(gameEntries)) {
    gameIds = gameEntries;
  } else {
    gameIds = Object.keys(gameIds);
  }
  if (err) {
    return error(res, err);
  } else if(gameIds.length === 0) {
    return finish(res, null, []);
  }
  var games = [];
  var next = after(gameIds.length, finish.bind(null, res));
  gameIds.forEach((gameId) => {
    SteamService.getGame(gameId, (err, game) => {
      games.push(game);
      next(err, games);
    });
  });
}

function finish(res, err, games) {
  if (err) {
    return error(res, err);
  }
  var names = res.req.query.users || res.req.query.group_name;
  games.sort((a, b) => {
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

function error(res, err) {
  console.error('ERROR:', err);
  res.req.flash('error', err.toString());
  res.redirect('/');
}


GamesController._config = {};
module.exports = GamesController;
