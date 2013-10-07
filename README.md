mongo-q
=======

[kriskowal's Q](http://documentup.com/kriskowal/q/) support for [mongodb](https://github.com/mongodb/node-mongodb-native/).

for [mongoose](http://mongoosejs.com), see [mongoose-q](http://github.com/iolo/monogoose-q).

usage
-----

* to apply Q with default suffix 'Q':

```javascript
var mongodb = require('mongo-q')(require('mongodb'));
// verbose way: mongooseQ is unused
var mongodb = require('mongodb'),
    mongoQ = require('mongo-q')(mongodb)
// shortest way: mongodb will be loaded by mongo-q
var mongodb = require('mongo-q')();
```

* use Q-applied mongodb client library:

```javascript
mongodb.MongoClient.connectQ(....)
  .then(function (db) {
    return db.collectionQ('test');
  })
  .then(function (coll) {
    return coll.findQ();
  })
  .then(function (cursor) {
    return cursor.toArrayQ();
  })
  .then(function (result) {
    ...
  })
  .fail(function (err) { ... })
  .done();
```

* you can mix them:

```javascript
mongodb.MongoClient.connectQ(....)
  .then(function (db) {
    return db.collectionQ('test');
  })
  .then(function (coll) {
    return coll.find().toArrayQ(); // <----- HERE!
  })
  .then(function (result) {
    ...
  })
  .fail(function (err) { ... })
  .done();
```

* to apply Q with custom suffix/prefix:

```javascript
var mongodb = require('mongodb-q')(require('mongodb'), {prefix:'promiseOf_', suffix:'_withQ'});
mongodb.MongoClient.promiseOf_connect_withQ(...)
  .then(function (db) {
    return db.promiseOf_collection_withQ(...)
  })
  .then(function (coll) {
    return coll.promiseOf_find_withQ();
  })
  .then(function (cursor) {
    return cursor.promiseOf_toArray_withQ();
  })
  .then(function (result) {
    ...
  })
  .fail(function (err) { ... })
  .done();
```

* to apply Q with custom name mapper:

```javascript
function customMapper(name) {
  return 'q' + name.charAt(0).toUpperCase() + name.substring(1);
}
var mongodb = require('mongodb-q')(require('mongodb'), {mapper:customMapper});
mongodb.MongoClient.qConnect(...)
  .then(function (db) { ... 
    return db.qCollection('test');
  })
  .then(function (coll) {
    return coll.qFind();
  })
  .then(function (cursor) {
    return cursor.toArray();
  })
  .then(function (result) {
    ...
  })
  .fail(function (err) { ... })
  .done();
```

* to apply Q with ```spread```:

```javascript
var mongodb = require('mongo-q')(require('mongodb'), {spread:true});
...
```

> NOTE: at this time, mongodb client library is well formed enough. 'spread' option is needless.

That's all folks!

