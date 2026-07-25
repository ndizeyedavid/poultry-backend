import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log("server running on: " + port);
});

const db = mysql.createConnection({
  host: "ib2zgu.h.filess.io",
  user: "poultry_nowexactam",
  password: "bf8d8b3ac110f71365a2f75eeaa1343437d18cda",
  database: "poultry_nowexactam",
  port: "3307",
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
    if (err)
      return res
        .status(500)
        .json({ message: "Failed to fetch data", error: err.message });
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
    if (err)
      return res
        .status(500)
        .json({ status: 500, msg: "Failed to fetch controls", error: err.message });
    res.json(data);
  });
});

app.get("/controls", (req, res) => {
  const gpio = req.query.gpio;
  const stateParam = req.query.state;

  if (!gpio)
    return res.status(400).json({ status: 400, msg: "gpio query parameter is required" });

  db.query("SELECT state FROM outputs WHERE gpio = ?", [gpio], (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ status: 500, msg: "Database error", error: err.message });

    if (!data.length)
      return res.status(404).json({ status: 404, msg: `Control '${gpio}' not found` });

    const currentState = data[0].state;
    let value = currentState;

    if (stateParam === "0" || stateParam === "1") {
      value = parseInt(stateParam, 10);
    } else {
      value = currentState === 0 ? 1 : 0;
    }

    const sql = "UPDATE outputs SET state = ? WHERE gpio = ?";
    db.query(sql, [value, gpio], (err2) => {
      if (err2)
        return res
          .status(500)
          .json({ status: 500, msg: "Failed to update gpio", error: err2.message });
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
