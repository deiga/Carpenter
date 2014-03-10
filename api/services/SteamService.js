var rest = require('restler');
var Long = require('long');
var parseString = require('xml2js').parseString;
var HashMap = require('hashmap').HashMap,
gamesHash = new HashMap();
var after = require('after');
require('dotenv').load();
var client = require('./SteamRestAPI').configure(process.env.STEAM_API_KEY);
var domain = require('domain');

function noop(err, result) {
  console.error(err);
  console.log(result);
}

function getGames(steam_id, callback) {
  client.games(steam_id).on('complete', callback.bind(null, null));
}

function getPlayerSummary(user_id, callback) {
  client.playerSummary(user_id).on('complete', callback.bind(null, null));
}

// https://developer.valvesoftware.com/wiki/SteamID#Steam_ID_as_a_Steam_Community_ID
function calculateSteamGroupId64(steam_group_id32) {
  return Long.ONE.shiftLeft(56).or(new Long(7).shiftLeft(52)).or(new Long(steam_group_id32)).toString();
}

function populateGamesHash(user_list, callback) {
  callback = callback || noop;

  var next = after(user_list.length, callback);
  user_list.forEach(insertUsersGames.bind(null, next));
}

function insertUsersGames(callback, user) {
  SteamService.games(user, insertGameData.bind(null, user, callback));
}

function insertGameData(user, next, err, data) {
  if (typeof data.response === 'undefined') {
    console.error("Response undefined", data);
  } else if (Object.getOwnPropertyNames(data.response).length > 0) {
    data.response.games.forEach(handleGame.bind(null, user));
  }
  next(err);
}

function handleGame(user, game) {
  delete game.playtime_forever;
  delete game.has_community_visible_stats;
  Game.findOrCreate(game, game).done(handleGameCreation);
  var user_ids = gamesHash.get(game.appid) || [];
  if (user_ids.indexOf(user) == -1) {
    user_ids.push(user);
  }
  gamesHash.set(game.appid, user_ids);
}

function handleGameCreation(error, created_game) {
  if (error) {
    console.error("Error while saving game: ", created_game, error);
  } else if (typeof created_game === 'undefined' && Game.adapter.identity !== 'sails-mongo') {
    console.log("whats wrong with this game?", created_game);
  }
}

var SteamService = {};

SteamService.games = function(steam_id, callback) {
  callback = callback || noop;
  if (/\d{17}/.test(steam_id)) {
    getGames(steam_id, callback);
  } else {
    client.resolveVanityURL(steam_id).on('complete', getGamesForResolvedVanityURL.bind(null, steam_id, callback));
  }
};

SteamService.player = function(user_id, callback) {
  callback = callback || noop;
  getPlayerSummary(user_id, function(err, result, res) {
    if (result.response.players.length > 0) {
      callback(null, result.response.players[0].personaname);
    } else {
      callback('Could not find player: ' + user_id, null);
    }
  });
};

function getGamesForResolvedVanityURL(steam_id, callback, result) {
  if (Object.getOwnPropertyNames(result).length === 0) {
    callback('Error in request. id: "' + steam_id + '"', {});
  } else if (result.response.success == 42) {
    callback('Found no match for id: "' + steam_id + '"', {});
  } else {
    getGames(result.response.steamid, callback);
  }
}

SteamService.getGroupMembers = function(steam_id, callback) {
  callback = callback || noop;
  var url = 'http://steamcommunity.com';
  steam_id = steam_id.replace(/[\[\]#\(\)]/g, '');
  if (/\d{3,10}/.test(steam_id)) {
    steam_id = calculateSteamGroupId64(steam_id);
    url += '/gid/';
  } else {
    url += '/groups/';
  }
  url += steam_id + '/memberslistxml/?xml=1';
  getMemberList(url, 5, callback);
};

function getMemberList(url, retries_left, callback) {
  var d = domain.create();
  function parseMemberList(data) {
    if (steamGroupError) {
      console.log("No group found, quitting");
      return callback(new Error("Given group is not valid, are you sure you typed the name correctly?"), []);
    }
    d.run(parseString.bind(null, data, function(err, result) {
      if (err) {
        console.error("Error while parsing xml, retrying");
        setImmediate(getMemberList.bind(null, url, retries_left - 1, callback));
      } else {
        callback(null, result.memberList.members[0].steamID64);
      }
    }));
  }

  d.on('error', function(err) {
    console.error("Error while parsing xml, retrying");
    getMemberList.bind(null, url, retries_left - 1, callback);
  });

  if (retries_left > 0) {
    rest.get(url).on('complete', parseMemberList);
  } else {
    return callback(new Error("Problem with Steam API, please try again"), []);
  }
}

function steamGroupError(data) {
  return data.indexOf("Invalid group URL") !== -1 || data.indexOf("No group could be retrieved for the given URL") !== -1;
}


SteamService.getCommonGames = function(user_list, limit, callback) {
  callback = callback || noop;
  if (typeof limit === 'function') {
    callback = limit;
    limit = user_list.length;
  }
  limit = typeof limit !== 'undefined' ? limit : user_list.length;
  populateGamesHash(user_list, callbackFromPopulate.bind(null, limit, callback));
};

function callbackFromPopulate(limit, callback, err) {
  var game_ids = [];
  gamesHash.forEach(function(user_ids, game_id) {
    if (limit == user_ids.length) {
      game_ids.push(game_id);
    }
  });
  gamesHash.clear();
  callback(err, game_ids);
}

SteamService.getGame = function(game_id, callback) {
  callback = callback || noop;
  Game.findOne({appid: game_id.toString()}, function(err, game) {
    callback(err, game);
  });
};

module.exports = SteamService;

