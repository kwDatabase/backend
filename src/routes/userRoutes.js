var express = require('express');
var router = express.Router();
const db = require('../config/db');

/* GET example */
router.get('/', function(req, res) {
  const query = 'SELECT * FROM user';
  db.query(query, (err, results) => {
    if(err){
      console.error(err.message);
      return res.status(500).json({error: 'Database query failed'});
    }
    console.log(results);
    res.json(results);
  });
});
router.get('/:idx', function(req, res){
  console.log(req.params.idx);
  const query = `SELECT * FROM user where id = ${req.params.idx}`;
  db.query(query, (err, results) => {
    if(err){
      console.error(err.message);
      return res.status(500).json({error: 'Database query failed'});
    }
    console.log(results);
    res.json(results);
  });
})

module.exports = router;
