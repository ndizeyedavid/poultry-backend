import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT;
const app = express();

app.use(cors());

app.listen(port, () => {
  console.log("server running on: " + port);
});

const db = mysql.createConnection({
  host: "6orij.h.filess.io",
  user: "poultry_properlyno",
  password: "1b13069fc6acb1e35f6dff0b7754f86e8d1a4315",
  database: "poultry_properlyno",
  port: "3305",
});
db.on("error", (err) => {
  console.log("Database connection failed \n" + err);
});

db.on("connect", (e) => {
  console.log("Databse connected");
});

app.get("/data", (req, res) => {
  const sql = "SELECT * FROM tbl_temperature";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    // console.log(data);
    return res.json(data);
  });
});

app.get("/average", (req, res) => {
  const sql =
    "SELECT ROUND(AVG(temperature), 1) as temperature, ROUND(AVG(humidity), 1) as humidity, ROUND(AVG(gaz), 1) as ammonia FROM tbl_temperature;";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// controls
app.get("/fetchcontrols", (req, res) => {
  const sql = "SELECT gpio, state FROM outputs";
  db.query(sql, (err, data) => {
    if (err) return console.log("An error occured");
    res.json(data);
  });
});

app.get("/controls", (req, res) => {
  let gpio = req.query.gpio;
  db.query(`SELECT state FROM outputs WHERE gpio = '${gpio}'`, (err, data) => {
    let value;
    if (data[0].state == 0) {
      value = 1;
    }
    if (data[0].state == 1) {
      value = 0;
    }

    const sql = `UPDATE outputs SET state = ${value} WHERE gpio = '${gpio}'`;
    db.query(sql, (err, data) => {
      if (err) return res.json({ status: 400, msg: "Failed to activate gpio" });
      res.json({ status: 200, changed: gpio, on: value });
    });
  });
});

app.post("/insert", (req, res) => {
  const { temperature, humidity, airQuality, location, timestamp } = req.body;

  const sql =
    "INSERT INTO tbl_temperature(temperature, humidity, gaz) values(?, ?, ?)";

  db.query(sql, [temperature, humidity, airQuality], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Unable to insert data", error: err.message });

    res.status(201).json({ message: "Recorded data inserted successfully" });
  });
});

app.get("/", (req, res) => {
  res.json({ msg: "Api working well" });
});
