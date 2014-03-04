var rest = require('restler');
var dotenv = require('dotenv');
var Long = require('Long');
var parseString = require('xml2js').parseString;

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
  // http://api.steampowered.com/ISteamUser/GetUserGroupList/v0001?key=XXX&steamid=YYY
});

dotenv.load();
var client = new Steam();

function noop(data) {
  console.log(data);
}

function getGames(steam_id, callback) {
  callback = callback || noop;
  client.games(steam_id).on('complete', callback);
}

// https://developer.valvesoftware.com/wiki/SteamID#Steam_ID_as_a_Steam_Community_ID
function calculateSteamGroupId64(steam_group_id32) {
  return Long.ONE.shiftLeft(56).or(new Long(7).shiftLeft(52)).or(new Long(steam_group_id32)).toString();
}

module.exports = {
  games: function(steam_id, callback) {
    callback = callback || noop;
    if (/\d{17}/.test(steam_id)) {
      getGames(steam_id, callback);
    } else {
      client.resolveVanityURL(steam_id).on('complete', function(result, res) {
        console.log(result);
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
    console.log(url);
    rest.get(url).on('complete', function(data) {
      parseString(data, function(err, result) {
        console.log(err, result);
        callback(result.memberList.members[0].steamID64);
      });
    });
  }
};
