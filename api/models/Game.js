/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

	attributes: {
    appid: {
      type: 'STRING',
      required: true,
      unique: true
    },
    name: {
      type: 'STRING',
      required: true
    },
    img_icon_url: 'STRING',
    img_logo_url: 'STRING'
	}

};
