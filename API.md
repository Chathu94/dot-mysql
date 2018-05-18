# API &middot; 

### Static Functions

| Function | Parameters | Return | Note |
|---|---|---|---|
| `config` | `({ host, port, database, user, password })` | `none` | Configurations of mysql database. |
| `initialize` | `none` | `none` | Initialize mysql pool manually. |
| `getConnection` | `none` | `Promise.then(connection)` | Return connection from mysql pool. |
| `beginTransaction` | `(connection)` | `Promise.then(connection)` | Start new mysql transaction. Connection is not required. It will create new connection of connection not given. |
| `rollback` | `(connection[Required], error: Error)` | `Promise.then(connection).catch(error)` | Rollback transaction. If error parameter is given, It will throw error after rollback. |
| `commit` | `(connection[Required])` | `Promise.then()` | Commit transaction. If there is an error, Transaction will rollback and error will be thrown |
| `execute` | `({ sql: String, timeout: Int, values: Array of [String / Int], connection, rollback: Boolean })` | `Promise.then({ results, fields })` | Execute mysql query. If you're on transaction connection is required, else it will get connection from  pool and execute query. |
| `escape` | `(str: String)` | `String` | Escape string to use in query. |

### Query Builder Functions
Look [JSDOC.md](https://github.com/Chathu94/dot-mysql/blob/master/JSDOC.md)