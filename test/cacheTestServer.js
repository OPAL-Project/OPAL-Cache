const { Constants } =  require('eae-utils');

const config = require('../config/opal.cache.test.config');
const OpalCache = require('../src/opalCache');

function CacheTestServer() {
    this.opalCache = new OpalCache(config);
}

CacheTestServer.prototype.setup = function() {
    let _this = this;
    return new Promise(function(resolve) {
        _this.opalCache.start().then(function() {
            _this.db = _this.opalCache.db;
            _this.db.collection(Constants.EAE_COLLECTION_JOBS).deleteMany({}).then(function() {
                resolve(true);
            });
        });
    });
};

CacheTestServer.prototype.shutdown = function() {
    let _this = this;
    return new Promise(function (resolve) {
        _this.db.close();
        resolve(true);
    });
};

CacheTestServer.prototype.insertJob = function(job) {
  let _this = this;
  return new Promise(function(resolve) {
      _this.db.collection(Constants.EAE_COLLECTION_JOBS).insertOne(job).then(function(document) {
          resolve(document);
      });
  })
};

module.exports = CacheTestServer;
