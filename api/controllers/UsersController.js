var openid = require('openid');
var relyingPart = new openid.RelyingParty(
  process.env.STEAM_AUTH_CALLBACK + '/users/callback',
  null,
  true,
  false,
  []);

var UsersController = {};

UsersController.callback = function(req, res) {
  var user_id = req.query['openid.identity'].split('/').slice(-1)[0];
  SteamService.player(user_id, function(err, player) {
    if (err) {
      res.view('500', {errors: err});
    } else {
      User.findOrCreate({ steam_id: user_id }, Object.assign({}, player, { steam_id: user_id }), function(error, user, wasCreated) {
        if (! wasCreated) {
          User.update(user, player).exec((err, updatedUser) => {
            if (err) {
              console.log('An error occurred when updating user', err);
            }
          });
        }
        req.session.user = user.steam_id;
        res.redirect('/users/' + user_id);
      });
    }
  });
};

UsersController.login = function (req, res) {
  if (req.session.user) {
    res.redirect('/users/' + req.session.user);
    return;
  }
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


UsersController._config = {};

module.exports = UsersController;
