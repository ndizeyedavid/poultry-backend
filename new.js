
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "esp"
})
function fetchData(){
    const sql = "SELECT * FROM sensordata";
    db.query(sql, (err, data)=>{
        if (err) return err;
        return data;
    })
}

function fetchAverage(){
    const sql = "SELECT ROUND(AVG(value1), 1) as value1, ROUND(AVG(value2), 1) as value2, ROUND(AVG(value3), 1) as value3 FROM sensordata;"
    db.query(sql, (err, data)=>{
        if (err) return err;
        return data;
    })
}
