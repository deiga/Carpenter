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
    steamid: {
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
      type: 'json',
      columnType: 'array'
    },
    games: {
      type: 'json',
      columnType: 'array'
    }
  }

};
