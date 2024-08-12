// const express = require('express');
import mysql from 'mysql2';
// const cors = require('cors');


const db = mysql.createConnection({
    host: "i52.h.filess.io",
    user: "testdb12234_distancehe",
    password: "74ab35df9812ba304bd85706df45ae06f9746142",
    database: "testdb12234_distancehe",
    port: "3305"
});
db.on('err', (err) => {
    console.log('Database connection failed');
});

db.on('connect', (e)=>{
    console.log('Databse connected');
})

function insertThis(){
    const sql = `
    INSERT INTO sensordata(temperature, humidity, ammonia) 
    VALUES('${Math.floor(Math.random() * 80)}', '${Math.floor(Math.random() * 80)}', '${Math.floor(Math.random() * 80)}')
    `;
    db.query(sql, (err, data)=>{
        if (err) return console.log(err);
        console.log("Data Inserted");
        // return res.json(data);
    });
}
setInterval(insertThis, 1500);
