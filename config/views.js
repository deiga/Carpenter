/**
 * Views
 *
 * Server-sent views are a classic and effective way to get your app up and running.
 * Views are normally served from controllers.  Below, you can configure your
 * templating language/framework of choice and configure Sails' layout support.
 *
 * For more information on views and layouts, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.views = {

  /***************************************************************************
  *                                                                          *
  * Extension to use for your views. When calling `res.view()` in an action, *
  * you can leave this extension off. For example, calling                   *
  * `res.view('homepage')` will (using default settings) look for a          *
  * `views/homepage.ejs` file.                                               *
  *                                                                          *
  ***************************************************************************/

  extension: 'pug',
  getRenderFn: function() {
    // Import `consolidate`.
    const cons = require('consolidate');
    // Return the rendering function for Pug.
    return cons.pug;
  },

  /***************************************************************************
  *                                                                          *
  * The path (relative to the views directory, and without extension) to     *
  * the default layout file to use, or `false` to disable layouts entirely.  *
  *                                                                          *
  * Note that layouts only work with the built-in EJS view engine!           *
  *                                                                          *
  ***************************************************************************/


  layout: false

};
