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

function deleteAll(){
    const sql = `DELETE FROM sensordata`;
    db.query(sql, (err, data)=>{
        if (err) return console.log("An error occured");
        console.log("Table reseted");
        // return res.json(data);
    });
}

deleteAll();
// setInterval(deleteAll, 300000);