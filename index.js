import express from 'express';
import cors from 'cors';
import mysql from 'mysql2'
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT;
const host = '0.0.0.0';
const app = express();

app.use(cors());

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
app.get('/data', (req, res)=>{
    const sql = "SELECT * FROM sensordata";
    db.query(sql, (err, data)=>{
        if (err) return console.log(err);
        return res.json(data);
    })
})

app.get('/average', (req, res)=>{
    const sql = "SELECT ROUND(AVG(value1), 1) as value1, ROUND(AVG(value2), 1) as value2, ROUND(AVG(value3), 1) as value3 FROM sensordata;"
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
        return res.json(data);
    })
});

app.get('/test', (req, res)=>{
    res.json({msg: "Api working well"});
})
app.listen(port, ()=>{
    console.log('server running on: ' + host + ':' + port)
})
