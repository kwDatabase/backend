var express = require('express');
const db = require('../config/db');

exports.SelectAllUser = (req, res) => {
    const query = 'SELECT * FROM user';
    db.query(query, (err, results) => {
      if(err){
        console.error(err.message);
        return res.status(500).json({error: 'Database query failed'});
      }
      console.log(results);
      res.json(results);
    });
};

exports.SelectUserById = (req, res) =>{
    const query = `SELECT * FROM user where id = ${req.params.id}`;
    db.query(query, (err, results) => {
      if(err){
        console.error(err.message);
        return res.status(500).json({error: 'Database query failed'});
      }
      console.log(results);
      res.json(results);
    });
}