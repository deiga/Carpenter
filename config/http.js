module.exports.http = {
  middleware: {

    order: [
      'cookieParser',
      'session',
      'flashtInit',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],

    flashtInit: (function () {
      const flash = require('connect-flash');
      var reqResNextFn = flash();
      return reqResNextFn;
    })(),

  }
}
