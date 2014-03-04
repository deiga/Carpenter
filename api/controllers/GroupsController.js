/**
 * GroupsController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {


  /**
   * `GroupsController.games`
   */

  games: function (req, res) {
    var group_id = req.params.id;
    console.log('Group ID: ' + group_id);
    SteamService.getGroupMembers(group_id, function(data) {
      res.json(data);
    });
  }
};
