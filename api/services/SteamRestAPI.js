var rest = require('restler');

var Steam = rest.service(function(apikey) {
  this.apikey = apikey;
}, {
  baseURL: 'https://api.steampowered.com'
});

Steam.prototype.resolveVanityURL = function(vanityUrl) {
  var opts = {
    query: {
      key: this.apikey,
      vanityurl: vanityUrl
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('/ISteamUser/ResolveVanityURL/v0001/', opts );
};

Steam.prototype.playerSummary = function(userId) {
  var opts = {
    query: {
      key: this.apikey,
      steamids: userId
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('/ISteamUser/GetPlayerSummaries/v0002/', opts);
};

Steam.prototype.games = function(steamId) {
  var opts = {
    query: {
      key: this.apikey,
      steamid: steamId,
      include_appinfo: 1 // eslint-disable-line camelcase
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return this.get('/IPlayerService/GetOwnedGames/v0001/', opts );
};

Steam.prototype.gameInfo = function(gameId) {
  var opts = {
    query: {
      key: this.apikey,
      appid: gameId,
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

