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

    createdAt: {
      type: 'number',
      autoCreatedAt: true,
    },
    updatedAt: {
      type: 'number',
      autoUpdatedAt: true,
    },

    id: {
      type: 'string',
      columnName: '_id'
    },

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
      type: 'json',
      columnType: 'array'
    },
    games: {
      type: 'json',
      columnType: 'array'
    }
  }

};
