## Functions

<dl>
<dt><a href="#clear">clear()</a> ⇒ <code>MySQL</code></dt>
<dd><p>Clear current values in Query Builder</p>
</dd>
<dt><a href="#select">select(key, as)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add select parameter</p>
</dd>
<dt><a href="#from">from(table_name)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add table name to select from</p>
</dd>
<dt><a href="#where">where(column, value, condition, refrence)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add where parameter</p>
</dd>
<dt><a href="#whereGroupStart">whereGroupStart(refrence)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Grouping where with brackets</p>
</dd>
<dt><a href="#set">set(column, value)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add set into update</p>
</dd>
<dt><a href="#value">value(column, value)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add value to insert / replace</p>
</dd>
<dt><a href="#insert">insert(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Insert query</p>
</dd>
<dt><a href="#update">update(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Update query</p>
</dd>
<dt><a href="#replace">replace(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Replace query</p>
</dd>
<dt><a href="#delete">delete(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Delete query</p>
</dd>
<dt><a href="#innerJoin">innerJoin(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add inner join to select</p>
</dd>
<dt><a href="#leftJoin">leftJoin(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Add left join to select</p>
</dd>
<dt><a href="#on">on(table)</a> ⇒ <code>MySQL</code></dt>
<dd><p>Set columns of join</p>
</dd>
<dt><a href="#query">query()</a> ⇒ <code>string</code></dt>
<dd><p>Return generated query based on current data</p>
</dd>
<dt><a href="#values">values()</a> ⇒ <code>Array.&lt;(string|number)&gt;</code></dt>
<dd><p>Get value array based on current data</p>
</dd>
<dt><a href="#exec">exec(start_transaction)</a> ⇒ <code><a href="#MySQLResult">MySQLResult</a></code></dt>
<dd><p>Execute query based on current data</p>
</dd>
<dt><a href="#commit">commit()</a> ⇒ <code>boolean</code></dt>
<dd><p>Commit current queries. You need to use .exec(true)</p>
</dd>
<dt><a href="#rollback">rollback(error)</a> ⇒ <code>boolean</code></dt>
<dd><p>Rollback current queries. You need to use .exec(true)</p>
</dd>
<dt><a href="#config">config(config)</a></dt>
<dd><p>Configure MySQL server and database info</p>
</dd>
<dt><a href="#initialize">initialize()</a></dt>
<dd><p>Initialize MySQL pool manually.
It will automatically initiate. You don&#39;t have to use it manually.</p>
</dd>
<dt><a href="#getConnection">getConnection()</a> ⇒ <code>Object</code></dt>
<dd><p>Get new connection from MySQL pool</p>
</dd>
<dt><a href="#beginTransaction">beginTransaction(connection)</a> ⇒ <code>Object</code></dt>
<dd><p>Begin new transaction
If you give connection, it will start transaction on given connection. else it will create new connection and return it.</p>
</dd>
<dt><a href="#rollback">rollback(connection)</a> ⇒ <code>Object</code></dt>
<dd><p>Rollback transaction</p>
</dd>
<dt><a href="#commit">commit(connection)</a> ⇒ <code>Object</code></dt>
<dd><p>Commit transaction</p>
</dd>
<dt><a href="#execute">execute(sql, timeout, values, connection, rollback)</a> ⇒ <code><a href="#MySQLResult">MySQLResult</a></code></dt>
<dd><p>Execute query</p>
</dd>
<dt><a href="#escape">escape(str)</a> ⇒ <code>string</code></dt>
<dd><p>Escape strings for use in queries</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MySQLResult">MySQLResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#MySQLConfig">MySQLConfig</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="clear"></a>

## clear() ⇒ <code>MySQL</code>
Clear current values in Query Builder

**Kind**: global function  
**Example**  
```js
db.clear();
```
<a name="select"></a>

## select(key, as) ⇒ <code>MySQL</code>
Add select parameter

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Column name |
| as | <code>string</code> \| <code>number</code> | Used as select as [?] |

**Example**  
```js
db.select('username', 'uname'); // username AS uname
```
<a name="from"></a>

## from(table_name) ⇒ <code>MySQL</code>
Add table name to select from

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table_name | <code>string</code> | Table name |

**Example**  
```js
// SELECT * FROM test
db
 .select('*')
 .from('test');
```
<a name="where"></a>

## where(column, value, condition, refrence) ⇒ <code>MySQL</code>
Add where parameter

**Kind**: global function  
**Default**: <code>AND</code>  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Column name |
| value | <code>string</code> \| <code>number</code> | Value to check |
| condition | <code>string</code> | Condition to where (=, <, >, !=, <=, >=) |
| refrence | <code>string</code> | Referenced to previous where |

**Example**  
```js
// SELECT * FROM test WHERE name = ?
db
 .from('test')
 .where('name', 'test');
```
**Example**  
```js
// SELECT * FROM test WHERE price > ?
db
 .from('test')
 .where('price', 30, '>');
```
**Example**  
```js
// SELECT * FROM test WHERE price > ? AND name = ?
db
 .from('test')
 .where('price', 30, '>')
 .where('name', 'test');
```
**Example**  
```js
// SELECT * FROM test WHERE price > ? OR name = ?
db
 .from('test')
 .where('price', 30, '>')
 .where('name', 'test', '=', 'OR');
```
<a name="whereGroupStart"></a>

## whereGroupStart(refrence) ⇒ <code>MySQL</code>
Grouping where with brackets

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| refrence | <code>string</code> | Referenced to previous where |

**Example**  
```js
// SELECT * FROM test WHERE price = ? AND (name = ? OR name = ?)
db
 .from('test')
 .where('price', 30)
 .whereGroupStart()
 .where('name', 't1')
 .where('name', 't2')
 .whereGroupEnd();
```
**Example**  
```js
// SELECT * FROM test WHERE price = ? OR (name = ? OR name = ?)
db
 .from('test')
 .where('price', 30)
 .whereGroupStart('OR')
 .where('name', 't1')
 .where('name', 't2')
 .whereGroupEnd();
```
<a name="set"></a>

## set(column, value) ⇒ <code>MySQL</code>
Add set into update

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Column name |
| value | <code>string</code> \| <code>number</code> | Value to set |

<a name="value"></a>

## value(column, value) ⇒ <code>MySQL</code>
Add value to insert / replace

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Column name |
| value | <code>string</code> \| <code>number</code> | Value |

<a name="insert"></a>

## insert(table) ⇒ <code>MySQL</code>
Insert query

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// INSERT INTO test (name, age) VALUES (?, ?)
db
 .insert('test')
 .value('name', 'John')
 .value('age', 21);
```
<a name="update"></a>

## update(table) ⇒ <code>MySQL</code>
Update query

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// UPDATE test SET name = ?, age = ? WHERE id = ?
db
 .update('test')
 .set('name', 'John')
 .set('age', 21)
 .where('id', 1);
```
<a name="replace"></a>

## replace(table) ⇒ <code>MySQL</code>
Replace query

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// REPLACE INTO test (name, age) VALUES (?, ?)
db
 .replace('test')
 .value('name', 'John')
 .value('age', 21);
```
<a name="delete"></a>

## delete(table) ⇒ <code>MySQL</code>
Delete query

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// DELETE FROM test WHERE id = ?
db
 .delete('test')
 .where('id', 1);
```
<a name="innerJoin"></a>

## innerJoin(table) ⇒ <code>MySQL</code>
Add inner join to select

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// SELECT * FROM test INNER JOIN profile ON test.id = profile.tid WHERE 1
db
 .from('test')
 .innerJoin('profile')
 .on('test.id', 'profile.tId');
```
<a name="leftJoin"></a>

## leftJoin(table) ⇒ <code>MySQL</code>
Add left join to select

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// SELECT * FROM test LEFT JOIN profile ON test.id = profile.tid WHERE 1
db
 .from('test')
 .leftJoin('profile')
 .on('test.id', 'profile.tId');
```
<a name="on"></a>

## on(table) ⇒ <code>MySQL</code>
Set columns of join

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Table name |

**Example**  
```js
// SELECT * FROM test INNER JOIN profile ON test.id = profile.tid WHERE 1
db
 .from('test')
 .innerJoin('profile')
 .on('test.id', 'profile.tId');
```
<a name="query"></a>

## query() ⇒ <code>string</code>
Return generated query based on current data

**Kind**: global function  
**Example**  
```js
// returns => 'SELECT * FROM test INNER JOIN profile ON test.id = profile.tid WHERE 1'
db
 .from('test')
 .innerJoin('profile')
 .on('test.id', 'profile.tId')
 .query();
```
<a name="values"></a>

## values() ⇒ <code>Array.&lt;(string\|number)&gt;</code>
Get value array based on current data

**Kind**: global function  
**Example**  
```js
// ['John', 21, 1]
db
 .update('test')
 .set('name', 'John')
 .set('age', 21)
 .where('id', 1)
 .values();
```
<a name="exec"></a>

## exec(start_transaction) ⇒ [<code>MySQLResult</code>](#MySQLResult)
Execute query based on current data

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| start_transaction | <code>boolean</code> | If true, MySQL will start new transaction. |

<a name="commit"></a>

## commit() ⇒ <code>boolean</code>
Commit current queries. You need to use .exec(true)

**Kind**: global function  
<a name="rollback"></a>

## rollback(error) ⇒ <code>boolean</code>
Rollback current queries. You need to use .exec(true)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | Error will throw after rollback. |

<a name="config"></a>

## config(config)
Configure MySQL server and database info

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>MySQLConfig</code>](#MySQLConfig) | Config Data |

<a name="initialize"></a>

## initialize()
Initialize MySQL pool manually.
It will automatically initiate. You don't have to use it manually.

**Kind**: global function  
<a name="getConnection"></a>

## getConnection() ⇒ <code>Object</code>
Get new connection from MySQL pool

**Kind**: global function  
**Returns**: <code>Object</code> - MySQL Connection  
<a name="beginTransaction"></a>

## beginTransaction(connection) ⇒ <code>Object</code>
Begin new transaction
If you give connection, it will start transaction on given connection. else it will create new connection and return it.

**Kind**: global function  
**Returns**: <code>Object</code> - connection MySQL Connection  

| Param | Type | Description |
| --- | --- | --- |
| connection | <code>Object</code> | MySQL Connection |

<a name="rollback"></a>

## rollback(connection) ⇒ <code>Object</code>
Rollback transaction

**Kind**: global function  
**Returns**: <code>Object</code> - connection MySQL Connection  

| Param | Type | Description |
| --- | --- | --- |
| connection | <code>Object</code> | MySQL Connection |

<a name="commit"></a>

## commit(connection) ⇒ <code>Object</code>
Commit transaction

**Kind**: global function  
**Returns**: <code>Object</code> - connection MySQL Connection  

| Param | Type | Description |
| --- | --- | --- |
| connection | <code>Object</code> | MySQL Connection |

<a name="execute"></a>

## execute(sql, timeout, values, connection, rollback) ⇒ [<code>MySQLResult</code>](#MySQLResult)
Execute query

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | Query |
| timeout | <code>number</code> | Timeout for query execution (default: 40000) = 40 mins. |
| values | <code>Array.&lt;(string\|number)&gt;</code> | Values for query Question marks (?) |
| connection | <code>Object</code> | If connection given it will be used. else it will get new one from pool and execute. |
| rollback | <code>boolean</code> | If true it will rollback on faliure |

<a name="escape"></a>

## escape(str) ⇒ <code>string</code>
Escape strings for use in queries

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String to escape |

<a name="MySQLResult"></a>

## MySQLResult : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| results | <code>Array.&lt;string&gt;</code> | Array of results of query |
| fields | <code>Array.&lt;string&gt;</code> | Array of columns in result |

<a name="MySQLConfig"></a>

## MySQLConfig : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | Hostname of MySQL Server (default: 'localhost') |
| port | <code>number</code> | Port of MySQL Server (default: 3306) |
| user | <code>string</code> | Username of MySQL Server (default: 'root') |
| password | <code>string</code> | Password of MySQL Server (default: '') |
| database | <code>string</code> | Name of the database |

