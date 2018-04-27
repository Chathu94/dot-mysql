# Dot-MySQL &middot; 
dot-mysql is a JavaScript library for building mysql queries.

## Installation
```jsx
npm install --save dot-mysql
```

## Usage

##### Import
```jsx
import MySQL from 'dot-mysql'
```
##### Config
```jsx
import MySQL from 'dot-mysql';

MySQL.config({
  host: 'localhost',
  port: 3306,
  database: 'test',
  user: 'root',
  password: ''
});
```

##### Direct Query
```jsx
import MySQL from 'dot-mysql';

MySQL
    .query({ sql: 'SELECT * FROM table' })
    .then(({ results }) => {
        console.log(results);
    });
```

##### Query Builder
```jsx
import MySQL from 'dot-mysql';

const db = new MySQL();
db
    .select('*')
    .from('table')
    .exec()
    .then(({ results }) => {
        console.log(results);
    });
```