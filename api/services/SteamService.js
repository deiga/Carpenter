var rest = require('restler');

Steam = rest.service(function() {
  this.key = process.env.STEAM_API_KEY;
}, {
  baseURL: 'api.steampowered.com'
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

var client = new Steam();

exports.games = function(steam_identifier) {
  // figure out if steam_identifier is ID or vanityurl
  client.resolveVanityURL(steam_identifier).on('complete', function(data) {
    console.log(data);
  });

};
