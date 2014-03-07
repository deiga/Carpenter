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
    id: {
      type: 'INTEGER',
      required: true,
      unique: true
    },
    name: {
      type: 'STRING',
      required: true,
      unique: true
    },
    steam_nick: {
      type: 'STRING',
      required: false,
      unique: true
    },
    steam_id: {
      type: 'STRING',
      required: false,
      unique: true
    },
    //I have no idea how these should work!
    friends: {
      collection: 'User'
    },
    games: {
     collection: 'Game'
   },

   toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
 }

};
