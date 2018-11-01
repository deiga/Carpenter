/**
 * Controllers
 *
 * By default, Sails inspects your controllers, models, and configuration and binds
 * certain routes automatically. These dynamically generated routes are called blueprints.
 *
 * These settings are for the global configuration of controllers & blueprint routes.
 * You may also override these settings on a per-controller basis by defining a '_config'
 * key in any of your controller files, and assigning it an object, e.g.:
 * {
 *     // ...
 *     _config: { blueprints: { rest: false } }
 *     // ...
 * }
 *
 * For more information on configuring controllers and blueprints, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.controllers = {


  /**
   * `jsonp`
   *
   * If enabled, allows built-in CRUD methods to support JSONP for cross-domain requests.
   *
   * Example usage (REST blueprint + UserController):
   * `GET /user?name=ciaran&limit=10&callback=receiveJSONPResponse`
   *
   * Defaults to false.
   */
  jsonp: false,



  /**
   * `expectIntegerId`
   *
   * If enabled, built-in CRUD methods will only accept valid integers as an :id parameter.
   *
   * i.e. trigger built-in API if requests look like:
   *    `GET /user/8`
   * but not like:
   *    `GET /user/a8j4g9jsd9ga4ghjasdha`
   *
   * Defaults to false.
   */
  expectIntegerId: false

};
