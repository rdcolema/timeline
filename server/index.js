const cors = require('cors');
const express = require('express');
const mysql = require('mysql');

const app = express();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST_IP,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

// Cross-Origin Resource Sharing
app.use(cors());

app.listen(process.env.REACT_APP_SERVER_PORT, () => {
  console.log(`App server now listening on port ${process.env.REACT_APP_SERVER_PORT}`);
});


// List wines
app.get('/events/:year', (req, res) => {

  const year = req.params.year;

  pool.query(`
    SELECT * FROM timeline_event WHERE date LIKE '${year}%'`, 
    (err, results) => {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        return res.send(results);
      }
    });
});


