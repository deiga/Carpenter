var rest = require('restler');
var dotenv = require('dotenv');

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
  }
});

dotenv.load();
var client = new Steam();
module.exports = {
  games: function(steam_identifier, callback) {
    // figure out if steam_identifier is ID or vanityurl
    client.resolveVanityURL(steam_identifier).on('complete', function(result, res) {
      console.log(result);
      if (result.response.success == 42) {
        callback('Found no match for ' + steam_identifier);
      } else {
        client.games(result.response.steamid).on('complete', function(result, res) {
          callback(result);
        });
      }
    });
  }
};
