import mysql from 'mysql';

const debug = require('debug')('MySQL:');

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

export default class MySQL {

  static configs = {
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root',
    password: ''
  };

  /**
   * @constructor
   */
  constructor() {
    this.log = () => {}; // eslint-disable-line
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
  clear() {
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
  select(...args) {
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
    } else if (typeof args[0] === 'object') {
      this._select.push([...this._select, ...args[0]]);
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
  from(...args) {
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
  where(...args) {
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
    } else if (typeof args[0] === 'object') {
      this._where.push([...this._where, ...args[0]]);
    }
    this.log('Added where', this._where);
    return this;
  }

  limit(...args) {
    this.log('Adding where', args);
    if (typeof args[0] === 'number') {
      this._limit = args[0]
      if (typeof args[1] === 'number') {
        this._offset = args[1]
      }
    }
    return this;
  }

  offset(...args) {
    if (typeof args[0] === 'number') {
      this._offset = args[0]
    }
    return this;
  }

  orderBy(...args) {
    if (typeof args[0] === 'string') {
      this._order = `\`${args[0]}\` ASC`;
      if (typeof args[1] === 'number') {
        this._order = `\`${args[0]}\` ${args[1] === -1 ? 'DESC' : 'ASC'}`;
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
  whereGroupStart(...args) {
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

  whereGroupEnd(...args) {
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
  set(...args) {
    this.log('Adding set', args);
    if (typeof args[0] === 'string' && (typeof args[1] === 'string' || typeof args[1] === 'number')) {
      this._set.push({
        key: args[0],
        value: args[1]
      });
    } else if (typeof args[0] === 'object') {
      this._set = [...this._set, ...Object.keys(args[0]).map(key => ({ key, value: args[0][key] }))];
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
  value(...args) {
    this.log('Adding values', args);
    if (typeof args[0] === 'string' && (typeof args[1] === 'string' || typeof args[1] === 'number')) {
      this._values.push({
        key: args[0],
        value: args[1]
      });
    } else if (typeof args[0] === 'object') {
      this._values = [...this._values, ...Object.keys(args[0]).map(key => ({ key, value: args[0][key] }))];
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
  insert(...args) {
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
  update(...args) {
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
  replace(...args) {
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
  delete(...args) {
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
  innerJoin(...args) {
    this.log('Adding innerJoin', args);
    if (typeof args[0] === 'string') {
      this._tJoin = {
        table: args[0],
        type: 'INNER'
      };
      this.log('Added innerJoin', this._tJoin);
    } else if (typeof args[0] === 'object' && args[0].table && args[0].onFrom && args[0].onTo) {
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
  leftJoin(...args) {
    this.log('Adding leftJoin', args);
    if (typeof args[0] === 'string') {
      this._tJoin = {
        table: args[0],
        type: 'LEFT'
      };
      this.log('Added leftJoin', this._tJoin);
    } else if (typeof args[0] === 'object' && args[0].table && args[0].onFrom && args[0].onTo) {
      args[0].type = 'LEFT';
      this._join.push(args[0]);
      this.log('Added leftJoin', this._join);
    }
    return this;
  }

  join(...args) {
    this.log('Adding join', args);
    if (typeof args[0] === 'string') {
      this._tJoin = {
        table: args[0],
        type: args[1] || 'LEFT'
      };
      this.log('Added join', this._tJoin);
    } else if (typeof args[0] === 'object' && args[0].table && args[0].onFrom && args[0].onTo) {
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
  on(onFrom, onTo) {
    this.log('Adding on', onFrom, onTo);
    if (typeof onFrom === 'string' && typeof onTo === 'string' && this._tJoin !== undefined) {
      const join = {
        onFrom,
        onTo
      };
      Object.assign(join, this._tJoin);
      this._join.push(join);
      this._tJoin = undefined;
    }
    this.log('Added on', this._join);
    return this;
  }

  getWhere() {
    return this._where.map((w, k) => {
      if (w.bracket) return `${w.rel} ` + `${w.start ? '(' : ')'}`;
      return `${(k === 0) || (this._where[k-1] && this._where[k-1].start) ? '' : `${w.rel} `}${w.key} ${w.cond} ?`;
    }).join(' ').replace(/\(\s/g, '(').replace(/\s\s\)/g, ')');
  }

  getSelect() {
    return this._select.map((w) => {
      if (typeof w === 'string') return `\`${w}\``;
      return w.as ? `${w.key} AS '${w.as}'` : w.key;
    }).join(', ');
  }

  getJoin() {
    return this._join.map(j => `${j.type} JOIN ${j.table} ON ${j.onFrom} = ${j.onTo}`).join(' ');
  }

  getLimit() {
    return this._limit > -1 ? ` LIMIT ${this._limit}${this._offset > -1 ? ` OFFSET ${this._offset}` : ''}` : '';
  }

  getOrder() {
    return this._order !== '' ? ` ORDER BY ${this._order}` : ''
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
  query() {
    if (this._insert !== '') {
      return `INSERT INTO ${this._insert} (${this._values.map(({ key }) => key).join(', ')}) VALUES (${this._values.map(() => '?').join(', ')})`;
    } else if (this._replace !== '') {
      return `REPLACE INTO ${this._replace} (${this._values.map(({ key }) => key).join(', ')}) VALUES (${this._values.map(() => '?').join(', ')})`;
    } else if (this._update !== '') {
      return `UPDATE ${this._update} SET ${this._set.map(({ key }) => `${key} = ?`).join(', ')} WHERE ${this._where.length > 0 ? `${this.getWhere()}` : '1'}${this.getOrder()}${this.getLimit()}`;
    } else if (this._delete !== '') {
      return `DELETE FROM ${this._delete} WHERE ${this._where.length > 0 ? `${this.getWhere()}` : '1'}${this.getOrder()}${this.getLimit()}`;
    } else if (this._from !== '') {
      return `SELECT ${this._select.length > 0 ? this.getSelect() : '*'} FROM ${this._from}${this._join.length > 0 ? ` ${this.getJoin()}` : ''} WHERE ${this._where.length > 0 ? `${this.getWhere()}` : '1'}${this.getOrder()}${this.getLimit()}`;
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
  values() {
    let values = [];
    if (this._insert !== '') {
      values = this._values.map(({ value }) => value);
    } else if (this._replace !== '') {
      values = this._values.map(({ value }) => value);
    } else if (this._update !== '') {
      values = [...this._set.map(({ value }) => value), ...this._where.filter(w => !w.bracket).map(({ value }) => value)];
    } else if (this._delete !== '') {
      values = this._where.filter(w => !w.bracket).map(({ value }) => value);
    } else if (this._from !== '') {
      values = this._where.filter(w => !w.bracket).map(({ value }) => value);
    }
    return values;
  }

  /**
   * Execute query based on current data
   * @async
   * @param {boolean} start_transaction If true, MySQL will start new transaction.
   * @returns {MySQLResult}
   */
  exec(...args) {
    const values = this.values();
    const sql = this.query();
    this.log('Executing query', sql, 'values', values);
    if (typeof args[0] === 'boolean' && args[0] === true) {
      if (this._connection) {
        return MySQL.execute({ sql, values, connection: this._connection });
      } else {
        return MySQL.beginTransaction()
          .then(con => {
            this._connection = con;
            return MySQL.execute({ sql, values, connection: con });
          });
      }
    } else {
      return MySQL.execute({ sql, values, connection: args[0] });
    }
  }

  /**
   * Commit current queries. You need to use .exec(true)
   * @async
   * @returns {boolean}
   */
  commit() {
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
  rollback(err) {
    if (this._connection) {
      return MySQL.rollback(this._connection, err);
    }
  }

  /**
   * Configure MySQL server and database info
   * @param {MySQLConfig} config Config Data
   */
  static config(config) {
    MySQL.configs = {...MySQL.configs, ...config };
  }

  /**
   * Initialize MySQL pool manually.
   * It will automatically initiate. You don't have to use it manually.
   */
  static initialize() {
    const config = MySQL.configs;
    config.connectionLimit = 20;
    MySQL.sqlPool = mysql.createPool(config);
    MySQL.sqlPoolCon = {};
    MySQL.sqlPool.on('acquire', (connection) => {
      debug('Connection %d acquired', connection.threadId);
      const timer = setTimeout(() => {
        debug('Connection %d timeout', connection.threadId);
        try {
          connection.release();
        } catch (e) {} // eslint-disable-line
      }, 50000);
      MySQL.sqlPoolCon[connection.threadId] = timer;
    });
    MySQL.sqlPool.on('release', (connection) => {
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
  static getConnection() {
    if (!MySQL.sqlPool) {
      MySQL.initialize();
    }
    return new Promise((resolve, reject) => {
      const pool = MySQL.sqlPool;
      pool.getConnection((err, con) => {
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
  static beginTransaction(con) {
    if (con) {
      return new Promise((resolve, reject) => {
        con.beginTransaction((err) => {
          if (err) reject(err);
          MySQL.sqlTransaction = true;
          resolve(con);
        });
      });
    }
    return MySQL.getConnection()
      .then(con => new Promise((resolve, reject) => {
        con.beginTransaction((err) => {
          if (err) reject(err);
          MySQL.sqlTransaction = true;
          resolve(con);
        });
      }));
  }

  /**
   * Rollback transaction
   * @async
   * @param {Object} connection MySQL Connection
   * @returns {Object} connection MySQL Connection
   */
  static rollback(con, err) {
    return new Promise((resolve, reject) => {
      con.rollback(() => {
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
  static commit(con) {
    return new Promise((resolve, reject) => {
      con.commit((error) => {
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
  static execute({ sql, timeout = 40000, values = [], connection, rollback }) {
    const promise = (con, rb) => new Promise((resolve, reject) => {
      con.query({ sql, timeout, values }, (error, results, fields) => {
        if (error) {
          if (rb) {
            MySQL.sqlTransaction = false;
            con.rollback(() => reject(error));
          } else {
            try {
              con.release();
            } catch (e) {} // eslint-disable-line
            reject(error);
          }
        } else {
          resolve({ results, fields });
        }
      });
    });
    if (!connection) {
      return MySQL.getConnection()
        .then(con => promise(con, rollback || MySQL.sqlTransaction || false));
    } else {
      return promise(connection, true);
    }
  }

  /**
   * Escape strings for use in queries
   * @param {string} str String to escape
   * @returns {string}
   */
  static escape(str) {
    return mysql.escape(str);
  }
}
