'use strict';

var
  Q = require('q'),
  MONGO_CLIENT_STATICS = [
    'connect'
  ],
  MONGO_CLIENT_METHODS = [
    'connect',
    'open',
    'close'
  ],
  DB_STATICS = [
    'connect'
  ],
  DB_METHODS = [
    'open',
    'close',
    'admin',
    'collectionsInfo',
    'collectionNames',
    'collection',
    'collections',
    'eval',
    'dereference',
    'logout',
    'authenticate',
    'addUser',
    'removeUser',
    'createCollection',
    'command',
    'dropCollection',
    'renameCollection',
    'lastError',
    'previousErrors',
    'resetErrorHistory',
    'createIndex',
    'ensureIndex',
    'cursorInfo',
    'dropIndex',
    'reIndex',
    'indexInformation',
    'dropDatabase',
    'stats'
  ],
  COLLECTION_STATICS = [
  ],
  COLLECTION_METHODS = [
    'insert',
    'remove',
    'rename',
    'save',
    'update',
    'distinct',
    'count',
    'drop',
    'findAndModify',
    'findAndRemove',
    'find',
    'findOne',
    'createIndex',
    'ensureIndex',
    'indexInformation',
    'dropIndex',
    'dropAllIndexes',
    'reIndex',
    'mapReduce',
    'group',
    'options',
    'isCapped',
    'indexExists',
    'geoNear',
    'geoHaystackSearch',
    'indexes',
    'aggregate',
    'stats'
  ],
  CURSOR_STATICS = [
  ],
  CURSOR_METHODS = [
    'toArray',
    'count',
    'sort',
    'limit',
    'setReadPreference',
    'skip',
    'batchSize',
    'nextObject',
    'explain',
    'close',
  ],
// TODO: ADMIN
// TODO: GRID
// TODO: GRID_STORE
  apslice = Array.prototype.slice;

/**
 * @module mongoq
 */
;

/**
 *
 * @param {object} obj
 * @param {Array.<string>} funcNames - original function names to apply Q
 * @param {function(string):string} funcNameMapper maps a function name into Q-applied one
 * @param {*} [spread=false] use spread for multi-results
 */
function qualify(obj, funcNames, funcNameMapper, spread) {
  funcNames.forEach(function (funcName) {
    if (typeof(obj[funcName]) !== 'function') {
      console.warn('***skip*** function not found:', funcName);
      return;
    }
    obj[funcNameMapper(funcName)] = function () {
      var d = Q.defer();
      var args = apslice.call(arguments);
      args.push(function (err, result) {
        if (err) {
          return d.reject(err);
        }
        // with 'spread' option: returns 'all' result with 'spread' only for multiple result
        if (spread && arguments.length > 2) {
          return d.resolve(apslice.call(arguments, 1));
        }
        // without 'spread' option: returns the 'first' result only and ignores following result
        return d.resolve(result);
      });
      // fix https://github.com/iolo/mongoose-q/issues/1
      // mongoose patches some instance methods after instantiation. :(
      this[funcName].apply(this, args);
      return d.promise;
    };
  });
}

/**
 * add Q wrappers for static/instance functions of mongodb nodejs native driver.
 *
 * @param {mongodb} [mongodb]
 * @param {object.<string,*>} [options={}] - prefix and/or suffix for wrappers
 * @param {string} [options.prefix='']
 * @param {string} [options.suffix='']
 * @param {function(string):string} [options.mapper]
 * @param {boolean} [options.spread=false]
 * @returns {mongodb} the same mongodb module, for convenience
 */
function mongoQ(mongodb, options) {
  var mongodb = mongodb || require('mongodb');
  options = options || {};
  var prefix = options.prefix || '';
  var suffix = options.suffix || 'Q';
  var mapper = options.mapper || function (funcName) {
    return prefix + funcName + suffix;
  };
  var spread = options.spread;
  // avoid duplicated application for custom mapper function...
  var applied = require('crypto').createHash('md5').update(mapper.toString()).digest('hex');
  if (mongodb['__q_applied_' + applied]) {
    return mongodb;
  }

  qualify(mongodb.MongoClient, MONGO_CLIENT_STATICS, mapper, spread);
  qualify(mongodb.MongoClient.prototype, MONGO_CLIENT_METHODS, mapper, spread);
  qualify(mongodb.Db, DB_STATICS, mapper, spread);
  qualify(mongodb.Db.prototype, DB_METHODS, mapper, spread);
  qualify(mongodb.Collection, COLLECTION_STATICS, mapper, spread);
  qualify(mongodb.Collection.prototype, COLLECTION_METHODS, mapper, spread);
  qualify(mongodb.Cursor, CURSOR_STATICS, mapper, spread);
  qualify(mongodb.Cursor.prototype, CURSOR_METHODS, mapper, spread);

  mongodb['__q_applied_' + applied] = true;
  return mongodb;
}

module.exports = mongoQ;
module.exports.qualify = qualify;
