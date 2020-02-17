const express = require('express');
const mongodb = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const { StatusHelper, Constants } = require('eae-utils');
const { Constants_Opal } = require('opal-utils');

const CacheController = require('./cacheController');
const StatusController = require('./statusController');
const package_json = require('../package.json');

/**
 * @fn OpalCache
 * @desc OpalCache class
 * @param config
 * @constructor
 */
function OpalCache(config) {
    this.config = config;
    this.app = express();
    global.opal_cache_config = config;

    this.start = OpalCache.prototype.start.bind(this);
    this.connectToDatabase = OpalCache.prototype.connectToDatabase.bind(this);
    this._setupStatusController = OpalCache.prototype._setupStatusController.bind(this);
}

/**
 * @fn start
 * @desc Start the OpalCache
 */
OpalCache.prototype.start = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        _this.connectToDatabase().then(function() {
            _this.app.use(bodyParser.json());
            // Setup route using controllers
            _this._setupStatusController();

            // Setup cache controller
            _this._setupCacheControllers();

            // Start status periodic update
            _this.status_helper.startPeriodicUpdate(5 * 1000); // Update status every 5 seconds

            resolve(_this.app);
        }, function(error) {
            reject(error);
        });
    });
};

/**
 * @fn connectToDatabase
 * @desc Connect to the mongodb database
 */
OpalCache.prototype.connectToDatabase = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        mongodb.connect(_this.config.mongoUrl, function(error, db) {
            if (error) {
                reject('Could not connect to database');
            } else {
                _this.db = db;
                resolve(true);
            }
        });
    });
};

/**
 * @fn _setupStatusController
 * @desc Initialize status service routes and controller
 * @private
 */
OpalCache.prototype._setupStatusController = function () {
    let _this = this;

    let statusOpts = {
        version: package_json.version
    };
    _this.status_helper = new StatusHelper(Constants_Opal.OPAL_SERVICE_TYPE_CACHE, global.opal_cache_config.port, null, statusOpts);
    _this.status_helper.setCollection(_this.db.collection(Constants.EAE_COLLECTION_STATUS));

    _this.statusController = new StatusController(_this.status_helper);
    _this.app.get('/status', _this.statusController.getStatus); // GET status
    _this.app.get('/specs', _this.statusController.getFullStatus); // GET Full status
};

/**
 * @fn _setupCacheControllers
 * @desc Initialize the Cache service routes and controller
 * @private
 */
OpalCache.prototype._setupCacheControllers = function() {
    let _this = this;
    // We create the controllers and initialize the routes
    _this.cacheController = new CacheController(_this.db);
    _this.app.post('/query', _this.cacheController.postQuery);
};

module.exports = OpalCache;
