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

/**
 @typedef MySQLResult
 @type {Object}
 @property {Array.<string>} results Array of results of query
 @property {Array.<string>} fields Array of columns in result
 */

/**
 @typedef MySQLConfig
 @type {Object}
 @property {string} host Hostname of MySQL Server (default: 'localhost')
 @property {number} port Port of MySQL Server (default: 3306)
 @property {string} user Username of MySQL Server (default: 'root')
 @property {string} password Password of MySQL Server (default: '')
 @property {string} database Name of the database
 */

var MySQL = function () {

  /**
   * @constructor
   */
  function MySQL() {
    _classCallCheck(this, MySQL);

    this.log = function () {}; // eslint-disable-line
    // this.log = debug;
    this._connection = undefined;
    this.clear();
  }

  /**
   * Clear current values in Query Builder
   * @example
   * db.clear();
   * @returns {MySQL}
   */


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
      this._limit = -1;
      this._offset = -1;
      this._order = '';
      return this;
    }

    /**
     * Add select parameter
     * @example
     * db.select('username', 'uname'); // username AS uname
     * @param {string} key Column name
     * @param {string|number} as Used as select as [?]
     * @returns {MySQL}
     */

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
          this._select.push({
            key: args[0]
          });
        }
      } else if (_typeof(args[0]) === 'object') {
        this._select.push([].concat(_toConsumableArray(this._select), _toConsumableArray(args[0])));
      }
      this.log('Added select', this._select);
      return this;
    }

    /**
     * Add table name to select from
     * @example
     * // SELECT * FROM test
     * db
     *  .select('*')
     *  .from('test');
     * @param {string} table_name Table name
     * @returns {MySQL}
     */

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

    /**
     * Add where parameter
     * @example
     * // SELECT * FROM test WHERE name = ?
     * db
     *  .from('test')
     *  .where('name', 'test');
     * @example
     * // SELECT * FROM test WHERE price > ?
     * db
     *  .from('test')
     *  .where('price', 30, '>');
     * @example
     * // SELECT * FROM test WHERE price > ? AND name = ?
     * db
     *  .from('test')
     *  .where('price', 30, '>')
     *  .where('name', 'test');
     * @example
     * // SELECT * FROM test WHERE price > ? OR name = ?
     * db
     *  .from('test')
     *  .where('price', 30, '>')
     *  .where('name', 'test', '=', 'OR');
     * @param {string} column Column name
     * @param {string|number} value Value to check
     * @param {string} condition Condition to where (=, <, >, !=, <=, >=)
     * @default =
     * @param {string} refrence Referenced to previous where
     * @default AND
     * @returns {MySQL}
     */

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
        this._where.push([].concat(_toConsumableArray(this._where), _toConsumableArray(args[0])));
      }
      this.log('Added where', this._where);
      return this;
    }
  }, {
    key: 'limit',
    value: function limit() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      this.log('Adding where', args);
      if (typeof args[0] === 'number') {
        this._limit = args[0];
        if (typeof args[1] === 'number') {
          this._offset = args[1];
        }
      }
      return this;
    }
  }, {
    key: 'offset',
    value: function offset() {
      if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'number') {
        this._offset = arguments.length <= 0 ? undefined : arguments[0];
      }
      return this;
    }
  }, {
    key: 'orderBy',
    value: function orderBy() {
      if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string') {
        this._order = '`' + (arguments.length <= 0 ? undefined : arguments[0]) + '` ASC';
        if (typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'number') {
          this._order = '`' + (arguments.length <= 0 ? undefined : arguments[0]) + '` ' + ((arguments.length <= 1 ? undefined : arguments[1]) === -1 ? 'DESC' : 'ASC');
        }
      }
      return this;
    }

    /**
     * Grouping where with brackets
     * @example
     * // SELECT * FROM test WHERE price = ? AND (name = ? OR name = ?)
     * db
     *  .from('test')
     *  .where('price', 30)
     *  .whereGroupStart()
     *  .where('name', 't1')
     *  .where('name', 't2')
     *  .whereGroupEnd();
     * @example
     * // SELECT * FROM test WHERE price = ? OR (name = ? OR name = ?)
     * db
     *  .from('test')
     *  .where('price', 30)
     *  .whereGroupStart('OR')
     *  .where('name', 't1')
     *  .where('name', 't2')
     *  .whereGroupEnd();
     * @param {string} refrence Referenced to previous where
     * @returns {MySQL}
     */

  }, {
    key: 'whereGroupStart',
    value: function whereGroupStart() {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      this.log('Adding whereGroupStart', args);
      if (typeof args[0] === 'string') {
        this._where.push({
          rel: args[0],
          bracket: true,
          start: true
        });
      } else {
        this._where.push({
          rel: 'AND',
          bracket: true,
          start: true
        });
      }
      this.log('Added whereGroupStart', this._where);
      return this;
    }
  }, {
    key: 'whereGroupEnd',
    value: function whereGroupEnd() {
      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      this.log('Adding whereGroupEnd', args);
      if (typeof args[0] === 'string') {
        this._where.push({
          rel: '',
          bracket: true,
          start: false
        });
      } else {
        this._where.push({
          rel: '',
          bracket: true,
          start: false
        });
      }
      this.log('Added whereGroupEnd', this._where);
      return this;
    }

    /**
     * Add set into update
     * @param {string} column Column name
     * @param {string|number} value Value to set
     * @returns {MySQL}
     */

  }, {
    key: 'set',
    value: function set() {
      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
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

    /**
     * Add value to insert / replace
     * @param {string} column Column name
     * @param {string|number} value Value
     * @returns {MySQL}
     */

  }, {
    key: 'value',
    value: function value() {
      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
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

    /**
     * Insert query
     * @example
     * // INSERT INTO test (name, age) VALUES (?, ?)
     * db
     *  .insert('test')
     *  .value('name', 'John')
     *  .value('age', 21);
     * @param {string} table Table name
     * @returns {MySQL}
     */

  }, {
    key: 'insert',
    value: function insert() {
      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
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

    /**
     * Update query
     * @example
     * // UPDATE test SET name = ?, age = ? WHERE id = ?
     * db
     *  .update('test')
     *  .set('name', 'John')
     *  .set('age', 21)
     *  .where('id', 1);
     * @param {string} table Table name
     * @returns {MySQL}
     */

  }, {
    key: 'update',
    value: function update() {
      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
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

    /**
     * Replace query
     * @example
     * // REPLACE INTO test (name, age) VALUES (?, ?)
     * db
     *  .replace('test')
     *  .value('name', 'John')
     *  .value('age', 21);
     * @param {string} table Table name
     * @returns {MySQL}
     */

  }, {
    key: 'replace',
    value: function replace() {
      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
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

    /**
     * Delete query
     * @example
     * // DELETE FROM test WHERE id = ?
     * db
     *  .delete('test')
     *  .where('id', 1);
     * @param {string} table Table name
     * @returns {MySQL}
     */

  }, {
    key: 'delete',
    value: function _delete() {
      for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
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

    /**
     * Add inner join to select
     * @example
     * // SELECT * FROM test INNER JOIN profile ON test.id = profile.tid WHERE 1
     * db
     *  .from('test')
     *  .innerJoin('profile')
     *  .on('test.id', 'profile.tId');
     * @param {string} table Table name
     * @returns {MySQL}
     */

  }, {
    key: 'innerJoin',
    value: function innerJoin() {
      for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
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

    /**
     * Add left join to select
     * @example
     * // SELECT * FROM test LEFT JOIN profile ON test.id = profile.tid WHERE 1
     * db
     *  .from('test')
     *  .leftJoin('profile')
     *  .on('test.id', 'profile.tId');
     * @param {string} table Table name
     * @returns {MySQL}
     */

  }, {
    key: 'leftJoin',
    value: function leftJoin() {
      for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
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
      for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
        args[_key15] = arguments[_key15];
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

    /**
     * Set columns of join
     * @example
     * // SELECT * FROM test INNER JOIN profile ON test.id = profile.tid WHERE 1
     * db
     *  .from('test')
     *  .innerJoin('profile')
     *  .on('test.id', 'profile.tId');
     * @param {string} table Table name
     * @returns {MySQL}
     */

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
      var _this = this;

      return this._where.map(function (w, k) {
        if (w.bracket) return w.rel + ' ' + ('' + (w.start ? '(' : ')'));
        return '' + (k === 0 || _this._where[k - 1] && _this._where[k - 1].start ? '' : w.rel + ' ') + w.key + ' ' + w.cond + ' ?';
      }).join(' ').replace(/\(\s/g, '(').replace(/\s\s\)/g, ')');
    }
  }, {
    key: 'getSelect',
    value: function getSelect() {
      return this._select.map(function (w) {
        if (typeof w === 'string') return '`' + w + '`';
        return w.as ? w.key + ' AS \'' + w.as + '\'' : w.key;
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
    key: 'getLimit',
    value: function getLimit() {
      return this._limit > -1 ? ' LIMIT ' + this._limit + (this._offset > -1 ? ' OFFSET ' + this._offset : '') : '';
    }
  }, {
    key: 'getOrder',
    value: function getOrder() {
      return this._order !== '' ? ' ORDER BY ' + this._order : '';
    }

    /**
     * Return generated query based on current data
     * @example
     * // returns => 'SELECT * FROM test INNER JOIN profile ON test.id = profile.tid WHERE 1'
     * db
     *  .from('test')
     *  .innerJoin('profile')
     *  .on('test.id', 'profile.tId')
     *  .query();
     * @returns {string}
     */

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
        }).join(', ') + ' WHERE ' + (this._where.length > 0 ? '' + this.getWhere() : '1') + this.getOrder() + this.getLimit();
      } else if (this._delete !== '') {
        return 'DELETE FROM ' + this._delete + ' WHERE ' + (this._where.length > 0 ? '' + this.getWhere() : '1') + this.getOrder() + this.getLimit();
      } else if (this._from !== '') {
        return 'SELECT ' + (this._select.length > 0 ? this.getSelect() : '*') + ' FROM ' + this._from + (this._join.length > 0 ? ' ' + this.getJoin() : '') + ' WHERE ' + (this._where.length > 0 ? '' + this.getWhere() : '1') + this.getOrder() + this.getLimit();
      }
      return '';
    }

    /**
     * Get value array based on current data
     * @example
     * // ['John', 21, 1]
     * db
     *  .update('test')
     *  .set('name', 'John')
     *  .set('age', 21)
     *  .where('id', 1)
     *  .values();
     * @returns {Array.<(string|number)>}
     */

  }, {
    key: 'values',
    value: function values() {
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
        })), _toConsumableArray(this._where.filter(function (w) {
          return !w.bracket;
        }).map(function (_ref7) {
          var value = _ref7.value;
          return value;
        })));
      } else if (this._delete !== '') {
        values = this._where.filter(function (w) {
          return !w.bracket;
        }).map(function (_ref8) {
          var value = _ref8.value;
          return value;
        });
      } else if (this._from !== '') {
        values = this._where.filter(function (w) {
          return !w.bracket;
        }).map(function (_ref9) {
          var value = _ref9.value;
          return value;
        });
      }
      return values;
    }

    /**
     * Execute query based on current data
     * @async
     * @param {boolean} start_transaction If true, MySQL will start new transaction.
     * @returns {MySQLResult}
     */

  }, {
    key: 'exec',
    value: function exec() {
      var _this2 = this;

      var values = this.values();
      var sql = this.query();
      this.log('Executing query', sql, 'values', values);
      if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'boolean' && (arguments.length <= 0 ? undefined : arguments[0]) === true) {
        if (this._connection) {
          return MySQL.execute({ sql: sql, values: values, connection: this._connection });
        } else {
          return MySQL.beginTransaction().then(function (con) {
            _this2._connection = con;
            return MySQL.execute({ sql: sql, values: values, connection: con });
          });
        }
      } else {
        return MySQL.execute({ sql: sql, values: values, connection: arguments.length <= 0 ? undefined : arguments[0] });
      }
    }

    /**
     * Commit current queries. You need to use .exec(true)
     * @async
     * @returns {boolean}
     */

  }, {
    key: 'commit',
    value: function commit() {
      if (this._connection) {
        return MySQL.commit(this._connection);
      }
    }

    /**
     * Rollback current queries. You need to use .exec(true)
     * @async
     * @param {Error} error Error will throw after rollback.
     * @returns {boolean}
     */

  }, {
    key: 'rollback',
    value: function rollback(err) {
      if (this._connection) {
        return MySQL.rollback(this._connection, err);
      }
    }

    /**
     * Configure MySQL server and database info
     * @param {MySQLConfig} config Config Data
     */

  }], [{
    key: 'config',
    value: function config(_config) {
      MySQL.configs = _extends({}, MySQL.configs, _config);
    }

    /**
     * Initialize MySQL pool manually.
     * It will automatically initiate. You don't have to use it manually.
     */

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

    /**
     * Get new connection from MySQL pool
     * @async
     * @returns {Object} MySQL Connection
     */

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

    /**
     * Begin new transaction
     * If you give connection, it will start transaction on given connection. else it will create new connection and return it.
     * @async
     * @param {Object} connection MySQL Connection
     * @returns {Object} connection MySQL Connection
     */

  }, {
    key: 'beginTransaction',
    value: function beginTransaction(con) {
      if (con) {
        return new Promise(function (resolve, reject) {
          con.beginTransaction(function (err) {
            if (err) reject(err);
            MySQL.sqlTransaction = true;
            resolve(con);
          });
        });
      }
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

    /**
     * Rollback transaction
     * @async
     * @param {Object} connection MySQL Connection
     * @returns {Object} connection MySQL Connection
     */

  }, {
    key: 'rollback',
    value: function rollback(con, err) {
      return new Promise(function (resolve, reject) {
        con.rollback(function () {
          MySQL.sqlTransaction = false;
          if (err) reject(err);
          resolve(con);
        });
      });
    }

    /**
     * Commit transaction
     * @async
     * @param {Object} connection MySQL Connection
     * @returns {Object} connection MySQL Connection
     */

  }, {
    key: 'commit',
    value: function commit(con) {
      return new Promise(function (resolve, reject) {
        con.commit(function (error) {
          if (error) {
            MySQL.sqlTransaction = false;
            MySQL.rollback(error);
          } else {
            try {
              con.release();
            } catch (e) {} // eslint-disable-line
            resolve(true);
          }
        });
      });
    }

    /**
     * Execute query
     * @param {string} sql Query
     * @param {number} timeout Timeout for query execution (default: 40000) = 40 mins.
     * @param {Array.<(string|number)>} values Values for query Question marks (?)
     * @param {Object} connection If connection given it will be used. else it will get new one from pool and execute.
     * @param {boolean} rollback If true it will rollback on faliure
     * @returns {MySQLResult}
     */

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
        return promise(connection, true);
      }
    }

    /**
     * Escape strings for use in queries
     * @param {string} str String to escape
     * @returns {string}
     */

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
