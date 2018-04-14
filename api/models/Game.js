/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true, },
    updatedAt: { type: 'number', autoUpdatedAt: true, },

    id: { type: 'string', columnName: '_id' },

    appid: {
      type: 'STRING',
      required: true,
      unique: true
    },
    name: {
      type: 'STRING',
      required: true
    },
    img_icon_url: 'STRING', // eslint-disable-line camelcase
    img_logo_url: 'STRING' // eslint-disable-line camelcase
  }

};
