import mysql from 'mysql';

const debug = require('debug')('MySQL:');

export default class MySQL {

  static configs = {
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root',
    password: ''
  };

  constructor() {
    this.log = () => {}; // eslint-disable-line
    // this.log = debug;
    this._connection = undefined;
    this.clear();
  }

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
    return this;
  }

  select(...args) {
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

  from(...args) {
    this.log('Adding from', args);
    if (typeof args[0] === 'string') {
      this._from = args[0];
    }
    this.log('Added from', this._from);
    return this;
  }

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
      this._where.push(args[0]);
    }
    this.log('Added where', this._where);
    return this;
  }

  whereGroupStart(...args) {
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

  whereGroupEnd(...args) {
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
      if (!w.key) return `${(k === 0) ? `${w.rel} ` : ''}${w}`;
      return `${(k === 0) ? '' : `${w.rel} `}${w.key} ${w.cond} ?`;
    }).join(' ');
  }

  getSelect() {
    return this._select.map((w) => {
      if (typeof w === 'string') return `\`${w}\``;
      return `${w.key} AS '${w.as}'`;
    }).join(', ');
  }

  getJoin() {
    return this._join.map(j => `${j.type} JOIN ${j.table} ON ${j.onFrom} = ${j.onTo}`).join(' ');
  }

  query() {
    if (this._insert !== '') {
      return `INSERT INTO ${this._insert} (${this._values.map(({ key }) => key).join(', ')}) VALUES (${this._values.map(() => '?').join(', ')})`;
    } else if (this._replace !== '') {
      return `REPLACE INTO ${this._replace} (${this._values.map(({ key }) => key).join(', ')}) VALUES (${this._values.map(() => '?').join(', ')})`;
    } else if (this._update !== '') {
      return `UPDATE ${this._update} SET ${this._set.map(({ key }) => `${key} = ?`).join(', ')} WHERE ${this._where.length > 0 ? `${this.getWhere()}` : '1'}`;
    } else if (this._delete !== '') {
      return `DELETE FROM ${this._delete} WHERE ${this._where.length > 0 ? `${this.getWhere()}` : '1'}`;
    } else if (this._from !== '') {
      return `SELECT ${this._select.length > 0 ? this.getSelect() : '*'} FROM ${this._from}${this._join.length > 0 ? ` ${this.getJoin()}` : ''} WHERE ${this._where.length > 0 ? `${this.getWhere()}` : '1'}`;
    }
    return '';
  }

  exec(...args) {
    let values = [];
    if (this._insert !== '') {
      values = this._values.map(({ value }) => value);
    } else if (this._replace !== '') {
      values = this._values.map(({ value }) => value);
    } else if (this._update !== '') {
      values = [...this._set.map(({ value }) => value), ...this._where.map(({ value }) => value)];
    } else if (this._delete !== '') {
      values = this._where.map(({ value }) => value);
    } else if (this._from !== '') {
      values = this._where.map(({ value }) => value);
    }
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

  commit() {
    if (this._connection) {
      return MySQL.commit(this._connection);
    }
  }

  rollback() {
    if (this._connection) {
      return MySQL.rollback(this._connection);
    }
  }

  static config(config) {
    MySQL.configs = {...MySQL.configs, ...config };
  }

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

  static beginTransaction() {
    return MySQL.getConnection()
      .then(con => new Promise((resolve, reject) => {
        con.beginTransaction((err) => {
          if (err) reject(err);
          MySQL.sqlTransaction = true;
          resolve(con);
        });
      }));
  }

  static rollback(con) {
    return new Promise((resolve, reject) => {
      con.beginTransaction((err) => {
        if (err) reject(err);
        MySQL.sqlTransaction = false;
        resolve(con);
      });
    });
  }

  static commit(con) {
    return new Promise((resolve, reject) => {
      con.commit((error) => {
        if (error) {
          MySQL.sqlTransaction = false;
          con.rollback(() => reject(error));
        } else {
          try {
            con.release();
          } catch (e) {} // eslint-disable-line
          resolve(true);
        }
      });
    });
  }

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
      return promise(connection, rollback || MySQL.sqlTransaction || false);
    }
  }

  static escape(str) {
    return mysql.escape(str);
  }
}
