'use strict';

var
  Q = require('q'),
  fixtures = require('./fixtures'),
  customMapper = function (name) {
    return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
  },
  mongodb = require('../libs/mongo_q')(require('mongodb'), {spread: true, mapper: customMapper}),
  client,
  db;

module.exports = {
  setUp: function (callback) {
    var fixturesLoader = require('pow-mongodb-fixtures').connect('test');
    fixturesLoader.clearAndLoad(fixtures, function (err) {
      if (err) throw err;
      fixturesLoader.client.close();
      client = mongodb.MongoClient.connect('mongodb://localhost:27017/test', {}, function (err, client) {
        if (err) {
          throw err;
        }
        db = client.db('test');
        callback();
      });
    });
  },
  tearDown: function (callback) {
    db.close();
    //client.close();
    callback();
  },
  test_count: function (test) {
    db.qCollection('users')
      .then(function (coll) {
        return coll.qCount();
      })
      .then(function (result) {
        console.log('***test_count ok', arguments);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_findOne: function (test) {
    db.qCollection('users')
      .then(function (coll) {
        return coll.qFindOne();
      })
      .then(function (result) {
        console.log('***test_findOne ok', arguments);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_find_toArray: function (test) {
    db.qCollection('users')
      .then(function (coll) {
        // FIXME: workaround for issue #1
        // since the latest mongodb driver(>=1.9.20)
        // ```collection.find()``` returns ```Scope``` instance not ```Cursor``` instance.
        // and the Scope can't be mixed in because it is not prototype based. :'(
        //return coll.find().qToArray();
        return Q.nfcall(coll.find().toArray);
      })
      .then(function (result) {
        console.log('***test_find_toArray ok', arguments);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
  test_find_nextObject: function (test) {
    db.qCollection('users')
      .then(function (coll) {
        return coll.qFind();
      })
      .then(function (result) {
        test.ok(result);
        // FIXME: workaround for issue #1
        //test.ok(result instanceof mongodb.Cursor);
        //return result.qNextObject();
        return Q.nfcall(result.nextObject);
      })
      .then(function (result) {
        console.log('***test_find_nextObject ok', arguments);
        test.ok(result);
      })
      .fail(test.ifError)
      .done(test.done);
  },
};
