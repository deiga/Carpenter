/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

 module.exports = {

   schema: true,

   attributes: {
     personaname: {
      type: 'STRING',
      required: true,
      unique: true
    },
    steam_id: {
      type: 'STRING',
      required: true,
      unique: true
    },
    avatar: {
      type: 'STRING'
    },
    avatarmedium: {
      type: 'STRING'
    },
    profileurl: {
      type: 'STRING'
    },
    friends: {
      type: 'ARRAY'
    },
    games: {
     type: 'ARRAY'
   },

   toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
 }

};
