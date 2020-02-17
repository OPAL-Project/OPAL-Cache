let os = require('os');

let config = require('../config/opal.cache.config.js');
let OpalCache = require('./opalCache.js');

let opalCache = new OpalCache(config);

opalCache.start().then(function(app) {
    //Remove unwanted express headers
    app.set('x-powered-by', false);
    app.listen(config.port, function (error) {
        if (error) {
            console.error(error); // eslint-disable-line no-console
            return;
        }
        console.log(`Listening at http://${os.hostname()}:${config.port}/`); // eslint-disable-line no-console
    });
}, function(error) {
    console.error(error); // eslint-disable-line no-console
});
