var after = require('after');

/**
 * GamesController
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


  /**
   * Action blueprints:
   *    `/games/common`
	 *
	 * get common games of list of users, return as JSON for now
  */
  common: function (req, res) {
    var user_ids = [];
    var next = after(1, listGames);
    if (typeof req.params.ids === 'undefined') {
      req.query.users.split(',').forEach(function(user_id) {
        user_ids.push(user_id.trim());
      });
    }
    else {
      user_ids = req.params.ids.split(',');
    }
    SteamService.getCommonGames(user_ids, function(common_game_ids) {
     next(null, common_game_ids);
   });

    function listGames(err, game_ids) {
      res.json(game_ids);
    }
  },


  /**
   * Action blueprints:
   *    `/games/owners`
	 *
	 * Get owners of requested game
  */
  owners: function (req, res) {

  },

  group: function (req, res) {
    var group_id = req.params.id;
    var next = after(1, getCommonGames);
    console.log('Group ID: ' + group_id);
    SteamService.getGroupMembers(group_id, function(err, user_ids) {
      next(err, user_ids);
    });

    function getCommonGames(err, user_ids) {
      SteamService.getCommonGames(user_ids, 4, function(games) {
        var game_names = [];
        var next = after(games.length, finish);
        games.forEach(function(game_id) {
          Game.findOne({appid: game_id.toString()}, function(err, game) {
            game_names.push(game.name);
            next(null, game_names);
          });
        });
      });
      function finish(err, game_names) {
        res.json(game_names);
        console.log('All done!');
      }
    }
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GamesController)
   */
   _config: {}

 };
