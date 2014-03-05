var rest = require('restler');
var dotenv = require('dotenv');
var Long = require('long');
var parseString = require('xml2js').parseString;
var HashMap = require('hashmap').HashMap;
var after = require('after');

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

function getGameInfo(game_id, callback) {
	client.gameInfo(game_id).on('complete', callback);
}

// https://developer.valvesoftware.com/wiki/SteamID#Steam_ID_as_a_Steam_Community_ID
function calculateSteamGroupId64(steam_group_id32) {
  return Long.ONE.shiftLeft(56).or(new Long(7).shiftLeft(52)).or(new Long(steam_group_id32)).toString();
}

var gamesHash = new HashMap();

function populateGamesHash(userList, callback) {
  callback = callback || noop;

  var next = after(userList.length, callback);
  userList.forEach(function(user) {
    SteamService.games(user, function(data){
      if (typeof data.response === 'undefined') {
        console.log("Response undefined", data);
      }
      if (typeof data.response !== 'undefined' &&  Object.getOwnPropertyNames(data.response).length > 0) {
        data.response.games.forEach(function(game) {
          delete game.playtime_forever;
          delete game.has_community_visible_stats;
          Game.findOrCreate(game, game).done(function(err, created) {
            if (err) {
              console.error("Error while saving game: ", game, err);
            } else {
              if (typeof created === 'undefined' && Game.adapter.identity !== 'sails-mongo') {
                console.log("whats wrong with this game?", game);
              }
            }
          });
          var user_ids = gamesHash.get(game.appid) || [];
          if (user_ids.indexOf(user) == -1) {
            user_ids.push(user);
          }
          gamesHash.set(game.appid, user_ids);
        });
      }
      next();
    });
  });
}

module.exports = {
  games: function(steam_id, callback) {
    callback = callback || noop;
    if (/\d{17}/.test(steam_id)) {
      getGames(steam_id, callback);
    } else {
      client.resolveVanityURL(steam_id).on('complete', function(result, res) {
        if (result.response.success == 42) {
          callback('Found no match for ' + steam_id);
        } else {
          getGames(result.response.steamid, callback);
        }
      });
    }
  },
  getGroupMembers: function(steam_id, callback) {
    callback = callback || noop;
    var url = 'http://steamcommunity.com';
    if (/\d{3,10}/.test(steam_id)) {
      steam_id = calculateSteamGroupId64(steam_id);
      url += '/gid/';
    } else {
      url += '/groups/';
    }
    url += steam_id + '/memberslistxml/?xml=1';
    rest.get(url).on('complete', function(data) {
      parseString(data, function(err, result) {
        if (err) console.error("Error while parsing xml", err);
        callback(result.memberList.members[0].steamID64);
      });
    });
  },
  getCommonGames: function(userList, limit, callback) {
    callback = callback || noop;
    if (typeof limit === 'function') {
      callback = limit;
      limit = userList.length;
    }
    limit = typeof limit !== 'undefined' ? limit : userList.length;
    populateGamesHash(userList, function() {
      var game_ids = [];
      gamesHash.forEach(function(user_ids, game_id) {
        if (limit == user_ids.length) {
          game_ids.push(game_id);
        }
      });
      callback(game_ids);
    });
  },
	getGameName: function(game_id, callback) {
		callback = callback || noop;
		getGameInfo(game_id, function(game_info) {
			callback(game_info.game.gameName);
		});
	}
};
