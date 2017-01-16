const express = require('express');
const bodyParser= require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const pg = require('pg');
// const connectionString = process.env.DATABASE_URL || 'postgres://vujyirwnujyxcw:l_YgTAhWfYduRPz2nWZGlBC62m@ec2-54-243-210-223.compute-1.amazonaws.com:5432/d47un0e1jc3pp9';
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:@localhost:5432/todo';

const client = new pg.Client(connectionString);
client.connect();

app.listen(process.env.PORT || 5000, () => {
  console.log('listening on 5000')
});

app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM items ORDER BY id ASC;");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      // return res.json(results);
      res.render('index.ejs', {quotes: results});
    });
  });
});

app.post('/quotes', (req, res) => {
  const data = {text: req.body.text, complete: false};
  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO items(text, complete) values($1, $2)', [data.text, data.complete]);

    res.redirect('/');
  });
});
