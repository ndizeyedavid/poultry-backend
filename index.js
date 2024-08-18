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
    host: "ide.h.filess.io",
    user: "chicken_mightwagon",
    password: "62a2fb2b1d802aec52e615eafd201ca22bc6f23b",
    database: "chicken_mightwagon",
    port: "3305"
});
db.on('error', (err) => {
    console.log('Database connection failed \n' + err);
});

db.on('connect', (e)=>{
    console.log('Databse connected');
})

app.get('/data', (req, res)=>{
    const sql = "SELECT * FROM tbl_temperature";
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
        return res.json(data);
    })
})

app.get('/average', (req, res)=>{
    const sql = "SELECT ROUND(AVG(temperature), 1) as temperature, ROUND(AVG(humidity), 1) as humidity, ROUND(AVG(gaz), 1) as ammonia FROM tbl_temperature;"
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
        return res.json(data);
    })
});

// controls
app.get('/fetchcontrols', (req, res)=>{
    const sql = "SELECT gpio, state FROM outputs";
    db.query(sql, (err, data)=>{
        if (err) return console.log('An error occured');
        res.json(data);
    });
})

app.get('/controls', (req, res)=>{
    let gpio = req.query.gpio;
    db.query(`SELECT state FROM outputs WHERE gpio = '${gpio}'`, (err, data)=>{
        let value;
        if (data[0].state == 0){
            value = 1;
        }
        if (data[0].state == 1){
            value = 0;
        }
        
        const sql = `UPDATE outputs SET state = ${value} WHERE gpio = '${gpio}'`;
        db.query(sql, (err, data)=>{
            if (err) return res.json({status: 400, msg: "Failed to activate gpio"});
            res.json({status: 200, changed: gpio, on: value});
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
