var openid = require('openid');
var relyingPart = new openid.RelyingParty(
  process.env.STEAM_AUTH_CALLBACK + '/users/callback',
  '/',
  true,
  false,
  []);

/**
 * UsersController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var UsersController = {};

UsersController.callback = function(req, res) {
  var user_id = req.query['openid.identity'].split('/').slice(-1)[0];
  SteamService.player(user_id, function(err, user_name) {
    if (err) {
      res.view('500', {errors: err});
    } else {
      User.findOrCreate({steam_id: user_id}, {steam_id: user_id, steam_nick: user_name}, function(error, user) {
        req.session.user = user.steam_id;
        res.redirect('/users/' + user_id);
      });
    }
  });
};

UsersController.login = function (req, res) {
  if (req.session.user !== null && typeof req.session.user !== 'undefined') {
    res.redirect('/users/' + req.session.user);
  } else {
    relyingPart.authenticate('http://steamcommunity.com/openid', false, function(error, authUrl) {
      if (error) {
        if (req.session.user) req.session.user = null;
        res.writeHead(200);
        res.end('Authentication failed: ' + error.message);
      }
      else {
        res.writeHead(302, {location: authUrl });
        res.end();
      }
    });
  }
};


UsersController.show = function (req, res) {
  var user_id = req.params.id;
  User.findOne({ steam_id: user_id }, function(err, user) {
   if (err) {
    return res.send(err,500);
  }
  if (!user) {
    return res.send(404);
  }
  SteamService.games(user_id, function (err, result) {
    var games = result.response.games;
    games.sort(function(a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
    return res.view({user: user, games: games});
  });

});

};


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

UsersController._config = {};

module.exports = UsersController;
