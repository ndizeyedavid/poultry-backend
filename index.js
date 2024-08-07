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
    host: "localhost",
    user: "root",
    password: "",
    database: "sensor_db"
})


app.get('/data', (req, res)=>{
    const sql = "SELECT * FROM SensorData";
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
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

app.listen(port, ()=>{
    console.log('server running on: ' + host + ':' + port)
})
