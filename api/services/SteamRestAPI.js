var rest = require('restler');

var Steam = rest.service(function(apikey) {
  this.apikey = apikey;
}, {
  baseURL: 'https://api.steampowered.com'
});

Steam.prototype.resolveVanityURL = function(vanity_url) {
  var opts = {
    query: {
      key: this.apikey,
      vanityurl: vanity_url
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('/ISteamUser/ResolveVanityURL/v0001/', opts );
};

Steam.prototype.playerSummary = function(user_id) {
  var opts = {
    query: {
      key: this.apikey,
      steamids: user_id
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('/ISteamUser/GetPlayerSummaries/v0002/', opts);
};

Steam.prototype.games = function(steam_id) {
  var opts = {
    query: {
      key: this.apikey,
      steamid: steam_id,
      include_appinfo: 1
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('/IPlayerService/GetOwnedGames/v0001/', opts );
};

Steam.prototype.gameInfo = function(game_id) {
  var opts = {
    query: {
      key: this.apikey,
      appid: game_id,
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('ISteamUserStats/GetSchemaForGame/v0002/', opts);
};

module.exports.configure = function(apikey) {
  var steam = new Steam();
  steam.apikey = apikey;
  return steam;
};

