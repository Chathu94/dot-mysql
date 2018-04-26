'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = require('debug')('MySQL:');

var MySQL = function () {
  function MySQL() {
    _classCallCheck(this, MySQL);

    this.log = function () {}; // eslint-disable-line
    // this.log = debug;
    this._connection = undefined;
    this.clear();
  }

  _createClass(MySQL, [{
    key: 'clear',
    value: function clear() {
      this._update = '';
      this._delete = '';
      this._select = [];
      this._from = '';
      this._join = [];
      this._tJoin = '';
      this._insert = '';
      this._replace = '';
      this._where = [];
      this._set = [];
      this._values = [];
      return this;
    }
  }, {
    key: 'select',
    value: function select() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.log('Adding select', args);
      if (typeof args[0] === 'string') {
        if (typeof args[1] === 'string') {
          this._select.push({
            key: args[0],
            as: args[1]
          });
        } else {
          this._select.push(args[0]);
        }
      }
      this.log('Added select', this._select);
      return this;
    }
  }, {
    key: 'from',
    value: function from() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      this.log('Adding from', args);
      if (typeof args[0] === 'string') {
        this._from = args[0];
      }
      this.log('Added from', this._from);
      return this;
    }
  }, {
    key: 'where',
    value: function where() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this.log('Adding where', args);
      if (typeof args[0] === 'string') {
        if (typeof args[1] === 'string' || typeof args[1] === 'number') {
          if (typeof args[2] === 'string') {
            if (typeof args[3] === 'string') {
              this._where.push({
                key: args[0],
                cond: args[2],
                value: args[1],
                rel: args[3]
              });
            } else {
              this._where.push({
                key: args[0],
                cond: args[2],
                value: args[1],
                rel: 'AND'
              });
            }
          } else {
            this._where.push({
              key: args[0],
              cond: '=',
              rel: 'AND',
              value: args[1]
            });
          }
        }
      } else if (_typeof(args[0]) === 'object') {
        this._where.push(args[0]);
      }
      this.log('Added where', this._where);
      return this;
    }
  }, {
    key: 'whereGroupStart',
    value: function whereGroupStart() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      this.log('Adding whereGroupStart', args);
      if (typeof args[0] === 'string') {
        this._where.push({
          rel: args[0],
          value: '('
        });
      } else {
        this._where.push({
          rel: 'AND',
          value: '('
        });
      }
      this.log('Added whereGroupStart', this._where);
      return this;
    }
  }, {
    key: 'whereGroupEnd',
    value: function whereGroupEnd() {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      this.log('Adding whereGroupEnd', args);
      if (typeof args[0] === 'string') {
        this._where.push({
          rel: args[0],
          value: ')'
        });
      } else {
        this._where.push({
          rel: 'AND',
          value: ')'
        });
      }
      this.log('Added whereGroupEnd', this._where);
      return this;
    }
  }, {
    key: 'set',
    value: function set() {
      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      this.log('Adding set', args);
      if (typeof args[0] === 'string' && (typeof args[1] === 'string' || typeof args[1] === 'number')) {
        this._set.push({
          key: args[0],
          value: args[1]
        });
      } else if (_typeof(args[0]) === 'object') {
        this._set = [].concat(_toConsumableArray(this._set), _toConsumableArray(Object.keys(args[0]).map(function (key) {
          return { key: key, value: args[0][key] };
        })));
      } else {
        throw new Error('Invalid parameters supplied to set');
      }
      this.log('Added set', this._set);
      return this;
    }
  }, {
    key: 'value',
    value: function value() {
      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      this.log('Adding values', args);
      if (typeof args[0] === 'string' && (typeof args[1] === 'string' || typeof args[1] === 'number')) {
        this._values.push({
          key: args[0],
          value: args[1]
        });
      } else if (_typeof(args[0]) === 'object') {
        this._values = [].concat(_toConsumableArray(this._values), _toConsumableArray(Object.keys(args[0]).map(function (key) {
          return { key: key, value: args[0][key] };
        })));
      } else {
        throw new Error('Invalid parameters supplied to values');
      }
      this.log('Added value', this._values);
      return this;
    }
  }, {
    key: 'insert',
    value: function insert() {
      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      this.log('Adding insert', args);
      if (typeof args[0] === 'string') {
        this._insert = args[0];
        this._update = '';
        this._replace = '';
        this._delete = '';
      }
      this.log('Added insert', this._insert);
      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      this.log('Adding update', args);
      if (typeof args[0] === 'string') {
        this._update = args[0];
        this._insert = '';
        this._replace = '';
        this._delete = '';
      }
      this.log('Added update', this._update);
      return this;
    }
  }, {
    key: 'replace',
    value: function replace() {
      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      this.log('Adding replace', args);
      if (typeof args[0] === 'string') {
        this._replace = args[0];
        this._update = '';
        this._insert = '';
        this._delete = '';
      }
      this.log('Added replace', this._replace);
      return this;
    }
  }, {
    key: 'delete',
    value: function _delete() {
      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      this.log('Adding delete', args);
      if (typeof args[0] === 'string') {
        this._delete = args[0];
        this._update = '';
        this._insert = '';
        this._replace = '';
      }
      this.log('Added delete', this._delete);
      return this;
    }
  }, {
    key: 'innerJoin',
    value: function innerJoin() {
      for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
      }

      this.log('Adding innerJoin', args);
      if (typeof args[0] === 'string') {
        this._tJoin = {
          table: args[0],
          type: 'INNER'
        };
        this.log('Added innerJoin', this._tJoin);
      } else if (_typeof(args[0]) === 'object' && args[0].table && args[0].onFrom && args[0].onTo) {
        args[0].type = 'INNER';
        this._join.push(args[0]);
        this.log('Added innerJoin', this._join);
      }
      return this;
    }
  }, {
    key: 'leftJoin',
    value: function leftJoin() {
      for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
      }

      this.log('Adding leftJoin', args);
      if (typeof args[0] === 'string') {
        this._tJoin = {
          table: args[0],
          type: 'LEFT'
        };
        this.log('Added leftJoin', this._tJoin);
      } else if (_typeof(args[0]) === 'object' && args[0].table && args[0].onFrom && args[0].onTo) {
        args[0].type = 'LEFT';
        this._join.push(args[0]);
        this.log('Added leftJoin', this._join);
      }
      return this;
    }
  }, {
    key: 'join',
    value: function join() {
      for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }

      this.log('Adding join', args);
      if (typeof args[0] === 'string') {
        this._tJoin = {
          table: args[0],
          type: args[1] || 'LEFT'
        };
        this.log('Added join', this._tJoin);
      } else if (_typeof(args[0]) === 'object' && args[0].table && args[0].onFrom && args[0].onTo) {
        if (!args[0].type) args[0].type = 'LEFT';
        this._join.push(args[0]);
        this.log('Added join', this._join);
      }
      return this;
    }
  }, {
    key: 'on',
    value: function on(onFrom, onTo) {
      this.log('Adding on', onFrom, onTo);
      if (typeof onFrom === 'string' && typeof onTo === 'string' && this._tJoin !== undefined) {
        var join = {
          onFrom: onFrom,
          onTo: onTo
        };
        Object.assign(join, this._tJoin);
        this._join.push(join);
        this._tJoin = undefined;
      }
      this.log('Added on', this._join);
      return this;
    }
  }, {
    key: 'getWhere',
    value: function getWhere() {
      return this._where.map(function (w, k) {
        if (!w.key) return '' + (k === 0 ? w.rel + ' ' : '') + w;
        return '' + (k === 0 ? '' : w.rel + ' ') + w.key + ' ' + w.cond + ' ?';
      }).join(' ');
    }
  }, {
    key: 'getSelect',
    value: function getSelect() {
      return this._select.map(function (w) {
        if (typeof w === 'string') return '`' + w + '`';
        return w.key + ' AS \'' + w.as + '\'';
      }).join(', ');
    }
  }, {
    key: 'getJoin',
    value: function getJoin() {
      return this._join.map(function (j) {
        return j.type + ' JOIN ' + j.table + ' ON ' + j.onFrom + ' = ' + j.onTo;
      }).join(' ');
    }
  }, {
    key: 'query',
    value: function query() {
      if (this._insert !== '') {
        return 'INSERT INTO ' + this._insert + ' (' + this._values.map(function (_ref) {
          var key = _ref.key;
          return key;
        }).join(', ') + ') VALUES (' + this._values.map(function () {
          return '?';
        }).join(', ') + ')';
      } else if (this._replace !== '') {
        return 'REPLACE INTO ' + this._replace + ' (' + this._values.map(function (_ref2) {
          var key = _ref2.key;
          return key;
        }).join(', ') + ') VALUES (' + this._values.map(function () {
          return '?';
        }).join(', ') + ')';
      } else if (this._update !== '') {
        return 'UPDATE ' + this._update + ' SET ' + this._set.map(function (_ref3) {
          var key = _ref3.key;
          return key + ' = ?';
        }).join(', ') + ' WHERE ' + (this._where.length > 0 ? '' + this.getWhere() : '1');
      } else if (this._delete !== '') {
        return 'DELETE FROM ' + this._delete + ' WHERE ' + (this._where.length > 0 ? '' + this.getWhere() : '1');
      } else if (this._from !== '') {
        return 'SELECT ' + (this._select.length > 0 ? this.getSelect() : '*') + ' FROM ' + this._from + (this._join.length > 0 ? ' ' + this.getJoin() : '') + ' WHERE ' + (this._where.length > 0 ? '' + this.getWhere() : '1');
      }
      return '';
    }
  }, {
    key: 'exec',
    value: function exec() {
      var _this = this;

      var values = [];
      if (this._insert !== '') {
        values = this._values.map(function (_ref4) {
          var value = _ref4.value;
          return value;
        });
      } else if (this._replace !== '') {
        values = this._values.map(function (_ref5) {
          var value = _ref5.value;
          return value;
        });
      } else if (this._update !== '') {
        values = [].concat(_toConsumableArray(this._set.map(function (_ref6) {
          var value = _ref6.value;
          return value;
        })), _toConsumableArray(this._where.map(function (_ref7) {
          var value = _ref7.value;
          return value;
        })));
      } else if (this._delete !== '') {
        values = this._where.map(function (_ref8) {
          var value = _ref8.value;
          return value;
        });
      } else if (this._from !== '') {
        values = this._where.map(function (_ref9) {
          var value = _ref9.value;
          return value;
        });
      }
      var sql = this.query();
      this.log('Executing query', sql, 'values', values);
      if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'boolean' && (arguments.length <= 0 ? undefined : arguments[0]) === true) {
        if (this._connection) {
          return MySQL.execute({ sql: sql, values: values, connection: this._connection });
        } else {
          return MySQL.beginTransaction().then(function (con) {
            _this._connection = con;
            return MySQL.execute({ sql: sql, values: values, connection: con });
          });
        }
      } else {
        return MySQL.execute({ sql: sql, values: values, connection: arguments.length <= 0 ? undefined : arguments[0] });
      }
    }
  }, {
    key: 'commit',
    value: function commit() {
      if (this._connection) {
        return MySQL.commit(this._connection);
      }
    }
  }, {
    key: 'rollback',
    value: function rollback() {
      if (this._connection) {
        return MySQL.rollback(this._connection);
      }
    }
  }], [{
    key: 'config',
    value: function config(_config) {
      MySQL.configs = _extends({}, MySQL.configs, _config);
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var config = MySQL.configs;
      config.connectionLimit = 20;
      MySQL.sqlPool = _mysql2.default.createPool(config);
      MySQL.sqlPoolCon = {};
      MySQL.sqlPool.on('acquire', function (connection) {
        debug('Connection %d acquired', connection.threadId);
        var timer = setTimeout(function () {
          debug('Connection %d timeout', connection.threadId);
          try {
            connection.release();
          } catch (e) {} // eslint-disable-line
        }, 50000);
        MySQL.sqlPoolCon[connection.threadId] = timer;
      });
      MySQL.sqlPool.on('release', function (connection) {
        debug('Connection %d released', connection.threadId);
        if (MySQL.sqlPoolCon[connection.threadId]) {
          try {
            clearTimeout(MySQL.sqlPoolCon[connection.threadId]);
          } catch (e) {} // eslint-disable-line
        }
      });
      debug('SQL pool initialized.');
    }
  }, {
    key: 'getConnection',
    value: function getConnection() {
      if (!MySQL.sqlPool) {
        MySQL.initialize();
      }
      return new Promise(function (resolve, reject) {
        var pool = MySQL.sqlPool;
        pool.getConnection(function (err, con) {
          if (err) {
            reject(err);
          } else {
            resolve(con);
          }
        });
      });
    }
  }, {
    key: 'beginTransaction',
    value: function beginTransaction() {
      return MySQL.getConnection().then(function (con) {
        return new Promise(function (resolve, reject) {
          con.beginTransaction(function (err) {
            if (err) reject(err);
            MySQL.sqlTransaction = true;
            resolve(con);
          });
        });
      });
    }
  }, {
    key: 'rollback',
    value: function rollback(con) {
      return new Promise(function (resolve, reject) {
        con.beginTransaction(function (err) {
          if (err) reject(err);
          MySQL.sqlTransaction = false;
          resolve(con);
        });
      });
    }
  }, {
    key: 'commit',
    value: function commit(con) {
      return new Promise(function (resolve, reject) {
        con.commit(function (error) {
          if (error) {
            MySQL.sqlTransaction = false;
            con.rollback(function () {
              return reject(error);
            });
          } else {
            try {
              con.release();
            } catch (e) {} // eslint-disable-line
            resolve(true);
          }
        });
      });
    }
  }, {
    key: 'execute',
    value: function execute(_ref10) {
      var sql = _ref10.sql,
        _ref10$timeout = _ref10.timeout,
        timeout = _ref10$timeout === undefined ? 40000 : _ref10$timeout,
        _ref10$values = _ref10.values,
        values = _ref10$values === undefined ? [] : _ref10$values,
        connection = _ref10.connection,
        rollback = _ref10.rollback;

      var promise = function promise(con, rb) {
        return new Promise(function (resolve, reject) {
          con.query({ sql: sql, timeout: timeout, values: values }, function (error, results, fields) {
            if (error) {
              if (rb) {
                MySQL.sqlTransaction = false;
                con.rollback(function () {
                  return reject(error);
                });
              } else {
                try {
                  con.release();
                } catch (e) {} // eslint-disable-line
                reject(error);
              }
            } else {
              resolve({ results: results, fields: fields });
            }
          });
        });
      };
      if (!connection) {
        return MySQL.getConnection().then(function (con) {
          return promise(con, rollback || MySQL.sqlTransaction || false);
        });
      } else {
        return promise(connection, rollback || MySQL.sqlTransaction || false);
      }
    }
  }, {
    key: 'escape',
    value: function escape(str) {
      return _mysql2.default.escape(str);
    }
  }]);

  return MySQL;
}();

MySQL.configs = {
  host: 'localhost',
  port: 3306,
  database: 'test',
  user: 'root',
  password: ''
};
exports.default = MySQL;
