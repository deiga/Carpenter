var rest = require('restler');
var dotenv = require('dotenv');
var Long = require('long');
var parseString = require('xml2js').parseString;
var HashMap = require('hashmap').HashMap;
var after = require('after');
var Re = require('re'),
re = new Re();

Steam = rest.service(function() {
  this.key = process.env.STEAM_API_KEY;
}, {
  baseURL: 'https://api.steampowered.com'
}, {
  resolveVanityURL: function(vanity_url) {
    var opts = {
      query: {
        key: this.key,
        vanityurl: vanity_url
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this.get('/ISteamUser/ResolveVanityURL/v0001/', opts );
  },
  playerSummary: function(user_id) {
    var opts = {
      query: {
        key: this.key,
        steamids: user_id
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this.get('/ISteamUser/GetPlayerSummaries/v0002/', opts);
  },
  games: function(steam_id) {
    var opts = {
      query: {
        key: this.key,
        steamid: steam_id,
        include_appinfo: 1
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this.get('/IPlayerService/GetOwnedGames/v0001/', opts );
  },
  gameInfo: function(game_id) {
    var opts = {
     query: {
      key: this.key,
      appid: game_id,
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('ISteamUserStats/GetSchemaForGame/v0002/', opts);
},
  // http://api.steampowered.com/ISteamUser/GetUserGroupList/v0001?key=XXX&steamid=YYY
});

dotenv.load();
var client = new Steam();

function noop(data) {
  console.log("NOOP", data);
}

function getGames(steam_id, callback) {
  client.games(steam_id).on('complete', callback);
}

function getPlayerSummary(user_id, callback) {
  client.playerSummary(user_id).on('complete', callback);
}

// https://developer.valvesoftware.com/wiki/SteamID#Steam_ID_as_a_Steam_Community_ID
function calculateSteamGroupId64(steam_group_id32) {
  return Long.ONE.shiftLeft(56).or(new Long(7).shiftLeft(52)).or(new Long(steam_group_id32)).toString();
}

var gamesHash = new HashMap();

function populateGamesHash(userList, callback) {
  callback = callback || noop;

  var next = after(userList.length, callback);
  userList.forEach(insertUsersGames.bind(null, next));
}

function insertUsersGames(cb, user) {
  SteamService.games(user, insertGameData.bind(null, user, cb));
}

function insertGameData(user, next, data) {
  if (typeof data.response === 'undefined') {
    console.log("Response undefined", data);
  }
  if (typeof data.response !== 'undefined' &&  Object.getOwnPropertyNames(data.response).length > 0) {
    data.response.games.forEach(handleGame.bind(null, user));
  }
  next();
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
    console.error("Error while saving game: ", game, error);
  } else if (typeof created === 'undefined' && Game.adapter.identity !== 'sails-mongo') {
    console.log("whats wrong with this game?", game);
  }
}

var SteamService = {};

SteamService.games = function(steam_id, callback) {
  callback = callback || noop;
  if (/\d{17}/.test(steam_id)) {
    getGames(steam_id, callback);
  } else {
    client.resolveVanityURL(steam_id).on('complete', getGamesForResolvedVanityURL.bind(null, callback));
  }
};

SteamService.player = function(user_id, callback) {
  callback = callback || noop;
  getPlayerSummary(user_id, function(result, res) {
      console.log(result.response.players[0].personaname);
  });
};

function getGamesForResolvedVanityURL(callback, result) {
  if (result.response.success == 42) {
    callback('Found no match for ' + steam_id);
  } else {
    getGames(result.response.steamid, callback);
  }
}

SteamService.getGroupMembers = function(steam_id, callback) {
  callback = callback || noop;
  var url = 'http://steamcommunity.com';
  if (/\d{3,10}/.test(steam_id)) {
    steam_id = calculateSteamGroupId64(steam_id);
    url += '/gid/';
  } else {
    url += '/groups/';
  }
  url += steam_id + '/memberslistxml/?xml=1';
  re.try(getMemberList.bind(null, url), callback);
};

function getMemberList(url, retryCount, cb) {
  rest.get(url).on('complete', parseMemberList.bind(null, cb));
}

function parseMemberList(done, data) {
  parseString(data, function(err, result) {
    if (err) {
      console.error("Error while parsing xml, retrying");
      done(err);
    } else {
      done(err, result.memberList.members[0].steamID64);
    }
  });
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

function callbackFromPopulate(limit, cb) {
  var game_ids = [];
  gamesHash.forEach(function(user_ids, game_id) {
    if (limit == user_ids.length) {
      game_ids.push(game_id);
    }
  });
  cb(game_ids);
}

SteamService.getGame = function(game_id, callback) {
  callback = callback || noop;
  Game.findOne({appid: game_id.toString()}, function(err, game) {
    callback(game);
  });
};

module.exports = SteamService;

