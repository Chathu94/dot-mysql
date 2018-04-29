import chai, { expect } from 'chai';
import MySQL from './index';

chai.config.includeStack = true;

describe('## Config', () => {
  describe('# Connect to ensembldb.ensembl.org', () => {
    it('should set config', (done) => {
      MySQL.config({
        host: 'ensembldb.ensembl.org',
        user: 'anonymous'
      });
      expect(MySQL.configs.host).to.equal('ensembldb.ensembl.org');
      expect(MySQL.configs.user).to.equal('anonymous');
      expect(MySQL.configs.port).to.equal(3306);
      expect(MySQL.configs.password).to.equal('');
      expect(MySQL.configs.database).to.equal('test');
      done();
    });
    it('should initialize', (done) => {
      MySQL.initialize();
      done();
    });
    it('should execute simple testing query', (done) => {
      MySQL
        .execute({ sql: 'SELECT 1' })
        .then(({ results }) => {
          expect(results[0]['1']).to.equal(1);
          done();
        })
        .catch(e => done(e));
    });
  });
  describe('# Create testing table', () => {
    it('should create table', (done) => {
      const sql = 'CREATE TABLE IF NOT EXISTS `test` (\n' +
        '  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n' +
        '  `name` varchar(100) DEFAULT NULL,\n' +
        '  `username` varchar(50) NOT NULL DEFAULT \'\',\n' +
        '  `password` varchar(32) NOT NULL DEFAULT \'\',\n' +
        '  PRIMARY KEY (`id`),\n' +
        '  UNIQUE KEY `username` (`username`)\n' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8;';
      MySQL
        .execute({ sql })
        .then(() => {
          done();
        })
        .catch(e => done(e));
    });
    it('should truncate table', (done) => {
      const sql = 'TRUNCATE TABLE `test`;';
      MySQL
        .execute({ sql })
        .then(() => {
          done();
        })
        .catch(e => done(e));
    });
  });
});

describe('## Query Builder', () => {
  describe('# SELECT', () => {
    it('should generate simple select without select parameters(*)', (done) => {
      const db = new MySQL();
      const sql = db
        .from('test')
        .query();
      expect(sql).to.equal('SELECT * FROM test WHERE 1');
      done();
    });
    it('should generate simple select with single select parameter', (done) => {
      const db = new MySQL();
      const sql = db
        .select('name')
        .from('test')
        .query();
      expect(sql).to.equal('SELECT name FROM test WHERE 1');
      done();
    });
    it('should generate simple select with single select as parameter', (done) => {
      const db = new MySQL();
      const sql = db
        .select('name', 'Full Name')
        .from('test')
        .query();
      expect(sql).to.equal('SELECT name AS \'Full Name\' FROM test WHERE 1');
      done();
    });
    it('should generate simple select with 3 select parameters', (done) => {
      const db = new MySQL();
      const sql = db
        .select('id')
        .select('name', 'Full Name')
        .select('username')
        .from('test')
        .query();
      expect(sql).to.equal('SELECT id, name AS \'Full Name\', username FROM test WHERE 1');
      done();
    });
    it('should generate simple select with single where', (done) => {
      const db = new MySQL();
      db
        .from('test')
        .where('username', 'test');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test WHERE username = ?');
      expect(values).to.deep.equal(['test']);
      done();
    });
    it('should generate simple select with 2 where', (done) => {
      const db = new MySQL();
      db
        .from('test')
        .where('username', 'test')
        .where('password', 'pass');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test WHERE username = ? AND password = ?');
      expect(values).to.deep.equal(['test', 'pass']);
      done();
    });
  });
});