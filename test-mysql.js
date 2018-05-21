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
    }).timeout(30000);
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
    }).timeout(30000);
    it('should truncate table', (done) => {
      const sql = 'TRUNCATE TABLE `test`;';
      MySQL
        .execute({ sql })
        .then(() => {
          done();
        })
        .catch(e => done(e));
    }).timeout(30000);
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
  });
  describe('# WHERE', () => {
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
    it('should generate simple select with 2 where with or', (done) => {
      const db = new MySQL();
      db
        .from('test')
        .where('username', 'test')
        .where('password', 'pass', '=', 'OR');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test WHERE username = ? OR password = ?');
      expect(values).to.deep.equal(['test', 'pass']);
      done();
    });
    it('should generate simple select with brackets in where', (done) => {
      const db = new MySQL();
      db
        .from('test')
        .where('username', 'test')
        .whereGroupStart()
        .where('email', 'x@grr.la', '=')
        .where('email', 'y@grr.la', '=', 'OR')
        .whereGroupEnd();
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test WHERE username = ? AND (email = ? OR email = ?)');
      expect(values).to.deep.equal(['test', 'x@grr.la', 'y@grr.la']);
      done();
    });
    it('should generate simple select with conditions', (done) => {
      const db = new MySQL();
      db
        .from('test')
        .where('time', 'test1', '<')
        .where('time', 'test2', '>')
        .where('time', 'test3', '!=');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test WHERE time < ? AND time > ? AND time != ?');
      expect(values).to.deep.equal(['test1', 'test2', 'test3']);
      done();
    });
    it('should generate simple select with mix of everything', (done) => {
      const db = new MySQL();
      db
        .from('test')
        .whereGroupStart()
        .where('username', 'userOne', '=')
        .where('username', 'userTwo', '=', 'OR')
        .whereGroupEnd()
        .whereGroupStart('OR')
        .where('time', 'test1', '<')
        .where('time', 'test2', '>', 'OR')
        .where('time', 'test3', '!=')
        .whereGroupEnd()
        .where('email', 'testx@grr.la');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test WHERE AND (username = ? OR username = ?) OR (time < ? OR time > ? AND time != ?) AND email = ?');
      expect(values).to.deep.equal(['userOne', 'userTwo', 'test1', 'test2', 'test3', 'testx@grr.la']);
      done();
    });
  });
  describe('# JOIN', () => {
    it('should generate simple select with inner join', (done) => {
      const db = new MySQL();
      db
        .select('*')
        .from('test')
        .innerJoin('profile')
        .on('test.id', 'profile.userId')
        .where('test.username', 'test');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test INNER JOIN profile ON test.id = profile.userId WHERE test.username = ?');
      expect(values).to.deep.equal(['test']);
      done();
    });
    it('should generate simple select with left join', (done) => {
      const db = new MySQL();
      db
        .select('*')
        .from('test')
        .leftJoin('profile')
        .on('test.id', 'profile.userId')
        .where('test.username', 'test');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test LEFT JOIN profile ON test.id = profile.userId WHERE test.username = ?');
      expect(values).to.deep.equal(['test']);
      done();
    });
    it('should generate simple select with multiple join', (done) => {
      const db = new MySQL();
      db
        .select('*')
        .from('test')
        .innerJoin('profile')
        .on('test.id', 'profile.userId')
        .leftJoin('friends')
        .on('test.id', 'friends.ownerId')
        .where('test.username', 'test');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('SELECT * FROM test INNER JOIN profile ON test.id = profile.userId LEFT JOIN friends ON test.id = friends.ownerId WHERE test.username = ?');
      expect(values).to.deep.equal(['test']);
      done();
    });
  });
  describe('# INSERT / REPLACE', () => {
    it('should generate simple insert', (done) => {
      const db = new MySQL();
      db
        .insert('test')
        .value('name', 'John')
        .value('age', 21)
        .value('address', '224 B,\nBaker Street,\nLondon.');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('INSERT INTO test (name, age, address) VALUES (?, ?, ?)');
      expect(values).to.deep.equal(['John', 21, '224 B,\nBaker Street,\nLondon.']);
      done();
    });
    it('should generate simple replace', (done) => {
      const db = new MySQL();
      db
        .replace('test')
        .value('name', 'John')
        .value('age', 21)
        .value('address', '224 B,\nBaker Street,\nLondon.');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('REPLACE INTO test (name, age, address) VALUES (?, ?, ?)');
      expect(values).to.deep.equal(['John', 21, '224 B,\nBaker Street,\nLondon.']);
      done();
    });
  });
  describe('# INSERT / REPLACE', () => {
    it('should generate simple update', (done) => {
      const db = new MySQL();
      db
        .update('test')
        .set('name', 'John')
        .set('age', 21)
        .set('address', '224 B,\nBaker Street,\nLondon.')
        .where('id', 1);
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('UPDATE test SET name = ?, age = ?, address = ? WHERE id = ?');
      expect(values).to.deep.equal(['John', 21, '224 B,\nBaker Street,\nLondon.', 1]);
      done();
    });
    it('should generate complex update', (done) => {
      const db = new MySQL();
      db
        .update('test')
        .set('name', 'John')
        .set('age', 21)
        .set('address', '224 B,\nBaker Street,\nLondon.')
        .where('id', 1)
        .whereGroupStart('OR')
        .where('username', 'u1')
        .where('username', 'u2', '=', 'OR')
        .whereGroupEnd();
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('UPDATE test SET name = ?, age = ?, address = ? WHERE id = ? OR (username = ? OR username = ?)');
      expect(values).to.deep.equal(['John', 21, '224 B,\nBaker Street,\nLondon.', 1, 'u1', 'u2']);
      done();
    });
  });
  describe('# DELETE', () => {
    it('should generate simple delete', (done) => {
      const db = new MySQL();
      db
        .delete('test');
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('DELETE FROM test WHERE 1');
      expect(values).to.deep.equal([]);
      done();
    });
    it('should generate delete with where', (done) => {
      const db = new MySQL();
      db
        .delete('test')
        .where('id', 1)
        .whereGroupStart('OR')
        .where('username', 'u1')
        .where('username', 'u2', '=', 'OR')
        .whereGroupEnd();
      const sql = db.query();
      const values = db.values();
      expect(sql).to.equal('DELETE FROM test WHERE id = ? OR (username = ? OR username = ?)');
      expect(values).to.deep.equal([1, 'u1', 'u2']);
      done();
    });
  });
});