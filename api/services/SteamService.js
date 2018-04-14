var rest = require('restler');
var Long = require('long');
var parseString = require('xml2js').parseString;
const HashMap = require('hashmap').HashMap;
const gamesHash = new HashMap();
var after = require('after');
require('dotenv').load();
var client = require('./SteamRestAPI').configure(process.env.STEAM_API_KEY);
var domain = require('domain');

const SteamService = {};

function noop(err, result) {
  console.log('NOOP');
  console.error(err);
  console.log(result);
}

function getGames(steamId, callback) {
  client.games(steamId).on('complete', callback.bind(null, null));
}

function getPlayerSummary(userId, callback) {
  client.playerSummary(userId).on('complete', callback.bind(null, null));
}

// https://developer.valvesoftware.com/wiki/SteamID#Steam_ID_as_a_Steam_Community_ID
function calculateSteamGroupId64(steamGroupId32) {
  return Long.ONE.shiftLeft(56).or(new Long(7).shiftLeft(52)).or(new Long(steamGroupId32)).toString();
}

function populateGamesHash(userList, callback) {
  callback = callback || noop;

  var next = after(userList.length, callback);
  userList.forEach(insertUsersGames.bind(null, next));
}

function insertUsersGames(callback, user) {
  SteamService.games(user, insertGameData.bind(null, user, callback));
}

function insertGameData(user, next, err, data) {
  if (typeof data.response === 'undefined') {
    console.error('Response undefined', data);
  } else if (Object.getOwnPropertyNames(data.response).length > 0) {
    data.response.games.forEach(handleGame.bind(null, user));
  }
  next(err);
}

async function handleGame(user, game) {
  delete game.playtime_forever;
  delete game.has_community_visible_stats;
  try {
    await Game.findOrCreate({ appid: '' + game.appid }, game);
    console.log('2');
  } catch (err) {
    switch (err.name) {
      case 'UsageError':
        console.error('There are errors in input data', game, err);
        break;
      case 'AdapterError':
        console.error('There is something wrong with MongoDB', err);
        break;
      default: console.error('Error while saving game: ', game, err);
    }
  }
  var userIds = gamesHash.get(game.appid) || [];
  if (userIds.indexOf(user) === -1) {
    userIds.push(user);
  }
  gamesHash.set(game.appid, userIds);
}

SteamService.games = function(steamId, callback) {
  callback = callback || noop;
  if (/\d{17}/.test(steamId)) {
    getGames(steamId, callback);
  } else {
    client.resolveVanityURL(steamId).on('complete', getGamesForResolvedVanityURL.bind(null, steamId, callback));
  }
};

SteamService.player = function(userId, callback) {
  callback = callback || noop;
  getPlayerSummary(userId, (err, result) => {
    if (err) {
      console.err('An error occured', err);
    }
    if (result.response.players.length > 0) {
      return callback(null, result.response.players[0]);
    } else {
      return callback('Could not find player: ' + userId, null);
    }
  });
};

function getGamesForResolvedVanityURL(steamId, callback, result) {
  if (Object.getOwnPropertyNames(result).length === 0) {
    return callback('Error in request. id: "' + steamId + '"', {});
  } else if (result.response.success === 42) {
    return callback('Found no match for id: "' + steamId + '"', {});
  } else {
    getGames(result.response.steamid, callback);
  }
}

SteamService.getGroupMembers = function(steamId, callback) {
  callback = callback || noop;
  var url = 'http://steamcommunity.com';
  steamId = steamId.replace(/[\[\]#\(\)\.]/g, '');
  if (/\d{3,10}/.test(steamId)) {
    steamId = calculateSteamGroupId64(steamId);
    url += '/gid/';
  } else {
    url += '/groups/';
  }
  url += steamId + '/memberslistxml/?xml=1';
  getMemberList(url, 5, callback);
};

function getMemberList(url, retriesLeft, callback) {
  var d = domain.create();
  function parseMemberList(data) {
    if (steamGroupError(data)) {
      console.log('No group found, quitting');
      return callback('Given group is not valid, are you sure you typed the name correctly?', []);
    }
    d.run(parseString.bind(null, data, (err, result) => {
      if (err) {
        console.error('Error while parsing xml, retrying');
        setImmediate(getMemberList.bind(null, url, retriesLeft - 1, callback));
      } else {
        return callback(null, result.memberList.members[0].steamID64);
      }
    }));
  }

  d.on('error', (err) => {
    console.error('Error while parsing xml, retrying', err);
    getMemberList.bind(null, url, retriesLeft - 1, callback);
  });

  if (retriesLeft > 0) {
    rest.get(url).on('complete', parseMemberList);
  } else {
    return callback('Problem with Steam API, please try again', []);
  }
}

function steamGroupError(data) {
  return data.indexOf('Invalid group URL') !== -1 || data.indexOf('No group could be retrieved for the given URL') !== -1;
}


SteamService.getCommonGames = function(userList, limit, callback) {
  callback = callback || noop;
  if (typeof limit === 'function') {
    callback = limit;
    limit = userList.length;
  }
  limit = typeof limit !== 'undefined' ? limit : userList.length;
  populateGamesHash(userList, callbackFromPopulate.bind(null, limit, callback));
};

function callbackFromPopulate(limit, callback, err) {
  var gameIds = [];
  gamesHash.forEach((userIds, gameId) => {
    if (limit <= userIds.length) {
      gameIds.push(gameId);
    }
  });
  gamesHash.clear();
  callback(err, gameIds);
}

SteamService.getGame = function(gameId, callback) {
  callback = callback || noop;
  Game.findOne({appid: gameId.toString()}, (err, game) => {
    callback(err, game);
  });
};

module.exports = SteamService;
