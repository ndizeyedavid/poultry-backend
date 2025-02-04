// const express = require('express');
import mysql from "mysql2";
// const cors = require('cors');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "poultry",
});
db.on("err", (err) => {
  console.log("Database connection failed");
});

db.on("connect", (e) => {
  console.log("Databse connected");
});

function insertThis() {
  const sql = `
    INSERT INTO tbl_temperature(temperature, humidity, gaz) 
    VALUES('${Math.floor(Math.random() * 80)}', '${Math.floor(
    Math.random() * 80
  )}', '${Math.floor(Math.random() * 80)}')
    `;
  db.query(sql, (err, data) => {
    if (err) return console.log(err);
    console.log("Data Inserted");
    // return res.json(data);
  });
}
setInterval(insertThis, 1500);
