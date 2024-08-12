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
        if (err) return res.json(err);
        return res.json(data);
    })
})

app.get('/average', (req, res)=>{
    const sql = "SELECT ROUND(AVG(temperature), 1) as temperature, ROUND(AVG(humidity), 1) as humidity, ROUND(AVG(ammonia), 1) as ammonia FROM sensordata;"
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
        return res.json(data);
    })
});

// controls
app.get('/fetchcontrols', (req, res)=>{
    const sql = "SELECT * FROM controls";
    db.query(sql, (err, data)=>{
        if (err) return console.log('An error occured');
        res.json(data);
    });
})

app.get('/controls', (req, res)=>{
    let control = req.query.control;
    db.query(`SELECT ${control} FROM controls`, (err, data)=>{
        let value;
        if (data[0].fan == 0){
            value = 1;
        }
        if (data[0].fan == 1){
            value = 0;
        }
        if (data[0].buzzer == 0){
            value = 1;
        }
        if (data[0].buzzer == 1){
            value = 0;
        }
        if (data[0].led == 0){
            value = 1;
        }
        if (data[0].led == 1){
            value = 0;
        }

        // console.log(value)
        const sql = `UPDATE controls SET ${control} = ${value}`;
        db.query(sql, (err, data)=>{
            // if (err) return console.log(err);
            if (err) return console.log('An error occured');
            // console.log(data)
            res.json({status: 200, changed: control, on: value});
            // console.log("Data changed")
            // res.json()
        })
    })
    
})

app.get('/insert', (req, res)=>{
    let date = new Date();
    let now = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '  ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    const query = req.query;

    const temp = query.temperature;
    const humidity = query.humidity;
    const ammonia = query.ammonia;
    
    const sql = 'INSERT INTO sensordata(temperature, humidity, ammonia) VALUES(? , ? , ?)'
    db.query(sql, [temp, humidity, ammonia], (err, data)=>{
        if (err) return res.json({err: "An error occured trying to insert data in database"});
        res.json({status: 200, msg: "Data inserted in the database", timestamp: now});
    })
})

app.get('/test', (req, res)=>{
    res.json({msg: "Api working well"});
})
app.listen(port, ()=>{
    console.log('server running on: ' + host + ':' + port)
})
