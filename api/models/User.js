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
   i d: {
      type: 'STRING',
      required: true,
      unique: true
    },
    name: {
      type: 'STRING',
      required: true
    },

	}

    
  }

};
