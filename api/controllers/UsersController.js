var openid = require('openid');
var relyingPart = new openid.RelyingParty(
                    'http://localhost:1337/users/callback',
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

module.exports = {

 callback: function(req, res) {
  var user_id = req.query['openid.identity'].split('/').slice(-1)[0];
  SteamService.player(user_id, function(user_name) {
    User.findOrCreate({steam_id: user_id}, {steam_id: user_id, steam_nick: user_name}, function(error, user) {
      console.log(user);  
      res.redirect('/users/' + user_id);
    });
  });
 },    
  
 login: function (req, res) {
  relyingPart.authenticate('http://steamcommunity.com/openid', false, function(error, authUrl) {
    if (error) {
      res.writeHead(200);
      res.end('Authentication failed: ' + error.message);
    }
    else {
      res.writeHead(302, {location: authUrl });
      res.end();
    }
  });
 },
    
  
	show: function (req, res) {
		var user_id = req.params.id;
		console.log(req.params);
		User.findOne({ steam_id: user_id }, function(err, user) {
			if (err) {
				return res.send(err,500);
			}
			if (!user) {
				return res.send(404);
			}
			//return res.send(user);
			return res.view({user: user});
		});

	},

	create: function (req, res) {
		
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
