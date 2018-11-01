var openid = require('openid');
var relyingPart = new openid.RelyingParty(
  process.env.STEAM_AUTH_CALLBACK + '/users/callback',
  null,
  true,
  false, []);

const SteamService = require('../services/SteamService');

var UsersController = {};

UsersController.callback = function (req, res) {
  var userId = req.query['openid.identity'].split('/').slice(-1)[0];
  SteamService.player(userId, (err, player) => {
    if (err) {
      return res.view('500', {
        errors: err
      });
    }
    User.findOrCreate({ steamid: userId }, player)
      .then(async (user, wasCreated) => {
        if (!wasCreated) {
          await User.update(user, player);
        }
        req.session.user = user.steamid;
        res.redirect('/users/' + userId);
      })
      .catch((err) => {
        if (err) {
          res.view('500', { errors: err });
        }
      });
  });
};

UsersController.login = function (req, res) {
  if (req.session.user) {
    res.redirect('/users/' + req.session.user);
    return;
  }
  relyingPart.authenticate('http://steamcommunity.com/openid', false, (error, authUrl) => {
    if (error) {
      if (req.session.user) {
        req.session.user = null;
      }
      res.writeHead(200);
      res.end('Authentication failed: ' + error.message);
    } else {
      res.writeHead(302, {
        location: authUrl
      });
      res.end();
    }
  });
};


UsersController.show = async function (req, res) {
  var userId = req.params.id;
  let user;
  try {
    user = await User.findOne({ steamid: userId });
  } catch (err) {
    if (err) {
      return res.send(err, 500);
    }
  }

  if (!user) {
    return res.send(404);
  }

  SteamService.games(userId, (err, result) => {
    if (err) {
      return res.send(err, 500);
    }
    var games = result.response.games;
    games.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
    return res.view({
      user: user,
      games: games
    });
  });
};


UsersController._config = {};

module.exports = UsersController;
