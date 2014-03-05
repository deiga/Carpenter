/**
 * GameController
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
   *    `/game/common`
	 * 
	 * get common games of list of users, return as JSON for now
   */
   common: function (req, res) {
    if (typeof req.params.ids === 'undefined') { 
      var user_ids = [];
      req.query.users.split(',').forEach(function(user_id) {
        user_ids.push(user_id.trim());
      });
    }
    else {
      var user_ids = req.params.ids.split(',');
    }
		SteamService.getCommonGames(user_ids, function(common_game_ids) { 
			res.json(common_game_ids); 
		});
  },


  /**
   * Action blueprints:
   *    `/game/owners`
	 *
	 * Get owners of requested game 
   */
   owners: function (req, res) {
    
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GameController)
   */
  _config: {}

  
};
